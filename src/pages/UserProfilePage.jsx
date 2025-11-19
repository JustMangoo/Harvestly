import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import IconElement from "../components/IconElement.jsx";
import AppBar from "../components/AppBar";
import Button from "../components/Button.jsx";
import Post from "../components/Post.jsx";
import "./ProfilePage.css";
import { getUserProfile } from "../services/users.js";
import { listPostsByUser } from "../services/forum.js";
import {
  getFriendshipStatus,
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getFriends,
} from "../services/friendships.js";

export default function UserProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [friendshipStatus, setFriendshipStatus] = useState(null);
  const [friendshipData, setFriendshipData] = useState(null);
  const [friendActionLoading, setFriendActionLoading] = useState(false);
  const [friendCount, setFriendCount] = useState(0);

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadPosts();
      loadFriendshipStatus();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await getUserProfile(userId);
      setProfile(userProfile);
      // Load friend count
      const friends = await getFriends(userId);
      setFriendCount(friends.length);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadPosts = async () => {
    try {
      setPostsLoading(true);
      const userPosts = await listPostsByUser({ userId, limit: 50 });
      setPosts(userPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setPostsLoading(false);
    }
  };

  const loadFriendshipStatus = async () => {
    try {
      const result = await getFriendshipStatus(userId);
      setFriendshipStatus(result.status);
      setFriendshipData(result);
    } catch (error) {
      console.error("Error loading friendship status:", error);
    }
  };

  const handleFriendAction = async () => {
    setFriendActionLoading(true);
    try {
      if (friendshipStatus === null) {
        // Send friend request
        await sendFriendRequest(userId);
        await loadFriendshipStatus();
      } else if (friendshipStatus === "pending" && !friendshipData.isSender) {
        // Accept friend request
        await acceptFriendRequest(friendshipData.friendship.id);
        await loadFriendshipStatus();
      } else if (friendshipStatus === "accepted") {
        // Unfriend
        await removeFriend(friendshipData.friendship.id);
        await loadFriendshipStatus();
      } else if (friendshipStatus === "pending" && friendshipData.isSender) {
        // Cancel friend request
        await removeFriend(friendshipData.friendship.id);
        await loadFriendshipStatus();
      }
    } catch (error) {
      console.error("Error handling friend action:", error);
      alert("Failed to perform action. Please try again.");
    } finally {
      setFriendActionLoading(false);
    }
  };

  const getFriendButtonConfig = () => {
    if (friendshipStatus === null) {
      return { text: "Add Friend", icon: "person_add", variant: "primary" };
    } else if (friendshipStatus === "pending" && !friendshipData.isSender) {
      return { text: "Accept Request", icon: "check", variant: "primary" };
    } else if (friendshipStatus === "pending" && friendshipData.isSender) {
      return { text: "Request Sent", icon: "schedule", variant: "secondary" };
    } else if (friendshipStatus === "accepted") {
      return { text: "Friends", icon: "check_circle", variant: "secondary" };
    }
    return { text: "Add Friend", icon: "person_add", variant: "primary" };
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-background" />
        <div className="profile-container">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-background" />
        <div className="profile-container">
          <p>User not found</p>
          <button onClick={() => navigate(-1)}>Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <AppBar showBack title={profile.username || "Profile"} />
      <div className="profile-background" />
      <div className="profile-container">
        {/* Back button now handled by AppBar */}

        <div className="profile-info">
          <div className="profile-avatar">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="avatar-image"
              />
            ) : (
              <IconElement icon="person" size={44} filled={false} />
            )}
          </div>

          <div className="profile-user-stats">
            <div className="profile-user-details">
              <div className="profile-header">
                <h2 className="profile-username">
                  {profile.username || "User"}
                </h2>
              </div>
              {profile.location && (
                <p className="profile-location">
                  {profile.location || "Location not set"}
                </p>
              )}
            </div>
            <div className="profile-stats-container">
              <div className="profile-stat">
                <span className="profile-stat-number">{posts.length}</span>
                <span className="profile-stat-label">Posts</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">{friendCount ?? 0}</span>
                <span className="profile-stat-label">Friends</span>
              </div>
            </div>
          </div>
          <div className="profile-friend-action">
            <Button
              {...getFriendButtonConfig()}
              onClick={handleFriendAction}
              disabled={friendActionLoading}
              iconFilled={true}
            />
          </div>
        </div>

        <div className="posts-section">
          <h3 className="posts-header">Posts</h3>
          {postsLoading ? (
            <div className="posts-loading">
              <p>Loading posts...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="posts-empty">
              <p>No posts yet.</p>
            </div>
          ) : (
            <div className="posts-list">
              {posts.map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  variant="preview"
                  onClick={() => navigate(`/forum/post/${post.id}`)}
                  onLike={() => {
                    setPosts((prev) =>
                      prev.map((p) =>
                        p.id === post.id
                          ? { ...p, like_count: (p.like_count ?? 0) + 1 }
                          : p
                      )
                    );
                  }}
                  onComment={() => navigate(`/forum/post/${post.id}`)}
                  onShare={() =>
                    navigator
                      .share?.({
                        title:
                          post.title || (post?.profiles?.username ?? "Post"),
                        text: post.body,
                      })
                      .catch(() => {})
                  }
                  onAuthorClick={(userId) => navigate(`/profile/${userId}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
