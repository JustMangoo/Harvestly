import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import IconElement from "../components/IconElement.jsx";
import { useAuthSession } from "../components/RequireAuth.jsx";
import { createPlant } from "../services/plants";
import "./PlantCreatePage.css";

const DIFFICULTY_OPTIONS = ["Easy", "Intermediate", "Challenging"];
const SUN_LEVEL_OPTIONS = ["Low light", "Indirect", "Full sun"];

const INITIAL_VALUES = {
  nickname: "",
  official_name: "",
  sun_level: "",
  difficulty: "",
  notes: "",
};

export default function PlantCreatePage() {
  const navigate = useNavigate();
  const { session } = useAuthSession();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const nickname = values.nickname.trim();
    if (!nickname) {
      setError("Give your plant a nickname.");
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
        sun_level: values.sun_level,
        difficulty: values.difficulty,
        notes: values.notes.trim() || null,
      };

      const newPlant = await createPlant(payload);
      navigate(`/plants/${newPlant.id}`);
    } catch (submitError) {
      console.error(submitError);
      setError(submitError.message || "Failed to add plant.");
      setSubmitting(false);
    }
  };

  return (
    <div className="plant-create-page">
      <header className="plant-create-header">
        <button
          type="button"
          className="plant-create-back"
          onClick={() => navigate(-1)}
        >
          <IconElement icon="arrow_back" size={24} />
          <span>Cancel</span>
        </button>
        <h1>Add plant</h1>
        <p>Give your new green friend a name and care profile.</p>
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

        <label className="form-field">
          <span>Sun level</span>
          <select
            name="sun_level"
            value={values.sun_level}
            onChange={handleChange}
          >
            <option value="">Select sun preference</option>
            {SUN_LEVEL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Difficulty</span>
          <div className="difficulty-options">
            {DIFFICULTY_OPTIONS.map((option) => (
              <label key={option} className="difficulty-option">
                <input
                  type="radio"
                  name="difficulty"
                  value={option}
                  checked={values.difficulty === option}
                  onChange={handleChange}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
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
            text="Back to plants"
            icon="chevron_left"
            onClick={() => navigate("/plants")}
            disabled={submitting}
          />
          <Button
            type="submit"
            text={submitting ? "Saving..." : "Save plant"}
            icon="check"
            disabled={submitting}
          />
        </div>
      </form>
    </div>
  );
}
