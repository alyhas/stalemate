import React, { forwardRef, memo } from 'react';
import cn from 'classnames';
import './checkbox.scss';

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /** Optional label text displayed next to the checkbox */
  label?: string;
  /** Display checkbox and label as block level */
  block?: boolean;
};

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, block = false, ...props }, ref) => (
    <label className={cn('checkbox', { block }, className)}>
      <input type="checkbox" ref={ref} {...props} />
      <span className="checkmark" aria-hidden="true" />
      {label && <span className="label-text">{label}</span>}
    </label>
  )
);

export default memo(Checkbox);
