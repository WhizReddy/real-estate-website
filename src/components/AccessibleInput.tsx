"use client";

import { forwardRef, InputHTMLAttributes, useState, useId } from 'react';
import { AriaLabelProps } from '@/utils/accessibility';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface AccessibleInputProps 
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>, 
          AriaLabelProps {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({
    label,
    error,
    success,
    hint,
    size = 'md',
    leftIcon,
    rightIcon,
    showPasswordToggle = false,
    type = 'text',
    id,
    className = '',
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const reactId = useId();
    const inputId = id || `${reactId}-input`;
    const errorId = `${reactId}-error`;
    const successId = `${reactId}-success`;
    const hintId = `${reactId}-hint`;
    
    const inputType = showPasswordToggle && type === 'password' 
      ? (showPassword ? 'text' : 'password')
      : type;
    
    const baseClasses = 'block w-full rounded-lg border transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-5 py-3 text-lg'
    };
    
    const stateClasses = error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : success
      ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    
    const paddingClasses = leftIcon && rightIcon
      ? 'pl-10 pr-10'
      : leftIcon
      ? 'pl-10'
      : rightIcon || showPasswordToggle
      ? 'pr-10'
      : '';
    
    // Build aria-describedby
    const describedByIds = [
      ariaDescribedBy,
      error ? errorId : null,
      success ? successId : null,
      hint ? hintId : null
    ].filter(Boolean).join(' ');
    
    return (
      <div className="space-y-1">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
            {props.required && (
              <span className="text-red-500 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}
        
        {/* Hint */}
        {hint && (
          <p
            id={hintId}
            className="text-sm text-gray-600"
          >
            {hint}
          </p>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400" aria-hidden="true">
                {leftIcon}
              </span>
            </div>
          )}
          
          {/* Input */}
          <input
            ref={ref}
            type={inputType}
            id={inputId}
            className={`${baseClasses} ${sizeClasses[size]} ${stateClasses} ${paddingClasses} ${className}`}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={describedByIds || undefined}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          />
          
          {/* Right Icon or Password Toggle */}
          {(rightIcon || showPasswordToggle) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {showPasswordToggle && type === 'password' ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              ) : rightIcon ? (
                <span className="text-gray-400" aria-hidden="true">
                  {rightIcon}
                </span>
              ) : null}
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <div
            id={errorId}
            className="flex items-center space-x-1 text-sm text-red-600"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
        
        {/* Success Message */}
        {success && !error && (
          <div
            id={successId}
            className="flex items-center space-x-1 text-sm text-green-600"
            role="status"
            aria-live="polite"
          >
            <CheckCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>{success}</span>
          </div>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';

export default AccessibleInput;