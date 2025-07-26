/**
 * Utility functions for handling date formats in the app
 */
import { Timestamp } from 'firebase/firestore';

/**
 * Converts a Firebase Timestamp or human-readable date string like "July 8, 2025 at 5:00:00 PM UTC-5"
 * to a format suitable for datetime-local input (YYYY-MM-DDTHH:MM)
 */
export function parseEventDateToInputFormat(eventDate: string | Timestamp): string {
  try {
    if (!eventDate) return '';
    
    let date: Date;
    
    // Handle Firebase Timestamp
    if (eventDate instanceof Timestamp) {
      date = eventDate.toDate();
    } else {
      // Handle string format "July 8, 2025 at 5:00:00 PM UTC-5"
      // Convert "at" to a space and remove timezone info for better parsing
      const normalizedDate = eventDate
        .replace(' at ', ' ')
        .replace(/\s+UTC[+-]\d+/, ''); // Remove timezone
      
      date = new Date(normalizedDate);
      
      if (isNaN(date.getTime())) {
        // Try alternative parsing if the first attempt fails
        const isoString = eventDate.replace(' at ', 'T').replace(/\s+UTC[+-]\d+/, '');
        const fallbackDate = new Date(isoString);
        if (!isNaN(fallbackDate.getTime())) {
          date = fallbackDate;
        } else {
          return '';
        }
      }
    }
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Convert to local time and format for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Error parsing event date:', error);
    return '';
  }
}

/**
 * Converts a datetime-local input value (YYYY-MM-DDTHH:MM) 
 * to a human-readable format like "July 8, 2025 at 5:00:00 PM UTC-5"
 */
export function formatInputDateToEventDate(inputDateString: string): string {
  try {
    if (!inputDateString) return '';
    
    // Create date from the input string (this will be in local time)
    const date = new Date(inputDateString);
    
    if (isNaN(date.getTime())) {
      return inputDateString; // Return original if parsing fails
    }
    
    // Format to human-readable string with timezone
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    };
    
    return date.toLocaleString('en-US', options);
  } catch (error) {
    console.error('Error formatting input date:', error);
    return inputDateString;
  }
}

/**
 * Formats a Firebase Timestamp or event date string for display in the UI
 */
export function formatEventDateForDisplay(eventDate: string | Timestamp): string {
  try {
    if (!eventDate) {
      return 'No date provided';
    }
    
    let date: Date;
    
    // Handle Firebase Timestamp
    if (eventDate instanceof Timestamp) {
      date = eventDate.toDate();
    } else if (typeof eventDate === 'object' && eventDate && 'seconds' in eventDate) {
      // Handle serialized Timestamp object
      const timestampLike = eventDate as { seconds: number; nanoseconds?: number };
      const seconds = timestampLike.seconds;
      const nanoseconds = timestampLike.nanoseconds || 0;
      date = new Date(seconds * 1000 + nanoseconds / 1000000);
    } else {
      // Handle string format
      // First try to parse as-is (works for most formats including our target format)
      date = new Date(eventDate as string);
      
      // If that fails, try our normalization approach
      if (isNaN(date.getTime())) {
        const normalizedDate = (eventDate as string)
          .replace(' at ', ' ')
          .replace(/\s+UTC[+-]\d+/, '');
        date = new Date(normalizedDate);
      }
    }
    
    if (isNaN(date.getTime())) {
      return typeof eventDate === 'string' ? eventDate : 'Invalid date';
    }
    
    // Format for display (shorter format)
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    };
    
    return date.toLocaleString('en-US', options);
  } catch (error) {
    console.error('Error formatting event date for display:', error);
    return typeof eventDate === 'string' ? eventDate : 'Invalid date';
  }
}