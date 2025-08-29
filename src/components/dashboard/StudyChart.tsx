'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStudyData } from '@/hooks/useStudyData';

export function StudyChart() {
  const { sessions, subjects } = useStudyData();

  // Prepare weekly data
  const weeklyData = useMemo(() => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const data = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(session => session.date === dateStr);
      const totalMinutes = Math.round(daySessions.reduce((sum, session) => sum + session.duration, 0) / 60);
      
      data.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: totalMinutes,
        sessions: daySessions.length,
        date: dateStr
      });
    }
    
    return data;
  }, [sessions]);

  // Prepare subject distribution data
  const subjectData = useMemo(() => {
    const subjectTimes = subjects.map(subject => {
      const subjectSessions = sessions.filter(s => s.subjectId === subject.id);
      const totalMinutes = Math.round(subjectSessions.reduce((sum, session) => sum + session.duration, 0) / 60);
      
      return {
        name: subject.name,
        minutes: totalMinutes,
        color: subject.color,
        sessions: subjectSessions.length
      };
    }).filter(subject => subject.minutes > 0);
    
    return subjectTimes.sort((a, b) => b.minutes - a.minutes).slice(0, 6);
  }, [subjects, sessions]);

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-blue-600">
            Study Time: {payload[0].value} minutes
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sessions: {data.sessions}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Study Analytics
          <div className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Last 7 days
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly Trend</TabsTrigger>
            <TabsTrigger value="subjects">Subject Distribution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={customTooltip} />
                  <Bar 
                    dataKey="minutes" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {weeklyData.every(day => day.minutes === 0) && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                </div>
                <p className="font-medium">No study sessions this week</p>
                <p className="text-sm mt-1">Start your first session to see analytics here</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="subjects" className="mt-6">
            <div className="h-80">
              {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData} layout="horizontal" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      type="number"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      width={80}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                              <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                              <p className="text-sm text-blue-600">
                                Time: {payload[0].value} minutes
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Sessions: {data.sessions}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="minutes" 
                      fill="#8B5CF6"
                      radius={[0, 4, 4, 0]}
                      className="hover:opacity-80"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                  </div>
                  <p className="font-medium">No subjects with study time</p>
                  <p className="text-sm mt-1">Create subjects and start studying to see distribution</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}