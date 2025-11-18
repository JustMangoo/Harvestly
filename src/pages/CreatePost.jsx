import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import IconElement from "../components/IconElement.jsx";
import { supabase } from "../lib/supabaseClient";
import { getUserProfile } from "../services/users";
import { createPost } from "../services/forum";
import "./CreatePost.css";

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const handleCancel = () => navigate(-1);

  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!text.trim() && !title.trim()) return;
    try {
      setLoading(true);
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      const user = userData?.user ?? null;
      await createPost({
        title: title.trim(),
        text: text.trim(),
        userId: user?.id,
      });

      navigate("/forum");
    } catch (e) {
      console.error("Failed to create post", e);
      alert("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      {/* ✅ Top bar */}
      <div className="create-post-topbar">
        <button className="cancel-btn" onClick={handleCancel}>
          Cancel
        </button>
        <button
          className={`post-btn ${
            !text.trim() && !title.trim() ? "disabled" : ""
          }`}
          onClick={handlePost}
          disabled={(!text.trim() && !title.trim()) || loading}
        >
          {loading ? "Posting…" : "Post"}
        </button>
      </div>

      {/* ✅ Body */}
      <div className="create-post-body">
        <div className="create-post-avatar">
          <img
            src="/assets/profile-placeholder.png"
            alt="User avatar"
            className="avatar-img"
          />
        </div>

        <div className="create-post-fields">
          <input
            type="text"
            placeholder="Header"
            className="create-post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="What’s on your mind?"
            className="create-post-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>

      {/* ✅ Bottom icons */}
      <div className="create-post-actions">
        <button className="action-btn">
          <IconElement icon="image" size={22} filled={false} />
        </button>
        <button className="action-btn">
          <IconElement icon="gif" size={22} filled={false} />
        </button>
      </div>
    </div>
  );
}
