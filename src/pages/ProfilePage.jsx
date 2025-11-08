import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import IconElement from "../components/IconElement.jsx";
import "./ProfilePage.css";
import { supabase } from "../lib/supabaseClient.js";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [signOutError, setSignOutError] = useState(null);
  const [userData, setUserData] = useState(supabase.auth.getUser());

  const handleLogout = async () => {
    setSignOutLoading(true);
    setSignOutError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth");
    } catch (error) {
      setSignOutError(error.message);
    } finally {
      setSignOutLoading(false);
    }
  };

  const isAuthenticated = !!userData;

  const handleCreateAccount = () => {
    navigate("/auth");
  };

  return (
    <div className="profile-page">
      <div className="profile-background" />
      <div className="profile-container">
        <div className="profile-info">
          <div className="profile-avatar">
            {isAuthenticated ? (
              <>
                <div className="profile-avatar-placeholder" />
                <button className="profile-avatar-edit">
                  <IconElement icon="edit" size={18} />
                </button>
              </>
            ) : (
              <IconElement icon="account" size={44} />
            )}
          </div>

          <div className="profile-stats">
            <div className="profile-header">
              <h2 className="profile-username">
                {isAuthenticated ? "User039928" : "Username"}
              </h2>
              {isAuthenticated && (
                <button className="profile-edit-button">
                  <IconElement icon="edit" size={18} />
                </button>
              )}
            </div>
            <p className="profile-location">Aarhus, Denmark</p>
            {isAuthenticated && (
              <div className="profile-numbers">
                <div className="profile-stat">
                  <span className="profile-stat-number">1</span>
                  <span className="profile-stat-label">Posts</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-number">15</span>
                  <span className="profile-stat-label">Followers</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="action-buttons">
          <button className="action-button">
            <div className="action-button-icon">
              <IconElement icon="Psychiatry" size={24} />
            </div>
            <span className="action-button-text">My plants</span>
          </button>
          <div className="action-divider" />
          <button className="action-button">
            <div className="action-button-icon">
              <IconElement icon="award_star" size={24} />
            </div>
            <span className="action-button-text">Badges</span>
          </button>
          <div className="action-divider" />
          <button className="action-button">
            <div className="action-button-icon">
              <IconElement icon="group" size={24} />
            </div>
            <span className="action-button-text">Share</span>
          </button>
        </div>

        <div className="posts-section">
          <h3 className="posts-header">Posts</h3>
          {isAuthenticated ? (
            <div className="post-item">
              <h4 className="post-title">
                Need help with my chili plant, its leaves are turning yellow and
                looking sad 😢🌶️
              </h4>
              <p className="post-content">
                Hey everyone, I'm hoping someone can help me figure out what's
                going on with my chili plant. It's been super healthy until
                recently, but now the leaves are starting to yellow and droop a
                bit.
              </p>
              <div className="post-actions">
                <button className="post-action-button">
                  <IconElement icon="like" size={14} />
                  <span>0</span>
                </button>
                <button className="post-action-button">
                  <IconElement icon="comment" size={14} />
                  <span>0</span>
                </button>
                <button className="post-action-button">
                  <IconElement icon="share" size={14} />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="posts-guest-message">
              <p className="posts-guest-text">
                You cannot access the Forums without an account
              </p>
              <Button
                variant="solid"
                size="md"
                onClick={handleCreateAccount}
                text="Create account"
              />
            </div>
          )}
        </div>

        {isAuthenticated && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleLogout}
            disabled={signOutLoading}
            icon="logout"
            text={signOutLoading ? "Signing out..." : "Sign Out"}
          />
        )}

        {signOutError && (
          <p className="error-message">Sign out failed: {signOutError}</p>
        )}
      </div>
    </div>
  );
}
