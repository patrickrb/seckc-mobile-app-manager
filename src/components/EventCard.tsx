'use client'

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Calendar, MapPin, Users, Link, Award, Home } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Event } from '@/types/event';
import { formatEventDateForDisplay } from '@/lib/dateUtils';

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

export default function EventCard({ event, onDelete, onUpdate }: EventCardProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/events/${event.id}/edit`);
  };


  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">{event.title}</h3>
              <Badge variant="secondary">Event</Badge>
              {event.isPublished && <Badge variant="default">Published</Badge>}
              {event.isVirtual && <Badge variant="outline">Virtual</Badge>}
              {event.difficultyLevel && (
                <Badge variant="outline">
                  <Award className="h-3 w-3 mr-1" />
                  {event.difficultyLevel}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="gap-1"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(event.id!)}
                className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="text-gray-600 prose prose-sm max-w-none">
            <ReactMarkdown>{event.description}</ReactMarkdown>
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {event.eventDate ? formatEventDateForDisplay(event.eventDate) : 'No date'}
            </div>
            
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {event.location}
              </div>
            )}

            {event.address && (
              <div className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                {event.address}
              </div>
            )}

            {event.eventUrl && (
              <div className="flex items-center gap-1">
                <Link className="h-4 w-4" />
                <a href={event.eventUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Event Page
                </a>
              </div>
            )}

            {event.rsvpCount !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {event.rsvpCount} RSVPs
              </div>
            )}
          </div>

          {/* Speakers */}
          {event.speakerNames && event.speakerNames.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Speakers</h5>
              <div className="flex flex-wrap gap-2">
                {event.speakerNames.map((speaker, index) => (
                  <Badge key={index} variant="outline">{speaker}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Topics */}
          {event.topics && event.topics.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Topics</h5>
              <div className="flex flex-wrap gap-2">
                {event.topics.map((topic, index) => (
                  <Badge key={index} variant="secondary">{topic}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sponsors */}
          {event.sponsorLinks && Object.keys(event.sponsorLinks).length > 0 && (
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Sponsors</h5>
              <div className="flex flex-wrap gap-2">
                {Object.entries(event.sponsorLinks).map(([name, url]) => (
                  <Badge key={name} variant="outline" className="cursor-pointer">
                    <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {name}
                    </a>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}