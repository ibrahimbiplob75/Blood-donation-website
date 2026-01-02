import React, { useState, useEffect } from 'react';

const DonorProfile = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Fetch donor profile
    fetchDonorProfile();
  }, []);

  const fetchDonorProfile = async () => {
    // API call to get donor profile
  };

  return (
    <div className="donor-profile">
      <h2>Donor Profile</h2>
      {profile ? (
        <div className="profile-details">
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Blood Group:</strong> {profile.bloodGroup}</p>
          <p><strong>Total Donations:</strong> {profile.totalDonations}</p>
          <p><strong>Last Donation:</strong> {profile.lastDonationDate}</p>
        </div>
      ) : (
        <p>Loading profile...</p>
      )}
    </div>
  );
};

export default DonorProfile;
