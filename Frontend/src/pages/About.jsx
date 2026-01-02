import React from 'react';

const About = () => {
  return (
    <div className="about-page">
      <h1>About Us</h1>
      <p>
        Welcome to the Blood Donation Management System. Our mission is to 
        connect blood donors with those in need, making it easier to save lives.
      </p>
      <section className="mission">
        <h2>Our Mission</h2>
        <p>
          To facilitate efficient blood donation and distribution, ensuring 
          that no life is lost due to blood shortage.
        </p>
      </section>
      <section className="features">
        <h2>Key Features</h2>
        <ul>
          <li>Easy donor registration</li>
          <li>Real-time blood stock tracking</li>
          <li>Emergency blood request system</li>
          <li>Donor eligibility tracking</li>
          <li>Comprehensive analytics</li>
        </ul>
      </section>
    </div>
  );
};

export default About;
