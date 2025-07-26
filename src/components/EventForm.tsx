'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { createEvent, updateEvent, getEvents } from '@/lib/events';
import { parseEventDateToInputFormat, formatInputDateToEventDate } from '@/lib/dateUtils';

export default function EventForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');

  // Load events and find the one being edited
  useEffect(() => {
    const loadEvent = async () => {
      if (eventId) {
        try {
          const eventsData = await getEvents();
          const eventToEdit = eventsData.find(e => e.id === eventId);
          if (eventToEdit) {
            setTitle(eventToEdit.title || '');
            setDescription(eventToEdit.description || '');
            setDate(parseEventDateToInputFormat(eventToEdit.eventDate || ''));
            setLocation(eventToEdit.location || '');
          }
        } catch {
          toast.error('Error loading event', {
            description: 'Could not load event details',
          });
        }
      }
    };
    loadEvent();
  }, [eventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const eventData = {
        title,
        description,
        eventDate: formatInputDateToEventDate(date),
        location,
      };

      if (eventId) {
        await updateEvent(eventId, eventData);
        toast.success('Event updated successfully');
      } else {
        await createEvent(eventData);
        toast.success('Event created successfully');
      }

      router.push('/');
    } catch (error: unknown) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };


  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {eventId ? 'Edit Event' : 'Create New Event'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-2">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Write your description in Markdown..."
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-2">
                <div className="min-h-[100px] p-3 border rounded-md bg-gray-50">
                  {description ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown>{description}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Nothing to preview yet...</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date and Time *</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Saving...' : eventId ? 'Update Event' : 'Create Event'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}