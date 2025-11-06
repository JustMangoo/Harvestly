import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Button from "../components/Button.jsx";
import { supabase } from "../lib/supabaseClient";
import { listPlants } from "../services/plants";

export default function HomePage() {
  const [session, setSession] = useState(null);
  const [signOutLoading, setSignOutLoading] = useState(false);
  const [signOutError, setSignOutError] = useState(null);
  const [plants, setPlants] = useState([]);
  const [plantsLoading, setPlantsLoading] = useState(false);
  const [plantsError, setPlantsError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let abort = false;
    const userId = session?.user?.id;

    if (!session || !userId) {
      setPlants([]);
      setPlantsError(null);
      return;
    }

    setPlantsLoading(true);
    setPlantsError(null);

    listPlants(userId)
      .then((items) => {
        if (!abort) setPlants(items);
      })
      .catch((error) => {
        if (!abort) setPlantsError(error.message);
      })
      .finally(() => {
        if (!abort) setPlantsLoading(false);
      });

    return () => {
      abort = true;
    };
  }, [session]);

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

  const hasPlants = useMemo(() => plants.length > 0, [plants]);

  return (
    <div className="home-page">
      <h2>Welcome to Harvestly</h2>
      <p>Your go-to app for managing your harvests efficiently.</p>

      {!session && (
        <section className="auth-cta">
          <p>Sign in to start tracking your plants.</p>
          <Link to="/auth">
            <Button icon="login" text="Go to Auth" />
          </Link>
        </section>
      )}

      {session && (
        <section className="plants-section">
          <div className="plants-header">
            <Button
              size="sm"
              variant="outline"
              onClick={handleLogout}
              disabled={signOutLoading}
              icon="logout"
              text={signOutLoading ? "Signing out..." : "Sign Out"}
            />
            <h3>Your plants</h3>
          </div>
          {plantsLoading && <p>Loading plants...</p>}
          {plantsError && <p className="error-message">{plantsError}</p>}
          {!plantsLoading && !plantsError && !hasPlants && (
            <p>You haven&apos;t added any plants yet.</p>
          )}
          {!plantsLoading && !plantsError && hasPlants && (
            <ul className="plant-list">
              {plants.map((plant) => (
                <li key={plant.id} className="plant-card">
                  <h4>{plant.nickname}</h4>
                  {plant.official_name && (
                    <p className="plant-official">{plant.official_name}</p>
                  )}
                  {plant.sun_level && (
                    <p className="plant-detail">
                      <strong>Sun:</strong> {plant.sun_level}
                    </p>
                  )}
                  {plant.difficulty && (
                    <p className="plant-detail">
                      <strong>Difficulty:</strong> {plant.difficulty}
                    </p>
                  )}
                  {plant.notes && <p className="plant-notes">{plant.notes}</p>}
                </li>
              ))}
            </ul>
          )}
          {signOutError && (
            <p className="error-message">Sign out failed: {signOutError}</p>
          )}
        </section>
      )}
    </div>
  );
}
