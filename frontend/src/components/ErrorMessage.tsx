'use client';

import React from 'react';

const ErrorMessage: React.FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;

  return <div className="bg-red-100 text-red-800 p-2 rounded mb-4">{message}</div>;
};

export default ErrorMessage;
