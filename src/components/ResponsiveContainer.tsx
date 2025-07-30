'use client';

import React from 'react';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export function ResponsiveContainer({
  children,
  className = '',
  maxWidth = 'lg',
  ...props
}: ResponsiveContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  };
  
  const classes = `w-full mx-auto ${maxWidthClasses[maxWidth]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}

export function ResponsiveCard({
  children,
  className = '',
  padding = 'md',
  ...props
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const classes = `bg-white rounded-lg shadow-lg border border-gray-200 ${paddingClasses[padding]} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}