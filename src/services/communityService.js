// communityService.js
import { apiCall, BLOB_BASE_URL } from './apiService';

export const communityAPI = {

  // Upload file first (image/video)
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append("attachment", file);

      console.log('📤 Uploading file:', file.name);

      // Make the API call with formData
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://api.learningbix.com:8112'}/upload_file`, {
        method: 'POST',
        body: formData,
      });

      const res = await response.json();
      console.log('📥 Upload response:', res);

      // Backend returns: { status: true, msg: 'File uploaded successfully', name: 'filename.jpg' }
      if (res.status === true || res.success === true) {
        const filename = res.name || res.data?.name || res.raw?.name;
        console.log('✅ File uploaded successfully:', filename);
        return filename; // Return just the filename, we'll add BLOB_BASE_URL later
      }

      console.error('❌ Upload failed:', res);
      return null;
    } catch (error) {
      console.error('❌ Upload error:', error);
      return null;
    }
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

  // GET POST DETAILS
  getPostDetails: async (postId, userId) => {
    const res = await apiCall('/group_post_details', {
      post_id: postId,
      user_id: userId
    });

    if (res?.success && res?.data) {
      const post = res.data.post || res.data;
      res.data = {
        ...post,
        post_image: post.post_image ? `${BLOB_BASE_URL}${post.post_image}` : null,
        image: post.image ? `${BLOB_BASE_URL}${post.image}` : null,
        video: post.video ? `${BLOB_BASE_URL}${post.video}` : null,
        post_video: post.post_video ? `${BLOB_BASE_URL}${post.post_video}` : null,
        user_profile: post.user_profile ? `${BLOB_BASE_URL}${post.user_profile}` : null,
        profile_image: post.profile_image ? `${BLOB_BASE_URL}${post.profile_image}` : null,
      };
    }

    return res;
  },

  // CREATE POST WITH IMAGE/VIDEO SUPPORT
  createPost: async (groupId, userId, postData) => {
    let uploadedImageFilename = null;
    let uploadedVideoFilename = null;

    // Upload image first if exists
    if (postData.image instanceof File) {
      console.log('📤 Uploading image file...');
      uploadedImageFilename = await communityAPI.uploadFile(postData.image);
      console.log('✅ Image uploaded:', uploadedImageFilename);
    } else if (postData.image) {
      uploadedImageFilename = postData.image;
    }

    // Upload video if exists
    if (postData.video instanceof File) {
      console.log('📤 Uploading video file...');
      uploadedVideoFilename = await communityAPI.uploadFile(postData.video);
      console.log('✅ Video uploaded:', uploadedVideoFilename);
    } else if (postData.video) {
      uploadedVideoFilename = postData.video;
    }

    // Create the post with uploaded filenames
    const payload = {
      group_id: groupId,
      user_id: userId,
      post_title: postData.title || '',
      post_description: postData.description || '',
      learning: '1',
    };

    // Add image/video filenames (not full URLs, just filenames)
    if (uploadedImageFilename) {
      payload.post_image = uploadedImageFilename;
    }
    if (uploadedVideoFilename) {
      payload.post_video = uploadedVideoFilename;
    }

    console.log('📤 Creating post with payload:', payload);

    // Call create post API
    const res = await apiCall('/create_group_post', payload);

    console.log('📥 Create post response:', res);

    // Normalize returned post to include full blob URLs
    if (res?.success && res?.data) {
      const toFullUrl = (filename) => {
        if (!filename) return null;
        // If already full URL, return as is
        if (filename.startsWith('http')) return filename;
        // Otherwise add BLOB_BASE_URL
        return `${BLOB_BASE_URL}${filename}`;
      };

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