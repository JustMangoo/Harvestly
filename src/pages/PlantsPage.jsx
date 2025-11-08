import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "../components/RequireAuth.jsx";
import IconElement from "../components/IconElement.jsx";
import { listPlants } from "../services/plants";
import "./PlantsPage.css";

const INDICATOR_FIELDS = [
  { key: "sun_level", label: "Sun" },
  { key: "difficulty", label: "Difficulty" },
  { key: "notes", label: "Notes" },
];

const INDICATOR_COLORS = [
  "var(--color-primary)",
  "var(--color-accent-60)",
  "var(--color-accent)",
  "var(--color-dark-80)",
];

function buildIndicators(plant) {
  const activeIndicators = INDICATOR_FIELDS.map((field) => {
    const value = resolveText(plant?.[field.key]);
    if (!value) return null;
    return { ...field, value };
  }).filter(Boolean);

  if (!activeIndicators.length) {
    return [
      {
        key: "profile",
        label: "Care profile",
        color: INDICATOR_COLORS[0],
      },
    ];
  }

  return activeIndicators
    .slice(0, INDICATOR_COLORS.length)
    .map((field, idx) => ({
      key: field.key,
      label: `${field.label}: ${field.value}`,
      color: INDICATOR_COLORS[idx],
    }));
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
      <header className="plants-header">
        <p className="plants-subtitle">Plant shelf</p>
        <h1>My plants</h1>
        <p className="plants-description">
          Keep an eye on every sprout, leaf, and bloom at a glance.
        </p>
      </header>

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
              const indicators = buildIndicators(plant);

              return (
                <li key={plant.id ?? displayName} className="plant-card">
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

                    <div className="plant-card__indicators">
                      {indicators.map((indicator) => (
                        <span
                          key={indicator.key}
                          className="plant-card__indicator"
                          style={{ backgroundColor: indicator.color }}
                          title={indicator.label}
                        />
                      ))}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <button
        type="button"
        className="plants-add-button"
        aria-label="Add a new plant"
      >
        <IconElement icon="add" size={28} filled />
      </button>
    </div>
  );
}
