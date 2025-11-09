import React, { useState } from "react";
import "./PostMockup.css";
import { FaHeart, FaRegComment } from "react-icons/fa";
import backarrow from "../assets/backarrow.svg";

const PostMockup = () => {
  const [mainPostLikes, setMainPostLikes] = useState(0);
  const [replyText, setReplyText] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);

  const [comments, setComments] = useState([
    {
      id: 1,
      user: "@soil_sage",
      text: "Try cutting back a bit on the watering — tomatoes like consistent moisture but not soggy roots. Also check under the leaves for aphids!",
      likes: 0,
      replies: [],
    },
  ]);

  const [mainPostReplies, setMainPostReplies] = useState([]);

  // Main post actions
  const handleMainLike = () => setMainPostLikes(mainPostLikes + 1);
  const handleMainReply = () => {
    if (!replyText.trim()) return;
    setMainPostReplies([
      ...mainPostReplies,
      { id: Date.now(), user: "@you", text: replyText, likes: 0, replies: [] },
    ]);
    setReplyText("");
    setActiveCommentId(null);
  };

  // Comment actions
  const handleCommentLike = (commentId, isReply = false, parentId = null) => {
    if (!isReply) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, likes: c.likes + 1 } : c
        )
      );
    } else {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId ? { ...r, likes: r.likes + 1 } : r
                ),
              }
            : c
        )
      );
    }
  };

  const handleCommentReply = (commentId) => {
    if (!replyText.trim()) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? {
              ...c,
              replies: [
                ...c.replies,
                { id: Date.now(), user: "@you", text: replyText, likes: 0 },
              ],
            }
          : c
      )
    );
    setReplyText("");
    setActiveCommentId(null);
  };

  const renderComment = (comment) => (
    <div key={comment.id} className="comment-card">
      <div className="comment-avatar">
        <img
          src={`https://i.pravatar.cc/150?img=12`}
          alt="User avatar"
        />
      </div>
      <div className="comment-body">
        <strong>{comment.user}</strong>
        <p>{comment.text}</p>

        <div className="comment-actions">
          <button
            className="comment-action-btn"
            onClick={() => handleCommentLike(comment.id)}
          >
            <FaHeart className="icon-element" /> <span>{comment.likes}</span>
          </button>
          <button
            className="comment-action-btn"
            onClick={() =>
              setActiveCommentId(activeCommentId === comment.id ? null : comment.id)
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
              onClick={() => handleCommentReply(comment.id)}
            >
              Send
            </button>
          </div>
        )}

        {comment.replies.map((reply) => (
          <div
            key={reply.id}
            className="comment-card comment-reply"
            style={{ marginLeft: "36px" }}
          >
            <div className="comment-avatar">
              <img
                src={`https://i.pravatar.cc/150?img=14`}
                alt="User avatar"
              />
            </div>
            <div className="comment-body">
              <strong>{reply.user}</strong>
              <p>{reply.text}</p>
              <div className="comment-actions">
                <button
                  className="comment-action-btn"
                  onClick={() => handleCommentLike(reply.id, true, comment.id)}
                >
                  <FaHeart className="icon-element" /> <span>{reply.likes}</span>
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
      <div className="post-card">
        <div className="post-avatar">
          <img src="https://i.pravatar.cc/150?img=23" alt="User avatar" />
        </div>
        <div className="post-body">
          <div className="post-head">
            <div className="post-author">@green_thumb_dk</div>
            <div className="post-time">Oct. 16th, 2025</div>
          </div>
          <div className="post-text">
            Hey everyone! 👋
            <br />
            <br />
            My tomato plants started curling their leaves upwards about a week
            ago. I water them every morning, and they get plenty of sunlight on
            my balcony. Could this be from overwatering or maybe pests? Any
            advice from fellow gardeners in Denmark would be super appreciated! 🌿
          </div>
          <img
            src="https://images.unsplash.com/photo-1598454444508-0489b1f1f64b?q=80&w=800"
            alt="Tomato leaves curling"
            className="post-image"
          />

          <div className="post-actions">
            <button className="post-action-btn" onClick={handleMainLike}>
              <FaHeart className="icon-element" /> <span>{mainPostLikes}</span>
            </button>
            <button
              className="post-action-btn"
              onClick={() =>
                setActiveCommentId(activeCommentId === "main" ? null : "main")
              }
            >
              <FaRegComment className="icon-element" /> <span>Reply</span>
            </button>
          </div>

          {activeCommentId === "main" && (
            <div className="reply-input-container">
              <input
                type="text"
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="reply-input"
              />
              <button className="reply-send-btn" onClick={handleMainReply}>
                Send
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="postmockup-comments">
        <h2>Comments</h2>
        {mainPostReplies.concat(comments).map((comment) => renderComment(comment))}
      </div>

      <button className="floating-add">+</button>
    </div>
  );
};

export default PostMockup;
