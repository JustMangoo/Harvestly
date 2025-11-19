import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "../components/AppBar.jsx";
import IconElement from "../components/IconElement.jsx";
import { supabase } from "../lib/supabaseClient.js";
import { getFriends } from "../services/friendships.js";
import "./FriendsPage.css";

export default function FriendsPage() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
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
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="friends-page">
      <AppBar showBack title="Friends" />

      <div className="friends-container">
        {loading ? (
          <div className="friends-empty">
            <p>Loading friends…</p>
          </div>
        ) : friends.length === 0 ? (
          <div className="friends-empty">
            <p>No friends yet.</p>
          </div>
        ) : (
          <div className="friends-grid">
            {friends.map((f) => (
              <button
                key={f.profile.id}
                type="button"
                className="friends-item"
                onClick={() => navigate(`/profile/${f.profile.id}`)}
                title={f.profile.username || "Friend"}
              >
                <div className="friends-avatar">
                  {f.profile.avatar_url ? (
                    <img
                      src={f.profile.avatar_url}
                      alt={f.profile.username || "Friend"}
                    />
                  ) : (
                    <div className="friends-avatar-fallback">
                      <IconElement icon="person" size={22} />
                    </div>
                  )}
                </div>
                <div className="friends-name">
                  {f.profile.username || f.profile.id}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
