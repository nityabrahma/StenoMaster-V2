
'use client';

import {
  BarChart2,
  Book,
  ClipboardList,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import Link from 'next/link';
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
import UserButton from './UserButton';

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

    const links = user?.role === 'teacher' ? teacherLinks : studentLinks;

    const isLinkActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard';
        }
        return pathname.startsWith(href);
    }

    return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
            <SheetContent
                side="left"
                className="w-[18rem] bg-card p-0 text-card-foreground [&>button]:hidden"
            >
                 <SheetHeader className="p-2 border-b">
                    <SheetTitle className='sr-only'>StenoMaster Menu</SheetTitle>
                    <SheetDescription className='sr-only'>Main navigation for StenoMaster</SheetDescription>
                     <Link
                        href="/dashboard"
                        className="flex items-center"
                        onClick={() => setOpenMobile(false)}
                    >
                        <Logo />
                    </Link>
                </SheetHeader>
                <SidebarContent className="p-2">
                    <SidebarMenu>
                    {links.map((link) => (
                        <SidebarMenuItem key={link.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={isLinkActive(link.href)}
                                onClick={() => setOpenMobile(false)}
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
                 <div className="p-2 border-t mt-auto">
                    <UserButton />
                </div>
            </SheetContent>
      </Sheet>
    )
}

export default function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  
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
        className="flex-shrink-0 md:flex md:flex-col bg-gray-900/30"
        style={{
            backdropFilter: "blur(1px)"
        }}
    >
      <SidebarHeader className="p-2 justify-center">
          <Logo />
      </SidebarHeader>

      <SidebarContent className="flex-1 p-2 mt-4">
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={isLinkActive(link.href)}
                tooltip={link.label}
              >
                  <Link href={link.href}>
                    <link.icon />
                    <span className="group-data-[collapsible=icon]:hidden">{link.label}</span>
                  </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
