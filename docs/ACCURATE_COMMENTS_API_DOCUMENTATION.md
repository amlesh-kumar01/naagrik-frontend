# Comments API Documentation (Accurate Implementation)

## Overview
This documentation covers the **actual implemented features** for comments based on the existing database schema and backend implementation. No comment voting features are included as they're not supported in the database.

---

## **1. Get Comments for an Issue**

### **Endpoint**
```http
GET /api/comments/issues/:issueId/comments
```

### **Authentication**
- Optional (can be accessed without token)

### **Path Parameters**
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| issueId | UUID | Yes | Must be valid UUID format |

### **Query Parameters**
| Parameter | Type | Required | Default | Validation |
|-----------|------|----------|---------|------------|
| limit | Integer | No | 50 | Min: 1, Max: 100 |
| offset | Integer | No | 0 | Min: 0 |
| sortBy | String | No | 'newest' | Enum: 'newest', 'oldest' |

### **Response**
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "comment-uuid",
        "content": "This pothole needs immediate attention!",
        "user_id": "user-uuid",
        "user_name": "John Doe",
        "user_avatar": "https://cloudinary.com/avatar.jpg",
        "issue_id": "issue-uuid",
        "parent_comment_id": null,
        "is_flagged": false,
        "created_at": "2025-08-30T14:00:00Z",
        "updated_at": "2025-08-30T14:00:00Z",
        "replies": [
          {
            "id": "reply-uuid",
            "content": "I agree completely",
            "user_name": "Jane Smith",
            "created_at": "2025-08-30T15:00:00Z"
          }
        ],
        "reply_count": 1
      }
    ],
    "total": 15,
    "pagination": {
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

---

## **2. Create Comment on Issue**

### **Endpoint**
```http
POST /api/comments/issues/:issueId/comments
```

### **Authentication**
- Required: Bearer token

### **Rate Limiting**
- Applied via `rateLimitService.commentRateLimit()`

### **Path Parameters**
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| issueId | UUID | Yes | Must be valid UUID, issue must exist |

### **Request Body**
```json
{
  "content": "This is my comment on the issue",
  "parentCommentId": null
}
```

### **Validation Rules**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| content | String | Yes | Min: 1 char, Max: 1000 chars, Trimmed, No empty strings |
| parentCommentId | UUID | No | Must be valid UUID if provided, must exist |

### **Validation Errors**
- `400` - "Comment content is required"
- `400` - "Comment must be between 1 and 1000 characters"
- `400` - "Invalid issue ID"
- `404` - "Issue not found"
- `404` - "Parent comment not found"
- `429` - "Rate limit exceeded"

### **Response**
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": "new-comment-uuid",
      "content": "This is my comment on the issue",
      "user_id": "user-uuid",
      "user_name": "John Doe",
      "user_avatar": "https://cloudinary.com/avatar.jpg",
      "issue_id": "issue-uuid",
      "parent_comment_id": null,
      "is_flagged": false,
      "created_at": "2025-08-30T16:00:00Z",
      "updated_at": "2025-08-30T16:00:00Z"
    }
  },
  "message": "Comment added successfully"
}
```

---

## **3. Get Individual Comment**

### **Endpoint**
```http
GET /api/comments/:commentId
```

### **Authentication**
- Optional

### **Path Parameters**
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| commentId | UUID | Yes | Must be valid UUID, comment must exist |

### **Response**
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": "comment-uuid",
      "content": "Comment content here",
      "user_id": "user-uuid",
      "user_name": "John Doe",
      "user_avatar": "https://cloudinary.com/avatar.jpg",
      "issue_id": "issue-uuid",
      "issue_title": "Related Issue Title",
      "parent_comment_id": null,
      "is_flagged": false,
      "created_at": "2025-08-30T14:00:00Z",
      "updated_at": "2025-08-30T14:30:00Z",
      "replies": []
    }
  }
}
```

---

## **4. Update Comment**

### **Endpoint**
```http
PUT /api/comments/:commentId
```

### **Authentication**
- Required: Bearer token
- Must be comment author

### **Path Parameters**
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| commentId | UUID | Yes | Must be valid UUID, comment must exist, user must be author |

### **Request Body**
```json
{
  "content": "Updated comment content"
}
```

### **Validation Rules**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| content | String | Yes | Min: 1 char, Max: 1000 chars, Trimmed, No empty strings |

### **Validation Errors**
- `400` - "Invalid comment ID"
- `400` - "Comment must be between 1 and 1000 characters"
- `403` - "You can only update your own comments"
- `404` - "Comment not found"

### **Response**
```json
{
  "success": true,
  "data": {
    "comment": {
      "id": "comment-uuid",
      "content": "Updated comment content",
      "user_id": "user-uuid",
      "updated_at": "2025-08-30T16:30:00Z"
    }
  },
  "message": "Comment updated successfully"
}
```

