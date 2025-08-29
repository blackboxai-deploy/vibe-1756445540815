'use client';

import { StatsCards } from '@/components/dashboard/StatsCards';
import { StudyChart } from '@/components/dashboard/StudyChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { UpcomingAssignments } from '@/components/dashboard/UpcomingAssignments';
import { ActiveGoals } from '@/components/dashboard/ActiveGoals';
import { useStudyData } from '@/hooks/useStudyData';

export default function DashboardPage() {
  const { isLoading } = useStudyData();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's your study overview.
          </p>
        </div>
        <QuickActions />
      </div>

      {/* Stats Cards */}
      <StatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Charts and Analytics */}
        <div className="lg:col-span-2 space-y-8">
          <StudyChart />
          <RecentActivity />
        </div>

        {/* Right Column - Sidebar Items */}
        <div className="space-y-8">
          <UpcomingAssignments />
          <ActiveGoals />
        </div>
      </div>
    </div>
  );
}