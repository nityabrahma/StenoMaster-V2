
'use client';
import { Feather } from 'lucide-react';
import { useAppRouter } from '@/hooks/use-app-router';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import React from 'react';

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
        <Feather className="w-8 h-8 text-primary flex-shrink-0" />
        <span className={cn(
            "text-2xl font-bold font-headline transition-opacity duration-200",
            state === 'collapsed' && 'opacity-0 hidden'
        )}>
            StenoMaster
        </span>
    </div>
  );
}
