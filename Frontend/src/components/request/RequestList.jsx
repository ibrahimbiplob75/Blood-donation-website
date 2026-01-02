import React, { useState, useEffect } from 'react';

const RequestList = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
  };

  return (
    <div className="request-list">
      <h2>Blood Requests</h2>
      {requests.length > 0 ? (
        <div className="requests-grid">
          {requests.map((request) => (
            <div key={request.id} className="request-card">
              <h3>{request.patientName}</h3>
              <p><strong>Blood Group:</strong> {request.bloodGroup}</p>
              <p><strong>Units:</strong> {request.units}</p>
              <p><strong>Hospital:</strong> {request.hospital}</p>
              <p><strong>Urgency:</strong> {request.urgency}</p>
              <button>View Details</button>
            </div>
          ))}
        </div>
      ) : (
        <p>No blood requests found.</p>
      )}
    </div>
  );
};

export default RequestList;
