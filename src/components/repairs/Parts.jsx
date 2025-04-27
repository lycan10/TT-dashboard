import React, { useState } from "react";
import "./repairs.css";

const PartSelector = ({ selectedParts, setSelectedParts }) => {
  const [customPart, setCustomPart] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleAddOrUpdatePart = (part, qty) => {
    setSelectedParts((prev) => {
      const existing = prev.find((p) => p.name === part);
      if (existing) {
        return prev.map((p) =>
          p.name === part ? { ...p, quantity: p.quantity + qty } : p
        );
      } else {
        return [...prev, { name: part, quantity: qty }];
      }
    });
    setCustomPart("");
    setQuantity(1);
  };

  const handleRemovePart = (part) => {
    setSelectedParts((prev) =>
      prev
        .map((p) => (p.name === part ? { ...p, quantity: p.quantity - 1 } : p))
        .filter((p) => p.quantity > 0)
    );
  };

  return (
    <div className="repair-selector part-selector">
      <label>Parts Needed</label>

      <div className="custom-repair">
        <input
          type="text"
          value={customPart}
          onChange={(e) => setCustomPart(e.target.value)}
          className="input-field"
          placeholder="Part name"
        />
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="input-field"
          placeholder="Quantity"
        />
        <button
          type="button"
          className="btn-add"
          onClick={() => {
            if (customPart.trim() && quantity > 0) {
              handleAddOrUpdatePart(customPart.trim(), quantity);
            }
          }}
        >
          Add Part
        </button>
      </div>

      {selectedParts.length > 0 && (
        <div className="custom-parts-list">
          <h5>Selected parts</h5>
          <ul>
            {selectedParts.map((p) => (
              <li key={p.name}>
                {p.name} — Qty: {p.quantity}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddOrUpdatePart(p.name, 1);
                  }}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePart(p.name);
                  }}
                >
                  -
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PartSelector;
