// src/pages/AddPintPage.jsx
import React, { useState } from "react";
import "../styles/index.css";

const BASE_API = "http://localhost:8000/api/records/";

export default function AddPintPage() {
  const [formData, setFormData] = useState({
    date: "",
    location: "",
    pint_brand: "",
    pint_cost: "",
    number: "",
    comment: "",
  });

  const [friendInput, setFriendInput] = useState("");
  const [friendNames, setFriendNames] = useState([]);

  const capitalizeFirstLetter = (str) =>
    str && str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, " ");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFriendKeyDown = (e) => {
    if (e.key === "Enter" | e.key == "Tab") {
      e.preventDefault();
      const trimmed = friendInput.trim();
      if (trimmed && !friendNames.includes(trimmed)) {
        setFriendNames([...friendNames, trimmed]);
        setFriendInput("");
      }
    }
  };

  const removeFriend = (name) => {
    setFriendNames(friendNames.filter((f) => f !== name));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        friend_names: friendNames,
        number: parseFloat(formData.number),
        pint_cost: parseFloat(formData.pint_cost),
      };

      const res = await fetch(BASE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add pint");

      alert("Pint successfully added!");

      // Reset form
      setFormData({
        date: "",
        location: "",
        pint_brand: "",
        pint_cost: "",
        number: "",
        comment: "",
      });
      setFriendNames([]);
    } catch (error) {
      console.error("Error adding pint:", error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="page-container">
      <h1 className="hero-title">Add New Pint Entry</h1>
      <br />
      <br />
      <form className="form-container" onSubmit={handleSubmit}>
        {/* Regular inputs (excluding comment) */}
        {Object.keys(formData)
          .filter((key) => key !== "comment")
          .map((key) => (
            <div key={key} className="form-group">
              <label htmlFor={key} className="form-label">
                {capitalizeFirstLetter(key)}
              </label>
              <input
                type={key === "date" ? "date" : "text"}
                id={key}
                name={key}
                value={formData[key]}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          ))}

        {/* Friend tag input */}
        <div className="form-group">
          <label htmlFor="friend_names" className="form-label">
            Friends
          </label>
          <div className="tag-input">
            {friendNames.map((name) => (
              <span key={name} className="tag">
                {name}
                <button
                  type="button"
                  className="remove-tag"
                  onClick={() => removeFriend(name)}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              id="friend_names"
              value={friendInput}
              onChange={(e) => setFriendInput(e.target.value)}
              onKeyDown={handleFriendKeyDown}
              className="tag-text-input"
              placeholder={
                friendNames.length
                  ? ""
                  : "Type a name and press Enter"
              }
            />
          </div>
        </div>

        {/* Comment field below Friends */}
        <div className="form-group">
          <label htmlFor="comment" className="form-label">
            Comment
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            className="form-input form-textarea"
            placeholder="Add an optional comment..."
            rows={3}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Submit Pint
        </button>
      </form>
    </div>
  );
}
