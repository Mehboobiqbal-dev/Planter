'use client';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-screen p-8">
      <div className="w-full max-w-5xl">
        <Skeleton height={40} width={`60%`} />
        <Skeleton height={30} count={2} />
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} height={200} />
          ))}
        </div>
      </div>
    </div>
  );
}
