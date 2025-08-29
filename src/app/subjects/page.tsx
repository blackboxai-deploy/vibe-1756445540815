'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useStudyData } from '@/hooks/useStudyData';
import { formatDuration } from '@/lib/storage';
import { toast } from 'sonner';

export default function SubjectsPage() {
  const { subjects, addSubject, updateSubject, deleteSubject, subjectProgress } = useStudyData();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<any>(null);

  const handleCreateSubject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newSubject = addSubject({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      color: formData.get('color') as string,
      goalHours: parseInt(formData.get('goalHours') as string) || 10
    });
    
    toast.success(`Subject "${newSubject.name}" created successfully!`);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateSubject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updatedSubject = {
      ...editingSubject,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      color: formData.get('color') as string,
      goalHours: parseInt(formData.get('goalHours') as string) || 10
    };
    
    updateSubject(updatedSubject);
    toast.success(`Subject "${updatedSubject.name}" updated successfully!`);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (subjectId: string, subjectName: string) => {
    if (confirm(`Are you sure you want to delete "${subjectName}"? This will also delete all related sessions and assignments. This action cannot be undone.`)) {
      deleteSubject(subjectId);
      toast.success(`Subject "${subjectName}" deleted successfully.`);
    }
  };

  const colorOptions = [
    { value: '#3B82F6', name: 'Blue' },
    { value: '#10B981', name: 'Green' },
    { value: '#F59E0B', name: 'Orange' },
    { value: '#8B5CF6', name: 'Purple' },
    { value: '#EF4444', name: 'Red' },
    { value: '#06B6D4', name: 'Cyan' },
    { value: '#F97316', name: 'Orange' },
    { value: '#84CC16', name: 'Lime' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subjects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your study subjects and track progress towards your goals.
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-md">
              Add New Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Subject</DialogTitle>
              <DialogDescription>
                Add a new subject to organize your studies and track progress.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subject Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Mathematics, History, Chemistry"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of the subject..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color Theme</Label>
                  <Select name="color" defaultValue="#3B82F6">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(color => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: color.value }}
                            ></div>
                            <span>{color.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goalHours">Weekly Goal (hours)</Label>
                  <Input
                    id="goalHours"
                    name="goalHours"
                    type="number"
                    min="1"
                    max="168"
                    defaultValue="10"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Subject</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Subject Cards */}
      {subjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No subjects yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              Create your first subject to start organizing your studies and tracking progress.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create First Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjectProgress.map((progress) => {
            const subject = subjects.find(s => s.id === progress.subjectId);
            if (!subject) return null;
            
            return (
              <Card key={subject.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      ></div>
                      <div>
                        <CardTitle className="text-lg">{subject.name}</CardTitle>
                        {subject.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {subject.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Badge 
                      variant={subject.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {subject.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Progress Towards Goal */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Weekly Progress
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.round(progress.percentage)}%
                      </span>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{formatDuration(progress.studyTime)}</span>
                      <span>Goal: {subject.goalHours}h/week</span>
                    </div>
                  </div>
                  
                  {/* Study Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {progress.sessions}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Sessions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formatDuration(Math.round(progress.avgSessionLength))}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Avg Session</div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-3 border-t">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => window.location.href = `/sessions?subject=${subject.id}`}
                    >
                      Study Now
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setEditingSubject(subject)}
                    >
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      onClick={() => handleDeleteSubject(subject.id, subject.name)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Subject Dialog */}
      <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update subject information and settings.
            </DialogDescription>
          </DialogHeader>
          {editingSubject && (
            <form onSubmit={handleUpdateSubject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Subject Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingSubject.name}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingSubject.description}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-color">Color Theme</Label>
                  <Select name="color" defaultValue={editingSubject.color}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(color => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: color.value }}
                            ></div>
                            <span>{color.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-goalHours">Weekly Goal (hours)</Label>
                  <Input
                    id="edit-goalHours"
                    name="goalHours"
                    type="number"
                    min="1"
                    max="168"
                    defaultValue={editingSubject.goalHours}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingSubject(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Subject</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}