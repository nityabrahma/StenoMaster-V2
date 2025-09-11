'use client';
import { Feather } from 'lucide-react';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center justify-center gap-2">
        <Feather className="w-8 h-8 text-primary" />
        <span className="text-2xl font-bold font-headline">StenoMaster</span>
    </Link>
  );
}