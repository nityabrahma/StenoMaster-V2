
'use client';
import { Feather } from 'lucide-react';
import { useAppRouter } from '@/hooks/use-app-router';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export default function Logo() {
  const router = useAppRouter();
  const { state } = useSidebar();
  
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

    