'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { useStudyData } from '@/hooks/useStudyData';
import { Assignment } from '@/lib/types';
import { toast } from 'sonner';

export default function AssignmentsPage() {
  const { assignments, subjects, addAssignment, updateAssignment, deleteAssignment, completeAssignment } = useStudyData();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Categorize assignments
  const categorizedAssignments = useMemo(() => {
    const now = new Date();
    
    const overdue = assignments.filter(a => 
      a.status !== 'completed' && new Date(a.dueDate) < now
    );
    
    const dueToday = assignments.filter(a => {
      const due = new Date(a.dueDate);
      return a.status !== 'completed' && 
             due.toDateString() === now.toDateString();
    });
    
    const upcoming = assignments.filter(a => {
      const due = new Date(a.dueDate);
      const daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return a.status !== 'completed' && daysDiff > 0 && daysDiff <= 7;
    });
    
    const future = assignments.filter(a => {
      const due = new Date(a.dueDate);
      const daysDiff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return a.status !== 'completed' && daysDiff > 7;
    });
    
    const completed = assignments.filter(a => a.status === 'completed');
    
    return { overdue, dueToday, upcoming, future, completed };
  }, [assignments]);

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
    setIsCreateDialogOpen(false);
  };

  const handleUpdateAssignment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAssignment) return;
    
    const formData = new FormData(e.currentTarget);
    
    const updatedAssignment: Assignment = {
      ...editingAssignment,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      subjectId: formData.get('subjectId') as string,
      subject: subjects.find(s => s.id === formData.get('subjectId'))?.name || '',
      dueDate: new Date(formData.get('dueDate') as string),
      priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
      status: formData.get('status') as 'pending' | 'in-progress' | 'completed' | 'overdue',
      estimatedTime: parseInt(formData.get('estimatedTime') as string) || 1
    };
    
    updateAssignment(updatedAssignment);
    toast.success(`Assignment "${updatedAssignment.title}" updated successfully!`);
    setEditingAssignment(null);
  };

  const handleDeleteAssignment = (assignmentId: string, assignmentTitle: string) => {
    if (confirm(`Are you sure you want to delete "${assignmentTitle}"? This action cannot be undone.`)) {
      deleteAssignment(assignmentId);
      toast.success(`Assignment "${assignmentTitle}" deleted successfully.`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
              {assignment.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {assignment.subject}
            </p>
            {assignment.description && (
              <p className="text-sm text-gray-500 dark:text-gray-500 line-clamp-2">
                {assignment.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-end space-y-1 ml-3">
            <Badge className={`text-xs ${getPriorityColor(assignment.priority)}`}>
              {assignment.priority}
            </Badge>
            <Badge className={`text-xs ${getStatusColor(assignment.status)}`}>
              {assignment.status}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
          <span>Est: {assignment.estimatedTime}h</span>
        </div>
        
        <div className="flex space-x-2">
          {assignment.status !== 'completed' && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => completeAssignment(assignment.id)}
            >
              Mark Complete
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setEditingAssignment(assignment)}
          >
            Edit
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-red-600 dark:text-red-400"
            onClick={() => handleDeleteAssignment(assignment.id, assignment.title)}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your tasks and track deadlines across all subjects.
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-md">
              Add New Assignment
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
                  onClick={() => setIsCreateDialogOpen(false)}
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

      {/* Content */}
      {assignments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No assignments yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
              Create your first assignment to start tracking tasks and deadlines.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create First Assignment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">
              Active ({categorizedAssignments.overdue.length + categorizedAssignments.dueToday.length + categorizedAssignments.upcoming.length + categorizedAssignments.future.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({categorizedAssignments.completed.length})
            </TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-6">
            {/* Overdue */}
            {categorizedAssignments.overdue.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
                  Overdue ({categorizedAssignments.overdue.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorizedAssignments.overdue.map(assignment => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Due Today */}
            {categorizedAssignments.dueToday.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-orange-600 dark:text-orange-400 mb-4">
                  Due Today ({categorizedAssignments.dueToday.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorizedAssignments.dueToday.map(assignment => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Upcoming */}
            {categorizedAssignments.upcoming.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4">
                  This Week ({categorizedAssignments.upcoming.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorizedAssignments.upcoming.map(assignment => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Future */}
            {categorizedAssignments.future.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-4">
                  Future ({categorizedAssignments.future.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorizedAssignments.future.map(assignment => (
                    <AssignmentCard key={assignment.id} assignment={assignment} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-6">
            {categorizedAssignments.completed.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-6xl mb-4 block">✅</span>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No completed assignments
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete some assignments to see them here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorizedAssignments.completed.map(assignment => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    Assignments for {selectedDate?.toLocaleDateString() || 'Selected Date'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDate && (
                    <AssignmentsForDate date={selectedDate} assignments={assignments} />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Assignment Dialog */}
      <Dialog open={!!editingAssignment} onOpenChange={(open) => !open && setEditingAssignment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
            <DialogDescription>
              Update assignment information and status.
            </DialogDescription>
          </DialogHeader>
          {editingAssignment && (
            <form onSubmit={handleUpdateAssignment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Assignment Title</Label>
                <Input
                  id="edit-title"
                  name="title"
                  defaultValue={editingAssignment.title}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-subjectId">Subject</Label>
                <Select name="subjectId" defaultValue={editingAssignment.subjectId}>
                  <SelectTrigger>
                    <SelectValue />
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
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Input
                    id="edit-dueDate"
                    name="dueDate"
                    type="date"
                    defaultValue={new Date(editingAssignment.dueDate).toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={editingAssignment.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select name="priority" defaultValue={editingAssignment.priority}>
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
                
                <div className="space-y-2">
                  <Label htmlFor="edit-estimatedTime">Est. Time (hours)</Label>
                  <Input
                    id="edit-estimatedTime"
                    name="estimatedTime"
                    type="number"
                    min="0.5"
                    step="0.5"
                    defaultValue={editingAssignment.estimatedTime}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingAssignment.description}
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingAssignment(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Assignment</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssignmentsForDate({ date, assignments }: { date: Date; assignments: Assignment[] }) {
  const dateAssignments = assignments.filter(assignment => {
    const assignmentDate = new Date(assignment.dueDate);
    return assignmentDate.toDateString() === date.toDateString();
  });

  if (dateAssignments.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
        No assignments due on this date.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {dateAssignments.map(assignment => (
        <div key={assignment.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white">{assignment.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.subject}</p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge className={`text-xs ${assignment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {assignment.status}
            </Badge>
            <Badge className={`text-xs ${assignment.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
              {assignment.priority}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}