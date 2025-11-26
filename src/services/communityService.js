// communityService.js
import { apiCall, BLOB_BASE_URL } from './apiService';

export const communityAPI = {

  // Upload file first (image/video)
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("attachment", file);

    const res = await apiCall('/upload_file', formData, true);
    
    // Response format expected: { success: true, name: "filename.jpg" }
    if (res?.success && res?.name) {
      return res.name;
    }

    return null;
  },

  // GET POSTS
  getPosts: async (groupId, userId, keyword = '', learning = '1') => {
    const res = await apiCall('/group_post_list', {
      group_id: groupId,
      user_id: userId,
      keyword,
      learning,
    });

    if (res?.success && Array.isArray(res.data)) {
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

    // FETCH COMMENTS FOR A POST
  getPostComments: async (postId, userId) => {
    const res = await apiCall('/get_post_comments', {
      post_id: postId,
      user_id: userId
    });

    if (res?.success && Array.isArray(res.data)) {
      res.data = res.data.map(c => ({
        id: c.id,
        user: c.name || "User",
        avatar: c.image ? `${BLOB_BASE_URL}${c.image}` : "",
        text: c.comment,
        date: c.created || "",
      }));
    }

    return res;
  },



  // CREATE POST WITH IMAGE/VIDEO SUPPORT
  createPost: async (groupId, userId, postData) => {
    let uploadedImage = null;
    let uploadedVideo = null;

    // Upload image first if exists
    if (postData.image instanceof File) {
      uploadedImage = await communityAPI.uploadFile(postData.image);
    } else {
      uploadedImage = postData.image;
    }

    // Upload video if exists
    if (postData.video instanceof File) {
      uploadedVideo = await communityAPI.uploadFile(postData.video);
    } else {
      uploadedVideo = postData.video;
    }

    const formData = new FormData();
    formData.append('group_id', groupId);
    formData.append('user_id', userId);
    formData.append('post_title', postData.title || '');
    formData.append('post_description', postData.description || '');
    formData.append('learning', '1');

    if (uploadedImage) formData.append('post_image', uploadedImage);
    if (uploadedVideo) formData.append('post_video', uploadedVideo);

    return await apiCall('/create_group_post', formData, true);
  },


  // LIKE/UNLIKE POST
  likePost: (postId, userId, type) =>
    apiCall('/like_post', { post_id: postId, user_id: userId, type }),

  // ADD COMMENT
  addComment: async (postId, userId, comment) => {
    const res = await apiCall('/post_comment', { post_id: postId, user_id: userId, comment });

    if (res?.success && Array.isArray(res.data)) {
      res.data = res.data.map(c => ({
        ...c,
        image: c.image ? `${BLOB_BASE_URL}${c.image}` : null,
      }));
    }
    return res;
  },

  deleteComment: (commentId, postId, userId = '') =>
    apiCall('/delete_post_comment', userId ? { comment_id: commentId, post_id: postId, user_id: userId } : { comment_id: commentId, post_id: postId }),

  deletePost: (postId, userId = '') =>
    apiCall('/delete_post', userId ? { post_id: postId, user_id: userId } : { post_id: postId }),

  reportPost: (postId, userId, reason = '') =>
    apiCall('/report_post_abuse', { post_id: postId, user_id: userId, reason }),

};

export default communityAPI;
