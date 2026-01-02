import React, { useState } from 'react';

const RequestForm = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    bloodGroup: '',
    units: '',
    hospital: '',
    urgency: 'normal',
    contactNumber: '',
    additionalInfo: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="request-form">
      <h2>Request Blood</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="patientName"
          placeholder="Patient Name"
          value={formData.patientName}
          onChange={handleChange}
          required
        />
        <select
          name="bloodGroup"
          value={formData.bloodGroup}
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
          placeholder="Units Required"
          value={formData.units}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="hospital"
          placeholder="Hospital Name"
          value={formData.hospital}
          onChange={handleChange}
          required
        />
        <select
          name="urgency"
          value={formData.urgency}
          onChange={handleChange}
        >
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
          <option value="emergency">Emergency</option>
        </select>
        <input
          type="tel"
          name="contactNumber"
          placeholder="Contact Number"
          value={formData.contactNumber}
          onChange={handleChange}
          required
        />
        <textarea
          name="additionalInfo"
          placeholder="Additional Information"
          value={formData.additionalInfo}
          onChange={handleChange}
        />
        <button type="submit">Submit Request</button>
      </form>
    </div>
  );
};

export default RequestForm;
