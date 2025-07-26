import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Event } from '@/types/event';

const COLLECTION_NAME = 'events';

export const eventsCollection = collection(db, COLLECTION_NAME);

export const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date();
  const docRef = await addDoc(eventsCollection, {
    ...eventData,
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  return docRef.id;
};

export const getEvents = async (): Promise<Event[]> => {
  const q = query(eventsCollection, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      eventDate: data.eventDate,
    };
  }) as Event[];
};

export const updateEvent = async (id: string, eventData: Partial<Event>) => {
  const eventRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(eventRef, {
    ...eventData,
    updatedAt: Timestamp.fromDate(new Date()),
  });
};

export const deleteEvent = async (id: string) => {
  const eventRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(eventRef);
};