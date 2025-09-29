
'use client';

import {
  BarChart2,
  Book,
  ClipboardList,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from './ui/sidebar';
import Logo from './logo';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
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


const MobileSidebar = () => {
  const { user } = useAuth();
  const { openMobile, setOpenMobile } = useSidebar();
  const pathname = usePathname();
  const router = useAppRouter();

  const links = user?.role === 'teacher' ? teacherLinks : studentLinks;

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  }

  const handleNavigation = (href: string) => {
    router.push(href);
    setOpenMobile(false);
  }

  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile}>
      <SheetContent
        side="left"
        className="w-[18rem] bg-card p-0 text-card-foreground [&>button]:hidden flex flex-col"
      >
        <SheetHeader className="p-2 border-b">
          <SheetTitle className='sr-only'>StenoMaster Menu</SheetTitle>
          <SheetDescription className='sr-only'>Main navigation for StenoMaster</SheetDescription>
          <div
            className="flex items-center cursor-pointer"
            onClick={() => handleNavigation('/dashboard')}
          >
            <Logo />
          </div>
        </SheetHeader>
        <SidebarContent className="p-2 flex-1">
          <SidebarMenu>
            {links.map((link) => (
              <SidebarMenuItem key={link.href}>
                <SidebarMenuButton
                  isActive={isLinkActive(link.href)}
                  onClick={() => handleNavigation(link.href)}
                >
                  <link.icon />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </SheetContent>
    </Sheet>
  )
}

export default function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const router = useAppRouter();

  if (isMobile) {
    return <MobileSidebar />;
  }

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
      collapsible="icon"
      className="flex-shrink-0 md:flex md:flex-col bg-background/30"
      style={{
        backdropFilter: "blur(1px)"
      }}
    >
      <SidebarContent className="flex-1 p-2 mt-4">
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                isActive={isLinkActive(link.href)}
                tooltip={link.label}
                onClick={() => router.push(link.href)}
                className="p-4"
              >
                <link.icon />
                <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}

    