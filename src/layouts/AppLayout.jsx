import Nav from "../components/Nav";
import TopNav from "../components/TopNav";
import { Outlet, useLocation } from "react-router-dom";
import { useState, useRef } from "react";

export default function AppLayout() {
  const location = useLocation();
  const showTopNav = location.pathname === "/profile";
  const [isEditMode, setIsEditMode] = useState(false);
  const saveProfileRef = useRef(null);

  const handleEditProfile = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    // Call the save function from ProfilePage
    if (saveProfileRef.current) {
      await saveProfileRef.current();
    }
    setIsEditMode(false);
  };

  return (
    <>
      {showTopNav && (
        <TopNav
          onEditProfile={handleEditProfile}
          isEditMode={isEditMode}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
        />
      )}
      <main>
        <Outlet context={{ isEditMode, setIsEditMode, saveProfileRef }} />
      </main>
      <Nav />
    </>
  );
}
