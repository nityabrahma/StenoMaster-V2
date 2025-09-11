'use client';

import {
  BarChart2,
  Book,
  ClipboardList,
  Feather,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarTrigger,
} from './ui/sidebar';

const teacherLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/classes', label: 'Classes', icon: Users },
  { href: '/dashboard/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/dashboard/students', label: 'Students', icon: BarChart2 },
];

const studentLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/assignments', label: 'My Assignments', icon: ClipboardList },
  { href: '/dashboard/typing-test', label: 'Typing Test', icon: Book },
];

export default function SidebarNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const links = user.role === 'teacher' ? teacherLinks : studentLinks;
  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 font-headline font-semibold text-lg flex-grow">
            <Feather className="w-6 h-6 text-primary" />
            <span>StenoMaster</span>
          </Link>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === link.href}
                tooltip={link.label}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={`https://avatar.vercel.sh/${user.email}.png`} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <div className="flex-grow overflow-hidden">
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <SidebarMenuButton
            variant="ghost"
            size="icon"
            onClick={logout}
            className="group-data-[collapsible=icon]:!size-8"
            tooltip="Log Out"
          >
            <LogOut />
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </>
  );
}
