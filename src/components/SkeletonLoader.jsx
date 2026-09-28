import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-4">
      <div className="id-card-frame rounded-[2rem] overflow-hidden animate-pulse bg-white dark:bg-[#23040B]">
        
        {/* Top bar skeleton */}
        <div className="h-3 w-full bg-[#E8A5B3]/40" />

        {/* Header Badges Skeleton */}
        <div className="p-6 flex flex-col items-center space-y-2 border-b border-[#F4CCD5]/60">
          <div className="h-5 w-32 bg-[#FCE7EB] dark:bg-[#3B0511] rounded-full" />
          <div className="h-3.5 w-48 bg-[#FCE7EB]/70 dark:bg-[#3B0511]/70 rounded-full" />
          <div className="h-3 w-36 bg-[#FCE7EB]/50 dark:bg-[#3B0511]/50 rounded-full" />
        </div>

        {/* Full-Length Portrait Photo Skeleton */}
        <div className="p-6 flex flex-col items-center">
          <div className="w-full max-w-[340px] aspect-[4/5] rounded-2xl bg-[#FCE7EB] dark:bg-[#3B0511] border-2 border-[#E8A5B3]/50 shadow-md" />
          <div className="h-4 w-52 bg-[#FCE7EB] dark:bg-[#3B0511] rounded-full mt-4" />
        </div>

        {/* Bottom Maroon Panel Skeleton */}
        <div className="maroon-panel p-6 flex flex-col items-center space-y-3">
          <div className="h-7 w-56 bg-white/20 rounded-xl" />
          <div className="h-4 w-32 bg-white/15 rounded-md" />
          <div className="h-4 w-40 bg-white/10 rounded-full" />

          {/* Social Icons Skeleton */}
          <div className="flex justify-center gap-4 pt-4 border-t border-white/10 w-full">
            <div className="w-12 h-12 rounded-full bg-white/20" />
            <div className="w-12 h-12 rounded-full bg-white/20" />
            <div className="w-12 h-12 rounded-full bg-white/20" />
            <div className="w-12 h-12 rounded-full bg-white/20" />
          </div>
        </div>

      </div>
    </div>
  );
}
