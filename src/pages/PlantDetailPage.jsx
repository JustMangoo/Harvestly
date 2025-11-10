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
import {
  listJournalByPlant,
  createSignedUrls,
  createJournalEntry,
  uploadJournalPhoto,
} from "../services/journal";
import "./PlantDetailPage.css";

const REMINDER_TYPES = [
  { key: "water", label: "Watering", icon: "water_drop" },
  { key: "fertilize", label: "Fertilizing", icon: "compost" },
  { key: "mist", label: "Misting", icon: "humidity_percentage" },
  { key: "rotate", label: "Rotation", icon: "sync" },
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

const JOURNAL_ENTRY_TYPES = [
  { key: "note", label: "Note", icon: "edit_note" },
  { key: "photo", label: "Photo", icon: "photo_camera" },
  { key: "water", label: "Watered", icon: "water_drop" },
  { key: "fertilize", label: "Fertilized", icon: "compost" },
  { key: "mist", label: "Misted", icon: "humidity_percentage" },
  { key: "rotate", label: "Rotated", icon: "sync" },
];

function getJournalIcon(entryType) {
  const type = JOURNAL_ENTRY_TYPES.find((t) => t.key === entryType);
  return type?.icon || "description";
}

const DEFAULT_FORM_STATE = {
  frequency: "specific_days",
  selectedDays: ["monday"],
  weekInterval: 2,
  weeklyDay: "monday",
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
    case "weekly":
      const interval = schedule.weekInterval || 1;
      const dayLabel =
        DAYS_OF_WEEK.find((d) => d.key === schedule.weeklyDay)?.label ||
        schedule.weeklyDay;
      if (interval === 1) {
        return `Every ${dayLabel}`;
      } else {
        return `Every ${interval} weeks on ${dayLabel}`;
      }
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
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [journalForm, setJournalForm] = useState({
    entry_type: "note",
    title: "",
    body: "",
    photos: [],
  });
  const [savingJournal, setSavingJournal] = useState(false);
  const [journalError, setJournalError] = useState("");

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
    } else if (reminderForm.frequency === "weekly") {
      recurrenceData = {
        day: reminderForm.weeklyDay,
        interval: reminderForm.weekInterval,
        start_date: dueDate,
      };
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

  const handleJournalFormSubmit = async (event) => {
    event.preventDefault();
    const userId = session?.user?.id;

    if (!userId || !plantId) return;

    setSavingJournal(true);
    setJournalError("");

    try {
      const newEntry = await createJournalEntry({
        userId,
        plantId,
        entry: journalForm,
      });

      // Add to local state with signed URLs if photos exist
      let entryWithUrls = newEntry;
      if (newEntry.photos && newEntry.photos.length > 0) {
        const signed = await createSignedUrls({
          paths: newEntry.photos,
          expires: 60,
        });
        entryWithUrls = {
          ...newEntry,
          _photoUrls: signed.map((s) => s.signedUrl),
        };
      } else {
        entryWithUrls = { ...newEntry, _photoUrls: [] };
      }

      setJournal((prev) => [entryWithUrls, ...prev]);
      setShowJournalForm(false);
      setJournalForm({
        entry_type: "note",
        title: "",
        body: "",
        photos: [],
      });
    } catch (error) {
      console.error("Failed to create journal entry:", error);
      setJournalError(error.message || "Failed to create entry");
    } finally {
      setSavingJournal(false);
    }
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const userId = session?.user?.id;
    if (!userId) return;

    try {
      const uploadedPaths = [];
      for (const file of files) {
        const timestamp = Date.now();
        const filename = `${userId}/${plantId}/${timestamp}-${file.name}`;
        await uploadJournalPhoto({ path: filename, file });
        uploadedPaths.push(filename);
      }

      setJournalForm((prev) => ({
        ...prev,
        photos: [...prev.photos, ...uploadedPaths],
      }));
    } catch (error) {
      console.error("Failed to upload photos:", error);
      setJournalError("Failed to upload photos");
    }
  };

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
            <div className="plant-detail-meta">
              <h1>{displayName}</h1>
              {subtitle && (
                <p className="plant-detail-subtitle">"{subtitle}"</p>
              )}
            </div>
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
                    <IconElement icon="speed" size={24} />
                    <div className="info-card__content">
                      <div className="info-card__label">Difficulty</div>
                      <div className="info-card__value">
                        {plant.difficulty || "—"}
                      </div>
                    </div>
                  </div>

                  <div className="info-card">
                    <IconElement icon="water_drop" size={24} />
                    <div className="info-card__content">
                      <div className="info-card__label">Water</div>
                      <div className="info-card__value">
                        {plant.water_amount_ml
                          ? `${plant.water_amount_ml} ml`
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>Conditions</h3>
                <div className="info-grid">
                  <div className="info-card">
                    <IconElement icon="humidity_percentage" size={24} />
                    <div className="info-card__content">
                      <div className="info-card__label">Humidity</div>
                      <div className="info-card__value">
                        {plant.humidity_level || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="info-card">
                    <IconElement icon="sunny" size={24} />
                    <div className="info-card__content">
                      <div className="info-card__label">Sunlight</div>
                      <div className="info-card__value">
                        {plant.sun_level || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="info-card">
                    <IconElement icon="device_thermostat" size={24} />
                    <div className="info-card__content">
                      <div className="info-card__label">Temperature</div>
                      <div className="info-card__value">
                        {plant.soil_temperature || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="info-card">
                    <IconElement icon="compost" size={24} />
                    <div className="info-card__content">
                      <div className="info-card__label">Soil</div>
                      <div className="info-card__value">
                        {plant.soil_type || "—"}
                      </div>
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
              <div className="journal-header">
                <h3>Journal</h3>
                <Button
                  variant="secondary"
                  icon="add"
                  text="Add entry"
                  onClick={() => setShowJournalForm(true)}
                />
              </div>
              {journalError && <p className="journal-error">{journalError}</p>}
              <div className="journal-timeline">
                {journal.length === 0 && (
                  <p className="journal-empty">
                    No journal entries yet. Add your first entry to track your
                    plant's progress!
                  </p>
                )}
                {journal.map((entry) => (
                  <div className="timeline-item" key={entry.id}>
                    <div className="timeline-marker">
                      <IconElement
                        icon={getJournalIcon(entry.entry_type)}
                        size={20}
                      />
                    </div>
                    <div className="timeline-card">
                      <strong>{entry.title || entry.entry_type}</strong>
                      <div className="timeline-meta">
                        {new Date(entry.created_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </div>
                      {entry.body && (
                        <p className="timeline-body">{entry.body}</p>
                      )}
                      {entry._photoUrls && entry._photoUrls.length > 0 && (
                        <div className="timeline-photos">
                          {entry._photoUrls.map((url, i) => (
                            <img
                              key={i}
                              src={url}
                              alt={`Journal photo ${i + 1}`}
                              className="timeline-photo"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                      value="weekly"
                      checked={reminderForm.frequency === "weekly"}
                      onChange={(event) =>
                        handleReminderFormChange(
                          "frequency",
                          event.target.value
                        )
                      }
                    />
                    <span>Weekly interval</span>
                  </label>
                  {reminderForm.frequency === "weekly" && (
                    <div className="frequency-detail">
                      <span>Every</span>
                      <input
                        type="number"
                        min="1"
                        max="52"
                        value={reminderForm.weekInterval}
                        onChange={(event) =>
                          handleReminderFormChange(
                            "weekInterval",
                            Number(event.target.value)
                          )
                        }
                        style={{ width: "60px" }}
                      />
                      <span>week(s) on</span>
                      <select
                        value={reminderForm.weeklyDay}
                        onChange={(event) =>
                          handleReminderFormChange(
                            "weeklyDay",
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

      {showJournalForm && (
        <div className="reminder-modal">
          <div
            className="reminder-modal__scrim"
            onClick={() => setShowJournalForm(false)}
          />
          <div className="reminder-modal__content">
            <header>
              <h3>Add journal entry</h3>
              <button
                type="button"
                className="reminder-modal__close"
                onClick={() => setShowJournalForm(false)}
                aria-label="Close journal form"
              >
                <IconElement icon="close" size={20} />
              </button>
            </header>
            <form onSubmit={handleJournalFormSubmit}>
              <label className="form-field">
                <span>Entry type</span>
                <select
                  value={journalForm.entry_type}
                  onChange={(e) =>
                    setJournalForm((prev) => ({
                      ...prev,
                      entry_type: e.target.value,
                    }))
                  }
                >
                  <option value="note">Note</option>
                  <option value="photo">Photo</option>
                </select>
              </label>

              <label className="form-field">
                <span>Title (optional)</span>
                <input
                  type="text"
                  value={journalForm.title}
                  onChange={(e) =>
                    setJournalForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g., First watering, New growth spotted"
                />
              </label>

              <label className="form-field">
                <span>Notes</span>
                <textarea
                  value={journalForm.body}
                  onChange={(e) =>
                    setJournalForm((prev) => ({
                      ...prev,
                      body: e.target.value,
                    }))
                  }
                  placeholder="Add any observations or details..."
                  rows={4}
                  required
                />
              </label>

              {journalForm.entry_type === "photo" && (
                <label className="form-field">
                  <span>Upload photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                  />
                  {journalForm.photos.length > 0 && (
                    <div className="photo-preview">
                      {journalForm.photos.length} photo(s) selected
                    </div>
                  )}
                </label>
              )}

              {journalError && <p className="form-error">{journalError}</p>}

              <div className="reminder-modal__actions">
                <Button
                  type="button"
                  variant="secondary"
                  text="Cancel"
                  onClick={() => setShowJournalForm(false)}
                  disabled={savingJournal}
                />
                <Button
                  type="submit"
                  text={savingJournal ? "Saving..." : "Add entry"}
                  icon="check"
                  disabled={savingJournal}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
