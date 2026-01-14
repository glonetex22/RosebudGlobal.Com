import React from 'react';

const StatusBadge = ({ status, children }) => {
  const statusConfig = {
    active: { class: 'badge-success', label: 'Active' },
    inactive: { class: 'badge-gray', label: 'Inactive' },
    pending: { class: 'badge-warning', label: 'Pending' },
    confirmed: { class: 'badge-success', label: 'Confirmed' },
    processing: { class: 'badge-info', label: 'Processing' },
    shipped: { class: 'badge-info', label: 'Shipped' },
    delivered: { class: 'badge-success', label: 'Delivered' },
    cancelled: { class: 'badge-danger', label: 'Cancelled' },
    refunded: { class: 'badge-danger', label: 'Refunded' },
    paid: { class: 'badge-success', label: 'Paid' },
    failed: { class: 'badge-danger', label: 'Failed' },
    new: { class: 'badge-info', label: 'New' },
    in_progress: { class: 'badge-warning', label: 'In Progress' },
    responded: { class: 'badge-success', label: 'Responded' },
    closed: { class: 'badge-gray', label: 'Closed' },
  };

  const config = statusConfig[status] || { class: 'badge-gray', label: status };
  const displayLabel = children || config.label;

  return (
    <span className={`badge ${config.class}`}>
      {displayLabel}
    </span>
  );
};

export default StatusBadge;
