import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart, FaCommentDots, FaEye, FaFlag, FaTrash } from "react-icons/fa";
import communityAPI from "../../services/communityService";
import getBlobUrl from "../../utils/blob";
import Avatar from "../Avatar/Avatar";

const Community = ({ user }) => {
  const [showModal, setShowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ========================= API DATA STATE =========================
  const [projects, setProjects] = useState([]);
  
  // ========================= COMMENTS STATE =========================
  const [comments, setComments] = useState({});
  const [commentInput, setCommentInput] = useState("");

  // ========================= LIKES STATE =========================
  const [likes, setLikes] = useState({});

  // ========================= VIEWS STATE =========================
  const [views, setViews] = useState({});

  // ========================= CREATE POST STATE =========================
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [postImage, setPostImage] = useState(null);
  const [postVideo, setPostVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Normalize USER_ID as a string for consistent comparison
  const USER_ID = String(user?.id || user?.student_id || user?.user_id || "44165");
  const GROUP_ID = "82";

  // ========================= FILTERED POSTS =========================
  // My Posts - posts created by current user
  const myPosts = projects.filter(post => 
    String(post.user_id) === USER_ID
  );
  
  // Most Loved Projects - posts by other users (not current user)
  const mostLovedPosts = projects.filter(post => 
    String(post.user_id) !== USER_ID
  );

  // ========================= FETCH DATA FROM API =========================
  useEffect(() => {
    fetchPosts();
  }, []);

  const getAvatar = (data) => {
    if (!data) return `https://i.pravatar.cc/150?img=1`;
    return data.user_profile?.trim()
      ? getBlobUrl(data.user_profile)
      : data.profile_image?.trim()
      ? getBlobUrl(data.profile_image)
      : data.image?.trim()
      ? getBlobUrl(data.image)
      : `https://i.pravatar.cc/150?img=${data.id}`;
  };

  // Get avatar for post author - use current user's profile if it's their post
  const getPostAuthorAvatar = (post) => {
    const postUserId = String(post.user_id || post.userId || '');
    const isCurrentUserPost = postUserId === USER_ID;
    
    // If it's current user's post, use current user's profile image
    if (isCurrentUserPost && user) {
      const userAvatar = user.profile_image || user.user_profile || user.image;
      if (userAvatar) {
        return getBlobUrl(userAvatar);
      }
    }
    // Otherwise, use avatar from post data
    return getAvatar(post);
  };

  const toFullUrl = (path) => {
    return getBlobUrl(path) || (path && typeof path === 'string' ? path : null);
  };

  const getImageUrl = (post) => toFullUrl(post?.post_image || post?.image);
  const getVideoUrl = (post) => toFullUrl(post?.post_video || post?.video);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await communityAPI.getPosts(GROUP_ID, USER_ID);

      const ok = response && (response.success === true || response.replyCode === 'success');
      if (ok && response.data) {
        const posts = Array.isArray(response.data) ? response.data : response.data.posts || [];
        setProjects(posts);

        const initialLikes = {};
        const initialViews = {};
        const initialComments = {};

        posts.forEach((post) => {
          const id = post.id ?? post.post_id ?? post.postId;
          initialLikes[id] = {
            count: parseInt(post.total_likes || 0),
            liked: parseInt(post.liked) === 1
          };
          initialViews[id] = parseInt(post.view_count || post.views || 0) || 0;
          // If the server returns comments as part of post, use them as initial comments
          if (Array.isArray(post.comments) && post.comments.length) {
            initialComments[id] = post.comments.map((c) => ({
              id: c.id || c.comment_id,
              user: c.name || c.user || 'User',
              avatar: c.image || getAvatar(c),
              text: c.comment || c.text || '',
              date: c.created || c.date || '',
            }));
          }
        });

        setLikes(initialLikes);
        setViews(initialViews);
        if (Object.keys(initialComments).length) setComments(initialComments);
      } else {
        setProjects([]);
      }
    } catch (err) {
      console.error("fetchPosts error:", err);
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // ========================= CREATE POST HANDLER =========================
  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!postTitle.trim() && !postImage && !postVideo && !postDescription.trim()) {
      alert("Your post is empty!");
      return;
    }

    setSubmitting(true);

    try {
      const postData = {
        title: postTitle?.trim() || "",
        description: postDescription?.trim() || "",
        image: postImage || null,   // File object allowed
        video: postVideo || null,   // File object allowed
      };

      const res = await communityAPI.createPost(GROUP_ID, USER_ID, postData);

      const ok = res && (res.success === true || res.replyCode === 'success');

      if (ok) {
        alert("🎉 Post created successfully!");

        // reset form
        setPostTitle("");
        setPostDescription("");
        setPostImage(null);
        setPostVideo(null);

        // Hide modal
        setShowModal(false);

        // Optimistic update: add the new post to UI immediately
        // Try to get the created post object from API response, otherwise build a fallback
        const createdPost = (res.data && (res.data.post || (Array.isArray(res.data) ? res.data[0] : res.data))) || null;
        const newPost = createdPost
          ? {
              ...createdPost,
              user_id: createdPost.user_id ?? USER_ID,
            }
          : {
              id: Date.now(),
              user_id: USER_ID,
              name: user?.name || user?.full_name || 'You',
              post_title: postTitle?.trim() || '',
              post_description: postDescription?.trim() || '',
              post_image: postImage && typeof postImage === 'string' ? postImage : postImage ? URL.createObjectURL(postImage) : null,
              post_video: postVideo && typeof postVideo === 'string' ? postVideo : postVideo ? URL.createObjectURL(postVideo) : null,
              total_likes: 0,
              liked: 0,
              comments: [],
              view_count: 0,
              created: new Date().toISOString(),
            };

        setProjects((prev) => [newPost, ...(prev || [])]);
        setLikes((prev) => ({ ...prev, [newPost.id]: { count: 0, liked: false } }));
        setViews((prev) => ({ ...prev, [newPost.id]: 0 }));
        setComments((prev) => ({ ...prev, [newPost.id]: [] }));

        // Optionally re-fetch to sync with server-fetched canonical data
        fetchPosts();
      } else {
        alert(res?.replyMsg || "❌ Something went wrong while creating post.");
      }
    } catch (err) {
      console.error("createPost error:", err);
      alert("❌ Error creating post");
    } finally {
      setSubmitting(false);
    }
  };


  // ========================= DELETE POST HANDLER =========================
  const handleDeletePost = async (postId, e) => {
    e.stopPropagation();
    
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const res = await communityAPI.deletePost(postId, USER_ID);
      const ok = res && (res.success === true || res.replyCode === 'success');

      if (ok) {
        alert("Post deleted successfully!");
        setProjects(prev => prev.filter(p => p.id !== postId));
        
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost(null);
        }
      } else {
        alert(res?.replyMsg || "Failed to delete post");
      }
    } catch (err) {
      console.error("deletePost error:", err);
      alert("Error deleting post");
    }
  };

  // ========================= LIKE HANDLER =========================
  const handleLike = async (postId, e) => {
    e.stopPropagation();

    const prev = likes[postId] || { count: 0, liked: false };
    const newLiked = !prev.liked;
    const newCount = newLiked ? prev.count + 1 : prev.count - 1;

    setLikes((p) => ({
      ...p,
      [postId]: { liked: newLiked, count: newCount },
    }));

    try {
      const type = newLiked ? 1 : 0;
      const res = await communityAPI.likePost(postId, USER_ID, type);

      if (!(res && (res.success === true || res.replyCode === "success"))) {
        setLikes((p) => ({
          ...p,
          [postId]: prev,
        }));
      }
    } catch (err) {
      console.error("likePost error:", err);
      setLikes((p) => ({
        ...p,
        [postId]: prev,
      }));
    }
  };

  // ========================= COMMENT HANDLERS =========================
  const handleAddComment = async (postId) => {
    if (!commentInput.trim()) return;

    const localComment = {
      id: Date.now(),
      user: "You",
      avatar: getAvatar(user) || `https://i.pravatar.cc/150?img=12`,
      text: commentInput,
      date: new Date().toDateString(),
    };

    setComments((prev) => ({
      ...prev,
      [postId]: prev[postId] ? [...prev[postId], localComment] : [localComment],
    }));
    setCommentInput("");

    try {
      const res = await communityAPI.addComment(postId, USER_ID, localComment.text);
      const ok = res && (res.success === true || res.replyCode === 'success');
      if (ok && Array.isArray(res.data)) {
        const mapped = res.data.map((c) => ({
          id: c.id,
          user: c.name || c.user || 'User',
          avatar: c.image || getAvatar(c),
          text: c.comment || c.text || '',
          date: formatDate(c.created || c.date),
        }));

        setComments((prev) => ({
          ...prev,
          [postId]: mapped,
        }));
      } else {
        setComments((prev) => ({
          ...prev,
          [postId]: prev[postId].filter((c) => c.id !== localComment.id),
        }));
      }
    } catch (err) {
      console.error("addComment error:", err);
      setComments((prev) => ({
        ...prev,
        [postId]: prev[postId].filter((c) => c.id !== localComment.id),
      }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    const previous = comments[postId] || [];
    setComments((prev) => ({ ...prev, [postId]: prev[postId].filter((c) => c.id !== commentId) }));

    try {
      const res = await communityAPI.deleteComment(commentId, postId, USER_ID);
      const ok = res && (res.success === true || res.replyCode === 'success');
      if (ok && Array.isArray(res.data)) {
        const mapped = res.data.map((c) => ({
          id: c.id,
          user: c.name || c.user || 'User',
          avatar: c.image || getAvatar(c),
          text: c.comment || c.text || '',
          date: formatDate(c.created || c.date),
        }));
        setComments((prev) => ({ ...prev, [postId]: mapped }));
      } else {
        setComments((prev) => ({ ...prev, [postId]: previous }));
      }
    } catch (err) {
      console.error("deleteComment error:", err);
      setComments((prev) => ({ ...prev, [postId]: previous }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Normalize a comment object from different API shapes
  const normalizeComment = (c) => {
    if (!c) return null;
    return {
      id: c.id || c.comment_id || Date.now(),
      user: c.name || c.user || 'User',
      avatar: c.image || c.avatar || getAvatar(c),
      text: c.comment || c.text || '',
      date: formatDate(c.created || c.date),
    };
  };

  

  // ========================= VIEW HANDLER =========================
  const handlePostClick = async (post) => {
  setViews(prev => ({
    ...prev,
    [post.id]: (prev[post.id] || 0) + 1
  }));

  setSelectedPost(post);

  try {
    // 1️⃣ Fetch post details
    const res = await communityAPI.getPostDetails(post.id, USER_ID);

    if (res?.success && res?.data) {
      const detail = res.data.post || res.data;

      // Update selected post (title/description/video etc.)
      setSelectedPost(detail);

      // 2️⃣ Fetch comments from new API
      const commentsRes = await communityAPI.getPostComments(post.id, USER_ID);

      // Normalize comments response — API can return array or nested objects depending on endpoint
      const possibleArrays = [
        commentsRes?.data,
        commentsRes?.raw?.data,
        commentsRes?.data?.data,
        commentsRes?.data?.comments,
        commentsRes?.raw?.comments,
      ];

      let commentsArray = [];
      for (const arr of possibleArrays) {
        if (Array.isArray(arr)) {
          commentsArray = arr;
          break;
        }
      }

      if (!commentsArray.length && Array.isArray(commentsRes?.data)) {
        commentsArray = commentsRes.data;
      }

      // If we have comments, map them to the normalized UI shape
      if (commentsArray.length) {
        const mappedComments = commentsArray.map((c) => ({
          id: c.id,
          user: c.name || c.user || 'User',
          avatar: c.image ? c.image : getAvatar(c),
          text: c.comment || c.text || '',
          date: formatDate(c.created || c.date),
        }));

        setComments((prev) => ({
          ...prev,
          [post.id]: mappedComments,
        }));
      }
    }
  } catch (err) {
    console.log("Error loading post details", err);
  }
};

  // ========================= POST CARD COMPONENT =========================
  const PostCard = ({ post, showDeleteButton = false }) => (
    <div
      key={post.id}
      className="w-full sm:w-[48%] lg:w-[32%] bg-white border border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow relative"
      onClick={() => handlePostClick(post)}
    >
      {/* Delete button for My Posts */}
      {showDeleteButton && (
        <button
          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full z-10"
          onClick={(e) => handleDeletePost(post.id, e)}
          title="Delete Post"
        >
          <FaTrash size={14} />
        </button>
      )}

      {getImageUrl(post) ? (
        <img
          src={getImageUrl(post)}
          className="w-full h-[204px] object-cover"
          alt="post"
        />
      ) : getVideoUrl(post) ? (
        <video
          src={getVideoUrl(post)}
          className="w-full h-[204px] object-cover"
          controls
        />
      ) : (
        <img
          src={`https://picsum.photos/seed/${post.id}/600/400`}
          className="w-full h-[204px] object-cover"
          alt="placeholder"
        />
      )}

      <div className="p-3">
        <h3 className="text-lg font-semibold">{post.post_title || post.title}</h3>

        <div className="flex justify-between items-center mt-3">
            <div className="flex items-center">
             <Avatar
              src={getPostAuthorAvatar(post) || `https://i.pravatar.cc/150?img=${post.id}`}
              alt={post.name || post.author || 'avatar'}
              className="mr-3"
              size={48}
            />
            <div>
              <h6 className="text-xs font-semibold text-gray-700">Posted by</h6>
              <p className="text-sm text-blue-800">{post.name || post.author}</p>
            </div>
          </div>
          <p className="text-sm text-blue-600">
            {formatDate(post?.created || post?.date)}
          </p>
        </div>

        <div className="flex justify-between mt-4">
          <button 
            className="flex items-center hover:opacity-80"
            onClick={(event) => handleLike(post.id, event)}
          >
            {likes[post.id]?.liked ? (
              <FaHeart className="text-orange-400 text-2xl mr-1" />
            ) : (
              <FaRegHeart className="text-orange-400 text-2xl mr-1" />
            )}
            <strong>{likes[post.id]?.count || 0}</strong>
          </button>
          
          <div className="flex items-center">
            <FaCommentDots className="text-blue-500 text-2xl mr-1" />
            <strong>{comments[post.id]?.length || post.comments?.length || 0}</strong>
          </div>
          
          <div className="flex items-center">
            <FaEye className="text-black text-2xl mr-1" />
            <strong>{views[post.id] || 0} Views</strong>
          </div>
        </div>
      </div>
    </div>
  );

  // ========================= LOADING & ERROR STATES =========================
  if (loading) {
    return (
      <div className="w-full max-w-[1200px] mx-auto p-6 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1200px] mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">Error: {error}</p>
          <button 
            onClick={fetchPosts}
            className="mt-4 bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded-full"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayedComments = selectedPost ? (comments[selectedPost.id] || selectedPost.comments || []) : [];

  return (
    <div className="w-full max-w-[1200px] mx-auto p-6">

      {/* =================== POST DETAIL VIEW =================== */}
      {selectedPost && (          
        <div className="w-full">
          <button 
            className="mb-4 text-blue-300 hover:text-blue-800 font-semibold"
            onClick={() => setSelectedPost(null)}
          >
            ← Back To Community
          </button>

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">{selectedPost.post_title || selectedPost.title}</h1>
          </div>

          <div className="flex flex-wrap gap-6">
            {/* LEFT CARD SECTION */}
            <div className="w-full max-w-[490px] bg-white border border-gray-300 rounded-lg p-4">
              {getImageUrl(selectedPost) ? (
                <img
                  src={getImageUrl(selectedPost)}
                  className="w-full h-[300px] object-cover rounded-lg"
                  alt="post"
                />
              ) : getVideoUrl(selectedPost) ? (
                <video
                  src={getVideoUrl(selectedPost)}
                  className="w-full h-[300px] object-cover rounded-lg"
                  controls
                />
              ) : (
                <img
                  src={`https://picsum.photos/seed/${selectedPost.id}/600/400`}
                  className="w-full h-[300px] object-cover rounded-lg"
                  alt="placeholder"
                />
              )}

              <div className="flex items-center gap-3 mt-4 mb-2">
                <Avatar
                  src={getPostAuthorAvatar(selectedPost) || `https://i.pravatar.cc/150?img=${selectedPost.id}`}
                  alt={selectedPost.name || selectedPost.author || 'avatar'}
                  size={48}
                />

                <div className="flex-1">
                  <h6 className="text-xs text-gray-600">Posted by</h6>
                  <p className="text-sm font-semibold text-blue-800">{selectedPost.name || selectedPost.author}</p>
                </div>

                <p className="text-sm text-blue-600">
                  {formatDate(selectedPost?.created || selectedPost?.date)}
                </p>
              </div>

              <div className="flex justify-between mb-2 py-3 border-y border-gray-200">
                <button 
                  className="flex items-center gap-2 hover:opacity-80"
                  onClick={(e) => handleLike(selectedPost.id, e)}
                >
                  {likes[selectedPost.id]?.liked ? (
                    <FaHeart className="text-orange-400 text-2xl" />
                  ) : (
                    <FaRegHeart className="text-orange-400 text-2xl" />
                  )}
                  <strong>{likes[selectedPost.id]?.count || 0}</strong>
                </button>

                <div className="flex items-center gap-2">
                  <FaCommentDots className="text-blue-500 text-2xl" />
                  <strong>{comments[selectedPost.id]?.length || selectedPost.comments?.length || 0}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <FaEye className="text-black text-2xl" />
                  <strong>{views[selectedPost.id] || 0} Views</strong>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">
                {selectedPost.post_description || selectedPost.description || `${selectedPost.post_title} — shared by ${selectedPost.name}`}
              </p>
            </div>

            {/* =================== RIGHT COMMENT BOX =================== */}
            <div className="w-full lg:w-[600px] bg-white border border-gray-300 rounded-lg p-4">
              <h3 className="text-xl font-semibold mb-4">
                Comments ({comments[selectedPost.id]?.length || 0})
              </h3>

              <div className="flex items-center gap-2 mb-6">
                  <Avatar
                    src={getAvatar(user) || `https://i.pravatar.cc/150?img=12`}
                    alt={user?.name || user?.full_name || 'You'}
                    size={40}
                    className="mr-2"
                  />

                <input
                  type="text"
                  placeholder="Write your comments"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 outline-none"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddComment(selectedPost.id);
                    }
                  }}
                />

                <button
                  className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-md font-semibold"
                  onClick={() => handleAddComment(selectedPost.id)}
                >
                  Post
                </button>
              </div>

               <div className="space-y-4 max-h-[500px] overflow-y-auto">
                 {displayedComments.map((cRaw) => {
                   const c = normalizeComment(cRaw);
                   return (
                     <div key={c.id} className="flex gap-3">
                   <Avatar
                    src={getAvatar(user) || `https://i.pravatar.cc/150?img=12`}
                    alt={user?.name || user?.full_name || 'You'}
                    size={40}
                    className="mr-2"
                  />

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h6 className="font-semibold text-sm">{c.user}</h6>
                        <p className="text-xs text-blue-600">{c.date}</p>
                      </div>

                      <p className="text-sm text-gray-700 mb-2">{c.text}</p>

                      <button
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                        onClick={() => handleDeleteComment(selectedPost.id, c.id)}
                      >
                        <i className="far fa-trash-alt"></i> Delete
                      </button>
                    </div>
                  </div>
                ); })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================== MAIN GRID =================== */}
      {!selectedPost && (
        <>
          <h1 className="text-4xl font-semibold text-gray-900">Community</h1>

          <p className="mt-2 py-4 px-5 text-gray-600 leading-loose space-y-2">
            <b>Explore the world, Genius!</b><br />
            <span>Be part of the world's biggest kid creators community.</span>
          </p>

          <button
            className="mt-3 mx-4 bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-2 rounded-full"
            onClick={() => setShowModal(true)}
          >
            Create Post
          </button>

          {/* =================== MY POSTS SECTION =================== */}
          <h5 className="mt-12 py-4 text-base font-semibold">📘 My Post</h5>
          
          <div className="flex flex-wrap gap-5">
            {myPosts.length === 0 ? (
              <div className="w-full text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                You haven't created any posts yet. Click "Create Post" to get started!
              </div>
            ) : (
              myPosts.map((post) => (
                <PostCard key={post.id} post={post} showDeleteButton={true} />
              ))
            )}
          </div>

          {/* =================== MOST LOVED PROJECTS SECTION =================== */}
          <h5 className="mt-12 text-base font-semibold text-black-800">💙 Most Loved Projects</h5>
          
          <div className="flex flex-wrap gap-5 mt-5">
            {mostLovedPosts.length === 0 ? (
              <div className="w-full text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                No posts from other users yet.
              </div>
            ) : (
              mostLovedPosts.map((post) => (
                <PostCard key={post.id} post={post} showDeleteButton={false} />
              ))
            )}
          </div>
        </>
      )}

      {/* =================== CREATE POST MODAL =================== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[999]">
          <div className="bg-white w-[500px] rounded-xl p-6 animate-[slideDown_0.3s_ease-out]">
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 hover:text-black text-2xl"
              >
                ✖
              </button>
            </div>

            <h3 className="text-center text-2xl font-semibold mb-6">
              Create Post
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="form text-gray-600 mb-1">Post Title *</label>
                <input
                  type="text"
                  placeholder="Enter post title"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 outline-none"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form text-gray-600 mb-1">Post Description</label>
                <textarea
                  placeholder="Enter post description"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 outline-none"
                  rows="3"
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                />
              </div>

              {/* Upload Image */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 text-sm font-medium capitalize">
              image
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer"
              onChange={(e) => setPostImage(e.target.files[0])}
            />
          </div>

          {/* Upload Video */}
          <div className="flex flex-col gap-1">
            <label className="text-gray-600 text-sm font-medium capitalize">
              upload Video
            </label>
            <input
              type="file"
              accept="video/*"
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer"
              onChange={(e) => setPostVideo(e.target.files[0])}
            />
          </div>


              <div className="text-center mt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-400 hover:bg-orange-500 text-white px-10 py-2 rounded-full font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================== REPORT POST MODAL =================== */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[999]">
          <div className="bg-white w-[400px] rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Report Post</h3>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason("");
                  setReportPostId(null);
                }}
                className="text-gray-600 hover:text-black text-2xl"
              >
                ✖
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-600 mb-2">Reason for reporting</label>
                <textarea
                  placeholder="Please describe why you're reporting this post..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:border-orange-400 focus:ring-2 focus:ring-orange-300 outline-none"
                  rows="4"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Community;