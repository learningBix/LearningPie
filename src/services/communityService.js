// communityService.js
import { apiCall, BLOB_BASE_URL } from './apiService';

export const communityAPI = {

  // Upload file first (image/video)
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append("attachment", file);

    const res = await apiCall('/upload_file', formData, true);
    
    // Response format expected: { success: true, name: "filename.jpg" }
      // Support various possible server response shapes.
      if (res?.success || res?.raw?.status === true) {
        // Try common shapes: res.data.name OR res.raw.name OR res.raw?.data?.name
        const name = res.data?.name || res.raw?.name || res.raw?.data?.name || null;
        // Support returning full URL as well: data.url
        const url = res.data?.url || res.raw?.url || null;
        return name || url || null;
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
        user_profile: post.user_profile ? `${BLOB_BASE_URL}${post.user_profile}` : (post.profile_image ? `${BLOB_BASE_URL}${post.profile_image}` : null),
        profile_image: post.profile_image ? `${BLOB_BASE_URL}${post.profile_image}` : (post.user_profile ? `${BLOB_BASE_URL}${post.user_profile}` : null),
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
          avatar: c.profile_image ? `${BLOB_BASE_URL}${c.profile_image}` : (c.user_profile ? `${BLOB_BASE_URL}${c.user_profile}` : (c.image ? `${BLOB_BASE_URL}${c.image}` : "")),
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

      // Normalize returned post(s) to include full blob URLs (image, video, profile)
      const res = await apiCall('/create_group_post', formData, true);

      if (res?.success && res?.data) {
        const toFullUrl = (path) => (path && typeof path === 'string' && !/^https?:\/\//i.test(path) ? `${BLOB_BASE_URL}${path}` : path);

        const normalizePost = (p) => {
          if (!p) return p;
          return {
            ...p,
            post_image: toFullUrl(p.post_image || p.image),
            image: toFullUrl(p.image || p.post_image),
            video: toFullUrl(p.video || p.post_video),
            post_video: toFullUrl(p.post_video || p.video),
            user_profile: toFullUrl(p.user_profile || p.profile_image),
            profile_image: toFullUrl(p.profile_image || p.user_profile),
          };
        };

        if (Array.isArray(res.data)) {
          res.data = res.data.map(normalizePost);
        } else if (res.data.post) {
          res.data.post = normalizePost(res.data.post);
        } else if (typeof res.data === 'object') {
          res.data = normalizePost(res.data);
        }
      }

      return res;
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
        avatar: c.profile_image ? `${BLOB_BASE_URL}${c.profile_image}` : (c.user_profile ? `${BLOB_BASE_URL}${c.user_profile}` : (c.image ? `${BLOB_BASE_URL}${c.image}` : null)),
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
