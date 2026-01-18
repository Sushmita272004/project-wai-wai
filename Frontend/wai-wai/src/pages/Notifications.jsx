// frontend/wai-wai/src/pages/Notifications.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FiBell,
  FiSettings,
  FiCheck,
  FiCheckCircle,
  FiMessageSquare,
  FiBriefcase,
  FiZap,
  FiCalendar,
  FiClock,
  FiTrash2,
  FiX,
  FiArrowRight,
} from "react-icons/fi";
import "../styles/Notifications.css";

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showSettings, setShowSettings] = useState(false);

  // NEW: State for the selected message (Detail View)
  const [selectedNotification, setSelectedNotification] = useState(null);

  const [prefs, setPrefs] = useState({
    email_enabled: true,
    push_enabled: true,
    inapp_enabled: true,
    frequency: "immediate",
  });

  // --- ICONS MAPPING ---
  const getIcon = (type) => {
    switch (type) {
      case "JOB_MATCH":
        return <FiBriefcase className="notif-icon match" />;
      case "APPLICATION_STATUS":
        return <FiCheckCircle className="notif-icon status" />;
      case "EMPLOYER_MESSAGE":
        return <FiMessageSquare className="notif-icon message" />;
      case "SKILL_RECOMMENDATION":
        return <FiZap className="notif-icon skill" />;
      case "INTERVIEW_REMINDER":
        return <FiCalendar className="notif-icon interview" />;
      default:
        return <FiBell className="notif-icon default" />;
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [user]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
      const res = await fetch(`${API_BASE}/notifications/user/${user.email}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
      const res = await fetch(
        `${API_BASE}/notifications/user/${user.email}/preferences`,
      );
      const data = await res.json();
      setPrefs(data);
    } catch (err) {
      console.error(err);
    }
  };

  // --- ACTIONS ---
  const handleNotificationClick = async (notif) => {
    setSelectedNotification(notif); // Open Modal

    if (!notif.read) {
      try {
        const API_BASE =
          import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
        await fetch(`${API_BASE}/notifications/${notif.id}/read`, {
          method: "PATCH",
        });
        // Update UI locally
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
        );
      } catch (err) {
        console.error(err);
      }
    }
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
      await fetch(`${API_BASE}/notifications/bulk-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_ids: unreadIds }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const savePreferences = async () => {
    try {
      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";
      await fetch(`${API_BASE}/notifications/user/${user.email}/preferences`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      setShowSettings(false);
      alert("Preferences Saved!");
    } catch (err) {
      alert("Failed to save settings");
    }
  };

  const displayedNotifs =
    filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="notifications-page">
      <div className="notif-container">
        {/* HEADER */}
        <header className="notif-header">
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with your job search progress</p>
          </div>
          <div className="header-actions">
            <button
              className="settings-btn"
              onClick={() => setShowSettings(true)}
            >
              <FiSettings /> Settings
            </button>
          </div>
        </header>

        {/* TOOLBAR */}
        <div className="notif-toolbar">
          <div className="tabs">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={filter === "unread" ? "active" : ""}
              onClick={() => setFilter("unread")}
            >
              Unread{" "}
              {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </button>
          </div>
          {unreadCount > 0 && (
            <button className="mark-read-btn" onClick={markAllRead}>
              <FiCheck /> Mark all as read
            </button>
          )}
        </div>

        {/* LIST VIEW */}
        <div className="notif-list">
          {loading ? (
            <div className="loading">Loading updates...</div>
          ) : displayedNotifs.length > 0 ? (
            displayedNotifs.map((notif) => (
              <div
                key={notif.id}
                className={`notif-card ${!notif.read ? "unread" : ""}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <div className="icon-wrapper">{getIcon(notif.type)}</div>
                <div className="content">
                  <div className="title-row">
                    <h3>{notif.title}</h3>
                    <span className="time">
                      <FiClock />{" "}
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Truncate message in list view */}
                  <p className="preview-text">
                    {notif.message.substring(0, 80)}
                    {notif.message.length > 80 ? "..." : ""}
                  </p>
                </div>
                {!notif.read && <div className="unread-dot"></div>}
              </div>
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <FiBell />
              </div>
              <h3>No notifications yet</h3>
              <p>We'll notify you when we find matching jobs.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- NEW: DETAIL VIEW MODAL --- */}
      {selectedNotification && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="modal-content detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="header-title-row">
                {getIcon(selectedNotification.type)}
                <h2>{selectedNotification.title}</h2>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="close-btn"
              >
                <FiX />
              </button>
            </div>

            <div className="modal-body">
              <p className="full-message">{selectedNotification.message}</p>

              {/* DYNAMIC DATA DISPLAY BASED ON TYPE */}
              {selectedNotification.data &&
                Object.keys(selectedNotification.data).length > 0 && (
                  <div className="data-box">
                    <h4>Additional Details</h4>
                    {selectedNotification.type === "JOB_MATCH" && (
                      <div className="data-grid">
                        <div className="data-item">
                          <span className="label">Company</span>
                          <span className="value">
                            {selectedNotification.data.company}
                          </span>
                        </div>
                        <div className="data-item">
                          <span className="label">Role</span>
                          <span className="value">
                            {selectedNotification.data.job_title}
                          </span>
                        </div>
                        <div className="data-item">
                          <span className="label">Match Score</span>
                          <span className="value score">
                            {selectedNotification.data.match_score}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Fallback for other types or generic data */}
                    {selectedNotification.type !== "JOB_MATCH" && (
                      <pre className="generic-data">
                        {JSON.stringify(selectedNotification.data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}

              <div className="timestamp-footer">
                Received on:{" "}
                {new Date(selectedNotification.created_at).toLocaleString()}
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="secondary-btn"
                onClick={() => setSelectedNotification(null)}
              >
                Close
              </button>
              {selectedNotification.type === "JOB_MATCH" && (
                <button className="primary-btn">
                  View Job <FiArrowRight />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <div className="modal-overlay">
          <div className="modal-content settings-modal">
            <div className="modal-header">
              <h2>Notification Preferences</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="close-btn"
              >
                <FiX />
              </button>
            </div>

            <div className="pref-group">
              <label className="switch-row">
                <span>Email Notifications</span>
                <input
                  type="checkbox"
                  checked={prefs.email_enabled}
                  onChange={(e) =>
                    setPrefs({ ...prefs, email_enabled: e.target.checked })
                  }
                />
              </label>
              <p className="pref-desc">
                Receive job matches and updates via email.
              </p>
            </div>

            <div className="pref-group">
              <label className="switch-row">
                <span>Push Notifications</span>
                <input
                  type="checkbox"
                  checked={prefs.push_enabled}
                  onChange={(e) =>
                    setPrefs({ ...prefs, push_enabled: e.target.checked })
                  }
                />
              </label>
              <p className="pref-desc">Get instant alerts on your device.</p>
            </div>

            <div className="pref-group">
              <label>Frequency</label>
              <select
                value={prefs.frequency}
                onChange={(e) =>
                  setPrefs({ ...prefs, frequency: e.target.value })
                }
                className="freq-select"
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button className="save-btn" onClick={savePreferences}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
