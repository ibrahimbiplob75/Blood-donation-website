import React from 'react';
import RequestForm from '../components/request/RequestForm';
import RequestList from '../components/request/RequestList';

const Requests = () => {
  return (
    <div className="requests-page">
      <h1>Blood Requests</h1>
      <RequestForm />
      <RequestList />
    </div>
  );
};

export default Requests;
