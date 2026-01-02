import React, { useState } from 'react';

const BloodExchange = () => {
  const [exchangeData, setExchangeData] = useState({
    fromBloodGroup: '',
    toBloodGroup: '',
    units: '',
    reason: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const handleChange = (e) => {
    setExchangeData({ ...exchangeData, [e.target.name]: e.target.value });
  };

  return (
    <div className="blood-exchange">
      <h2>Blood Exchange</h2>
      <form onSubmit={handleSubmit}>
        <select
          name="fromBloodGroup"
          value={exchangeData.fromBloodGroup}
          onChange={handleChange}
          required
        >
          <option value="">From Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
        <select
          name="toBloodGroup"
          value={exchangeData.toBloodGroup}
          onChange={handleChange}
          required
        >
          <option value="">To Blood Group</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
        <input
          type="number"
          name="units"
          placeholder="Number of Units"
          value={exchangeData.units}
          onChange={handleChange}
          required
        />
        <textarea
          name="reason"
          placeholder="Reason for Exchange"
          value={exchangeData.reason}
          onChange={handleChange}
          required
        />
        <button type="submit">Process Exchange</button>
      </form>
    </div>
  );
};

export default BloodExchange;
