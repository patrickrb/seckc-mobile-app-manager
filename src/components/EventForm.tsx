'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { Plus, Minus } from 'lucide-react';
import { createEvent, updateEvent, getEvents } from '@/lib/events';
import { parseEventDateToInputFormat, formatInputDateToEventDate } from '@/lib/dateUtils';

interface EventFormProps {
  eventId?: string;
}

export default function EventForm({ eventId }: EventFormProps) {
  // Basic fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [eventUrl, setEventUrl] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [isPublished, setIsPublished] = useState(false);
  const [isVirtual, setIsVirtual] = useState(false);
  const [rsvpCount, setRsvpCount] = useState('0');
  
  // Array fields
  const [speakerNames, setSpeakerNames] = useState<string[]>(['']);
  const [topics, setTopics] = useState<string[]>(['']);
  
  // Object fields
  const [sponsorLinks, setSponsorLinks] = useState<Record<string, string>>({});
  const [sponsorOrder, setSponsorOrder] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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
            setAddress(eventToEdit.address || '');
            setEventUrl(eventToEdit.eventUrl || '');
            setDifficultyLevel(eventToEdit.difficultyLevel || 'beginner');
            setIsPublished(eventToEdit.isPublished || false);
            setIsVirtual(eventToEdit.isVirtual || false);
            setRsvpCount(eventToEdit.rsvpCount?.toString() || '0');
            setSpeakerNames(eventToEdit.speakerNames && eventToEdit.speakerNames.length > 0 ? eventToEdit.speakerNames : ['']);
            setTopics(eventToEdit.topics && eventToEdit.topics.length > 0 ? eventToEdit.topics : ['']);
            setSponsorLinks(eventToEdit.sponsorLinks || {});
            setSponsorOrder(eventToEdit.sponsorOrder || []);
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
        address,
        eventUrl,
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
      Object.keys(eventData).forEach(key => {
        const value = eventData[key as keyof typeof eventData];
        if (value === '' || (Array.isArray(value) && value.length === 0) || 
            (typeof value === 'object' && value !== null && Object.keys(value).length === 0)) {
          delete eventData[key as keyof typeof eventData];
        }
      });

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

  // Speaker management
  const addSpeaker = () => {
    setSpeakerNames([...speakerNames, '']);
  };

  const updateSpeaker = (index: number, value: string) => {
    const updated = [...speakerNames];
    updated[index] = value;
    setSpeakerNames(updated);
  };

  const removeSpeaker = (index: number) => {
    if (speakerNames.length > 1) {
      setSpeakerNames(speakerNames.filter((_, i) => i !== index));
    }
  };

  // Topic management
  const addTopic = () => {
    setTopics([...topics, '']);
  };

  const updateTopic = (index: number, value: string) => {
    const updated = [...topics];
    updated[index] = value;
    setTopics(updated);
  };

  const removeTopic = (index: number) => {
    if (topics.length > 1) {
      setTopics(topics.filter((_, i) => i !== index));
    }
  };

  // Sponsor management
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          {eventId ? 'Edit Event' : 'Create New Event'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Basic Information</h4>
            
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
                <Label htmlFor="eventUrl">Event URL</Label>
                <Input
                  id="eventUrl"
                  value={eventUrl}
                  onChange={(e) => setEventUrl(e.target.value)}
                  placeholder="https://..."
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficultyLevel">Difficulty Level</Label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger className="h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rsvpCount">RSVP Count</Label>
                <Input
                  id="rsvpCount"
                  type="number"
                  value={rsvpCount}
                  onChange={(e) => setRsvpCount(e.target.value)}
                  min="0"
                  className="h-11"
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
                <Label htmlFor="published">Published</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="virtual"
                  checked={isVirtual}
                  onCheckedChange={setIsVirtual}
                />
                <Label htmlFor="virtual">Virtual Event</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Location</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Venue Name</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Venue name"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Full address"
                  className="h-11"
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
                  className="flex-1 h-11"
                />
                {speakerNames.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSpeaker(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
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
                  className="flex-1 h-11"
                />
                {topics.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTopic(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
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
              <div key={name} className="space-y-2 p-4 border rounded">
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => updateSponsorName(name, e.target.value)}
                    placeholder="Sponsor name"
                    className="flex-1 h-11"
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
                  className="h-11"
                />
              </div>
            ))}
          </div>

          <Separator />

          {/* Form Actions */}
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