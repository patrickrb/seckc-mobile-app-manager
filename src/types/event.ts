import { Timestamp } from 'firebase/firestore';

export interface Event {
  id?: string;
  title: string;
  description: string;
  eventDate: string | Timestamp; // Can be Firebase Timestamp or human-readable string
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}