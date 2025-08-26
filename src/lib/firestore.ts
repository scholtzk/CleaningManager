import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Generic CRUD operations
export const firestoreUtils = {
  // Get all documents from a collection
  async getAll<T>(collectionName: string): Promise<T[]> {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
  },

  // Get documents with filters
  async getWhere<T>(collectionName: string, field: string, operator: any, value: any): Promise<T[]> {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
  },

  // Get a single document by ID
  async getById<T>(collectionName: string, id: string): Promise<T | null> {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  },

  // Add a new document
  async add<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  // Update a document
  async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  // Delete a document
  async delete(collectionName: string, id: string): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  },

  // Set a document with a specific ID
  async set<T>(collectionName: string, id: string, data: Omit<T, 'id'>): Promise<void> {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  }
};

// Specific operations for cleaners
export const cleanerUtils = {
  async getAllActive(): Promise<any[]> {
    return firestoreUtils.getWhere('cleaners', 'isActive', '==', true);
  },

  async create(cleanerData: any): Promise<string> {
    return firestoreUtils.add('cleaners', {
      ...cleanerData,
      isActive: true,
      role: cleanerData.role || 'cleaner'
    });
  },

  async update(id: string, data: any): Promise<void> {
    return firestoreUtils.update('cleaners', id, data);
  },

  async softDelete(id: string): Promise<void> {
    return firestoreUtils.update('cleaners', id, { isActive: false });
  }
};

// Specific operations for cleaning assignments
export const cleaningAssignmentUtils = {
  async getAll(): Promise<any[]> {
    return firestoreUtils.getAll('cleaning-assignments');
  },

  async getByDate(date: string): Promise<any[]> {
    return firestoreUtils.getWhere('cleaning-assignments', 'currentCleaningDate', '==', date);
  },

  async createOrUpdate(assignmentData: any): Promise<void> {
    const docId = `${assignmentData.originalBookingDate}_${assignmentData.bookingId}`;
    const docRef = doc(db, 'cleaning-assignments', docId);
    await updateDoc(docRef, {
      ...assignmentData,
      updatedAt: serverTimestamp()
    });
  },

  async updateCleaner(date: string, bookingId: string, cleanerId: string | null, cleanerName: string | null): Promise<void> {
    const assignments = await firestoreUtils.getWhere('cleaning-assignments', 'bookingId', '==', bookingId);
    const matchingAssignment = assignments.find(a => a.currentCleaningDate === date || a.originalBookingDate === date);
    
    if (matchingAssignment) {
      await firestoreUtils.update('cleaning-assignments', matchingAssignment.id, { 
        cleanerId, 
        cleanerName 
      });
    }
  },

  async delete(date: string): Promise<void> {
    const assignments = await firestoreUtils.getWhere('cleaning-assignments', 'currentCleaningDate', '==', date);
    if (assignments.length > 0) {
      await firestoreUtils.delete('cleaning-assignments', assignments[0].id);
    }
  },

  async syncFromBookings(bookings: any[]): Promise<void> {
    const batch = writeBatch(db);
    const existingAssignments = await this.getAll();
    const existingMap = new Map(existingAssignments.map(a => a.id));

    for (const booking of bookings) {
      if (booking.cleaningRequired) {
        const docId = `${booking.checkOut}_${booking.id}`;
        const assignmentData = {
          originalBookingDate: booking.checkOut,
          currentCleaningDate: booking.checkOut,
          bookingId: booking.id,
          guestName: booking.guestName,
          cleanerId: null,
          cleanerName: null,
          bookingDateChanged: false
        };

        const docRef = doc(db, 'cleaning-assignments', docId);
        batch.set(docRef, {
          ...assignmentData,
          updatedAt: serverTimestamp()
        });
      }
    }

    await batch.commit();
  }
};

// Specific operations for cleaner availability
export const availabilityUtils = {
  async getByCleanerAndMonth(cleanerId: string, month: string): Promise<any | null> {
    const availabilities = await firestoreUtils.getWhere('cleaner_availability', 'cleanerId', '==', cleanerId);
    const monthAvailability = availabilities.find(a => a.month === month);
    return monthAvailability || null;
  },

  async updateAvailability(cleanerId: string, month: string, availableDates: string[]): Promise<void> {
    const existing = await this.getByCleanerAndMonth(cleanerId, month);
    
    if (existing) {
      await firestoreUtils.update('cleaner_availability', existing.id, { availableDates });
    } else {
      await firestoreUtils.add('cleaner_availability', {
        cleanerId,
        month,
        availableDates
      });
    }
  }
};

// Specific operations for availability links
export const availabilityLinkUtils = {
  async getAll(): Promise<any[]> {
    return firestoreUtils.getAll('availability_links');
  },

  async getByLink(uniqueLink: string): Promise<any | null> {
    const links = await firestoreUtils.getWhere('availability_links', 'uniqueLink', '==', uniqueLink);
    return links.find(l => l.isActive) || null;
  },

  async create(linkData: any): Promise<string> {
    return firestoreUtils.add('availability_links', {
      ...linkData,
      isActive: true
    });
  },

  async deactivate(id: string): Promise<void> {
    return firestoreUtils.update('availability_links', id, { isActive: false });
  }
};
