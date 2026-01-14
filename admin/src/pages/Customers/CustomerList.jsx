import React from 'react';
import { Table, Pagination, StatusBadge } from '../../components/Common';

const CustomerList = () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'orders', label: 'Orders' },
    { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
  ];

  const data = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900 font-heading">Customers</h1>
        <p className="text-gray-600 mt-1">Manage customer accounts</p>
      </div>
      <div className="card p-6">
        <Table columns={columns} data={data} emptyMessage="No customers found" />
      </div>
    </div>
  );
};

export default CustomerList;
