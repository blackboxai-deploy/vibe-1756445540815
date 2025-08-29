'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudyData } from '@/hooks/useStudyData';
import { formatDuration } from '@/lib/storage';

export function RecentActivity() {
  const { sessions, subjects, assignments } = useStudyData();

  const recentActivity = useMemo(() => {
    const activities = [];

    // Recent study sessions
    const recentSessions = sessions
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 5)
      .map(session => {
        const subject = subjects.find(s => s.id === session.subjectId);
        return {
          id: session.id,
          type: 'session',
          title: `Study session: ${subject?.name || 'Unknown Subject'}`,
          description: `${formatDuration(session.duration)} session${session.notes ? ` - ${session.notes}` : ''}`,
          timestamp: session.startTime,
          color: subject?.color || '#6B7280'
        };
      });

    // Recent assignment completions
    const recentCompletions = assignments
      .filter(a => a.status === 'completed' && a.completedAt)
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, 3)
      .map(assignment => ({
        id: assignment.id,
        type: 'assignment',
        title: `Completed: ${assignment.title}`,
        description: `Assignment from ${assignment.subject}`,
        timestamp: assignment.completedAt!,
        color: '#10B981'
      }));

    // Recent assignments added
    const recentAssignments = assignments
      .filter(a => a.status !== 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map(assignment => {
        const daysUntilDue = Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return {
          id: assignment.id,
          type: 'assignment-new',
          title: `New assignment: ${assignment.title}`,
          description: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} - ${assignment.subject}`,
          timestamp: assignment.createdAt,
          color: '#F59E0B',
          urgent: daysUntilDue <= 2
        };
      });

    // Combine and sort by timestamp
    activities.push(...recentSessions, ...recentCompletions, ...recentAssignments);
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, 8);
  }, [sessions, subjects, assignments]);

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'session':
        return '⏱️';
      case 'assignment':
        return '✅';
      case 'assignment-new':
        return '📝';
      default:
        return '•';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivity.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <p className="font-medium">No recent activity</p>
            <p className="text-sm mt-1">Start studying or create assignments to see activity here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={`${activity.type}-${activity.id}-${index}`} className="flex items-start space-x-3">
                {/* Activity Icon */}
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                  style={{ backgroundColor: activity.color }}
                >
                  {getTypeIcon(activity.type)}
                </div>
                
                {/* Activity Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.description}
                      </p>
                    </div>
                    
                    {/* Timestamp and Badge */}
                    <div className="flex items-center space-x-2 ml-2">
                      {activity.urgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                      <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {formatRelativeTime(new Date(activity.timestamp))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {recentActivity.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <button 
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium w-full text-center py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
              onClick={() => {
                // Navigate to a more detailed activity log
                console.log('Navigate to full activity log');
              }}
            >
              View all activity
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}