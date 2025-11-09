import React from "react";
import "./PostMockup.css";
import { FaHeart, FaRegCommentAlt, FaShareAlt } from "react-icons/fa";

const PostMockup = () => {
  return (
    <div className="postmockup-container">
      <div className="post-header">
        <div className="post-author">
          <img
            src="https://i.pravatar.cc/150?img=23"
            alt="User avatar"
            className="author-avatar"
          />
          <div className="author-info">
            <p className="author-username">@green_thumb_dk</p>
            <p className="post-date">Oct. 16th, 2025</p>
          </div>
        </div>
        <div className="post-menu">⋮</div>
      </div>

      <img
        src="https://images.unsplash.com/photo-1598454444508-0489b1f1f64b?q=80&w=800"
        alt="Tomato leaves curling"
        className="post-image"
      />

      <div className="post-content">
        <h2 className="post-title">
          Why are my tomato leaves curling even though I water regularly?
        </h2>
        <p className="post-body">
          Hey everyone! 👋
          <br />
          <br />
          My tomato plants started curling their leaves upwards about a week
          ago. I water them every morning, and they get plenty of sunlight on my
          balcony. Could this be from overwatering or maybe pests? Any advice
          from fellow gardeners in Denmark would be super appreciated! 🌿
        </p>
      </div>

      <div className="post-actions">
        <div className="action">
          <FaHeart className="action-icon" />
          <span>0</span>
        </div>
        <div className="action">
          <FaRegCommentAlt className="action-icon" />
          <span>0</span>
        </div>
        <div className="action">
          <FaShareAlt className="action-icon" />
          <span>Share</span>
        </div>
      </div>

      <div className="comment-section">
        <div className="comment">
          <p className="comment-username">@soil_sage</p>
          <p className="comment-text">
            Try cutting back a bit on the watering — tomatoes like consistent
            moisture but not soggy roots. Also check under the leaves for
            aphids!
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostMockup;
