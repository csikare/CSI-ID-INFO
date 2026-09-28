import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="glass-card rounded-3xl p-8 space-y-6 animate-pulse">
        {/* Header Badges Skeleton */}
        <div className="flex flex-col items-center space-y-2">
          <div className="h-4 w-28 bg-slate-800 rounded-full light:bg-slate-200"></div>
          <div className="h-3 w-40 bg-slate-800/60 rounded-full light:bg-slate-200"></div>
          <div className="h-4 w-32 bg-slate-800/80 rounded-full light:bg-slate-200 mt-1"></div>
        </div>

        {/* Photo Avatar Skeleton */}
        <div className="flex justify-center my-4">
          <div className="w-36 h-36 rounded-full bg-slate-800 light:bg-slate-200 ring-4 ring-slate-800/50 light:ring-slate-300"></div>
        </div>

        {/* Name and Role Skeleton */}
        <div className="flex flex-col items-center space-y-3">
          <div className="h-7 w-52 bg-slate-800 rounded-xl light:bg-slate-200"></div>
          <div className="h-4 w-36 bg-slate-800/70 rounded-lg light:bg-slate-200"></div>
          <div className="h-3.5 w-24 bg-slate-800/50 rounded-md light:bg-slate-200"></div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex justify-center gap-4 pt-4">
          <div className="w-12 h-12 rounded-full bg-slate-800 light:bg-slate-200"></div>
          <div className="w-12 h-12 rounded-full bg-slate-800 light:bg-slate-200"></div>
          <div className="w-12 h-12 rounded-full bg-slate-800 light:bg-slate-200"></div>
          <div className="w-12 h-12 rounded-full bg-slate-800 light:bg-slate-200"></div>
        </div>
      </div>
    </div>
  );
}
