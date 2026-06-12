import { useState, useEffect } from 'react';
import { MOCK_LOCATIONS } from '@/lib/constants';

interface Props {
  onDone: (location: string) => void;
}

export function GPSIndicator({ onDone }: Props) {
  const [status, setStatus] = useState<'locating' | 'done'>('locating');
  const [locationName, setLocationName] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      const loc = MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)];
      setLocationName(loc.name);
      setStatus('done');
      onDone(loc.name);
    }, 1500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'locating') {
    return (
      <div className="flex items-center justify-center gap-2 py-3">
        <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
        <span className="text-[12px] text-neutral-500">正在获取双频 GPS 定位...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-3">
      <span className="w-2 h-2 bg-lime-500 rounded-full" />
      <span className="text-[12px] font-medium text-lime-600 bg-lime-50 px-3 py-1 rounded-full">
        定位成功：{locationName}
      </span>
    </div>
  );
}
