'use client';

import { useState } from 'react';
import { StudyTimer } from '@/components/study/StudyTimer';
import { SessionHistory } from '@/components/study/SessionHistory';
import { SessionForm } from '@/components/study/SessionForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useStudyData } from '@/hooks/useStudyData';

export default function SessionsPage() {
  const { sessions, addSession } = useStudyData();
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const handleSessionComplete = (session: any) => {
    addSession(session);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Sessions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Focus with the Pomodoro timer and track your study progress.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Timer and Controls */}
        <div className="xl:col-span-2 space-y-6">
          <StudyTimer 
            onSessionComplete={handleSessionComplete}
            selectedSubjectId={selectedSubjectId}
            onSubjectChange={setSelectedSubjectId}
          />
          
          {/* Manual Session Entry */}
          <Card>
            <CardHeader>
              <CardTitle>Add Manual Session</CardTitle>
            </CardHeader>
            <CardContent>
              <SessionForm onSubmit={handleSessionComplete} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Session History */}
        <div className="space-y-6">
          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="all">All Sessions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="mt-6">
              <SessionHistory 
                sessions={sessions.slice(-10).reverse()} 
                showAll={false}
              />
            </TabsContent>
            
            <TabsContent value="all" className="mt-6">
              <SessionHistory 
                sessions={sessions} 
                showAll={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Study Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Study Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <TodaysSummary sessions={sessions} />
        </CardContent>
      </Card>
    </div>
  );
}

function TodaysSummary({ sessions }: { sessions: any[] }) {
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === today);
  const totalTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const totalMinutes = Math.round(totalTime / 60);
  const sessionCount = todaySessions.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          {totalMinutes}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Minutes Studied</div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {sessionCount}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Study Sessions</div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
          {sessionCount > 0 ? Math.round(totalTime / sessionCount / 60) : 0}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Avg Session (min)</div>
      </div>
      
      <div className="text-center">
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
          {Math.ceil(totalMinutes / 25)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Pomodoros</div>
      </div>
    </div>
  );
}