import React from "react";




export function CreateModel({
  isCreateModalOpen,
  closeModals,
  e,
  alert,
  isNaN,
  newEvent,
  p,
  handleInputChange
}) {
  return <Modal isOpen={isCreateModalOpen} onRequestClose={closeModals} className="modal-container" overlayClassName="modal-overlay">
          <div className="modal-content">
            <h2>Create Event</h2>
            <form onSubmit={e => {
        e.preventDefault(); // Basic validation for required fields

        if (!formData.title || !formData.description || !formData.participants || !formData.date || !formData.time || !formData.duration || !formData.sessionNotes) {
          alert("Please fill out all required fields.");
          return;
        } // Example validation for duration


        if (isNaN(formData.duration) || formData.duration <= 0) {
          alert("Please provide a valid duration (in hours).");
          return;
        } // Handle event creation logic here


        const newEvent = {
          title: formData.title,
          description: formData.description,
          participants: formData.participants.split(",").map(p => p.trim()),
          // Convert participants to an array
          start: `${formData.date}T${formData.time}:00`,
          duration: `${formData.duration}h`,
          sessionNotes: formData.sessionNotes
        };
        console.log("New Event:", newEvent); // Clear the form and close modal

        closeModals();
      }}>
              <label>
                Event Title:
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter event title" required />
              </label>
              <label>
                Description:
                <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter a brief description" required />
              </label>
              <label>
                List of Participants (comma-separated):
                <input type="text" name="participants" value={formData.participants} onChange={handleInputChange} placeholder="e.g., John Doe, Jane Smith" required />
              </label>
              <label>
                Date:
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
              </label>
              <label>
                Time:
                <input type="time" name="time" value={formData.time} onChange={handleInputChange} required />
              </label>
              <label>
                Duration (in hours):
                <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} placeholder="Enter duration in hours" min="1" required />
              </label>
              <label>
                Session Notes:
                <textarea name="sessionNotes" value={formData.sessionNotes} onChange={handleInputChange} placeholder="Add any additional notes about the session" required />
              </label>
              <div className="modal-buttons">
                <button type="submit" className="submit-btn">
                  Add Event
                </button>
                <button type="button" onClick={closeModals} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </Modal>;
}
      