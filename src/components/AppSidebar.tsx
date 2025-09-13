
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
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={isLinkActive(link.href)}
                tooltip={link.label}
                className="data-[active=true]:bg-sidebar-accent/80"
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
