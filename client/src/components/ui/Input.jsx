import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  className = '',
  labelClassName = '',
  inputClassName = '',
  ...props
}, ref) => {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className={clsx('block text-sm font-medium text-text-secondary mb-1.5', labelClassName)}>
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'w-full bg-surface-2 border rounded-md text-text-primary placeholder-text-tertiary',
            'transition-all duration-200',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            leftIcon ? 'pl-10 pr-4 py-3' : 'px-4 py-3',
            error 
              ? 'border-danger focus:border-danger focus:ring-danger' 
              : 'border-border hover:border-text-tertiary',
            inputClassName
          )}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p className={clsx(
          'mt-1.5 text-sm',
          error ? 'text-danger' : 'text-text-tertiary'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
