
'use client';
import Image from 'next/image';

export default function LogoStatic() {
  return (
    <div className="flex items-center justify-center gap-2">
        <Image src="/logo.png" alt="StenoMaster Logo" width={48} height={32} className="h-8 w-auto" />
        <span className="text-2xl font-bold font-headline">StenoMaster</span>
    </div>
  );
}
