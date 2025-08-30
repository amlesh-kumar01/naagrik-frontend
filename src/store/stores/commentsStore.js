import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { commentAPI, issueAPI } from '@/lib/api';

const useCommentsStore = create(
  devtools(
    (set, get) => ({
      // State
      commentsByIssue: {}, // { issueId: { comments: [], loading: false, lastFetched: null } }
      flaggingComment: null,
      flagReason: '',
      flagDetails: '',
      loading: false,
      submitting: false,
      sortBy: 'newest',

      // Actions
      setFlaggingComment: (commentId) => set({ flaggingComment: commentId }),
      setFlagReason: (reason) => set({ flagReason: reason }),
      setFlagDetails: (details) => set({ flagDetails: details }),
      setSortBy: (sortBy) => set({ sortBy }),

      // Get comments for a specific issue
      getIssueComments: (issueId) => {
        const state = get();
        return state.commentsByIssue[issueId]?.comments || [];
      },

      // Check if comments are loading for an issue
      isCommentsLoading: (issueId) => {
        const state = get();
        return state.commentsByIssue[issueId]?.loading || false;
      },

      // Fetch comments for an issue
      fetchComments: async (issueId, options = {}) => {
        const { sortBy: currentSortBy } = get();
        const sortBy = options.sortBy || currentSortBy;

        set((state) => ({
          commentsByIssue: {
            ...state.commentsByIssue,
            [issueId]: {
              ...state.commentsByIssue[issueId],
              loading: true,
            }
          }
        }));

        try {
          const response = await issueAPI.getComments(issueId, { 
            sortBy,
            nested: 'true',
            ...options
          });
          
          const commentsData = response.data?.data?.comments || response.data?.comments || response.comments || [];
          
          set((state) => ({
            commentsByIssue: {
              ...state.commentsByIssue,
              [issueId]: {
                comments: commentsData,
                loading: false,
                lastFetched: new Date().toISOString(),
              }
            }
          }));

          return { success: true, comments: commentsData };
        } catch (error) {
          set((state) => ({
            commentsByIssue: {
              ...state.commentsByIssue,
              [issueId]: {
                ...state.commentsByIssue[issueId],
                loading: false,
              }
            }
          }));
          
          console.error('Failed to fetch comments:', error);
          throw error;
        }
      },

      // Add comment to an issue
      addComment: async (issueId, content, parentCommentId = null) => {
        set({ submitting: true });

        try {
          const response = await issueAPI.createComment(issueId, {
            content: content.trim(),
            parentCommentId: parentCommentId
          });

          const newCommentData = response.data?.data?.comment || response.data?.comment || response.comment;
          
          set((state) => {
            const currentComments = state.commentsByIssue[issueId]?.comments || [];
            
            if (parentCommentId) {
              // Add reply to parent comment
              const updatedComments = currentComments.map(comment => {
                if (comment.id === parentCommentId) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), newCommentData],
                    reply_count: (comment.reply_count || 0) + 1
                  };
                }
                return comment;
              });

              return {
                commentsByIssue: {
                  ...state.commentsByIssue,
                  [issueId]: {
                    ...state.commentsByIssue[issueId],
                    comments: updatedComments,
                  }
                },
                submitting: false
              };
            } else {
              // Add new top-level comment
              return {
                commentsByIssue: {
                  ...state.commentsByIssue,
                  [issueId]: {
                    ...state.commentsByIssue[issueId],
                    comments: [newCommentData, ...currentComments],
                  }
                },
                submitting: false
              };
            }
          });

          return { success: true, comment: newCommentData };
        } catch (error) {
          set({ submitting: false });
          console.error('Failed to add comment:', error);
          throw error;
        }
      },

      // Update comment
      updateComment: async (commentId, content, issueId) => {
        try {
          const response = await commentAPI.updateComment(commentId, { content });
          const updatedComment = response.data?.data?.comment || response.data?.comment || response.comment;

          set((state) => {
            const currentComments = state.commentsByIssue[issueId]?.comments || [];
            
            const updateCommentRecursively = (comments) => {
              return comments.map(comment => {
                if (comment.id === commentId) {
                  return { ...comment, ...updatedComment };
                }
                if (comment.replies) {
                  return {
                    ...comment,
                    replies: updateCommentRecursively(comment.replies)
                  };
                }
                return comment;
              });
            };

            return {
              commentsByIssue: {
                ...state.commentsByIssue,
                [issueId]: {
                  ...state.commentsByIssue[issueId],
                  comments: updateCommentRecursively(currentComments),
                }
              }
            };
          });

          return { success: true, comment: updatedComment };
        } catch (error) {
          console.error('Failed to update comment:', error);
          throw error;
        }
      },

      // Delete comment (with cascade for replies)
      deleteComment: async (commentId, issueId) => {
        try {
          await commentAPI.deleteComment(commentId);

          set((state) => {
            const currentComments = state.commentsByIssue[issueId]?.comments || [];
            
            const removeCommentRecursively = (comments) => {
              return comments.filter(comment => {
                if (comment.id === commentId) {
                  return false; // Remove this comment
                }
                if (comment.replies) {
                  comment.replies = removeCommentRecursively(comment.replies);
                }
                return true;
              });
            };

            return {
              commentsByIssue: {
                ...state.commentsByIssue,
                [issueId]: {
                  ...state.commentsByIssue[issueId],
                  comments: removeCommentRecursively(currentComments),
                }
              }
            };
          });

          return { success: true };
        } catch (error) {
          console.error('Failed to delete comment:', error);
          throw error;
        }
      },

      // Flag comment
      flagComment: async (commentId, reason, details, issueId) => {
        try {
          const response = await commentAPI.flagComment(commentId, {
            reason,
            details
          });

          // Update local comment to show flagged status
          set((state) => {
            const currentComments = state.commentsByIssue[issueId]?.comments || [];
            
            const updateCommentRecursively = (comments) => {
              return comments.map(comment => {
                if (comment.id === commentId) {
                  return { 
                    ...comment, 
                    is_flagged: true,
                    flag_count: (comment.flag_count || 0) + 1
                  };
                }
                if (comment.replies) {
                  return {
                    ...comment,
                    replies: updateCommentRecursively(comment.replies)
                  };
                }
                return comment;
              });
            };

            return {
              commentsByIssue: {
                ...state.commentsByIssue,
                [issueId]: {
                  ...state.commentsByIssue[issueId],
                  comments: updateCommentRecursively(currentComments),
                }
              },
              flaggingComment: null,
              flagReason: '',
              flagDetails: ''
            };
          });

          return { success: true, flag: response.data?.data?.flag };
        } catch (error) {
          console.error('Failed to flag comment:', error);
          throw error;
        }
      },

      // Clear comments for an issue (when needed)
      clearIssueComments: (issueId) => {
        set((state) => {
          const newCommentsByIssue = { ...state.commentsByIssue };
          delete newCommentsByIssue[issueId];
          return { commentsByIssue: newCommentsByIssue };
        });
      },

      // Reset flag modal state
      resetFlagModal: () => set({
        flaggingComment: null,
        flagReason: '',
        flagDetails: ''
      }),
    }),
    {
      name: 'comments-store',
    }
  )
);

export default useCommentsStore;
