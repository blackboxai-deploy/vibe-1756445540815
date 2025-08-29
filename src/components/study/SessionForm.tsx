'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStudyData } from '@/hooks/useStudyData';
import { StudySession } from '@/lib/types';
import { generateId } from '@/lib/storage';
import { toast } from 'sonner';

interface SessionFormProps {
  onSubmit: (session: StudySession) => void;
}

export function SessionForm({ onSubmit }: SessionFormProps) {
  const { subjects } = useStudyData();
  const [formData, setFormData] = useState({
    subjectId: '',
    duration: 25, // in minutes
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subjectId) {
      toast.error('Please select a subject.');
      return;
    }

    const subject = subjects.find(s => s.id === formData.subjectId);
    const now = new Date();
    const startTime = new Date(now.getTime() - (formData.duration * 60 * 1000));

    const session: StudySession = {
      id: generateId(),
      subject: subject?.name || 'Unknown Subject',
      subjectId: formData.subjectId,
      duration: formData.duration * 60, // Convert to seconds
      startTime,
      endTime: now,
      notes: formData.notes,
      date: formData.date,
      isCompleted: true,
      type: 'focus'
    };

    onSubmit(session);
    
    // Reset form
    setFormData({
      subjectId: '',
      duration: 25,
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    toast.success(`${formData.duration}-minute study session recorded!`);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Subject Selection */}
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Select 
          value={formData.subjectId} 
          onValueChange={(value) => handleInputChange('subjectId', value)}
        >
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
        
        {subjects.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Create a subject first to add manual sessions
          </p>
        )}
      </div>

      {/* Duration and Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min="1"
            max="480"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 1)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Session Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Session Notes (optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="What did you study or accomplish during this session?"
          rows={3}
        />
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full"
        disabled={subjects.length === 0 || !formData.subjectId}
      >
        Record Study Session
      </Button>
      
      {subjects.length === 0 && (
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Create your first subject to start recording study sessions
        </p>
      )}
    </form>
  );
}