
'use client';
import { Feather } from 'lucide-react';

export default function LogoStatic() {
  return (
    <div className="flex items-center justify-center gap-2">
        <Feather className="w-8 h-8 text-primary" />
        <span className="text-2xl font-bold font-headline">StenoMaster</span>
    </div>
  );
}
