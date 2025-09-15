
'use client';

import {
  BarChart2,
  Book,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Users,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from './ui/sidebar';
import Logo from './logo';
import { useSidebar } from './ui/sidebar';
import { cn } from '@/lib/utils';
import { useAppRouter } from '@/hooks/use-app-router';

const teacherLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/classes', label: 'Classes', icon: Users },
  { href: '/dashboard/assignments', label: 'Assignments', icon: ClipboardList },
  { href: '/dashboard/students', label: 'Students', icon: BarChart2 },
];

const studentLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/assignments', label: 'My Assignments', icon: ClipboardList },
  { href: '/dashboard/typing-test', label: 'Typing Practice', icon: Book },
];

export default function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { isMobile, state } = useSidebar();
  const router = useAppRouter();

  if (!user) return null;

  const links = user.role === 'teacher' ? teacherLinks : studentLinks;

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') {
        return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  }

  return (
    <Sidebar 
        className="flex-shrink-0 md:flex md:flex-col bg-gray-900/30"
        style={{
            backdropFilter: "blur(1px)"
        }}
    >
      <SidebarHeader className={cn(!isMobile && "p-2")}>
        <div className={cn(
            "flex items-center justify-center p-2",
            state === 'collapsed' && 'h-10 w-10 p-0'
        )}>
            <Logo />
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {links.map((link) => {
            const active = isLinkActive(link.href);
            return (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                isActive={active}
                tooltip={link.label}
                onClick={() => router.push(link.href)}
                className={cn(
                    "rounded-2xl transition-all duration-300",
                )}
              >
                  <link.icon />
                  <span>{link.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )})}
        </SidebarMenu>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={logout} tooltip="Log out">
                    <LogOut/>
                    <span>Log Out</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

    