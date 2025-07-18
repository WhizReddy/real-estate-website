'use client';

import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { ReactNode } from 'react';

interface FormErrorMessageProps {
  type?: 'error' | 'success' | 'warning' | 'info';
  message: string | ReactNode;
  className?: string;
}

export default function FormErrorMessage({ 
  type = 'error', 
  message, 
  className = '' 
}: FormErrorMessageProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  if (!message) return null;

  return (
    <div className={`flex items-start space-x-2 p-3 border rounded-md ${getStyles()} ${className}`}>
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>
      <div className="text-sm">
        {typeof message === 'string' ? <p>{message}</p> : message}
      </div>
    </div>
  );
}