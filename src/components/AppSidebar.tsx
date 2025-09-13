
'use client';

import {
  BarChart2,
  Book,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Users,
} from 'lucide-react';
import Link from 'next/link';
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
  const { isMobile } = useSidebar();

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
        className="hidden md:flex md:flex-col md:w-64 bg-gray-900/30"
        style={{
            backdropFilter: "blur(1px)"
        }}
    >
      {isMobile && (
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo />
          </div>
        </SidebarHeader>
      )}

      <SidebarContent className="flex-1 p-2">
        <SidebarMenu>
          {links.map((link) => {
            const active = isLinkActive(link.href);
            return (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={active}
                tooltip={link.label}
                className={cn(
                    "rounded-2xl transition-all duration-300",
                    active 
                    ? "bg-gray-900/30 border-2 border-white/20" 
                    : "border-2 border-transparent hover:bg-gray-900/30 hover:border-white/20"
                )}
                 style={
                  active ? {
                    backdropFilter: "blur(1px)",
                    boxShadow: "inset 0 2px 6px rgba(255, 255, 255, 0.1), inset 0 -2px 6px rgba(0, 0, 0, 0.2)"
                  } : {}
                }
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                </Link>
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

