import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import IconElement from "../components/IconElement.jsx";
import Post from "../components/Post.jsx";
import HeaderBar from "../components/HeaderBar.jsx";
import { FRIENDS } from "../data/friendsData.js";
import { listPosts, timeAgo } from "../services/forum";
import "./ForumPage.css";

export default function ForumPage() {
  const navigate = useNavigate();
  const params = useParams();
  const topicParam = params?.topicId ?? null;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await listPosts({ limit: 50 });
        if (!cancelled) setPosts(data);
      } catch (e) {
        console.error("Failed to load posts", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const topics = [
    { id: 1, title: "Dealing with Pests" },
    { id: 2, title: "Getting Started" },
    { id: 3, title: "Bulb & Allium Crops" },
    { id: 4, title: "Soil & Mixes" },
    { id: 5, title: "Watering Setups" },
    { id: 6, title: "Indoor Lighting" },
  ];

  const [query, setQuery] = useState("");
  const [composer, setComposer] = useState("");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [friendCode, setFriendCode] = useState("12345-67");
  const [pasteCode, setPasteCode] = useState("");
  const [copiedFriendCode, setCopiedFriendCode] = useState(false);

  const activeTopic = topicParam
    ? topics.find((t) => String(t.id) === String(topicParam))
    : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (!q) return true;
      return (
        p.author_name?.toLowerCase().includes(q) ||
        p.title?.toLowerCase().includes(q) ||
        p.body?.toLowerCase().includes(q)
      );
    });
  }, [posts, query]);

  const handleSubmit = () => {
    if (!composer.trim()) return;
    const newPost = {
      id: Date.now(),
      topicId: activeTopic ? activeTopic.id : null,
      author: "You",
      text: composer.trim(),
      likes: 0,
      comments: 0,
      time: "just now",
    };
    setPosts((s) => [newPost, ...s]);
    setComposer("");
  };

  const openTopic = (t) => {
    navigate(`/forum/topic/${t.id}`);
    const el = document.querySelector(".topics-grid");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const clearTopic = () => {
    navigate(`/forum`);
  };

  const handleCopyFriendCode = () => {
    navigator.clipboard.writeText(friendCode);
    setCopiedFriendCode(true);
    setTimeout(() => setCopiedFriendCode(false), 2000);
  };

  const handlePasteCode = () => {
    if (pasteCode.trim()) {
      console.log("Adding friend with code:", pasteCode);
      // TODO: Implement add friend functionality
      setPasteCode("");
      setShowAddFriendModal(false);
    }
  };

  return (
    <div className="forum-page">
      <HeaderBar title="Forum" showMenu />

      <div className="forum-search">
        <IconElement icon="search" size={20} filled={false} />
        <input
          type="search"
          placeholder="Search Topics"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search topics"
        />
      </div>

      <main className="forum-content">
        <section className="friends-card" aria-label="Your friends">
          <div className="friends-header">
            <strong>Your Friends</strong>
            <a className="friends-seeall" href="#!">
              See All →
            </a>
          </div>
          <div className="friends-list">
            {FRIENDS.map((f) => (
              <div className="friend-avatar" key={f.id} title={f.name}>
                <img src={f.avatar} alt={f.name} />
              </div>
            ))}
            <button
              className="friend-add"
              aria-label="Add friend"
              onClick={() => setShowAddFriendModal(true)}
            >
              <IconElement icon="add" size={18} filled={true} />
            </button>
          </div>
        </section>

        <section className="explore-topics" aria-label="Explore topics">
          <div className="topics-header">
            <strong>Explore Topics</strong>
            {activeTopic && (
              <button
                className="clear-topic"
                onClick={clearTopic}
                aria-label="Clear topic"
                title="Back to all"
              >
                ← All topics
              </button>
            )}
          </div>
          <div className="topics-grid">
            {topics.map((t) => (
              <button
                className={`topic-card ${
                  activeTopic && String(activeTopic.id) === String(t.id)
                    ? "active"
                    : ""
                }`}
                key={t.id}
                type="button"
                onClick={() => openTopic(t)}
              >
                <div className="topic-title">{t.title}</div>
                <div className="topic-icon" aria-hidden>
                  <IconElement icon="local_florist" size={28} filled={false} />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="posts-list" aria-live="polite">
          {loading ? (
            <div className="empty-state">
              <p>Loading posts…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <p>No posts found.</p>
            </div>
          ) : (
            filtered.map((post, i) => (
              <Post
                key={post.id}
                post={post}
                variant="preview"
                showDivider={i < filtered.length - 1}
                onClick={() => navigate(`/forum/post/${post.id}`)}
                onLike={() =>
                  setPosts((s) =>
                    s.map((p) =>
                      p.id === post.id
                        ? { ...p, like_count: (p.like_count ?? 0) + 1 }
                        : p
                    )
                  )
                }
                onComment={() => navigate(`/forum/post/${post.id}`)}
                onShare={() =>
                  navigator
                    .share?.({
                      title: post.title || post.author_name,
                      text: post.body,
                    })
                    .catch(() => {})
                }
                onAuthorClick={(userId) => navigate(`/profile/${userId}`)}
              />
            ))
          )}
        </section>
      </main>

      <button
        className="floating-add"
        aria-label="Create post"
        onClick={() => navigate("create")}
      >
        <IconElement icon="add" size={26} filled={true} />
      </button>

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowAddFriendModal(false)}
        >
          <div
            className="add-friend-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="modal-title">Add Friend</h2>

            <div className="modal-section">
              <h3 className="modal-section-title">Share your code</h3>
              <div className="friend-code-container">
                <input
                  type="text"
                  className="friend-code-input"
                  value={friendCode}
                  readOnly
                />
                <button
                  className={`copy-friend-code-button ${
                    copiedFriendCode ? "copied" : ""
                  }`}
                  onClick={handleCopyFriendCode}
                >
                  {copiedFriendCode ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="modal-divider">
              <span>Or</span>
            </div>

            <div className="modal-section">
              <h3 className="modal-section-title">Enter friend's code</h3>
              <div className="paste-code-container">
                <input
                  type="text"
                  className="paste-code-input"
                  placeholder="Enter code"
                  value={pasteCode}
                  onChange={(e) => setPasteCode(e.target.value)}
                />
                <button
                  className="add-friend-button"
                  onClick={handlePasteCode}
                  disabled={!pasteCode.trim()}
                >
                  Add
                </button>
              </div>
            </div>

            <button
              className="modal-close"
              onClick={() => setShowAddFriendModal(false)}
            >
              <IconElement icon="close" size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
