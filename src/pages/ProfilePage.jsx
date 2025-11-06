import { useEffect, useState } from "react";
import Button from "../components/Button.jsx";

export default function ProfilePage() {
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [signOutError, setSignOutError] = useState(null);

  const handleLogout = async () => {
    setSignOutLoading(true);
    setSignOutError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      setSignOutError(error.message);
    } finally {
      setSignOutLoading(false);
    }
  };
  return (
    <div className="home-page">
      <h2>Profile Page</h2>
      <Button
        size="sm"
        variant="outline"
        onClick={handleLogout}
        disabled={signOutLoading}
        icon="logout"
        text={signOutLoading ? "Signing out..." : "Sign Out"}
      />
      {signOutError && (
        <p className="error-message">Sign out failed: {signOutError}</p>
      )}
    </div>
  );
}
