import React, { memo } from 'react';
import cn from 'classnames';
import './input.scss';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Applies the "block" style so the input takes full width */
  block?: boolean;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, block = false, ...props }, ref) => (
    <input
      ref={ref}
      className={cn('text-input', { block }, className)}
      {...props}
    />
  ),
);

export default memo(Input);
