import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import IconElement from "../components/IconElement.jsx";
import { useAuthSession } from "../components/RequireAuth.jsx";
import { createPlant } from "../services/plants";
import {
  searchCareProfiles,
  toInitialValuesFromProfile,
} from "../services/careProfiles";
import "./PlantCreatePage.css";

// Constrained enum-style options matching DB CHECK constraints
const SUN_LEVEL_OPTIONS = [
  { label: "Shade", value: "shade" },
  { label: "Partial shade", value: "partial shade" },
  { label: "Direct sun", value: "direct sun" },
];

const HUMIDITY_OPTIONS = [
  { label: "High", value: "high" },
  { label: "Moderate", value: "moderate" },
  { label: "Low", value: "low" },
];

const DIFFICULTY_OPTIONS = [
  { label: "Easy", value: "easy" },
  { label: "Moderate", value: "moderate" },
  { label: "Challenging", value: "challenging" },
];

const INITIAL_VALUES = {
  nickname: "",
  official_name: "",
  description: "",
  picture_url: "",
  sun_level: "",
  difficulty: "",
  humidity_level: "",
  soil_temperature: "",
  water_amount_ml: "",
  soil_type: "",
  notes: "",
  season: "",
  life_expectation: "",
};

export default function PlantCreatePage() {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [step, setStep] = useState("search"); // 'search' | 'details'
  const [useRecommended, setUseRecommended] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (v) => {
    // Only enforce nickname on details step
    if (step === "details" && !v.nickname.trim())
      return "Give your plant a nickname.";
    if (!v.sun_level) return "Select a sun level.";
    if (!v.difficulty) return "Select difficulty.";
    if (v.water_amount_ml) {
      const w = Number(v.water_amount_ml);
      if (Number.isNaN(w) || w < 1 || w > 2000)
        return "Water amount must be 1–2000 ml.";
    }
    if (v.soil_temperature) {
      const t = Number(v.soil_temperature);
      if (Number.isNaN(t) || t < 0 || t > 40)
        return "Soil temperature must be 0–40°C.";
    }
    if (
      v.humidity_level &&
      !["high", "moderate", "low"].includes(v.humidity_level)
    )
      return "Invalid humidity level.";
    return "";
  };

  // SEARCH STEP handlers
  const handleQueryChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    setResults(searchCareProfiles(q));
  };

  const handlePickProfile = (profile) => {
    const prefill = toInitialValuesFromProfile(profile);
    setValues((v) => ({ ...v, ...prefill }));
    setUseRecommended(true);
    setStep("details");
  };

  const handleUseCustomOfficialName = () => {
    if (!query.trim()) return;
    setValues((v) => ({ ...v, official_name: query.trim() }));
    setUseRecommended(false);
    setStep("details");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const nickname = values.nickname.trim();
    const validationMessage = validate(values);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const userId = session?.user?.id;
    if (!userId) {
      setError("Missing user session.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        user_id: userId,
        nickname,
        official_name: values.official_name.trim() || null,
        description: values.description.trim() || null,
        picture_url: values.picture_url.trim() || null,
        sun_level: values.sun_level,
        difficulty: values.difficulty.toLowerCase(),
        humidity_level: values.humidity_level || null,
        soil_temperature: values.soil_temperature
          ? Number(values.soil_temperature)
          : null,
        water_amount_ml: values.water_amount_ml
          ? Number(values.water_amount_ml)
          : null,
        soil_type: values.soil_type.trim() || null,
        notes: values.notes.trim() || null,
        season: values.season.trim() || null,
        life_expectation: values.life_expectation.trim() || null,
      };

      const newPlant = await createPlant(payload);
      navigate(`/plants/${newPlant.id}`);
    } catch (submitError) {
      console.error(submitError);
      setError(submitError.message || "Failed to add plant.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="plant-create-page">
      <button
        type="button"
        className="plant-create-back"
        onClick={() => navigate(-1)}
      >
        <IconElement icon="arrow_back" size={24} />
        <span>Cancel</span>
      </button>

      {step === "search" && (
        <>
          <header className="plant-create-header">
            <h1>Find your plant</h1>
            <p>Search an official plant name to start.</p>
          </header>

          <div className="plant-create-form plant-search">
            <label className="form-field">
              <span>Official plant name</span>
              <input
                type="text"
                name="search"
                value={query}
                onChange={handleQueryChange}
                placeholder="e.g. Monstera deliciosa"
                autoFocus
              />
              <small>
                Pick a profile to auto-fill care, or continue with a custom
                name.
              </small>
            </label>

            {!!results.length && (
              <ul className="search-results">
                {results.map((p) => (
                  <li key={p.official_name} className="search-item">
                    <div>
                      <strong>{p.official_name}</strong>
                      {p.aka ? <span className="aka"> — {p.aka}</span> : null}
                      {p.description ? (
                        <div className="desc">{p.description}</div>
                      ) : null}
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      text="Use this"
                      onClick={() => handlePickProfile(p)}
                    />
                  </li>
                ))}
              </ul>
            )}

            {query.trim().length >= 2 && (
              <Button
                type="button"
                text={`Continue with “${query.trim()}”`}
                icon="arrow_forward"
                onClick={handleUseCustomOfficialName}
              />
            )}
          </div>
        </>
      )}

      {step === "details" && (
        <>
          <header className="plant-create-header">
            <h1>Add plant</h1>
            <p>Nickname and photo, then review care details.</p>
          </header>

          <form className="plant-create-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>Nickname *</span>
              <input
                name="nickname"
                type="text"
                value={values.nickname}
                onChange={handleChange}
                placeholder="e.g., Spicy Tina"
                required
              />
            </label>

            <label className="form-field">
              <span>Official name</span>
              <input
                name="official_name"
                type="text"
                value={values.official_name}
                onChange={handleChange}
                placeholder="Chili plant"
              />
            </label>

            {/* Segmented control for Recommended / Custom */}
            <div className="segmented" role="tablist" aria-label="Care mode">
              <button
                type="button"
                role="tab"
                className={`segmented__option ${
                  useRecommended ? "is-active" : ""
                }`}
                aria-selected={useRecommended}
                onClick={() => setUseRecommended(true)}
              >
                Recommended
              </button>
              <button
                type="button"
                role="tab"
                className={`segmented__option ${
                  !useRecommended ? "is-active" : ""
                }`}
                aria-selected={!useRecommended}
                onClick={() => setUseRecommended(false)}
              >
                Custom
              </button>
            </div>

            <label className="form-field">
              <span>Sun level *</span>
              <select
                name="sun_level"
                value={values.sun_level}
                onChange={handleChange}
                disabled={useRecommended}
                required
              >
                <option value="">Select sun preference</option>
                {SUN_LEVEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Difficulty *</span>
              <div className="difficulty-options">
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <label key={opt.value} className="difficulty-option">
                    <input
                      type="radio"
                      name="difficulty"
                      value={opt.value}
                      checked={values.difficulty === opt.value}
                      onChange={handleChange}
                      disabled={useRecommended}
                      required
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </label>

            <label className="form-field">
              <span>Humidity level</span>
              <select
                name="humidity_level"
                value={values.humidity_level}
                onChange={handleChange}
                disabled={useRecommended}
              >
                <option value="">Select humidity</option>
                {HUMIDITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Soil temperature (°C)</span>
              <input
                name="soil_temperature"
                type="number"
                min={0}
                max={40}
                value={values.soil_temperature}
                onChange={handleChange}
                disabled={useRecommended}
                placeholder="e.g. 20"
              />
            </label>

            <label className="form-field">
              <span>Water amount (ml)</span>
              <input
                name="water_amount_ml"
                type="number"
                min={1}
                max={2000}
                value={values.water_amount_ml}
                onChange={handleChange}
                disabled={useRecommended}
                placeholder="e.g. 300"
              />
            </label>

            <label className="form-field">
              <span>Soil type</span>
              <input
                name="soil_type"
                type="text"
                value={values.soil_type}
                onChange={handleChange}
                disabled={useRecommended}
                placeholder="e.g. well-draining"
              />
            </label>

            <label className="form-field">
              <span>Season</span>
              <input
                name="season"
                type="text"
                value={values.season}
                onChange={handleChange}
                disabled={useRecommended}
                placeholder="e.g. all year"
              />
            </label>

            <label className="form-field">
              <span>Life expectation</span>
              <input
                name="life_expectation"
                type="text"
                value={values.life_expectation}
                onChange={handleChange}
                disabled={useRecommended}
                placeholder="e.g. perennial"
              />
            </label>

            <label className="form-field">
              <span>Picture URL</span>
              <input
                name="picture_url"
                type="text"
                value={values.picture_url}
                onChange={handleChange}
                placeholder="https://..."
              />
            </label>

            <label className="form-field">
              <span>Description</span>
              <textarea
                name="description"
                rows={3}
                value={values.description}
                onChange={handleChange}
                placeholder="Short description of the plant"
              />
            </label>

            <label className="form-field">
              <span>Notes</span>
              <textarea
                name="notes"
                rows={4}
                value={values.notes}
                onChange={handleChange}
                placeholder="Care tips, watering amount, fertilizer type..."
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <div className="plant-create-actions">
              <Button
                type="button"
                variant="secondary"
                text="Cancel"
                icon="close"
                onClick={() => navigate(-1)}
                disabled={submitting}
              />
              <Button
                type="submit"
                text={submitting ? "Saving..." : "Add plant"}
                icon="check"
                disabled={submitting}
              />
            </div>
          </form>
        </>
      )}
    </div>
  );
}
