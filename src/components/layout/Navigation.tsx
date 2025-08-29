'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useStudyData } from '@/hooks/useStudyData';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/',
    description: 'Overview and quick actions'
  },
  {
    name: 'Study Timer',
    href: '/sessions',
    description: 'Focus sessions and timer'
  },
  {
    name: 'Subjects',
    href: '/subjects',
    description: 'Manage your courses'
  },
  {
    name: 'Assignments',
    href: '/assignments',
    description: 'Tasks and deadlines'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    description: 'Study insights and reports'
  },
  {
    name: 'Settings',
    href: '/settings',
    description: 'Preferences and configuration'
  }
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { overdueAssignments, studyStats } = useStudyData();

  const NavItems = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        const showBadge = item.name === 'Assignments' && overdueAssignments.length > 0;
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`${
              mobile
                ? 'flex flex-col items-start p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors'
                : 'px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-700'
            } ${
              isActive
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => mobile && setIsOpen(false)}
          >
            <div className="flex items-center gap-2">
              <span>{item.name}</span>
              {showBadge && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                  {overdueAssignments.length}
                </Badge>
              )}
            </div>
            {mobile && (
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {item.description}
              </span>
            )}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SX</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg text-gray-900 dark:text-white">StudyX</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Study Tracker</span>
              </div>
            </Link>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              <NavItems />
            </div>

            {/* Study Stats Display */}
            <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>{Math.floor(studyStats.totalStudyTime / 3600)}h studied</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>{studyStats.streakDays} day streak</span>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="md:hidden">
                  <div className="flex flex-col gap-1">
                    <div className="w-4 h-0.5 bg-current rounded"></div>
                    <div className="w-4 h-0.5 bg-current rounded"></div>
                    <div className="w-4 h-0.5 bg-current rounded"></div>
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">SX</span>
                      </div>
                      <div>
                        <h2 className="font-bold text-xl text-gray-900 dark:text-white">StudyX</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Study Tracker</p>
                      </div>
                    </div>
                  </div>

                  {/* Study Stats */}
                  <div className="py-6 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Quick Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {Math.floor(studyStats.totalStudyTime / 3600)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Hours Studied</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {studyStats.streakDays}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Day Streak</div>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <div className="flex-1 py-6">
                    <nav className="space-y-2">
                      <NavItems mobile />
                    </nav>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      StudyX v1.0.0 - Smart Study Tracking
                    </p>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  );
}