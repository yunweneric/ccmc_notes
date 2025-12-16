# Admin Dashboard Sidebar & Layout Implementation Guide

This guide provides step-by-step instructions for implementing the exact sidebar and layout system used in the PlayPal Admin Dashboard. This implementation features a collapsible sidebar with icon mode, responsive mobile support, breadcrumb navigation, and user profile integration.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Component Structure](#component-structure)
- [Step-by-Step Implementation](#step-by-step-implementation)
- [Customization](#customization)
- [Usage Examples](#usage-examples)

## Overview

The admin dashboard layout consists of:

1. **Sidebar Component** - Collapsible sidebar with icon mode, mobile sheet support
2. **Layout Wrapper** - Main layout component that wraps admin pages
3. **Breadcrumb Navigation** - Dynamic breadcrumb generation from route paths
4. **Navigation Components** - Reusable nav components for sidebar sections
5. **User Profile Integration** - User dropdown with logout functionality

## Features

- ✅ **Collapsible Sidebar** - Expand/collapse with icon-only mode
- ✅ **Responsive Design** - Mobile sheet overlay, desktop fixed sidebar
- ✅ **Keyboard Shortcut** - `Cmd/Ctrl + B` to toggle sidebar
- ✅ **Active Route Highlighting** - Automatic active state based on current route
- ✅ **Dynamic Breadcrumbs** - Auto-generated from route structure
- ✅ **User Profile Dropdown** - Avatar, name, email with logout
- ✅ **Dark Mode Support** - Full dark mode compatibility
- ✅ **State Persistence** - Sidebar state saved in cookies

## Prerequisites

- Next.js 15+ (App Router)
- React 19+
- TypeScript
- Tailwind CSS 3.4+
- shadcn/ui components
- Lucide React icons

## Installation

### 1. Install Required Dependencies

```bash
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-avatar @radix-ui/react-dropdown-menu @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tooltip
```

### 2. Install shadcn/ui Components

```bash
npx shadcn@latest add sidebar
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add separator
npx shadcn@latest add button
npx shadcn@latest add tooltip
npx shadcn@latest add sheet
npx shadcn@latest add skeleton
```

## Component Structure

```
components/
├── ui/
│   ├── sidebar.tsx          # Core sidebar component (from shadcn/ui)
│   ├── breadcrumb.tsx       # Breadcrumb component
│   ├── avatar.tsx           # Avatar component
│   ├── dropdown-menu.tsx    # Dropdown menu component
│   └── separator.tsx        # Separator component
├── dashboard-sidebar.tsx    # Main sidebar implementation
├── nav-projects.tsx         # Navigation items component
├── nav-user.tsx             # User profile component
└── nav-secondary.tsx        # Secondary nav items component

hooks/
└── use-mobile.ts            # Mobile detection hook

app/
└── admin/
    └── layout.tsx           # Admin layout wrapper
```

## Step-by-Step Implementation

### Step 1: Create Mobile Detection Hook

Create `hooks/use-mobile.ts`:

```typescript
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```

### Step 2: Configure Tailwind CSS

Add sidebar colors to your `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
    },
  },
}
```

### Step 3: Add CSS Variables

Add to your `app/globals.css`:

```css
@layer base {
  :root {
    --sidebar: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    --sidebar: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}
```

### Step 4: Create Navigation Components

#### `components/nav-projects.tsx`

```typescript
"use client";

import { type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavProjects({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const isActive =
            pathname === item.url ||
            (item.url !== "/admin" &&
              pathname.startsWith(item.url + "/")) ||
            (item.url !== "/admin" && pathname === item.url);

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
```

#### `components/nav-user.tsx`

```typescript
"use client";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function NavUser({
  user,
  onLogout,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  onLogout?: () => void;
}) {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
```

#### `components/nav-secondary.tsx`

```typescript
"use client";

import * as React from "react";
import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url || pathname.startsWith(item.url + "/");

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild size="sm" isActive={isActive}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
```

### Step 5: Create Dashboard Sidebar Component

Create `components/dashboard-sidebar.tsx`:

```typescript
"use client";

import * as React from "react";
import {
  Calendar,
  Command,
  LayoutDashboard,
  LifeBuoy,
  Map,
  Send,
  Ticket,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/shared/supabase/client";
// Adjust import path based on your auth service
// import { authService } from "@/lib/features/auth";
// import { User } from "@/lib/features/auth/data/interfaces";

import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavSecondary } from "./nav-secondary";

// Define your navigation items
const navSecondary = [
  {
    title: "Support",
    url: "#",
    icon: LifeBuoy,
  },
  {
    title: "Feedback",
    url: "#",
    icon: Send,
  },
];

const projects = [
  {
    name: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    name: "Locations",
    url: "/admin/locations",
    icon: Map,
  },
  {
    name: "Events",
    url: "/admin/events",
    icon: Calendar,
  },
  {
    name: "Tickets",
    url: "/admin/tickets",
    icon: Ticket,
  },
];

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Replace with your auth service
        // const { data, error } = await authService.getCurrentUser();
        // if (error || !data) {
        //   console.error("Failed to fetch user:", error);
        //   setUser(null);
        //   return;
        // }
        // setUser(data);
        
        // Example: Using Supabase directly
        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser(authUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  // Get user display information
  const getUserDisplayInfo = () => {
    if (!user) {
      return {
        name: "Guest",
        email: "",
        avatar: "",
      };
    }

    const displayName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";

    const initials = displayName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return {
      name: displayName,
      email: user.email || "",
      avatar: user.user_metadata?.avatar_url || "",
      initials,
    };
  };

  const userInfo = getUserDisplayInfo();

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Your App Admin</span>
                  <span className="truncate text-xs">Dashboard</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={projects} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        {!isLoading && (
          <NavUser
            user={{
              name: userInfo.name,
              email: userInfo.email,
              avatar: userInfo.avatar,
            }}
            onLogout={handleLogout}
          />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
```

### Step 6: Create Admin Layout

Create `app/admin/layout.tsx`:

```typescript
"use client";

import React from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo } from "react";

// Route labels mapping
const routeLabels: Record<string, string> = {
  admin: "Admin",
  users: "Users",
  locations: "Locations",
  events: "Events",
  tickets: "Tickets",
  profile: "Profile",
  add: "Add",
  edit: "Edit",
};

// Function to format route segment to readable label
const formatRouteLabel = (segment: string): string => {
  // Check if it's a dynamic route (UUID or ID)
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment
    )
  ) {
    return "Details";
  }
  if (/^\d+$/.test(segment)) {
    return "Details";
  }

  // Use mapping if available, otherwise capitalize
  return (
    routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
  );
};

// Function to generate breadcrumb items from pathname
const generateBreadcrumbs = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: Array<{ label: string; href: string; isLast: boolean }> =
    [];

  // Filter out "admin" from segments since we'll add it separately
  const adminSegments = segments.filter((seg) => seg !== "admin");

  // Always start with Admin
  if (adminSegments.length === 0) {
    // If we're on /admin, just show "Admin"
    breadcrumbs.push({
      label: "Admin",
      href: "/admin",
      isLast: true,
    });
  } else {
    // Add Admin as a link
    breadcrumbs.push({
      label: "Admin",
      href: "/admin",
      isLast: false,
    });

    // Build breadcrumbs from remaining segments
    let currentPath = "/admin";
    adminSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === adminSegments.length - 1;

      breadcrumbs.push({
        label: formatRouteLabel(segment),
        href: currentPath,
        isLast,
      });
    });
  }

  return breadcrumbs;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    return generateBreadcrumbs(pathname);
  }, [pathname]);

  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[data-collapsible='icon']/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((breadcrumb, index) => (
                  <React.Fragment key={breadcrumb.href}>
                    <BreadcrumbItem
                      className={index === 0 ? "hidden md:block" : ""}
                    >
                      {breadcrumb.isLast ? (
                        <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!breadcrumb.isLast && (
                      <BreadcrumbSeparator
                        className={index === 0 ? "hidden md:block" : ""}
                      />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

## Customization

### Customizing Sidebar Items

Edit the `projects` array in `dashboard-sidebar.tsx`:

```typescript
const projects = [
  {
    name: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  // Add your custom items here
  {
    name: "Custom Page",
    url: "/admin/custom",
    icon: YourIcon, // Import from lucide-react
  },
];
```

### Customizing Sidebar Branding

Update the header in `dashboard-sidebar.tsx`:

```typescript
<SidebarMenuButton size="lg" asChild>
  <a href="/admin">
    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
      <YourLogo /> {/* Replace Command icon */}
    </div>
    <div className="grid flex-1 text-left text-sm leading-tight">
      <span className="truncate font-medium">Your App Name</span>
      <span className="truncate text-xs">Dashboard</span>
    </div>
  </a>
</SidebarMenuButton>
```

### Customizing Colors

Modify CSS variables in `globals.css`:

```css
:root {
  --sidebar: 0 0% 98%; /* Light mode sidebar background */
  --sidebar-foreground: 240 5.3% 26.1%; /* Light mode text */
  /* ... other variables */
}

.dark {
  --sidebar: 240 5.9% 10%; /* Dark mode sidebar background */
  --sidebar-foreground: 240 4.8% 95.9%; /* Dark mode text */
  /* ... other variables */
}
```

### Customizing Breadcrumb Labels

Add route mappings in `app/admin/layout.tsx`:

```typescript
const routeLabels: Record<string, string> = {
  admin: "Admin",
  users: "Users",
  // Add your custom routes
  settings: "Settings",
  analytics: "Analytics",
};
```

## Usage Examples

### Basic Page

```typescript
// app/admin/page.tsx
export default function AdminPage() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Your content here</p>
    </div>
  );
}
```

### Nested Route

```typescript
// app/admin/users/page.tsx
export default function UsersPage() {
  return (
    <div>
      <h1>Users</h1>
      {/* Breadcrumb will automatically show: Admin > Users */}
    </div>
  );
}
```

### Dynamic Route

```typescript
// app/admin/users/[id]/page.tsx
export default function UserDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>User Details</h1>
      {/* Breadcrumb will automatically show: Admin > Users > Details */}
    </div>
  );
}
```

## Features Explained

### Collapsible Sidebar

- **Expanded Mode**: Full sidebar with labels and icons
- **Icon Mode**: Collapsed sidebar showing only icons
- **Toggle**: Click sidebar trigger button or use `Cmd/Ctrl + B`
- **State Persistence**: Sidebar state saved in cookies

### Responsive Behavior

- **Desktop**: Fixed sidebar on the left
- **Mobile**: Sheet overlay that slides in from the left
- **Breakpoint**: 768px (configurable in `use-mobile.ts`)

### Active Route Highlighting

Routes are automatically highlighted based on:
- Exact match for dashboard (`/admin`)
- Prefix match for sub-routes (`/admin/users` matches `/admin/users/123`)

### Breadcrumb Generation

Breadcrumbs are automatically generated from the route path:
- `/admin` → `Admin`
- `/admin/users` → `Admin > Users`
- `/admin/users/123` → `Admin > Users > Details`
- `/admin/users/add` → `Admin > Users > Add`

## Troubleshooting

### Sidebar Not Collapsing

Ensure `SidebarProvider` wraps your layout and `collapsible="icon"` is set on the `Sidebar` component.

### Mobile Sidebar Not Showing

Check that `useIsMobile` hook is properly imported and `Sheet` component is installed.

### Active State Not Working

Verify that `usePathname` is imported from `next/navigation` and routes match exactly.

### User Not Loading

Update the user fetching logic in `dashboard-sidebar.tsx` to match your authentication system.

## Additional Notes

- The sidebar uses CSS custom properties for theming
- All components are client-side (`"use client"`)
- The layout uses Next.js App Router conventions
- Icons are from `lucide-react` - replace with your preferred icon library if needed

## License

This implementation guide is provided as-is for use in your projects.

