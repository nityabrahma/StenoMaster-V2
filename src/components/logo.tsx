
'use client';
import { useAppRouter } from '@/hooks/use-app-router';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import React from 'react';
import Image from 'next/image';

export default function Logo() {
  const router = useAppRouter();
  
  // Conditionally use the hook, and provide a default state if not in provider
  let state = 'expanded';
  try {
    const sidebar = useSidebar();
    state = sidebar.state;
  } catch (e) {
    // We are not inside a sidebar provider, use default state.
  }
  
  return (
    <div onClick={() => router.push('/')} className="flex items-center justify-center gap-2 cursor-pointer">
        <Image src="/logo.png" alt="StenoMaster Logo" width={48} height={32} className="h-8 w-auto flex-shrink-0" />
        <span className={cn(
            "text-2xl font-bold font-headline transition-opacity duration-200",
            state === 'collapsed' && 'opacity-0 hidden'
        )}>
            StenoMaster
        </span>
    </div>
  );
}
