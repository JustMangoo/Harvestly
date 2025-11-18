import React, { useEffect, useState } from "react";
import "./PostDetailPage.css";
import { useParams, useNavigate } from "react-router-dom";
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
import Button from "../components/Button";
import AppBar from "../components/AppBar";

const PostDetailPage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
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
      const inserted = await createComment({
        postId: postId,
        text: newComment.trim(),
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
      const inserted = await createReply({
        commentId,
        text: replyText.trim(),
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
            comment.profiles?.username || comment.id
          }`}
          alt="User avatar"
        />
      </div>
      <div className="comment-body">
        <strong
          onClick={() =>
            comment.user_id && navigate(`/profile/${comment.user_id}`)
          }
          style={{ cursor: comment.user_id ? "pointer" : "default" }}
        >
          {comment.profiles?.username ?? "Anonymous"}
        </strong>
        <span className="comment-time">{timeAgo(comment.created_at)}</span>
        <p>{comment.body}</p>

        <div className="comment-actions">
          <Button
            icon="Favorite"
            text={`${comment.like_count || 0}`}
            variant="outline"
            size="sm"
            onClick={() => onLikeComment(comment.id)}
            iconFilled={false}
          />
          <Button
            icon="Chat_bubble"
            text="Reply"
            variant="outline"
            size="sm"
            onClick={() =>
              setActiveCommentId(
                activeCommentId === comment.id ? null : comment.id
              )
            }
            iconFilled={false}
          />
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
            <Button
              text="Send"
              variant="primary"
              size="sm"
              onClick={() => onReply(comment.id)}
            />
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
                  reply.profiles?.username || reply.id
                }`}
                alt="User avatar"
              />
            </div>
            <div className="comment-body">
              <strong
                onClick={() =>
                  reply.user_id && navigate(`/profile/${reply.user_id}`)
                }
                style={{ cursor: reply.user_id ? "pointer" : "default" }}
              >
                {reply.profiles?.username ?? "Anonymous"}
              </strong>
              <span className="comment-time">{timeAgo(reply.created_at)}</span>
              <p>{reply.body}</p>
              <div className="comment-actions">
                <Button
                  icon="Favorite"
                  text={`${reply.like_count || 0}`}
                  variant="outline"
                  size="sm"
                  onClick={() => onLikeReply(comment.id, reply.id)}
                  iconFilled={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const postDisplayName = post?.profiles?.username ?? "Anonymous";

  return (
    <div className="forum-page">
      <AppBar showBack />

      {/* Main Post */}
      {loading ? (
        <div className="post-card">
          <p>Loading…</p>
        </div>
      ) : error ? (
        <div className="post-card">
          <p>Error: {error}</p>
        </div>
      ) : post ? (
        <div className="post-card">
          <div className="post-head">
            <div className="post-avatar">
              <img
                src={`https://i.pravatar.cc/150?u=${
                  postDisplayName || post.id
                }`}
                alt="User avatar"
              />
            </div>
            <div
              className="post-author"
              onClick={() =>
                post.user_id && navigate(`/profile/${post.user_id}`)
              }
              style={{ cursor: post.user_id ? "pointer" : "default" }}
            >
              {postDisplayName}
            </div>
            <div className="post-time">{timeAgo(post.published_at)}</div>
          </div>
          <div className="post-content">
            {post.title && <h2 className="post-title">{post.title}</h2>}
            <div className="post-text">{post.body}</div>
          </div>
          <div className="post-actions">
            <Button
              icon="Favorite"
              text={`${post.like_count || 0}`}
              variant="outline"
              size="sm"
              onClick={onLikePost}
              iconFilled={false}
            />
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
          <Button
            text="Comment"
            variant="primary"
            size="sm"
            onClick={onAddComment}
          />
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;
