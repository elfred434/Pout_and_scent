import { TextareaHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const describedBy = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

    return (
      <div>
        {label && <label htmlFor={textareaId} className="form-label">{label}</label>}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn('textarea', error && 'border-red-400 focus:border-red-500 focus:ring-red-500/15', className)}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...props}
        />
        {error ? (
          <p id={`${textareaId}-error`} className="form-error">{error}</p>
        ) : hint ? (
          <p id={`${textareaId}-hint`} className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
