import React from 'react';
import DonorRegistration from '../components/donor/DonorRegistration';
import DonorProfile from '../components/donor/DonorProfile';

const Donors = () => {
  return (
    <div className="donors-page">
      <h1>Donors</h1>
      <DonorRegistration />
      <DonorProfile />
    </div>
  );
};

export default Donors;
