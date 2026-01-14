import React from 'react';
import { Table, Pagination, StatusBadge } from '../../components/Common';

const InquiryList = () => {
  const columns = [
    { key: 'inquiryNumber', label: 'Inquiry #' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
    { key: 'date', label: 'Date' },
  ];

  const data = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900 font-heading">Inquiries</h1>
        <p className="text-gray-600 mt-1">Manage customer inquiries</p>
      </div>
      <div className="card p-6">
        <Table columns={columns} data={data} emptyMessage="No inquiries found" />
      </div>
    </div>
  );
};

export default InquiryList;
