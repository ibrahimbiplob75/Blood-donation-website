import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const RequestDetails = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const fetchRequestDetails = async () => {
  };

  return (
    <div className="request-details">
      <h2>Request Details</h2>
      {request ? (
        <div className="details-container">
          <p><strong>Patient Name:</strong> {request.patientName}</p>
          <p><strong>Blood Group:</strong> {request.bloodGroup}</p>
          <p><strong>Units Required:</strong> {request.units}</p>
          <p><strong>Hospital:</strong> {request.hospital}</p>
          <p><strong>Urgency:</strong> {request.urgency}</p>
          <p><strong>Contact:</strong> {request.contactNumber}</p>
          <p><strong>Status:</strong> {request.status}</p>
          <p><strong>Additional Info:</strong> {request.additionalInfo}</p>
        </div>
      ) : (
        <p>Loading request details...</p>
      )}
    </div>
  );
};

export default RequestDetails;
