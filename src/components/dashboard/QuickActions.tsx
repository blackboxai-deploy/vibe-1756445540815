'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStudyData } from '@/hooks/useStudyData';
import { toast } from 'sonner';

export function QuickActions() {
  const { subjects, addSubject, addAssignment } = useStudyData();
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);

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
    setIsSubjectDialogOpen(false);
  };

  const handleCreateAssignment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newAssignment = addAssignment({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      subjectId: formData.get('subjectId') as string,
      dueDate: new Date(formData.get('dueDate') as string),
      priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
      status: 'pending',
      estimatedTime: parseInt(formData.get('estimatedTime') as string) || 1
    });
    
    toast.success(`Assignment "${newAssignment.title}" created successfully!`);
    setIsAssignmentDialogOpen(false);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Start Study Session */}
      <Button 
        size="lg" 
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
        onClick={() => window.location.href = '/sessions'}
      >
        Start Study Session
      </Button>

      {/* Quick Add Subject */}
      <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="shadow-md">
            Add Subject
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Add a new subject to track your studies and progress.
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
              <Label htmlFor="description">Description (optional)</Label>
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
                    <SelectItem value="#3B82F6">Blue</SelectItem>
                    <SelectItem value="#10B981">Green</SelectItem>
                    <SelectItem value="#F59E0B">Orange</SelectItem>
                    <SelectItem value="#8B5CF6">Purple</SelectItem>
                    <SelectItem value="#EF4444">Red</SelectItem>
                    <SelectItem value="#06B6D4">Cyan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goalHours">Goal (hours/week)</Label>
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
                onClick={() => setIsSubjectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Subject</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick Add Assignment */}
      <Dialog open={isAssignmentDialogOpen} onOpenChange={setIsAssignmentDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="shadow-md">
            Add Assignment
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>
              Add a new assignment or task to track and manage.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Assignment Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Chapter 5 Review, Research Paper"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subjectId">Subject</Label>
              <Select name="subjectId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {subjects.length === 0 && (
                <p className="text-xs text-gray-500">
                  Create a subject first to add assignments
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated Time (hours)</Label>
              <Input
                id="estimatedTime"
                name="estimatedTime"
                type="number"
                min="0.5"
                max="100"
                step="0.5"
                defaultValue="2"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Assignment details and requirements..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAssignmentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={subjects.length === 0}>
                Create Assignment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}