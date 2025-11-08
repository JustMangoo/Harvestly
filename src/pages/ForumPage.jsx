import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import IconElement from "../components/IconElement.jsx";
import "./ForumPage.css";

export default function ForumPage() {
  const navigate = useNavigate();
  const params = useParams();
  const topicParam = params?.topicId ?? null;

  // sample posts — replace with real data later
  const [posts, setPosts] = useState([
    {
      id: 101,
      topicId: 1,
      author: "Lina",
      text: "My chili plant leaves are yellowing — any tips?",
      likes: 3,
      comments: 2,
      time: "2h",
    },
    {
      id: 102,
      topicId: 2,
      author: "Omar",
      text: "Just repotted my monstera. Soil mix recommendations?",
      likes: 6,
      comments: 4,
      time: "1d",
    },
    {
      id: 103,
      topicId: 3,
      author: "Ava",
      text: "Show us your fav watering setups 🌱",
      likes: 1,
      comments: 5,
      time: "3d",
    },
    {
      id: 104,
      topicId: 1,
      author: "Elliot",
      text: "Neem oil worked wonders for me — dilute 1:10.",
      likes: 8,
      comments: 3,
      time: "4d",
    },
  ]);

  // friends + topics sample data (match image)
  const friends = [
    { id: 1, name: "Maya" },
    { id: 2, name: "Noah" },
    { id: 3, name: "Zoe" },
  ];

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

  // derive active topic from url param (if any)
  const activeTopic = topicParam ? topics.find((t) => String(t.id) === String(topicParam)) : null;

  // filter posts by search + active topic
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (activeTopic && String(p.topicId) !== String(activeTopic.id)) return false;
      if (!q) return true;
      return (
        p.author.toLowerCase().includes(q) ||
        p.text.toLowerCase().includes(q)
      );
    });
  }, [posts, query, activeTopic]);

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
    // navigate to /forum/topic/:id; adjust path if your router uses different base
    navigate(`/forum/topic/${t.id}`);
    // keep on mobile UX: scroll to topics area (optional)
    const el = document.querySelector(".topics-grid");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const clearTopic = () => {
    navigate(`/forum`);
  };

  return (
    <div className="forum-page">
      <header className="forum-header">
        <div className="forum-title">
          <h1>Forum{activeTopic ? ` — ${activeTopic.title}` : ""}</h1>
          <p className="forum-subtitle">Share tips, ask questions, and trade plant wisdom.</p>
        </div>

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
      </header>

      <main className="forum-content">
        {/* Your Friends */}
        <section className="friends-card" aria-label="Your friends">
          <div className="friends-header">
            <strong>Your Friends</strong>
            <a className="friends-seeall" href="#!">See All →</a>
          </div>
          <div className="friends-list">
            {friends.map((f) => (
              <div className="friend-avatar" key={f.id} title={f.name}>
                {f.name.charAt(0).toUpperCase()}
              </div>
            ))}
            <button className="friend-add" aria-label="Add friend">
              <IconElement icon="add" size={18} filled={true} />
            </button>
          </div>
        </section>

        {/* Explore Topics */}
        <section className="explore-topics" aria-label="Explore topics">
          <div className="topics-header">
            <strong>Explore Topics</strong>
            {activeTopic && (
              <button className="clear-topic" onClick={clearTopic} aria-label="Clear topic" title="Back to all">
                ← All topics
              </button>
            )}
          </div>
          <div className="topics-grid">
            {topics.map((t) => (
              <button
                className={`topic-card ${activeTopic && String(activeTopic.id) === String(t.id) ? "active" : ""}`}
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

        {/* Popular Posts header card (matches image) */}
        <section className="popular-card">
          <div className="popular-header">
            <strong>Popular Posts</strong>
            <a className="friends-seeall" href="#!">See All →</a>
          </div>
          <div className="popular-sample">
            <div className="popular-headline">Headline</div>
            <div className="popular-placeholder">Add post text here.</div>
          </div>
        </section>

        {/* Composer */}
        <section className="composer">
          <div className="composer-avatar" aria-hidden>
            <IconElement icon="account_circle" size={36} filled={false} />
          </div>
          <div className="composer-body">
            <textarea
              className="composer-input"
              placeholder="Share something with the community..."
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              rows={3}
            />
            <div className="composer-actions">
              <Button
                text="Post"
                variant="solid"
                size="md"
                onClick={handleSubmit}
                disabled={!composer.trim()}
              />
            </div>
          </div>
        </section>

        {/* Posts list */}
        <section className="posts-list" aria-live="polite">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <p>No posts found.</p>
            </div>
          ) : (
            filtered.map((post) => (
              <article className="post-card" key={post.id}>
                <div className="post-avatar" aria-hidden>
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <div className="post-body">
                  <div className="post-head">
                    <strong className="post-author">{post.author}</strong>
                    <span className="post-time">{post.time}</span>
                  </div>
                  <p className="post-text">{post.text}</p>
                  <div className="post-actions">
                    <button className="post-action">
                      <IconElement icon="thumb_up" size={16} filled={false} /> <span>{post.likes}</span>
                    </button>
                    <button className="post-action">
                      <IconElement icon="chat_bubble" size={16} filled={false} /> <span>{post.comments}</span>
                    </button>
                    <button className="post-action">
                      <IconElement icon="share" size={16} filled={false} />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
      </main>

      {/* floating add button like in the design - mobile only overlay */}
      <button className="floating-add" aria-label="Create post" onClick={() => navigate("/forum/create")}>
        <IconElement icon="add" size={26} filled={true} />
      </button>
    </div>
  );
}
