import React, { useState } from 'react';

const StockManagement = () => {
  const [stockData, setStockData] = useState({
    bloodGroup: '',
    units: '',
    action: 'add'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const handleChange = (e) => {
    setStockData({ ...stockData, [e.target.name]: e.target.value });
  };

  return (
    <div className="stock-management">
      <h2>Stock Management</h2>
      <form onSubmit={handleSubmit}>
        <select
          name="bloodGroup"
          value={stockData.bloodGroup}
          onChange={handleChange}
          required
        >
          <option value="">Select Blood Group</option>
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
          value={stockData.units}
          onChange={handleChange}
          required
        />
        <select
          name="action"
          value={stockData.action}
          onChange={handleChange}
        >
          <option value="add">Add Stock</option>
          <option value="remove">Remove Stock</option>
        </select>
        <button type="submit">Update Stock</button>
      </form>
    </div>
  );
};

export default StockManagement;
