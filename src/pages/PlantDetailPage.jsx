import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/Button.jsx";
import IconElement from "../components/IconElement.jsx";
import ToggleGroup from "../components/ToggleGroup.jsx";
import { useAuthSession } from "../components/RequireAuth.jsx";
import { getPlantById } from "../services/plants";
import {
  createReminder,
  deleteReminder,
  listRemindersByPlant,
  updateReminder,
} from "../services/reminders";
import { listJournalByPlant, createSignedUrls } from "../services/journal";
import "./PlantDetailPage.css";

const REMINDER_TYPES = [
  { key: "water", label: "Watering", icon: "water_drop" },
  { key: "fertilize", label: "Fertilizing", icon: "compost" },
  { key: "mist", label: "Misting", icon: "humidity_percentage" },
  { key: "turn", label: "Rotation", icon: "sync" },
];

const DAYS_OF_WEEK = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
];

const DEFAULT_FORM_STATE = {
  frequency: "multi_week",
  timesPerWeek: 2,
  selectedDays: ["monday"],
  biweeklyDay: "monday",
  startDate: "",
};

function createEmptyReminderState() {
  return REMINDER_TYPES.reduce((acc, type) => {
    acc[type.key] = { enabled: false };
    return acc;
  }, {});
}

function resolvePlantImageSrc(plant) {
  return (
    plant?.image_url || plant?.photo_url || plant?.photo || plant?.image || null
  );
}

function summarizeSchedule(schedule) {
  if (!schedule) return "No reminder scheduled yet.";
  if (typeof schedule === "string") return schedule;

  switch (schedule.frequency) {
    case "multi_week":
      return `${schedule.timesPerWeek}x per week`;
    case "specific_days":
      return schedule.selectedDays.length
        ? `Every ${schedule.selectedDays
            .map(
              (day) =>
                DAYS_OF_WEEK.find((d) => d.key === day)?.label ??
                day.slice(0, 3)
            )
            .join(", ")}`
        : "Select at least one day";
    case "biweekly":
      return `Every other ${
        DAYS_OF_WEEK.find((d) => d.key === schedule.biweeklyDay)?.label ??
        schedule.biweeklyDay
      }`;
    default:
      return "Custom schedule";
  }
}

function ReminderSwitch({ active, onToggle, disabled }) {
  return (
    <button
      type="button"
      className={`reminder-switch ${active ? "is-on" : ""}`}
      onClick={onToggle}
      aria-pressed={active}
      disabled={disabled}
    >
      <span className="reminder-switch__thumb" />
    </button>
  );
}

