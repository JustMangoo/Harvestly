import Nav from "../components/Nav";
import TopNav from "../components/TopNav";
import { Outlet, useLocation, useOutletContext } from "react-router-dom";
import { useState } from "react";

export default function AppLayout() {
  const location = useLocation();
  const showTopNav = location.pathname === "/profile";
  const [isEditMode, setIsEditMode] = useState(false);

  const handleEditProfile = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSaveEdit = () => {
    // TODO: Save the profile changes
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
        <Outlet context={{ isEditMode, setIsEditMode }} />
      </main>
      <Nav />
    </>
  );
}
