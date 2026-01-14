import React from 'react';
import { Table, Pagination, StatusBadge } from '../../components/Common';

const CategoryList = () => {
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'slug', label: 'Slug' },
    { key: 'products', label: 'Products' },
    { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
  ];

  const data = [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900 font-heading">Categories</h1>
        <p className="text-gray-600 mt-1">Manage product categories</p>
      </div>
      <div className="card p-6">
        <Table columns={columns} data={data} emptyMessage="No categories found" />
      </div>
    </div>
  );
};

export default CategoryList;
