import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthSession } from "../components/RequireAuth.jsx";
import IconElement from "../components/IconElement.jsx";
import { listPlants } from "../services/plants";
import { listRemindersForUser } from "../services/reminders";
import "./PlantsPage.css";

const REMINDER_TYPES = [
  { key: "water", label: "Watering", color: "var(--color-water-reminder)" },
  { key: "mist", label: "Misting", color: "var(--color-mist-reminder)" },
  { key: "rotate", label: "Rotation", color: "var(--color-rotate-reminder)" },
  {
    key: "fertilize",
    label: "Fertilizing",
    color: "var(--color-fertilize-reminder)",
  },
];

function buildReminderLookup(entries) {
  return entries.reduce((acc, reminder) => {
    if (!reminder?.plant_id || !reminder?.task_type) return acc;
    if (!acc[reminder.plant_id]) acc[reminder.plant_id] = [];
    if (!acc[reminder.plant_id].includes(reminder.task_type)) {
      acc[reminder.plant_id].push(reminder.task_type);
    }
    return acc;
  }, {});
}

function resolvePlantImageSrc(plant) {
  return (
    plant?.image_url || plant?.photo_url || plant?.photo || plant?.image || null
  );
}

function resolveText(...candidates) {
  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const trimmed = candidate.trim();
      if (trimmed) return trimmed;
    }
  }
  return "";
}

export default function PlantsPage() {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const [plants, setPlants] = useState([]);
  const [reminderLookup, setReminderLookup] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let abort = false;
    const userId = session?.user?.id;

    if (!userId) {
      setPlants([]);
      setReminderLookup({});
      setError("Missing user session.");
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([listPlants(userId), listRemindersForUser(userId)])
      .then(([items, reminders]) => {
        if (abort) return;
        setPlants(items);
        setReminderLookup(buildReminderLookup(reminders ?? []));
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
      <nav className="plants-nav">
        <button className="back-button" onClick={() => navigate(-1)}>
          <IconElement icon="arrow_back" size={24} />
        </button>
        <h1 className="page-title">My plants</h1>
        <div className="nav-spacer" />
      </nav>

      <section className="plants-content">
        {loading && <p className="plants-state">Loading your plants…</p>}
        {error && <p className="plants-state plants-state--error">{error}</p>}
        {!loading && !error && !hasPlants && (
          <p className="plants-state">You haven&apos;t added any plants yet.</p>
        )}

        {!loading && !error && hasPlants && (
          <ul className="plant-list">
            {plants.map((plant) => {
              const displayName =
                resolveText(plant?.nickname, plant?.official_name) ||
                "Unnamed plant";
              const subtitleCandidate = resolveText(
                plant?.official_name,
                plant?.species,
                plant?.variety,
                plant?.type
              );
              const subtitle =
                subtitleCandidate &&
                subtitleCandidate.toLowerCase() !== displayName.toLowerCase()
                  ? subtitleCandidate
                  : "";
              const imageSrc = resolvePlantImageSrc(plant);
              const plantReminderTypes =
                (plant.id && reminderLookup[plant.id]) || [];
              const activeReminders = REMINDER_TYPES.filter((type) =>
                plantReminderTypes.includes(type.key)
              );

              return (
                <li key={plant.id ?? displayName} className="plant-card">
                  <Link to={`/plants/${plant.id}`} className="plant-card__link">
                    <div className="plant-card__media">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={`${displayName} photo`}
                          loading="lazy"
                        />
                      ) : (
                        <div className="plant-card__avatar" aria-hidden="true">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="plant-card__body">
                      <div className="plant-card__header">
                        <div>
                          <p className="plant-card__name">{displayName}</p>
                          {subtitle && (
                            <p className="plant-card__subtitle">{subtitle}</p>
                          )}
                        </div>
                        <IconElement
                          icon="chevron_right"
                          size={24}
                          className="plant-card__chevron"
                        />
                      </div>

                      {activeReminders.length > 0 && (
                        <div className="plant-card__indicators">
                          {activeReminders.map((indicator) => (
                            <span
                              key={indicator.key}
                              className="plant-card__indicator"
                              style={{ backgroundColor: indicator.color }}
                              title={`${indicator.label} reminder active`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Link
        to="/plants/new"
        className="plants-add-button"
        aria-label="Add a new plant"
      >
        <IconElement icon="add" size={28} filled />
      </Link>
    </div>
  );
}
