import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  const inputClass = `
    w-full px-3 py-2 text-sm border rounded-md
    focus:outline-none focus:ring-2 focus:ring-primary-color
    ${error ? 'border-red-500' : 'border-gray-300'}
    ${className}
  `;

  return (
    <div className="form-group">
      {label && (
        <label className="form-label" htmlFor={props.id || props.name}>
          {label}
        </label>
      )}
      <input
        className={inputClass}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
          border: error ? '1px solid #ef4444' : '1px solid var(--border-color)',
          borderRadius: '0.375rem',
          backgroundColor: 'var(--bg-primary)',
        }}
        {...props}
      />
      {error && (
        <span style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
