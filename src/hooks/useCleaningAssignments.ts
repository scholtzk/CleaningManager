import { useState, useEffect } from 'react';
import { cleaningAssignmentUtils } from '@/lib/firestore';

interface CleaningAssignment {
  date: string;
  originalBookingDate: string;
  currentCleaningDate: string;
  bookingId: string;
  guestName: string;
  cleanerId: string | null;
  cleanerName: string | null;
  bookingDateChanged: boolean;
  updatedAt: any;
}

interface UseCleaningAssignmentsReturn {
  cleaningAssignments: CleaningAssignment[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createOrUpdateAssignment: (assignment: Partial<CleaningAssignment>) => Promise<void>;
  updateCleanerAssignment: (date: string, cleanerId: string | null, cleanerName: string | null) => Promise<void>;
  deleteAssignment: (date: string) => Promise<void>;
  syncAssignments: (bookings: any[]) => Promise<void>;
  updateAssignmentOptimistically: (assignment: Partial<CleaningAssignment>) => void;
}

export const useCleaningAssignments = (): UseCleaningAssignmentsReturn => {
  const [cleaningAssignments, setCleaningAssignments] = useState<CleaningAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const assignmentsData = await cleaningAssignmentUtils.getAll();
      setCleaningAssignments(assignmentsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateAssignment = async (assignment: Partial<CleaningAssignment>) => {
    try {
      await cleaningAssignmentUtils.createOrUpdate(assignment);
      // Refetch to get updated data
      await fetchAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateCleanerAssignment = async (date: string, cleanerId: string | null, cleanerName: string | null) => {
    try {
      // Find the assignment for this date
      const assignment = cleaningAssignments.find(a => a.currentCleaningDate === date);
      if (!assignment) {
        throw new Error('Assignment not found for this date');
      }

      await cleaningAssignmentUtils.updateCleaner(date, assignment.bookingId, cleanerId, cleanerName);
      // Refetch to get updated data
      await fetchAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteAssignment = async (date: string) => {
    try {
      await cleaningAssignmentUtils.delete(date);
      // Refetch to get updated data
      await fetchAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const syncAssignments = async (bookings: any[]) => {
    try {
      await cleaningAssignmentUtils.syncFromBookings(bookings);
      // Refetch to get updated data
      await fetchAssignments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateAssignmentOptimistically = (assignment: Partial<CleaningAssignment>) => {
    // Update local state immediately for better UX
    setCleaningAssignments(prev => 
      prev.map(a => {
        if (a.currentCleaningDate === assignment.currentCleaningDate && a.bookingId === assignment.bookingId) {
          return { ...a, ...assignment };
        }
        return a;
      })
    );
  };

  const migrateOldAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting migration of old cleaning assignments...');
      
      const allAssignments = await cleaningAssignmentUtils.getAll();
      let migrationCount = 0;

      for (const assignment of allAssignments) {
        // Check if this is an old format document (simple date ID)
        const isOldFormat = /^\d{4}-\d{2}-\d{2}$/.test(assignment.id);
        
        if (isOldFormat && assignment.bookingId) {
          // Create new document with composite ID
          const newAssignment = {
            ...assignment,
            id: `${assignment.originalBookingDate}_${assignment.bookingId}`
          };
          
          // Create the new document
          await cleaningAssignmentUtils.createOrUpdate(newAssignment);
          
          // Delete the old document (we'll need to add a delete function)
          // For now, we'll just log it
          console.log(`Would migrate: ${assignment.id} → ${newAssignment.id}`);
          migrationCount++;
        }
      }

      if (migrationCount > 0) {
        console.log(`✅ Migration complete: ${migrationCount} documents would be migrated`);
        // Refetch to get updated data
        await fetchAssignments();
      } else {
        console.log('✅ No documents need migration');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return {
    cleaningAssignments,
    loading,
    error,
    refetch: fetchAssignments,
    createOrUpdateAssignment,
    updateCleanerAssignment,
    deleteAssignment,
    syncAssignments,
    updateAssignmentOptimistically,
    migrateOldAssignments
  };
}; 