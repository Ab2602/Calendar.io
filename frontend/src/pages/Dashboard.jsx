
import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction"; // For interaction like clicks
import Modal from "react-modal"; // Ensure it's installed
import "../styles/dashboard.css";
Modal.setAppElement("#root");

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false); // For event details modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // For creating new events
  const [selectedEvent, setSelectedEvent] = useState(null); // For selected event details
  const [newEventDate, setNewEventDate] = useState(null); // For creating new events
  const [isEditing, setIsEditing] = useState(false); // For edit mode
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    time: "",
  });

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `https://calendar-io-psi.vercel.app/auth/current-user`,
          { credentials: "include" }
        );
        const data = await response.json();
        if (data) {
          setUser(data);
        } else {
          window.location.href = "/";
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        window.location.href = "/";
      }
    };

    fetchUser();
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}calendar/events`,
          { credentials: "include" }
        );
        const data = await response.json();
        const formattedEvents = data.map((event) => ({
          id: event.id,
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end?.dateTime || event.start.date, // Ensure end date fallback
        }));
        setEvents(formattedEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user]);

  // Handle event click
  const handleEventClick = (info) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start.toISOString().slice(0, 10),
      time: info.event.start.toTimeString().slice(0, 5),
    });
    setFormData({
      title: info.event.title,
      date: info.event.start.toISOString().slice(0, 10),
      time: info.event.start.toTimeString().slice(0, 5),
    });
    setIsEventModalOpen(true);
  };

  // Handle date click
  const handleDateClick = (info) => {
    setNewEventDate(info.dateStr); // Store the clicked date
    setFormData((prevData) => ({ ...prevData, date: info.dateStr })); // Set default date
    setIsCreateModalOpen(true); // Open modal to create event
  };

  // Close modals
  const closeModals = () => {
    setIsEventModalOpen(false);
    setIsCreateModalOpen(false);
    setSelectedEvent(null);
    setIsEditing(false);
    setFormData({
      title: "",
      date: "",
      time: "",
    });
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle event deletion
  const handleDeleteEvent = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/calendar/events/${
          selectedEvent.id
        }`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setEvents(events.filter((event) => event.id !== selectedEvent.id));
        closeModals();
      } else {
        alert("Failed to delete event.");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
    }
  };

  // Handle editing an event
  const handleEditEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/calendar/events/${
          selectedEvent.id
        }`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: formData.title,
            start: { dateTime: `${formData.date}T${formData.time}:00` },
            end: { dateTime: `${formData.date}T${formData.time}:00` }, // Same as start for now
          }),
        }
      );

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === updatedEvent.id
              ? {
                  ...event,
                  title: updatedEvent.summary,
                  start: updatedEvent.start.dateTime,
                  end: updatedEvent.end.dateTime,
                }
              : event
          )
        );
        closeModals();
      } else {
        alert("Failed to update event.");
      }
    } catch (err) {
      console.error("Error updating event:", err);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        events={events}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
      />

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={isEventModalOpen}
          onRequestClose={closeModals}
          className="modal-container"
          overlayClassName="modal-overlay"
        >
          <div className="modal-content">
            {!isEditing ? (
              <>
                <h2>{selectedEvent.title}</h2>
                <p>
                  <strong>Start Date:</strong> {selectedEvent.start}
                </p>
                <p>
                  <strong>Time:</strong> {selectedEvent.time}
                </p>
                <div className="modal-buttons">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button onClick={handleDeleteEvent} className="delete-btn">
                    Delete
                  </button>
                  <button onClick={closeModals} className="close-btn">
                    Close
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleEditEvent}>
                <label>
                  Title:
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Date:
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <label>
                  Time:
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                  />
                </label>
                <div className="modal-buttons">
                  <button type="submit" className="save-btn">
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </Modal>
      )}


      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onRequestClose={closeModals}
          className="modal-container"
          overlayClassName="modal-overlay"
        >
          <div className="modal-content">
            <h2>Create Event</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();

                // Basic validation for required fields
                if (
                  !formData.title ||
                  !formData.description ||
                  !formData.participants ||
                  !formData.date ||
                  !formData.time ||
                  !formData.duration ||
                  !formData.sessionNotes
                ) {
                  alert("Please fill out all required fields.");
                  return;
                }

                // Example validation for duration
                if (isNaN(formData.duration) || formData.duration <= 0) {
                  alert("Please provide a valid duration (in hours).");
                  return;
                }

                // Handle event creation logic here
                const newEvent = {
                  title: formData.title,
                  description: formData.description,
                  participants: formData.participants
                    .split(",")
                    .map((p) => p.trim()), // Convert participants to an array
                  start: `${formData.date}T${formData.time}:00`,
                  duration: `${formData.duration}h`,
                  sessionNotes: formData.sessionNotes,
                };

                console.log("New Event:", newEvent);

                // Clear the form and close modal
                closeModals();
              }}
            >
              <label>
                Event Title:
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event title"
                  required
                />
              </label>
              <label>
                Description:
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter a brief description"
                  required
                />
              </label>
              <label>
                List of Participants (comma-separated):
                <input
                  type="text"
                  name="participants"
                  value={formData.participants}
                  onChange={handleInputChange}
                  placeholder="e.g., John Doe, Jane Smith"
                  required
                />
              </label>
              <label>
                Date:
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Time:
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Duration (in hours):
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="Enter duration in hours"
                  min="1"
                  required
                />
              </label>
              <label>
                Session Notes:
                <textarea
                  name="sessionNotes"
                  value={formData.sessionNotes}
                  onChange={handleInputChange}
                  placeholder="Add any additional notes about the session"
                  required
                />
              </label>
              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  Add Event
                </button>
                <button
                  type="button"
                  onClick={closeModals}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      <button
        onClick={() =>
          (window.location.href = `${
            import.meta.env.VITE_BACKEND_URL
          }/auth/logout`)
        }
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#ff4757",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
