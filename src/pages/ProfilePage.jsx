import { useState, useEffect } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Button from "../components/Button.jsx";
import IconElement from "../components/IconElement.jsx";
import "./ProfilePage.css";
import { supabase } from "../lib/supabaseClient.js";
import { getUserProfile, updateUserProfile } from "../services/users.js";

// Import gallery images
import plantPot from "../assets/gallery/rectangle-136.webp";
import monstera from "../assets/gallery/Rectangle 137.webp";
import succulent from "../assets/gallery/Rectangle 138.webp";
import cactus from "../assets/gallery/Rectangle 139.webp";
import fern from "../assets/gallery/Rectangle 140.webp";
import herbs from "../assets/gallery/Rectangle 141.webp";
import vegetables from "../assets/gallery/Rectangle 142.webp";
import flowers from "../assets/gallery/Rectangle 143.webp";
import butterfly from "../assets/gallery/Rectangle 144.webp";
import bee from "../assets/gallery/Rectangle 145.webp";
import ladybug from "../assets/gallery/Rectangle 146.webp";
import dragonfly from "../assets/gallery/Rectangle 147.webp";
import forest from "../assets/gallery/Rectangle 148.webp";
import naturePath from "../assets/gallery/Rectangle 149.webp";
import wildflowers from "../assets/gallery/Rectangle 150.webp";
import tree from "../assets/gallery/Rectangle 151.webp";
import bird from "../assets/gallery/Rectangle 152.webp";
import catGarden from "../assets/gallery/Rectangle 153.webp";
import dogNature from "../assets/gallery/Rectangle 154.webp";
import fox from "../assets/gallery/Rectangle 155.webp";
import deer from "../assets/gallery/Rectangle 156.webp";
import indoorPlants from "../assets/gallery/Rectangle 157.webp";
import gardenBed from "../assets/gallery/Rectangle 158.webp";
import roseBush from "../assets/gallery/Rectangle 159.webp";
import terrarium from "../assets/gallery/Rectangle 160.webp";
import tomatoPlant from "../assets/gallery/Rectangle 161.webp";
import orchid from "../assets/gallery/Rectangle 162.webp";
import bamboo from "../assets/gallery/Rectangle 163.webp";
import aloeVera from "../assets/gallery/Rectangle 164.webp";
import sunflower from "../assets/gallery/Rectangle 165.webp";
import lavender from "../assets/gallery/Rectangle 166.webp";
import tulips from "../assets/gallery/Rectangle 167.webp";
import ivy from "../assets/gallery/Rectangle 168.webp";
import spiderPlant from "../assets/gallery/Rectangle 169.webp";
import snakePlant from "../assets/gallery/Rectangle 170.webp";
import pothos from "../assets/gallery/Rectangle 171.webp";
import peperomia from "../assets/gallery/Rectangle 172.webp";
import fiddle from "../assets/gallery/Rectangle 173.webp";
import rubberPlant from "../assets/gallery/Rectangle 174.webp";
import zz from "../assets/gallery/Rectangle 175.webp";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { isEditMode, setIsEditMode, saveProfileRef } = useOutletContext();
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [signOutError, setSignOutError] = useState(null);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [location, setLocation] = useState("");
  const [originalLocation, setOriginalLocation] = useState("");
  const [followerCount, setFollowerCount] = useState(0);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isGalleryExpanded, setIsGalleryExpanded] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [originalProfilePicture, setOriginalProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gallery images - all local images with descriptive names
  const galleryImages = [
    plantPot,
    monstera,
    succulent,
    cactus,
    fern,
    herbs,
    vegetables,
    flowers,
    butterfly,
    bee,
    ladybug,
    dragonfly,
    forest,
    naturePath,
    wildflowers,
    tree,
    bird,
    catGarden,
    dogNature,
    fox,
    deer,
    indoorPlants,
    gardenBed,
    roseBush,
    terrarium,
    tomatoPlant,
    orchid,
    bamboo,
    aloeVera,
    sunflower,
    lavender,
    tulips,
    ivy,
    spiderPlant,
    snakePlant,
    pothos,
    peperomia,
    fiddle,
    rubberPlant,
    zz,
  ];

  // Load user profile data on mount
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Register save function with parent
  useEffect(() => {
    if (saveProfileRef) {
      saveProfileRef.current = saveProfileChanges;
    }
  }, [username, profilePicture, location]);

  // Handle edit mode changes (cancel restores original values)
  useEffect(() => {
    if (!isEditMode) {
      // Restore original values when edit mode is cancelled
      setUsername(originalUsername);
      setLocation(originalLocation);
      setProfilePicture(originalProfilePicture);
      setIsEditingUsername(false);
    }
  }, [isEditMode]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        setUser(user);
        const profile = await getUserProfile(user.id);

        const fallbackUsername = user.email?.split("@")[0] || "User";
        const resolvedUsername = profile?.username?.trim() || fallbackUsername;
        const resolvedLocation = profile?.location?.trim() || "";
        const resolvedAvatar = profile?.avatar_url || null;
        const resolvedFollowers =
          typeof profile?.follower_count === "number"
            ? profile.follower_count
            : 0;

        setUsername(resolvedUsername);
        setOriginalUsername(resolvedUsername);
        setLocation(resolvedLocation);
        setOriginalLocation(resolvedLocation);
        setFollowerCount(resolvedFollowers);
        setProfilePicture(resolvedAvatar);
        setOriginalProfilePicture(resolvedAvatar);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfileChanges = async () => {
    if (!user) return;

    try {
      const fallbackUsername = user.email?.split("@")[0] || "User";
      const sanitizedUsername = username?.trim() || null;
      const sanitizedLocation = location?.trim() || null;

      const updatedProfile = await updateUserProfile(user.id, {
        username: sanitizedUsername,
        location: sanitizedLocation,
        avatar_url: profilePicture,
      });

      const nextUsername =
        updatedProfile?.username?.trim() || fallbackUsername;
      const nextLocation = updatedProfile?.location?.trim() || "";
      const nextAvatar = updatedProfile?.avatar_url || null;
      const nextFollowers =
        typeof updatedProfile?.follower_count === "number"
          ? updatedProfile.follower_count
          : 0;

      // Update the original values after successful save
      setUsername(nextUsername);
      setOriginalUsername(nextUsername);
      setLocation(nextLocation);
      setOriginalLocation(nextLocation);
      setProfilePicture(nextAvatar);
      setOriginalProfilePicture(nextAvatar);
      setFollowerCount(nextFollowers);

      console.log("Profile saved successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile changes. Please try again.");
    }
  };

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

  const isAuthenticated = !!user;

  const handleCreateAccount = () => {
    navigate("/auth");
  };

  const handleAvatarEdit = () => {
    setIsAvatarMenuOpen(true);
  };

  const handleCloseAvatarMenu = () => {
    setIsAvatarMenuOpen(false);
    setIsGalleryOpen(false);
    setIsGalleryExpanded(false);
  };

  const handlePhotoLibrary = () => {
    setIsGalleryOpen(true);
  };

  const handleCloseGallery = () => {
    setIsGalleryOpen(false);
    setIsGalleryExpanded(false);
    setIsAvatarMenuOpen(false);
  };

  const toggleGalleryExpand = () => {
    setIsGalleryExpanded(!isGalleryExpanded);
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    const clientY = e.type.includes("touch") ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
    setIsDragging(true);
    setHasDragged(false);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;

    const currentY = e.type.includes("touch")
      ? e.touches[0].clientY
      : e.clientY;
    const dragDistance = Math.abs(dragStartY - currentY);

    // Mark as dragged if moved more than 5px
    if (dragDistance > 5) {
      setHasDragged(true);
    }

    const verticalDistance = dragStartY - currentY;

    // If dragged up more than 50px, expand the gallery
    if (verticalDistance > 50 && !isGalleryExpanded) {
      setIsGalleryExpanded(true);
      setIsDragging(false);
    }
    // If dragged down more than 50px while expanded, collapse it
    else if (verticalDistance < -50 && isGalleryExpanded) {
      setIsGalleryExpanded(false);
      setIsDragging(false);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStartY(0);
  };

  const handleDragAreaClick = (e) => {
    // Only stop propagation if the user didn't actually drag
    if (!hasDragged) {
      e.stopPropagation();
    }
  };

  // Add event listeners for drag when dragging is active
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      e.preventDefault();
      handleDragMove(e);
    };

    const handleEnd = () => {
      handleDragEnd();
    };

    // Add listeners to document for mouse
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleEnd);

    // Add listeners for touch
    document.addEventListener("touchmove", handleMove, { passive: false });
    document.addEventListener("touchend", handleEnd);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, dragStartY, isGalleryExpanded]);

  const handleSelectImage = (imageUrl) => {
    setProfilePicture(imageUrl);
    handleCloseGallery();
  };

  const handleCamera = () => {
    console.log("Open camera");
    setIsAvatarMenuOpen(false);
    // TODO: Implement camera
  };

  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleUsernameBlur = () => {
    setIsEditingUsername(false);
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  return (
    <div className="profile-page">
      <div className="profile-background" />
      <div className="profile-container">
        <div className="profile-info">
          <button
            className={`profile-avatar ${isEditMode ? "edit-mode" : ""}`}
            onClick={isEditMode ? handleAvatarEdit : undefined}
            disabled={!isEditMode}
          >
            {isEditMode && <div className="avatar-overlay" />}
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="avatar-image"
              />
            ) : (
              <IconElement icon="image" size={44} filled={false} />
            )}
            {isEditMode && (
              <div className="avatar-edit-button">
                <IconElement icon="edit" size={18} filled={true} />
              </div>
            )}
          </button>

          <div className="profile-user-stats">
            <div className="profile-user-details">
              <div className="profile-header">
                {isEditingUsername ? (
                  <input
                    type="text"
                    className="profile-username-input"
                    value={username}
                    onChange={handleUsernameChange}
                    onBlur={handleUsernameBlur}
                    autoFocus
                  />
                ) : isEditMode ? (
                  <button
                    className="profile-username-edit-area"
                    onClick={handleUsernameEdit}
                  >
                    <h2 className="profile-username">{username}</h2>
                    <div className="profile-edit-button">
                      <IconElement icon="edit" size={18} filled={true} />
                    </div>
                  </button>
                ) : (
                  <h2 className="profile-username">{username}</h2>
                )}
              </div>
              {isEditMode ? (
                <input
                  type="text"
                  className="profile-location-input"
                  value={location}
                  onChange={handleLocationChange}
                  placeholder="e.g., Aarhus, Denmark"
                />
              ) : (
                <p className="profile-location">
                  {location?.trim() || "Add your location"}
                </p>
              )}
            </div>
            <div className="profile-stats-container">
              <div className="profile-stat">
                <span className="profile-stat-number">1</span>
                <span className="profile-stat-label">Posts</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-number">
                  {followerCount ?? 0}
                </span>
                <span className="profile-stat-label">Followers</span>
              </div>
            </div>
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
                  <IconElement icon="favorite" size={14} filled={false} />
                  <span>0</span>
                </button>
                <button className="post-action-button">
                  <IconElement icon="comment" size={14} filled={false} />
                  <span>0</span>
                </button>
                <button className="post-action-button">
                  <IconElement icon="share" size={14} filled={false} />
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
      </div>

      {isAvatarMenuOpen && !isGalleryOpen && (
        <div className="settings-overlay" onClick={handleCloseAvatarMenu}>
          <div
            className="settings-menu avatar-menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-header">
              <button className="settings-dots-button">
                <IconElement icon="more_vert" size={4} filled={true} />
              </button>
              <h3>Add picture</h3>
              <button className="close-button" onClick={handleCloseAvatarMenu}>
                <IconElement icon="close" size={24} filled={false} />
              </button>
            </div>
            <div className="settings-content">
              <div className="settings-menu-items">
                <button
                  className="settings-menu-item"
                  onClick={handlePhotoLibrary}
                >
                  <span>Photo Library</span>
                  <IconElement icon="collections" size={18} filled={true} />
                </button>
                <div className="settings-divider" />
                <button className="settings-menu-item" onClick={handleCamera}>
                  <span>Camera</span>
                  <IconElement icon="photo_camera" size={18} filled={true} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isGalleryOpen && (
        <div className="settings-overlay" onClick={handleCloseGallery}>
          <div
            className="gallery-safe-zone"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`gallery-menu ${
                isGalleryExpanded ? "expanded" : "collapsed"
              }`}
            >
              <div
                className="gallery-drag-area"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                onClick={handleDragAreaClick}
              >
                <div className="gallery-drag-indicator" />
              </div>
              <div
                className="gallery-header"
                onClick={(e) => e.stopPropagation()}
              >
                <button className="settings-dots-button">
                  <IconElement icon="more_vert" size={4} filled={true} />
                </button>
                <div className="gallery-category">
                  <span>Recents</span>
                  <IconElement icon="expand_less" size={12} filled={false} />
                </div>
                <button className="close-button" onClick={handleCloseGallery}>
                  <IconElement icon="close" size={24} filled={false} />
                </button>
              </div>
              <div
                className="gallery-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="gallery-grid">
                  {galleryImages.map((imageUrl, i) => (
                    <button
                      key={i}
                      className="gallery-image-button"
                      onClick={() => handleSelectImage(imageUrl)}
                    >
                      <img
                        src={imageUrl}
                        alt={`Gallery ${i + 1}`}
                        className="gallery-image"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
