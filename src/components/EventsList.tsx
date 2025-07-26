'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Event } from '@/types/event';
import { getEvents, deleteEvent } from '@/lib/events';
import EventCard from './EventCard';

export default function EventsList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  console.log("events: ", JSON.stringify(events));

  const loadEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (error: unknown) {
      toast.error('Error loading events', {
        description: error instanceof Error ? error.message : 'Failed to load events',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await getEvents();
        setEvents(eventsData);
      } catch (error: unknown) {
        toast.error('Error loading events', {
          description: error instanceof Error ? error.message : 'Failed to load events',
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleCreateEvent = () => {
    router.push('/events');
  };

  const handleDeleteEvent = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        toast.success('Event deleted successfully');
        loadEvents();
      } catch (error: unknown) {
        toast.error('Error deleting event', {
          description: error instanceof Error ? error.message : 'Failed to delete event',
        });
      }
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Events Management</h1>
        <Button onClick={handleCreateEvent} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      <div className="space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No events found. Create your first event!</p>
          </div>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={handleDeleteEvent}
              onUpdate={loadEvents}
            />
          ))
        )}
      </div>
    </div>
  );
}