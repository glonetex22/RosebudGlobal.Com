import React from 'react';
import { useParams } from 'react-router-dom';

const CustomerDetail = () => {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900 font-heading">Customer Details</h1>
        <p className="text-gray-600 mt-1">Customer #{id}</p>
      </div>
      <div className="card p-6">
        <p className="text-gray-500">Customer detail - to be implemented</p>
      </div>
    </div>
  );
};

export default CustomerDetail;
