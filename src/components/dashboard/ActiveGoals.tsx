'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStudyData } from '@/hooks/useStudyData';

export function ActiveGoals() {
  const { activeGoals, updateGoal } = useStudyData();

  const getDaysUntilDeadline = (deadline: Date) => {
    const now = new Date();
    const due = new Date(deadline);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateProgress = (goal: any) => {
    const percentage = (goal.current / goal.target) * 100;
    return Math.min(percentage, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const markGoalComplete = (goalId: string) => {
    const goal = activeGoals.find(g => g.id === goalId);
    if (goal) {
      updateGoal({ ...goal, isCompleted: true });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Active Goals</CardTitle>
        <Badge variant="outline" className="text-xs">
          {activeGoals.length} active
        </Badge>
      </CardHeader>
      <CardContent>
        {activeGoals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <p className="font-medium">No active goals</p>
            <p className="text-sm mt-1">Set goals to track your study progress</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeGoals.slice(0, 4).map((goal) => {
              const progress = calculateProgress(goal);
              const daysLeft = getDaysUntilDeadline(goal.deadline);
              const isNearDeadline = daysLeft <= 7;
              const isOverdue = daysLeft < 0;
              
              return (
                <div
                  key={goal.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3"
                >
                  {/* Goal Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {goal.title}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {goal.type} goal
                        </span>
                        {isOverdue ? (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        ) : isNearDeadline ? (
                          <Badge className="bg-orange-500 text-white text-xs">
                            {daysLeft === 0 ? 'Due today' : `${daysLeft} days left`}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {daysLeft} days left
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {progress >= 100 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => markGoalComplete(goal.id)}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Progress: {goal.current} / {goal.target} {goal.unit}
                      </span>
                      <span className={`text-xs font-medium ${getProgressColor(progress)}`}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  {/* Goal Details */}
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Target: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                    {goal.subjectId && (
                      <span>
                        Subject-specific goal
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {activeGoals.length > 4 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              onClick={() => window.location.href = '/goals'}
            >
              View all goals ({activeGoals.length})
            </Button>
          </div>
        )}
        
        {activeGoals.length === 0 && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.location.href = '/settings'}
            >
              Create First Goal
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}