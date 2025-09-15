
'use client';
import { Feather } from 'lucide-react';
import { useAppRouter } from '@/hooks/use-app-router';

export default function Logo() {
  const router = useAppRouter();
  return (
    <div onClick={() => router.push('/')} className="flex items-center justify-center gap-2 cursor-pointer">
        <Feather className="w-8 h-8 text-primary" />
        <span className="text-2xl font-bold font-headline">StenoMaster</span>
    </div>
  );
}
