import api from './client';

// Upload API calls (exactly from original api.js)
export const uploadAPI = {
  uploadProfileImage: (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.post('/upload/profile', formData, {
      headers: { 'Content-Type': undefined },
    });
  },
  uploadIssueMedia: (mediaFiles) => {
    const formData = new FormData();
    Array.from(mediaFiles).forEach(file => {
      formData.append('media', file);
    });
    return api.post('/upload/issue-media', formData, {
      headers: { 'Content-Type': undefined },
    });
  },
  deleteMedia: (publicId, type = 'image') => 
    api.delete('/upload/media', { data: { publicId, type } }),
  getMediaInfo: (publicId) => api.get(`/upload/media/${publicId}`),
};
