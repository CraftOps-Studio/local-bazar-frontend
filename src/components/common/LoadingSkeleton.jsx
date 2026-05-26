import React from 'react';

const LoadingSkeleton = ({
  variant = 'rectangle',
  width = 'w-full',
  height = 'h-6',
  className = '',
}) => {
  const baseClass = 'bg-brand-surface-2 animate-pulse';
  
  const variants = {
    text: 'rounded-md h-4 w-3/4',
    circle: 'rounded-full h-10 w-10 shrink-0',
    rectangle: 'rounded-xl',
    card: 'rounded-2xl h-48 w-full',
  };

  return (
    <div 
      className={`${baseClass} ${variants[variant]} ${variant !== 'text' && variant !== 'circle' ? `${width} ${height}` : ''} ${className}`}
    />
  );
};

export const CardSkeleton = () => (
  <div className="glass rounded-3xl p-5 border border-brand-border/60 flex flex-col gap-4">
    <LoadingSkeleton variant="card" />
    <div className="flex flex-col gap-2">
      <LoadingSkeleton variant="text" />
      <LoadingSkeleton variant="text" width="w-1/2" />
    </div>
    <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-border/20">
      <LoadingSkeleton variant="text" width="w-1/3" />
      <LoadingSkeleton variant="circle" />
    </div>
  </div>
);

export default LoadingSkeleton;