---

## **5. Delete Comment**

### **Endpoint**
```http
DELETE /api/comments/:commentId
```

### **Authentication**
- Required: Bearer token

### **Authorization Matrix**
| Role | Can Delete |
|------|------------|
| Comment Author | Own comments only |
| STEWARD | Comments in their assigned zone issues |
| SUPER_ADMIN | Any comment |

### **Path Parameters**
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| commentId | UUID | Yes | Must be valid UUID, comment must exist |

### **Validation Errors**
- `400` - "Invalid comment ID"
- `403` - "You can only delete your own comments"
- `404` - "Comment not found"

### **Response**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

---

## **6. Flag Comment (Zone-Based Permission)**

### **Endpoint**
```http
POST /api/comments/:commentId/flag
```

### **Authentication**
- Required: Bearer token

### **Authorization**
- **STEWARD**: Can flag comments on issues in their assigned zones only
- **SUPER_ADMIN**: Can flag any comment
- **CITIZEN**: Cannot flag comments

### **Path Parameters**
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| commentId | UUID | Yes | Must be valid UUID, comment must exist, must have permission |

### **Request Body**
```json
{
  "reason": "INAPPROPRIATE",
  "details": "This comment contains offensive language"
}
```

### **Validation Rules**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| reason | String | Yes | Enum: 'SPAM', 'INAPPROPRIATE', 'MISLEADING', 'OTHER' |
| details | String | No | Max: 500 chars, Trimmed |

### **Validation Errors**
- `400` - "Invalid comment ID"
- `400` - "Flag reason is required"
- `400` - "Invalid flag reason"
- `403` - "You don't have permission to flag comments in this zone"
- `404` - "Comment not found"
- `409` - "You have already flagged this comment"

### **Response**
```json
{
  "success": true,
  "data": {
    "flag": {
      "id": "flag-uuid",
      "reason": "INAPPROPRIATE",
      "details": "This comment contains offensive language",
      "user_id": "flagging-user-uuid",
      "comment_id": "comment-uuid",
      "status": "PENDING",
      "created_at": "2025-08-30T16:00:00Z"
    }
  },
  "message": "Comment flagged for review"
}
```

---

## **7. Get User's Comments**

### **Endpoint**
```http
GET /api/comments/users/:userId/comments
```

### **Authentication**
- Optional

### **Path Parameters**
| Parameter | Type | Required | Validation |
|-----------|------|----------|------------|
| userId | UUID | Yes | Must be valid UUID, user must exist |

### **Query Parameters**
| Parameter | Type | Required | Default | Validation |
|-----------|------|----------|---------|------------|
| limit | Integer | No | 50 | Min: 1, Max: 100 |
| offset | Integer | No | 0 | Min: 0 |

### **Response**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "full_name": "John Doe",
      "avatar_url": "https://cloudinary.com/avatar.jpg"
    },
    "comments": [
      {
        "id": "comment-uuid",
        "content": "User's comment content",
        "issue_id": "issue-uuid",
        "issue_title": "Related Issue Title",
        "parent_comment_id": null,
        "reply_count": 2,
        "is_flagged": false,
        "created_at": "2025-08-30T14:00:00Z"
      }
    ],
    "total": 25,
    "stats": {
      "total_comments": 25,
      "flagged_comments": 0
    }
  }
}
```

---

## **Issue Voting API (Available)**

### **1. Vote on Issue**
```http
POST /api/issues/:issueId/vote
```

### **Authentication**
- Required: Bearer token

### **Rate Limiting**
- 100 votes per hour per user

### **Request Body**
```json
{
  "voteType": 1  // 1 for upvote, -1 for downvote
}
```

### **Validation Rules**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| voteType | Integer | Yes | Must be exactly 1 (upvote) or -1 (downvote) |

### **Business Rules**
- Users cannot vote on their own issues
- One vote per user per issue
- Changing vote updates existing vote

### **Validation Errors**
- `400` - "Valid issue ID is required"
- `400` - "Vote type must be 1 (upvote) or -1 (downvote)"
- `400` - "You cannot vote on your own issue"
- `404` - "Issue not found"
- `429` - "Rate limit exceeded"

### **Response**
```json
{
  "success": true,
  "data": {
    "vote": {
      "user_id": "user-uuid",
      "issue_id": "issue-uuid",
      "vote_type": 1,
      "created_at": "2025-08-30T16:00:00Z"
    },
    "issueStats": {
      "upvotes": 15,
      "downvotes": 3,
      "total_score": 12,
      "user_vote": 1
    }
  },
  "message": "Vote recorded successfully"
}
```

### **2. Remove Vote from Issue**
```http
DELETE /api/issues/:issueId/vote
```

### **Authentication**
- Required: Bearer token

### **Response**
```json
{
  "success": true,
  "data": {
    "issueStats": {
      "upvotes": 14,
      "downvotes": 3,
      "total_score": 11,
      "user_vote": null
    }
  },
  "message": "Vote removed successfully"
}
```

---

## **Statistics API**

### **1. Public System Statistics**
```http
GET /api/dashboard/public/stats
```

### **Authentication**
- None required

### **Response**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total_issues": 2847,
      "resolved_issues": 2123,
      "total_citizens": 1562,
      "response_rate": 94,
      "total_comments": 8450,
      "active_stewards": 45,
      "avg_resolution_days": 5.2
    }
  }
}
```

