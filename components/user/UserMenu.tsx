'use client';

import { useAuthContext } from '@/lib/features/auth';
import { Role } from '@/lib/features/auth/data/interfaces/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

function getInitials(displayName: string | null, email: string | null): string {
  if (displayName) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  }
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }
  return 'U';
}

export function UserMenu() {
  const { user, logout } = useAuthContext();
  const router = useRouter();

  if (!user) {
    return null;
  }

  const initials = getInitials(user.displayName, user.email);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 focus:ring-offset-2"
          aria-label="User menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
            <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.displayName || 'User'}
            </p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/profile')}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        {user.role?.name === Role.ADMIN && (
          <DropdownMenuItem
            onClick={() => router.push('/dashboard')}
            className="cursor-pointer"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

