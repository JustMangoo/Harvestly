import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import IconElement from "../components/IconElement.jsx";
import Post from "../components/Post.jsx";
import AppBar from "../components/AppBar.jsx";
import { supabase } from "../lib/supabaseClient.js";
import {
  getFriends,
  sendFriendRequest,
  getAllFriendships,
} from "../services/friendships.js";
import { searchProfiles } from "../services/users.js";
import {
  listPosts,
  listComments,
  listReplies,
  timeAgo,
} from "../services/forum";
import "./ForumPage.css";

export default function ForumPage() {
  const navigate = useNavigate();
  const params = useParams();
  const topicParam = params?.topicId ?? null;

  const [posts, setPosts] = useState([]);
  const [postCommentCounts, setPostCommentCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [requested, setRequested] = useState({});

  const getCommentCount = async (postId) => {
    try {
      const comments = await listComments(postId);
      const replies = await Promise.all(comments.map((c) => listReplies(c.id)));
      const totalReplies = replies.reduce((sum, r) => sum + r.length, 0);
      return comments.length + totalReplies;
    } catch (e) {
      console.error("Failed to get comment count", e);
      return 0;
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await listPosts({ limit: 50 });
        if (!cancelled) {
          setPosts(data);
          // Load comment counts for each post
          const counts = {};
          await Promise.all(
            data.map(async (post) => {
              const count = await getCommentCount(post.id);
              counts[post.id] = count;
            })
          );
          if (!cancelled) setPostCommentCounts(counts);
        }
      } catch (e) {
        console.error("Failed to load posts", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    async function loadFriends() {
      try {
        setFriendsLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          if (!cancelled) setFriends([]);
          return;
        }
        const f = await getFriends(user.id);
        if (!cancelled) setFriends(f);
      } catch (e) {
        console.error("Failed to load friends", e);
      } finally {
        if (!cancelled) setFriendsLoading(false);
      }
    }
    load();
    loadFriends();
    return () => {
      cancelled = true;
    };
  }, []);

  // Live search users by username
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const q = searchQuery.trim();
      if (!q) {
        setSearchResults([]);
        return;
      }
      try {
        setSearchLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const results = await searchProfiles(q, { limit: 25 });

        // Get all existing friendships to add status
        const allFriendships = await getAllFriendships();
        const friendshipMap = new Map(
          allFriendships.map((f) => {
            const otherId = f.user_id === user?.id ? f.friend_id : f.user_id;
            return [otherId, f.status];
          })
        );

        // Filter out only current user, add friendship status to others
        const filtered = user
          ? results
              .filter((u) => u.id !== user.id)
              .map((u) => ({
                ...u,
                friendshipStatus: friendshipMap.get(u.id) || null,
              }))
          : results;
        if (!cancelled) setSearchResults(filtered);
      } catch (e) {
        console.error("Search failed", e);
        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    };
    const t = setTimeout(run, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [searchQuery]);

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
      const uname = p?.profiles?.username?.toLowerCase() || "";
      return (
        uname.includes(q) ||
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
      <AppBar title="Forum" showBack />

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
            <button
              className="friends-seeall"
              type="button"
              onClick={() => navigate("/friends")}
            >
              See All →
            </button>
          </div>
          <div className="friends-list">
            {friendsLoading ? (
              <div className="friend-avatar skeleton" />
            ) : friends.length === 0 ? (
              <div className="friends-empty">No friends yet</div>
            ) : (
              friends.map((f) => (
                <button
                  type="button"
                  className="friend-avatar"
                  key={f.profile.id}
                  title={f.profile.username || "Friend"}
                  onClick={() => navigate(`/profile/${f.profile.id}`)}
                >
                  {f.profile.avatar_url ? (
                    <img
                      src={f.profile.avatar_url}
                      alt={f.profile.username || "Friend"}
                    />
                  ) : (
                    <div className="friend-avatar-fallback">
                      <IconElement icon="person" size={18} />
                    </div>
                  )}
                </button>
              ))
            )}
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
                comment_count={postCommentCounts[post.id] || 0}
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
                      title: post.title || (post?.profiles?.username ?? "Post"),
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

      {/* Add Friend Modal (Search users) */}
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
              <h3 className="modal-section-title">Search people</h3>
              <div className="paste-code-container">
                <input
                  type="search"
                  className="paste-code-input"
                  placeholder="Search by username"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-section">
              {searchLoading ? (
                <div className="empty-state">
                  <p>Searching…</p>
                </div>
              ) : searchQuery.trim() && searchResults.length === 0 ? (
                <div className="empty-state">
                  <p>No users found.</p>
                </div>
              ) : (
                <div className="search-results-list">
                  {searchResults.map((u) => (
                    <div className="search-result-item" key={u.id}>
                      <div className="search-result-info">
                        <button
                          className="friend-avatar"
                          title={u.username || "User"}
                          onClick={() => navigate(`/profile/${u.id}`)}
                        >
                          {u.avatar_url ? (
                            <img
                              src={u.avatar_url}
                              alt={u.username || "User"}
                            />
                          ) : (
                            <div className="friend-avatar-fallback">
                              <IconElement icon="person" size={18} />
                            </div>
                          )}
                        </button>
                        <div className="search-result-name">
                          {u.username || u.id}
                        </div>
                      </div>
                      <div className="search-result-action">
                        {u.friendshipStatus === "accepted" ? (
                          <Button disabled variant="outline" size="sm">
                            Friends
                          </Button>
                        ) : u.friendshipStatus === "pending" ? (
                          <Button disabled variant="outline" size="sm">
                            Pending
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={!!requested[u.id]}
                            onClick={async () => {
                              try {
                                await sendFriendRequest(u.id);
                                setRequested((prev) => ({
                                  ...prev,
                                  [u.id]: true,
                                }));
                              } catch (e) {
                                console.error("Failed to send request", e);
                                alert("Failed to send friend request.");
                              }
                            }}
                          >
                            {requested[u.id] ? "Requested" : "Add"}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
