import React, { useState } from 'react';
import './repairs.css';

const predefinedRepairs = [
  "Axle", "Brakes", "Suspension", "Wiring", "Lube job", "Lights", "Door-cable"
];

const RepairSelector = ({ selectedRepairs, setSelectedRepairs }) => {
  const [customRepair, setCustomRepair] = useState('');

  const toggleRepair = (item) => {
    setSelectedRepairs(prev =>
      prev.includes(item)
        ? prev.filter(r => r !== item)
        : [...prev, item]
    );
  };

  const addCustomRepair = () => {
    if (customRepair.trim() !== '' && !selectedRepairs.includes(customRepair.trim())) {
      setSelectedRepairs(prev => [...prev, customRepair.trim()]);
      setCustomRepair('');
    }
  };

  return (
    <div className="repair-selector">
      <label>Repair Needed</label>
      <div className="repair-options">
        {predefinedRepairs.map((item) => (
          <div
            key={item}
            className={`repair-box ${selectedRepairs.includes(item) ? 'selected' : ''}`}
            onClick={() => toggleRepair(item)}
          >
            {item}
          </div>
        ))}
      </div>
      <div className="custom-repair">
        <input
          type="text"
          value={customRepair}
          onChange={(e) => setCustomRepair(e.target.value)}
          className="input-field"
          placeholder="Custom repair"
        />
        <button type="button" className="btn-add" onClick={addCustomRepair}>
          Add More
        </button>
      </div>
    </div>
  );
};

export default RepairSelector;