export default function PlantDetailPage() {
  const { session } = useAuthSession();
  const navigate = useNavigate();
  const { plantId } = useParams();

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reminders, setReminders] = useState(() => createEmptyReminderState());
  const [activeReminderType, setActiveReminderType] = useState(null);
  const [reminderForm, setReminderForm] = useState(DEFAULT_FORM_STATE);
  const [formError, setFormError] = useState("");
  const [reminderError, setReminderError] = useState("");
  const [pendingToggleType, setPendingToggleType] = useState(null);
  const [savingReminder, setSavingReminder] = useState(false);
  const [activeTab, setActiveTab] = useState("information");
  const [journal, setJournal] = useState([]);

  useEffect(() => {
    let abort = false;

    const userId = session?.user?.id;
    if (!userId || !plantId) return;

    setLoading(true);
    setError(null);
    setReminderError("");

    Promise.all([
      getPlantById({ plantId, userId }),
      listRemindersByPlant({ userId, plantId }).catch(() => []),
    ])
      .then(([plantData, reminderRows]) => {
        if (abort) return;
        setPlant(plantData);

        const mappedReminders = createEmptyReminderState();

        reminderRows.forEach((reminder) => {
          mappedReminders[reminder.task_type] = {
            enabled: true,
            id: reminder.id,
            dueDate: reminder.due_date,
            schedule: reminder.description || "Custom schedule",
          };
        });

        setReminders(mappedReminders);
        // fetch journal entries for this plant
        listJournalByPlant({ userId, plantId })
          .then(async (rows) => {
            if (abort) return;
            // if photos are stored as storage paths, create signed urls (short lived) for display
            const withUrls = await Promise.all(
              (rows || []).map(async (r) => {
                if (Array.isArray(r.photos) && r.photos.length > 0) {
                  try {
                    const signed = await createSignedUrls({
                      paths: r.photos,
                      expires: 60,
                    });
                    return { ...r, _photoUrls: signed.map((s) => s.signedUrl) };
                  } catch (e) {
                    return { ...r, _photoUrls: [] };
                  }
                }
                return { ...r, _photoUrls: [] };
              })
            );

            setJournal(withUrls);
          })
          .catch(() => {
            // ignore journal errors for now
          });
      })
      .catch((fetchError) => {
        if (!abort) {
          setError(fetchError.message || "Failed to load plant details.");
        }
      })
      .finally(() => {
        if (!abort) setLoading(false);
      });

    return () => {
      abort = true;
    };
  }, [session, plantId]);

  const displayName = useMemo(() => {
    if (!plant) return "";
    return (
      plant.nickname?.trim() ||
      plant.official_name?.trim() ||
      plant.species?.trim() ||
      "Unnamed plant"
    );
  }, [plant]);

  const subtitle = useMemo(() => {
    if (!plant) return "";
    const parts = [
      plant.official_name,
      plant.species,
      plant.variety,
      plant.type,
    ]
      .map((value) => value?.trim())
      .filter(Boolean);

    return parts.find(
      (value) => value.toLowerCase() !== displayName.toLowerCase()
    );
  }, [plant, displayName]);

  const handleToggleReminder = async (typeKey) => {
    const current = reminders[typeKey];
    const userId = session?.user?.id;

    if (current?.enabled) {
      if (!current.id || !userId) {
        setReminders((prev) => ({
          ...prev,
          [typeKey]: { enabled: false },
        }));
        return;
      }

      setPendingToggleType(typeKey);
      setReminderError("");
      try {
        await deleteReminder(current.id, userId);
        setReminders((prev) => ({
          ...prev,
          [typeKey]: { enabled: false },
        }));
      } catch (toggleError) {
        console.error(toggleError);
        setReminderError(
          toggleError.message || "Failed to disable reminder. Please try again."
        );
      } finally {
        setPendingToggleType(null);
      }
      return;
    }

    setReminderForm({
      ...DEFAULT_FORM_STATE,
      selectedDays: ["monday"],
      startDate: new Date().toISOString().split("T")[0],
    });
    setActiveReminderType(typeKey);
    setFormError("");
  };

  const closeReminderForm = () => {
    setActiveReminderType(null);
    setFormError("");
  };

  const handleReminderFormChange = (field, value) => {
    setReminderForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFormError("");
  };

  const handleDayToggle = (dayKey) => {
    setReminderForm((prev) => {
      const exists = prev.selectedDays.includes(dayKey);
      const selectedDays = exists
        ? prev.selectedDays.filter((day) => day !== dayKey)
        : [...prev.selectedDays, dayKey];
      return { ...prev, selectedDays };
    });
  };

  const handleReminderFormSubmit = async (event) => {
    event.preventDefault();

    if (reminderForm.frequency === "specific_days") {
      if (!reminderForm.selectedDays.length) {
        setFormError("Choose at least one day of the week.");
        return;
      }
    }

    if (!activeReminderType) return;

    const userId = session?.user?.id;
    if (!userId || !plantId) {
      setFormError("Missing account information. Please sign in again.");
      return;
    }

    const dueDate =
      reminderForm.startDate || new Date().toISOString().split("T")[0];

    // Build recurrence_data based on frequency
    let recurrenceData = null;
    if (reminderForm.frequency === "specific_days") {
      recurrenceData = { days: reminderForm.selectedDays };
    } else if (reminderForm.frequency === "biweekly") {
      recurrenceData = {
        day: reminderForm.biweeklyDay,
        start_date: dueDate,
      };
    } else if (reminderForm.frequency === "multi_week") {
      recurrenceData = { times_per_week: reminderForm.timesPerWeek };
    }

    const existingReminder = reminders[activeReminderType];

    setSavingReminder(true);
    setReminderError("");
    try {
      let savedReminder;

      if (existingReminder?.id) {
        savedReminder = await updateReminder(existingReminder.id, userId, {
          dueDate,
          frequency: reminderForm.frequency,
          recurrenceData,
        });
      } else {
        savedReminder = await createReminder({
          userId,
          plantId,
          dueDate,
          taskType: activeReminderType,
          frequency: reminderForm.frequency,
          recurrenceData,
        });
      }

      setReminders((prev) => ({
        ...prev,
        [activeReminderType]: {
          enabled: true,
          id: savedReminder.id,
          dueDate: savedReminder.due_date,
          schedule: reminderForm,
        },
      }));

      closeReminderForm();
    } catch (saveError) {
      console.error(saveError);
      setFormError(
        saveError.message || "Failed to save reminder. Please try again."
      );
    } finally {
      setSavingReminder(false);
    }
  };

  const currentReminderLabel = activeReminderType
    ? REMINDER_TYPES.find((type) => type.key === activeReminderType)?.label
    : "";

  return (
    <div className="plant-detail-page">
      <header className="plant-detail-header">
        <button
          type="button"
          className="plant-detail-back"
          onClick={() => navigate(-1)}
        >
          <IconElement icon="arrow_back" size={24} />
          <span>Back</span>
        </button>
        <Button variant="secondary" icon="edit" text="Edit plant" />
      </header>

      {loading && <p className="plant-detail-state">Loading plant...</p>}
      {error && (
        <p className="plant-detail-state plant-detail-state--error">{error}</p>
      )}

      {!loading && !error && plant && (
        <>
          <section className="plant-detail-hero">
            <div className="plant-detail-photo">
              {resolvePlantImageSrc(plant) ? (
                <img
                  src={resolvePlantImageSrc(plant)}
                  alt={`${displayName} photo`}
                />
              ) : (
                <div className="plant-detail-avatar">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="plant-detail-meta">
              <p className="plant-detail-subtitle">Plant profile</p>
              <h1>{displayName}</h1>
              {subtitle && (
                <p className="plant-detail-description">{subtitle}</p>
              )}
              <div className="plant-detail-tags">
                {plant.sun_level && (
                  <span className="plant-detail-tag">
                    <IconElement icon="sunny" size={18} />
                    {plant.sun_level}
                  </span>
                )}
                {plant.difficulty && (
                  <span className="plant-detail-tag">
                    <IconElement icon="psychology" size={18} />
                    {plant.difficulty}
                  </span>
                )}
              </div>
            </div>
          </section>

          <ToggleGroup
            options={[
              { label: "Information", value: "information" },
              { label: "Reminders", value: "reminders" },
              { label: "Journal", value: "journal" },
            ]}
            value={activeTab}
            onChange={(v) => setActiveTab(v)}
            className="plant-tabs"
          />

          {activeTab === "information" && (
            <section className="plant-info">
              <div className="info-section">
                <h3>How to care</h3>
                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-card__label">Difficulty</div>
                    <div className="info-card__value">
                      {plant.difficulty || "—"}
                    </div>
                  </div>

                  <div className="info-card">
                    <div className="info-card__label">Water</div>
                    <div className="info-card__value">
                      {plant.water_amount_ml
                        ? `${plant.water_amount_ml} ml`
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>Conditions</h3>
                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-card__label">Humidity</div>
                    <div className="info-card__value">
                      {plant.humidity_level || "—"}
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-card__label">Sunlight</div>
                    <div className="info-card__value">
                      {plant.sun_level || "—"}
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-card__label">Temperature</div>
                    <div className="info-card__value">
                      {plant.soil_temperature || "—"}
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-card__label">Soil</div>
                    <div className="info-card__value">
                      {plant.soil_type || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === "reminders" && (
            <section className="plant-reminders">
              <div className="plant-reminders-header">
                <div>
                  <h2>Care reminders</h2>
                  <p>Automate your watering, misting, and rotation habits.</p>
                </div>
                <Button variant="secondary" icon="event" text="View calendar" />
              </div>
              {reminderError && (
                <p className="reminder-inline-error">{reminderError}</p>
              )}
              <div className="reminder-grid">
                {REMINDER_TYPES.map((type) => {
                  const reminder = reminders[type.key];
                  return (
                    <div className="reminder-card" key={type.key}>
                      <div className="reminder-card-head">
                        <div className="reminder-card-icon">
                          <IconElement icon={type.icon} size={24} />
                        </div>
                        <div>
                          <p className="reminder-card-title">{type.label}</p>
                          <p className="reminder-card-summary">
                            {summarizeSchedule(reminder?.schedule)}
                          </p>
                        </div>
                      </div>
                      <ReminderSwitch
                        active={Boolean(reminder?.enabled)}
                        onToggle={() => handleToggleReminder(type.key)}
                        disabled={pendingToggleType === type.key}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === "journal" && (
            <section className="plant-journal">
              <h3>Journal</h3>
              <div className="journal-timeline">
                {/* Sample static journal entries - replace with real data when available */}
                <div className="timeline-item">
                  <div className="timeline-marker" />
                  <div className="timeline-card">
                    <strong>Watered</strong>
                    <div className="timeline-meta">Aug 4, 2025</div>
                    <p className="timeline-body">
                      Watered the plant thoroughly.
                    </p>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-marker" />
                  <div className="timeline-card">
                    <strong>Photo</strong>
                    <div className="timeline-meta">Aug 4, 2025</div>
                    <div className="timeline-photos">
                      <div className="thumb" />
                      <div className="thumb" />
                      <div className="thumb" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {activeReminderType && (
        <div className="reminder-modal">
          <div className="reminder-modal__scrim" onClick={closeReminderForm} />
          <div className="reminder-modal__content">
            <header>
              <h3>{currentReminderLabel} reminder</h3>
              <button
                type="button"
                className="reminder-modal__close"
                onClick={closeReminderForm}
                aria-label="Close reminder form"
              >
                <IconElement icon="close" size={20} />
              </button>
            </header>
            <form onSubmit={handleReminderFormSubmit}>
              <label className="form-field">
                <span>Start date</span>
                <input
                  type="date"
                  value={reminderForm.startDate}
                  onChange={(event) =>
                    handleReminderFormChange("startDate", event.target.value)
                  }
                  required
                />
              </label>

              <fieldset className="form-field">
                <legend>How often?</legend>
                <div className="frequency-options">
                  <label className="frequency-option">
                    <input
                      type="radio"
                      name="frequency"
                      value="multi_week"
                      checked={reminderForm.frequency === "multi_week"}
                      onChange={(event) =>
                        handleReminderFormChange(
                          "frequency",
                          event.target.value
                        )
                      }
                    />
                    <span>Multiple times per week</span>
                  </label>
                  {reminderForm.frequency === "multi_week" && (
                    <div className="frequency-detail">
                      <input
                        type="number"
                        min="1"
                        max="7"
                        value={reminderForm.timesPerWeek}
                        onChange={(event) =>
                          handleReminderFormChange(
                            "timesPerWeek",
                            Number(event.target.value)
                          )
                        }
                      />
                      <span>times per week</span>
                    </div>
                  )}

                  <label className="frequency-option">
                    <input
                      type="radio"
                      name="frequency"
                      value="specific_days"
                      checked={reminderForm.frequency === "specific_days"}
                      onChange={(event) =>
                        handleReminderFormChange(
                          "frequency",
                          event.target.value
                        )
                      }
                    />
                    <span>Specific days of the week</span>
                  </label>
                  {reminderForm.frequency === "specific_days" && (
                    <div className="days-selector">
                      {DAYS_OF_WEEK.map((day) => (
                        <button
                          type="button"
                          key={day.key}
                          className={`day-chip ${
                            reminderForm.selectedDays.includes(day.key)
                              ? "is-selected"
                              : ""
                          }`}
                          onClick={() => handleDayToggle(day.key)}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <label className="frequency-option">
                    <input
                      type="radio"
                      name="frequency"
                      value="biweekly"
                      checked={reminderForm.frequency === "biweekly"}
                      onChange={(event) =>
                        handleReminderFormChange(
                          "frequency",
                          event.target.value
                        )
                      }
                    />
                    <span>Every other week</span>
                  </label>
                  {reminderForm.frequency === "biweekly" && (
                    <div className="frequency-detail">
                      <select
                        value={reminderForm.biweeklyDay}
                        onChange={(event) =>
                          handleReminderFormChange(
                            "biweeklyDay",
                            event.target.value
                          )
                        }
                      >
                        {DAYS_OF_WEEK.map((day) => (
                          <option key={day.key} value={day.key}>
                            {day.label}
                          </option>
                        ))}
                      </select>
                      <span>every other week</span>
                    </div>
                  )}
                </div>
              </fieldset>

              {formError && <p className="form-error">{formError}</p>}

              <div className="reminder-modal__actions">
                <Button
                  type="button"
                  variant="secondary"
                  text="Cancel"
                  onClick={closeReminderForm}
                  disabled={savingReminder}
                />
                <Button
                  type="submit"
                  text={savingReminder ? "Saving..." : "Save reminder"}
                  icon="check"
                  disabled={savingReminder}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
