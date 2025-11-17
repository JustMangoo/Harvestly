import React, { useEffect, useState } from "react";
import "./PostDetailPage.css";
import { FaHeart, FaRegComment } from "react-icons/fa";
import backarrow from "../assets/backarrow.svg";
import { useParams } from "react-router-dom";
import {
  getPostById,
  listComments,
  listReplies,
  createComment,
  createReply,
  likePost,
  likeComment,
  likeReply,
  timeAgo,
} from "../services/forum";
import { supabase } from "../lib/supabaseClient";
import { getUserProfile } from "../services/users";

const PostDetailPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]); // each: {id, author_name, body, like_count, created_at, replies: []}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const p = await getPostById(postId);
        if (cancelled) return;
        setPost(p);
        const cs = await listComments(postId);
        if (cancelled) return;
        // load replies for each comment
        const withReplies = await Promise.all(
          cs.map(async (c) => ({ ...c, replies: await listReplies(c.id) }))
        );
        if (!cancelled) setComments(withReplies);
      } catch (e) {
        if (!cancelled) setError(e.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function onLikePost() {
    try {
      setPost((p) => (p ? { ...p, like_count: (p.like_count ?? 0) + 1 } : p));
      await likePost(postId);
    } catch {}
  }

  async function onAddComment() {
    if (!newComment.trim()) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      let authorName = "Anonymous";
      if (user?.id) {
        try {
          const profile = await getUserProfile(user.id);
          authorName =
            profile?.username ||
            user.user_metadata?.name ||
            user.email ||
            authorName;
        } catch (_) {
          authorName = user?.user_metadata?.name || user?.email || authorName;
        }
      }
      const inserted = await createComment({
        postId: postId,
        text: newComment.trim(),
        authorName,
        userId: user?.id,
      });
      setComments((cs) => [{ ...inserted, replies: [] }, ...cs]);
      setNewComment("");
    } catch (e) {
      console.error(e);
      alert("Failed to add comment.");
    }
  }

  async function onLikeComment(commentId) {
    try {
      setComments((cs) =>
        cs.map((c) =>
          c.id === commentId ? { ...c, like_count: (c.like_count ?? 0) + 1 } : c
        )
      );
      await likeComment(commentId);
    } catch {}
  }

  async function onReply(commentId) {
    if (!replyText.trim()) return;
    try {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      let authorName = "Anonymous";
      if (user?.id) {
        try {
          const profile = await getUserProfile(user.id);
          authorName =
            profile?.username ||
            user.user_metadata?.name ||
            user.email ||
            authorName;
        } catch (_) {
          authorName = user?.user_metadata?.name || user?.email || authorName;
        }
      }
      const inserted = await createReply({
        commentId,
        text: replyText.trim(),
        authorName,
        userId: user?.id,
      });
      setComments((cs) =>
        cs.map((c) =>
          c.id === commentId
            ? { ...c, replies: [...(c.replies || []), inserted] }
            : c
        )
      );
      setReplyText("");
      setActiveCommentId(null);
    } catch (e) {
      console.error(e);
      alert("Failed to add reply.");
    }
  }

  async function onLikeReply(commentId, replyId) {
    try {
      setComments((cs) =>
        cs.map((c) =>
          c.id === commentId
            ? {
                ...c,
                replies: (c.replies || []).map((r) =>
                  r.id === replyId
                    ? { ...r, like_count: (r.like_count ?? 0) + 1 }
                    : r
                ),
              }
            : c
        )
      );
      await likeReply(replyId);
    } catch {}
  }

  const renderComment = (comment) => (
    <div key={comment.id} className="comment-card">
      <div className="comment-avatar">
        <img
          src={`https://i.pravatar.cc/150?u=${
            comment.author_name || comment.id
          }`}
          alt="User avatar"
        />
      </div>
      <div className="comment-body">
        <strong>{comment.author_name}</strong>
        <span className="comment-time">{timeAgo(comment.created_at)}</span>
        <p>{comment.body}</p>

        <div className="comment-actions">
          <button
            className="comment-action-btn"
            onClick={() => onLikeComment(comment.id)}
          >
            <FaHeart className="icon-element" />{" "}
            <span>{comment.like_count || 0}</span>
          </button>
          <button
            className="comment-action-btn"
            onClick={() =>
              setActiveCommentId(
                activeCommentId === comment.id ? null : comment.id
              )
            }
          >
            Reply
          </button>
        </div>

        {activeCommentId === comment.id && (
          <div className="reply-input-container">
            <input
              type="text"
              placeholder="Write a reply..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="reply-input"
            />
            <button
              className="reply-send-btn"
              onClick={() => onReply(comment.id)}
            >
              Send
            </button>
          </div>
        )}

        {(comment.replies || []).map((reply) => (
          <div
            key={reply.id}
            className="comment-card comment-reply"
            style={{ marginLeft: "36px" }}
          >
            <div className="comment-avatar">
              <img
                src={`https://i.pravatar.cc/150?u=${
                  reply.author_name || reply.id
                }`}
                alt="User avatar"
              />
            </div>
            <div className="comment-body">
              <strong>{reply.author_name}</strong>
              <span className="comment-time">{timeAgo(reply.created_at)}</span>
              <p>{reply.body}</p>
              <div className="comment-actions">
                <button
                  className="comment-action-btn"
                  onClick={() => onLikeReply(comment.id, reply.id)}
                >
                  <FaHeart className="icon-element" />{" "}
                  <span>{reply.like_count || 0}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="forum-page">
      {/* Header */}
      <div className="headwear-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          <img src={backarrow} alt="Back" />
        </button>
      </div>

      {/* Main Post */}
      {loading ? (
        <div className="post-card">
          <div className="post-body">
            <p>Loading…</p>
          </div>
        </div>
      ) : error ? (
        <div className="post-card">
          <div className="post-body">
            <p>Error: {error}</p>
          </div>
        </div>
      ) : post ? (
        <div className="post-card">
          <div className="post-avatar">
            <img
              src={`https://i.pravatar.cc/150?u=${post.author_name || post.id}`}
              alt="User avatar"
            />
          </div>
          <div className="post-body">
            <div className="post-head">
              <div className="post-author">{post.author_name}</div>
              <div className="post-time">{timeAgo(post.published_at)}</div>
            </div>
            {post.title && <h2 className="post-title">{post.title}</h2>}
            <div className="post-text">{post.body}</div>
            <div className="post-actions">
              <button className="post-action-btn" onClick={onLikePost}>
                <FaHeart className="icon-element" />{" "}
                <span>{post.like_count || 0}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Comments Section */}
      <div className="post-detail-comments">
        <h2>Comments</h2>
        {comments.length === 0 ? (
          <p>No comments yet. Be the first to comment.</p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
        <div className="reply-input-container" style={{ marginTop: 12 }}>
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="reply-input"
          />
          <button className="reply-send-btn" onClick={onAddComment}>
            Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
