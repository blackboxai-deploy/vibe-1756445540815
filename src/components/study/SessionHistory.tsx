'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudySession } from '@/lib/types';
import { useStudyData } from '@/hooks/useStudyData';
import { formatDuration } from '@/lib/storage';

interface SessionHistoryProps {
  sessions: StudySession[];
  showAll: boolean;
}

export function SessionHistory({ sessions, showAll }: SessionHistoryProps) {
  const { subjects, deleteSession } = useStudyData();
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'subject'>('date');

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions;
    
    // Filter by subject
    if (filterSubject !== 'all') {
      filtered = filtered.filter(session => session.subjectId === filterSubject);
    }
    
    // Sort sessions
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
        case 'duration':
          return b.duration - a.duration;
        case 'subject':
          return a.subject.localeCompare(b.subject);
        default:
          return 0;
      }
    });
    
    return showAll ? filtered : filtered.slice(0, 10);
  }, [sessions, filterSubject, sortBy, showAll]);

  const formatSessionDate = (date: Date) => {
    const now = new Date();
    const sessionDate = new Date(date);
    
    // Check if it's today
    if (sessionDate.toDateString() === now.toDateString()) {
      return `Today at ${sessionDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (sessionDate.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${sessionDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
    
    // Otherwise show date and time
    return sessionDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || '#6B7280';
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      deleteSession(sessionId);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <CardTitle>
            {showAll ? 'All Sessions' : 'Recent Sessions'} 
            {filteredSessions.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({filteredSessions.length})
              </span>
            )}
          </CardTitle>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={filterSubject} onValueChange={setFilterSubject}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: 'date' | 'duration' | 'subject') => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="subject">Subject</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredSessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
            <p className="font-medium">
              {sessions.length === 0 ? 'No study sessions yet' : 'No sessions match your filters'}
            </p>
            <p className="text-sm mt-1">
              {sessions.length === 0 
                ? 'Start your first study session to see it here' 
                : 'Try adjusting your filters or create more sessions'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {/* Subject Color Indicator */}
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getSubjectColor(session.subjectId) }}
                  ></div>
                  
                  {/* Session Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {session.subject}
                      </h4>
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {formatDuration(session.duration)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatSessionDate(session.startTime)}</span>
                      {session.notes && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-48">
                            {session.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-2 ml-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Load More Button */}
        {!showAll && sessions.length > filteredSessions.length && (
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => window.location.href = '/sessions?tab=all'}
            >
              View All Sessions ({sessions.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}