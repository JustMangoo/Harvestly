import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "../components/RequireAuth.jsx";
import { listPlants } from "../services/plants";

export default function PlantsPage() {
  const { session } = useAuthSession();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let abort = false;
    const userId = session?.user?.id;

    if (!userId) {
      setPlants([]);
      setError("Missing user session.");
      return;
    }

    setLoading(true);
    setError(null);

    listPlants(userId)
      .then((items) => {
        if (!abort) setPlants(items);
      })
      .catch((fetchError) => {
        if (!abort) setError(fetchError.message);
      })
      .finally(() => {
        if (!abort) setLoading(false);
      });

    return () => {
      abort = true;
    };
  }, [session]);

  const hasPlants = useMemo(() => plants.length > 0, [plants]);

  return (
    <div className="plants-page">
      <h2>Your plants</h2>
      <p>All of your saved greenery, in one place.</p>

      {loading && <p>Loading plants...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && !hasPlants && (
        <p>You haven&apos;t added any plants yet.</p>
      )}
      {!loading && !error && hasPlants && (
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
    </div>
  );
}
