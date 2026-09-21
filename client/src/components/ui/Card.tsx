import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised' | 'bordered' | 'subtle';
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      interactive = false,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'rounded-2xl transition-all duration-200';

    const variantStyles = {
      default: 'bg-white border border-[#E4E5E1] shadow-sm',
      raised: 'bg-white border border-[#E4E5E1] shadow-md',
      bordered: 'bg-transparent border border-[#E4E5E1]',
      subtle: 'bg-[#FBFBFA] border border-[#EAE7DF]',
    };

    const interactiveStyles = interactive
      ? 'hover:-translate-y-1 hover:shadow-md hover:border-[#CBD5E1] cursor-pointer'
      : '';

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
