// communityService.js
import { apiCall, BLOB_BASE_URL } from './apiService';

export const communityAPI = {

  getPosts: async (groupId, userId, keyword = '', learning = '1') => {
    const res = await apiCall('/group_post_list', {
      group_id: groupId,
      user_id: userId,
      keyword,
      learning,
    });

    // FIX IMAGE & VIDEO URL
    const ok = res && (res.success === true || res.replyCode === 'success');
    if (ok && Array.isArray(res.data)) {
      res.data = res.data.map(post => ({
        ...post,
        post_image: post.post_image ? `${BLOB_BASE_URL}${post.post_image}` : null,
        image: post.image ? `${BLOB_BASE_URL}${post.image}` : null,
        video: post.video ? `${BLOB_BASE_URL}${post.video}` : null,
        post_video: post.post_video ? `${BLOB_BASE_URL}${post.post_video}` : null,
      }));
    }

    return res;
  },

  

 
 // CREATE POST
createPost: async (groupId, userId, postData) => {
  const formData = new FormData();
  formData.append('group_id', groupId);
  formData.append('user_id', userId);
  formData.append('post_title', postData.title || '');
  formData.append('post_description', postData.description || '');
  formData.append('learning', '1');  // <-- YE ADD KARO
  
  if (postData.image) {
    formData.append('post_image', postData.image);
  }
  if (postData.video) {
    formData.append('post_video', postData.video);
  }

  const res = await apiCall('/create_group_post', formData, true);
  return res;
},

  // LIKE/UNLIKE POST
  likePost: (postId, userId, type) =>
    apiCall('/like_post', { post_id: postId, user_id: userId, type }),

  // ADD COMMENT
  addComment: async (postId, userId, comment) => {
    const res = await apiCall('/post_comment', { post_id: postId, user_id: userId, comment });
    const ok = res && (res.success === true || res.replyCode === 'success');
    if (ok && Array.isArray(res.data)) {
      res.data = res.data.map(c => ({
        ...c,
        image: c.image ? `${BLOB_BASE_URL}${c.image}` : c.image || null,
      }));
    }
    return res;
  },

  // DELETE COMMENT
  deleteComment: async (commentId, postId, userId = '') => {
    const payload = { comment_id: commentId, post_id: postId };
    if (userId) payload.user_id = userId;
    const res = await apiCall('/delete_post_comment', payload);
    const ok = res && (res.success === true || res.replyCode === 'success');
    if (ok && Array.isArray(res.data)) {
      res.data = res.data.map(c => ({
        ...c,
        image: c.image ? `${BLOB_BASE_URL}${c.image}` : c.image || null,
      }));
    }
    return res;
  },

  // DELETE POST
  deletePost: async (postId, userId = '') => {
    const payload = { post_id: postId };
    if (userId) payload.user_id = userId;
    const res = await apiCall('/delete_post', payload);
    return res;
  },

  // REPORT POST
  reportPost: async (postId, userId, reason = '') => {
    const res = await apiCall('/report_post_abuse', { 
      post_id: postId, 
      user_id: userId,
      reason: reason 
    });
    return res;
  },
};

export default communityAPI;