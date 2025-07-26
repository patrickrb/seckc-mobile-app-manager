'use client'

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Edit, Trash2, Calendar, MapPin, Save, X, Check, Plus, Minus, Users, Link, Award, Globe, Home, Clock } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Event } from '@/types/event';
import { updateEvent } from '@/lib/events';
import { formatEventDateForDisplay, parseEventDateToInputFormat, formatInputDateToEventDate } from '@/lib/dateUtils';

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}

export default function EventCard({ event, onDelete, onUpdate }: EventCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  
  // Form state
  const [title, setTitle] = useState(event.title || '');
  const [description, setDescription] = useState(event.description || '');
  const [location, setLocation] = useState(event.location || '');
  const [address, setAddress] = useState(event.address || '');
  const [eventDate, setEventDate] = useState(parseEventDateToInputFormat(event.eventDate || ''));
  const [eventUrl, setEventUrl] = useState(event.eventUrl || '');
  const [difficultyLevel, setDifficultyLevel] = useState(event.difficultyLevel || 'beginner');
  const [isPublished, setIsPublished] = useState(event.isPublished || false);
  const [isVirtual, setIsVirtual] = useState(event.isVirtual || false);
  const [rsvpCount, setRsvpCount] = useState(event.rsvpCount?.toString() || '0');
  const [speakerNames, setSpeakerNames] = useState<string[]>(event.speakerNames || []);
  const [topics, setTopics] = useState<string[]>(event.topics || []);
  const [sponsorLinks, setSponsorLinks] = useState<Record<string, string>>(event.sponsorLinks || {});
  const [sponsorOrder, setSponsorOrder] = useState<string[]>(event.sponsorOrder || []);
  
  const [isUpdating, setIsUpdating] = useState(false);

  const resetFormState = () => {
    setTitle(event.title || '');
    setDescription(event.description || '');
    setLocation(event.location || '');
    setAddress(event.address || '');
    setEventDate(parseEventDateToInputFormat(event.eventDate || ''));
    setEventUrl(event.eventUrl || '');
    setDifficultyLevel(event.difficultyLevel || 'beginner');
    setIsPublished(event.isPublished || false);
    setIsVirtual(event.isVirtual || false);
    setRsvpCount(event.rsvpCount?.toString() || '0');
    setSpeakerNames(event.speakerNames || []);
    setTopics(event.topics || []);
    setSponsorLinks(event.sponsorLinks || {});
    setSponsorOrder(event.sponsorOrder || []);
  };

  const handleEdit = () => {
    setIsEditing(true);
    resetFormState();
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingField(null);
    resetFormState();
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: Partial<Event> = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        address: address.trim(),
        eventDate: formatInputDateToEventDate(eventDate),
        eventUrl: eventUrl.trim(),
        difficultyLevel,
        isPublished,
        isVirtual,
        rsvpCount: parseInt(rsvpCount) || 0,
        speakerNames: speakerNames.filter(name => name.trim()),
        topics: topics.filter(topic => topic.trim()),
        sponsorLinks,
        sponsorOrder: sponsorOrder.filter(sponsor => sponsor.trim()),
      };

      // Remove empty fields
      Object.keys(updateData).forEach(key => {
        const value = updateData[key as keyof Event];
        if (value === '' || (Array.isArray(value) && value.length === 0) || 
            (typeof value === 'object' && value !== null && Object.keys(value).length === 0)) {
          delete updateData[key as keyof Event];
        }
      });

      await updateEvent(event.id!, updateData);
      toast.success('Event updated successfully');
      setIsEditing(false);
      setEditingField(null);
      onUpdate();
    } catch (error: unknown) {
      toast.error('Error updating event', {
        description: error instanceof Error ? error.message : 'Failed to update event',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const addSpeaker = () => {
    setSpeakerNames([...speakerNames, '']);
  };

  const updateSpeaker = (index: number, value: string) => {
    const updated = [...speakerNames];
    updated[index] = value;
    setSpeakerNames(updated);
  };

  const removeSpeaker = (index: number) => {
    setSpeakerNames(speakerNames.filter((_, i) => i !== index));
  };

  const addTopic = () => {
    setTopics([...topics, '']);
  };

  const updateTopic = (index: number, value: string) => {
    const updated = [...topics];
    updated[index] = value;
    setTopics(updated);
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const addSponsor = () => {
    const newSponsorName = `Sponsor ${Object.keys(sponsorLinks).length + 1}`;
    setSponsorLinks({ ...sponsorLinks, [newSponsorName]: '' });
    setSponsorOrder([...sponsorOrder, newSponsorName]);
  };

  const updateSponsorName = (oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    const newLinks = { ...sponsorLinks };
    const url = newLinks[oldName];
    delete newLinks[oldName];
    newLinks[newName] = url;
    setSponsorLinks(newLinks);
    
    const newOrder = sponsorOrder.map(name => name === oldName ? newName : name);
    setSponsorOrder(newOrder);
  };

  const updateSponsorUrl = (name: string, url: string) => {
    setSponsorLinks({ ...sponsorLinks, [name]: url });
  };

  const removeSponsor = (name: string) => {
    const newLinks = { ...sponsorLinks };
    delete newLinks[name];
    setSponsorLinks(newLinks);
    setSponsorOrder(sponsorOrder.filter(sponsor => sponsor !== name));
  };

  if (isEditing) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Editing Event</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isUpdating}
                className="gap-1"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isUpdating}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                {isUpdating ? 'Saving...' : 'Save All'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Basic Information</h4>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                className="text-lg font-semibold"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Description *</label>
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit" className="mt-2">
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="Write your description in Markdown..."
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-2">
                  <div className="min-h-[150px] p-3 border rounded-md bg-gray-50">
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
          </div>

          <Separator />

          {/* Event Details */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Event Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Date and Time *</label>
                <Input
                  type="datetime-local"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Event URL</label>
                <Input
                  value={eventUrl}
                  onChange={(e) => setEventUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Difficulty Level</label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">RSVP Count</label>
                <Input
                  type="number"
                  value={rsvpCount}
                  onChange={(e) => setRsvpCount(e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <label htmlFor="published" className="text-sm font-medium">Published</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="virtual"
                  checked={isVirtual}
                  onCheckedChange={setIsVirtual}
                />
                <label htmlFor="virtual" className="text-sm font-medium">Virtual Event</label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Location</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Venue Name</label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Venue name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Address</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full address"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Speakers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">Speakers</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSpeaker}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Speaker
              </Button>
            </div>
            
            {speakerNames.map((speaker, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={speaker}
                  onChange={(e) => updateSpeaker(index, e.target.value)}
                  placeholder="Speaker name"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeSpeaker(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Topics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">Topics</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTopic}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Topic
              </Button>
            </div>
            
            {topics.map((topic, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={topic}
                  onChange={(e) => updateTopic(index, e.target.value)}
                  placeholder="Topic"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeTopic(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <Separator />

          {/* Sponsors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">Sponsors</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSponsor}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add Sponsor
              </Button>
            </div>
            
            {Object.entries(sponsorLinks).map(([name, url]) => (
              <div key={name} className="space-y-2 p-3 border rounded">
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => updateSponsorName(name, e.target.value)}
                    placeholder="Sponsor name"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSponsor(name)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  value={url}
                  onChange={(e) => updateSponsorUrl(name, e.target.value)}
                  placeholder="Sponsor URL"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

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