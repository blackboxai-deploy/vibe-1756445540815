'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useStudyData } from '@/hooks/useStudyData';
import { formatDuration } from '@/lib/storage';

export function StatsCards() {
  const { studyStats } = useStudyData();

  const stats = [
    {
      label: 'Total Study Time',
      value: formatDuration(studyStats.totalStudyTime),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      description: 'All-time study hours'
    },
    {
      label: 'Study Sessions',
      value: studyStats.totalSessions.toString(),
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      description: 'Completed sessions'
    },
    {
      label: 'Current Streak',
      value: `${studyStats.streakDays} days`,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      description: 'Consecutive study days'
    },
    {
      label: 'Avg Session',
      value: formatDuration(Math.round(studyStats.averageSessionLength)),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      description: 'Average session length'
    },
    {
      label: 'Assignments Done',
      value: studyStats.completedAssignments.toString(),
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      description: 'Completed tasks'
    },
    {
      label: 'Goals Achieved',
      value: studyStats.achievedGoals.toString(),
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      description: 'Reached milestones'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center mb-4`}>
              <div className={`w-6 h-6 rounded-full ${stat.color.replace('text-', 'bg-')}`}></div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {stat.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}