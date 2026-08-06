'use client';

import { CheckSquare } from 'lucide-react';

export default function Logo({ size = 32, textColor = 'text-white' }: { size?: number; textColor?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-blue-600 text-white rounded-lg p-1.5 flex items-center justify-center" style={{ width: size, height: size }}>
        <CheckSquare size={size * 0.6} strokeWidth={2.5} />
      </div>
      <span className={`text-xl font-bold ${textColor}`}>Todo App</span>
    </div>
  );
}
