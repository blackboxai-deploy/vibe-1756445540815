'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useTimer } from '@/hooks/useTimer';
import { useStudyData } from '@/hooks/useStudyData';
import { StudySession } from '@/lib/types';
import { generateId } from '@/lib/storage';
import { toast } from 'sonner';

interface StudyTimerProps {
  onSessionComplete: (session: StudySession) => void;
  selectedSubjectId: string;
  onSubjectChange: (subjectId: string) => void;
}

export function StudyTimer({ onSessionComplete, selectedSubjectId, onSubjectChange }: StudyTimerProps) {
  const { subjects, settings } = useStudyData();
  const [sessionNotes, setSessionNotes] = useState('');
  const [isTimerStarted, setIsTimerStarted] = useState(false);

  const {
    currentMode,
    completedSessions,
    progress,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    skipSession,
    resetProgress,
    formatTime,
    isRunning,
    isPaused,
    isIdle,
    isFocusMode,
    nextBreakType
  } = useTimer({
    focusTime: settings.timer.focusTime,
    shortBreak: settings.timer.shortBreak,
    longBreak: settings.timer.longBreak,
    longBreakInterval: settings.timer.longBreakInterval,
    onSessionComplete: (session) => {
      const subject = subjects.find(s => s.id === selectedSubjectId);
      const completedSession: StudySession = {
        ...session,
        subject: subject?.name || 'Unknown Subject',
        subjectId: selectedSubjectId,
        notes: sessionNotes,
        id: generateId(),
        date: new Date().toISOString().split('T')[0]
      };
      
      onSessionComplete(completedSession);
      setSessionNotes('');
      toast.success(`${settings.timer.focusTime}-minute study session completed!`);
    },
    onBreakComplete: () => {
      toast.success('Break completed! Ready for another study session.');
    }
  });

  const handleStart = () => {
    if (!selectedSubjectId && isFocusMode) {
      toast.error('Please select a subject before starting a study session.');
      return;
    }
    
    startTimer(selectedSubjectId, sessionNotes);
    setIsTimerStarted(true);
  };

  const handleStop = () => {
    stopTimer();
    setIsTimerStarted(false);
    setSessionNotes('');
  };

  const getModeDisplay = () => {
    switch (currentMode) {
      case 'focus':
        return {
          title: 'Focus Session',
          emoji: '🎯',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        };
      case 'short-break':
        return {
          title: 'Short Break',
          emoji: '☕',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20'
        };
      case 'long-break':
        return {
          title: 'Long Break',
          emoji: '🌟',
          color: 'text-purple-600 dark:text-purple-400',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20'
        };
      default:
        return {
          title: 'Ready',
          emoji: '⏰',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800'
        };
    }
  };

  const modeInfo = getModeDisplay();
  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <Card className="relative overflow-hidden">
      <div className={`absolute inset-0 ${modeInfo.bgColor} opacity-50`}></div>
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">{modeInfo.emoji}</span>
            <span>{modeInfo.title}</span>
          </CardTitle>
          
          {completedSessions > 0 && (
            <Badge variant="outline" className="text-sm">
              {completedSessions} completed
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-6">
        {/* Timer Display */}
        <div className="text-center space-y-4">
          <div className={`text-6xl md:text-8xl font-mono font-bold ${modeInfo.color}`}>
            {formatTime}
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-3"
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{Math.round(progress)}% complete</span>
              <span>
                Next: {isFocusMode ? nextBreakType.replace('-', ' ') : 'focus session'}
              </span>
            </div>
          </div>
        </div>

        {/* Subject Selection */}
        {isFocusMode && (
          <div className="space-y-3">
            <Label htmlFor="subject">Study Subject</Label>
            <Select value={selectedSubjectId} onValueChange={onSubjectChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject to study" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(subject => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      ></div>
                      <span>{subject.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedSubject && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Goal: {selectedSubject.goalHours}h/week • 
                Progress: {Math.round(selectedSubject.totalTime / 3600)}h studied
              </div>
            )}
          </div>
        )}

        {/* Session Notes */}
        {isFocusMode && (
          <div className="space-y-2">
            <Label htmlFor="notes">Session Notes (optional)</Label>
            <Input
              id="notes"
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="What will you focus on during this session?"
              disabled={isRunning || isPaused}
            />
          </div>
        )}

        {/* Timer Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isIdle && (
            <Button 
              size="lg" 
              onClick={handleStart}
              disabled={isFocusMode && !selectedSubjectId}
              className="flex-1 max-w-xs"
            >
              Start {modeInfo.title}
            </Button>
          )}
          
          {isRunning && (
            <Button 
              size="lg" 
              variant="outline" 
              onClick={pauseTimer}
              className="flex-1 max-w-xs"
            >
              Pause
            </Button>
          )}
          
          {isPaused && (
            <Button 
              size="lg" 
              onClick={resumeTimer}
              className="flex-1 max-w-xs"
            >
              Resume
            </Button>
          )}
          
          {(isRunning || isPaused) && (
            <>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleStop}
                className="flex-1 max-w-xs"
              >
                Stop
              </Button>
              
              <Button 
                size="lg" 
                variant="ghost" 
                onClick={skipSession}
                className="flex-1 max-w-xs text-gray-500"
              >
                Skip
              </Button>
            </>
          )}
        </div>

        {/* Session Info */}
        {isTimerStarted && (
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 border-t pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="font-medium">Current Session</div>
                <div>
                  {isFocusMode ? settings.timer.focusTime : 
                   currentMode === 'short-break' ? settings.timer.shortBreak : settings.timer.longBreak} minutes
                </div>
              </div>
              <div>
                <div className="font-medium">Sessions Today</div>
                <div>{completedSessions} completed</div>
              </div>
            </div>
          </div>
        )}

        {/* Reset Button */}
        {completedSessions > 0 && isIdle && (
          <div className="text-center pt-4 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetProgress}
              className="text-gray-500 dark:text-gray-400"
            >
              Reset Progress
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}