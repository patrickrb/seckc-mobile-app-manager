import { Timestamp } from 'firebase/firestore';

export interface Event {
  id?: string;
  title: string;
  description: string;
  eventDate: string | Timestamp; // Can be Firebase Timestamp or human-readable string
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional properties found in the data
  speakerNames?: string[];
  rsvpCount?: number;
  sponsorLinks?: Record<string, string>;
  eventUrl?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  isPublished?: boolean;
  sponsorOrder?: string[];
  topics?: string[];
  address?: string;
  isVirtual?: boolean;
}