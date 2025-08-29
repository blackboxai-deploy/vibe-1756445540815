'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStudyData } from '@/hooks/useStudyData';

export function UpcomingAssignments() {
  const { upcomingAssignments, overdueAssignments, completeAssignment } = useStudyData();

  const allAssignments = [...overdueAssignments, ...upcomingAssignments].slice(0, 5);

  const getDaysUntilDue = (dueDate: Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusBadge = (assignment: any) => {
    const daysUntil = getDaysUntilDue(assignment.dueDate);
    
    if (daysUntil < 0) {
      return (
        <Badge variant="destructive" className="text-xs">
          Overdue
        </Badge>
      );
    }
    
    if (daysUntil === 0) {
      return (
        <Badge className="bg-orange-500 text-white text-xs">
          Due Today
        </Badge>
      );
    }
    
    if (daysUntil === 1) {
      return (
        <Badge className="bg-yellow-500 text-white text-xs">
          Due Tomorrow
        </Badge>
      );
    }
    
    if (daysUntil <= 3) {
      return (
        <Badge variant="secondary" className="text-xs">
          Due in {daysUntil} days
        </Badge>
      );
    }
    
    return null;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Upcoming Assignments</CardTitle>
        {overdueAssignments.length > 0 && (
          <Badge variant="destructive" className="text-xs">
            {overdueAssignments.length} overdue
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {allAssignments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <p className="font-medium">No upcoming assignments</p>
            <p className="text-sm mt-1">Create new assignments to track deadlines</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allAssignments.map((assignment) => {
              const statusBadge = getStatusBadge(assignment);
              
              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {assignment.title}
                      </h4>
                      {statusBadge}
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{assignment.subject}</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-full ${getPriorityColor(assignment.priority)}`}>
                        {assignment.priority}
                      </span>
                      <span>•</span>
                      <span>
                        Due {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {assignment.description && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                        {assignment.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="ml-3 flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => completeAssignment(assignment.id)}
                    >
                      Mark Done
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {allAssignments.length > 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              onClick={() => window.location.href = '/assignments'}
            >
              View all assignments
            </Button>
          </div>
        )}
        
        {allAssignments.length === 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.location.href = '/assignments'}
            >
              Create First Assignment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}