### **2. Issue Statistics**
```http
GET /api/issues/:issueId/stats
```

### **Response**
```json
{
  "success": true,
  "data": {
    "stats": {
      "upvotes": 25,
      "downvotes": 3,
      "total_score": 22,
      "comments": 12,
      "views": 156,
      "user_vote": 1,
      "user_has_commented": true
    }
  }
}
```

### **3. User Statistics**
```http
GET /api/users/:userId/stats
```

### **Response**
```json
{
  "success": true,
  "data": {
    "stats": {
      "issues_created": 15,
      "comments_posted": 42,
      "votes_given": 128,
      "votes_received": 89,
      "reputation_score": 156,
      "join_date": "2025-01-15T00:00:00Z",
      "last_active": "2025-08-30T14:00:00Z"
    }
  }
}
```

---

## **Available Features Summary**

### ✅ **Comments**
- Create, read, update, delete comments
- Nested replies (parent-child structure)
- User comment history
- Pagination and sorting

### ✅ **Issue Voting**
- Upvote/downvote issues only
- Vote removal
- Vote statistics
- Rate limiting and validation

### ✅ **Content Flagging**
- Flag comments (STEWARD/ADMIN only for zone issues)
- Flag reasons with details
- Moderation queue support

### ✅ **Statistics**
- System-wide statistics
- Issue-specific statistics
- User activity statistics
- Dashboard analytics

### ❌ **NOT Available (No Database Support)**
- Comment voting/upvoting
- Comment reactions/emoji
- Advanced comment analytics
- Comment bookmarking

---

## **Permission Matrix**

| Action | CITIZEN | STEWARD | SUPER_ADMIN |
|--------|---------|---------|-------------|
| Read Comments | ✅ | ✅ | ✅ |
| Create Comments | ✅ | ✅ | ✅ |
| Update Own Comments | ✅ | ✅ | ✅ |
| Delete Own Comments | ✅ | ✅ | ✅ |
| Delete Any Comments | ❌ | ✅ (zone only) | ✅ |
| Flag Comments | ❌ | ✅ (zone only) | ✅ |
| Vote on Issues | ✅ | ✅ | ✅ |
| View Statistics | ✅ (public) | ✅ | ✅ |

---

## **Frontend Integration Examples**

### **Simple Comment Component**
```jsx
const CommentSection = ({ issueId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const fetchComments = async () => {
    const response = await fetch(`/api/comments/issues/${issueId}/comments`);
    const data = await response.json();
    setComments(data.data.comments);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;
    
    const response = await fetch(`/api/comments/issues/${issueId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: newComment })
    });

    if (response.ok) {
      const data = await response.json();
      setComments([data.data.comment, ...comments]);
      setNewComment('');
    }
  };

  return (
    <div>
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
      />
      <button onClick={addComment}>Add Comment</button>
      
      {comments.map(comment => (
        <div key={comment.id} className="comment">
          <div className="comment-header">
            <span>{comment.user_name}</span>
            <span>{new Date(comment.created_at).toLocaleDateString()}</span>
          </div>
          <div className="comment-content">{comment.content}</div>
        </div>
      ))}
    </div>
  );
};
```

### **Issue Voting Component**
```jsx
const IssueVoting = ({ issueId, initialStats }) => {
  const [stats, setStats] = useState(initialStats);

  const vote = async (voteType) => {
    const response = await fetch(`/api/issues/${issueId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ voteType })
    });

    if (response.ok) {
      const data = await response.json();
      setStats(data.data.issueStats);
    }
  };

  return (
    <div className="voting-buttons">
      <button onClick={() => vote(1)}>
        ↑ {stats.upvotes}
      </button>
      <span>{stats.total_score}</span>
      <button onClick={() => vote(-1)}>
        ↓ {stats.downvotes}
      </button>
    </div>
  );
};
```

This documentation accurately reflects your actual implementation with no voting on comments and zone-based flagging permissions for stewards.
