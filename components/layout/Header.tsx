'use client';

import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Bell, Menu, ArrowLeftRight, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/hooks';
import { setActiveStore } from '@/lib/store';

interface HeaderProps {
  isMobile?: boolean;
  onMenuClick?: () => void;
}

export default function AppHeader({ isMobile, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, storeAssignments, activeStoreId } = useAuth();

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '';

  return (
    <header className="sticky top-0 z-10 h-16 flex items-center justify-between bg-[var(--k-bg-page)] px-4 md:px-7">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-600 hover:bg-white hover:shadow-sm transition-all"
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Store selector */}
        {storeAssignments.length > 1 && (
          <Select
            value={activeStoreId ?? undefined}
            onValueChange={(value) => dispatch(setActiveStore(value))}
          >
            <SelectTrigger className="w-[140px] md:w-[200px] h-10 text-sm rounded-xl border-stone-200 bg-white shadow-sm">
              <ArrowLeftRight size={14} className="mr-1.5 text-stone-400" />
              <SelectValue placeholder="Select store" />
            </SelectTrigger>
            <SelectContent>
              {storeAssignments.map((s) => (
                <SelectItem key={s.storeId} value={s.storeId}>
                  {s.storeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Search */}
        <button
          className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-600 hover:bg-white hover:shadow-sm transition-all"
        >
          <Search size={18} />
        </button>

        {/* Alert bell */}
        <button
          onClick={() => router.push('/alerts')}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-400 hover:text-stone-600 hover:bg-white hover:shadow-sm transition-all relative"
        >
          <Bell size={18} />
        </button>

        {/* User avatar + info */}
        <div className="flex items-center gap-2.5 pl-2 ml-1 border-l border-stone-200/60">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-indigo-600 text-white text-xs font-bold font-[family-name:var(--font-display)]">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!isMobile && (
            <div className="text-left leading-tight">
              <div className="text-sm font-semibold text-stone-800">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-[11px] text-stone-400 font-medium">
                {user?.roles?.[0]?.replace(/([A-Z])/g, ' $1').trim() ?? 'User'}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
