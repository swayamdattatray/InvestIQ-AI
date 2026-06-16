import React from 'react';

const Skeleton = ({ className }) => {
  return (
    <div className={`animate-pulse bg-white/5 rounded ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="glass-card flex flex-col gap-4">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-4 w-12 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="border-b border-white/5">
    <td className="py-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </td>
    <td className="py-4"><Skeleton className="h-4 w-20" /></td>
    <td className="py-4"><Skeleton className="h-4 w-16" /></td>
    <td className="py-4"><Skeleton className="h-8 w-16 rounded" /></td>
  </tr>
);

export default Skeleton;
