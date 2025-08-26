import { useState, useEffect } from 'react';
import { Cleaner, CleaningAssignment, CleaningTask } from '@/types/booking';
import { cleanerUtils, cleaningAssignmentUtils } from '@/lib/firestore';

export const useCleaners = () => {
  const [cleaners, setCleaners] = useState<Cleaner[]>([]);
  const [assignments, setAssignments] = useState<CleaningAssignment[]>([]);
  const [tasks, setTasks] = useState<CleaningTask[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, { month: string; dates: string[] }>>({}); // cleanerId -> {month, dates}
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCleaners = async () => {
    try {
      setLoading(true);
      const cleanersData = await cleanerUtils.getAllActive();
      const nonAdmins = cleanersData.filter((c: any) => (c.role || 'cleaner') !== 'admin');
      setCleaners(nonAdmins);
      setError(null);
    } catch (err) {
      console.error('Error loading cleaners:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cleaners');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const assignmentsData = await cleaningAssignmentUtils.getAll();
      
      // Convert the new structure to the old structure for backward compatibility
      const convertedAssignments = assignmentsData.map((assignment: any) => ({
        id: assignment.id, // Use Firestore document ID
        date: assignment.currentCleaningDate,
        bookingId: assignment.bookingId,
        cleanerId: assignment.cleanerId,
        status: assignment.cleanerId ? 'assigned' : 'unassigned',
        assignedAt: assignment.updatedAt,
        completedAt: null
      }));
      
      setAssignments(convertedAssignments);
    } catch (err) {
      console.error('Error loading assignments:', err);
      setAssignments([]);
    }
  };

  const loadTasks = async () => {
    // Cleaning tasks functionality not implemented yet
    // This will be added in a future update
    setTasks([]);
  };

  const assignCleaner = async (
    assignment: Omit<CleaningAssignment, 'id' | 'assignedAt'> & { originalBookingDate?: string; guestName?: string }
  ) => {
    try {
      // Find the cleaner name
      const cleaner = cleaners.find(c => c.id === assignment.cleanerId);
      const cleanerName = cleaner?.name || '';

      if (!cleaner) {
        throw new Error('Cleaner not found');
      }

      console.log('Assigning cleaner:', {
        date: assignment.date,
        cleanerId: assignment.cleanerId,
        cleanerName: cleanerName,
        bookingId: assignment.bookingId
      });

      // Use direct Firestore operation
      await cleaningAssignmentUtils.updateCleaner(
        assignment.date,
        assignment.bookingId,
        assignment.cleanerId,
        cleanerName
      );

      // Refresh assignments
      await loadAssignments();
    } catch (err) {
      console.error('Error assigning cleaner:', err);
      throw err;
    }
  };



  const updateAssignmentStatus = async (assignmentId: string, status: CleaningAssignment['status']) => {
    try {
      // Find the assignment to get the date
      const assignment = assignments.find(a => a.id === assignmentId);
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // For now, we'll just update the local state since the new structure doesn't have status
      // In the future, we can add status tracking to the new cleaning assignments structure
      setAssignments(prev => prev.map(a => 
        a.id === assignmentId 
          ? { 
              ...a, 
              status,
              completedAt: status === 'completed' ? new Date().toISOString() : a.completedAt
            }
          : a
      ));
    } catch (err) {
      console.error('Error updating assignment status:', err);
      throw err;
    }
  };

  const unassignCleaner = async (assignmentId: string) => {
    try {
      console.log('Unassigning cleaner for assignment ID:', assignmentId);
      
      // The assignmentId might be the date itself (from new Firestore structure)
      // or it might be the old ID structure
      let assignment = assignments.find(a => a.id === assignmentId);
      
      // If not found, try to find by date (for new Firestore structure)
      if (!assignment) {
        assignment = assignments.find(a => a.date === assignmentId);
      }
      
      if (!assignment) {
        console.error('Assignment not found in assignments array:', assignments);
        console.error('Looking for assignmentId:', assignmentId);
        throw new Error('Assignment not found');
      }

      console.log('Found assignment:', assignment);

      // Use direct Firestore operation
      await cleaningAssignmentUtils.unassignCleaner(assignment.date, assignment.bookingId);

      // Update local state to remove cleaner assignment
      setAssignments(prev => prev.map(a => 
        a.id === assignmentId || a.date === assignmentId
          ? { ...a, cleanerId: null, status: 'unassigned' }
          : a
      ));

      // Refresh assignments to get the latest data from Firestore
      await loadAssignments();
    } catch (err) {
      console.error('Error unassigning cleaner:', err);
      throw err;
    }
  };

  const getAssignmentsForDate = (date: string): CleaningAssignment[] => {
    return assignments.filter(assignment => assignment.date === date);
  };

  const getAvailableCleaners = (date: string): Cleaner[] => {
    // For now, return all active cleaners
    // In the future, this could check availability
    return cleaners.filter(cleaner => cleaner.isActive);
  };

  const createCleaner = async (cleanerData: Omit<Cleaner, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await cleanerUtils.create(cleanerData);
      await loadCleaners(); // Refresh the list
    } catch (err) {
      console.error('Error creating cleaner:', err);
      throw err;
    }
  };

  const updateCleaner = async (id: string, data: Partial<Cleaner>) => {
    try {
      await cleanerUtils.update(id, data);
      await loadCleaners(); // Refresh the list
    } catch (err) {
      console.error('Error updating cleaner:', err);
      throw err;
    }
  };

  const deleteCleaner = async (id: string) => {
    try {
      await cleanerUtils.softDelete(id);
      await loadCleaners(); // Refresh the list
    } catch (err) {
      console.error('Error deleting cleaner:', err);
      throw err;
    }
  };

  const refetch = async () => {
    await Promise.all([
      loadCleaners(),
      loadAssignments(),
      loadTasks()
    ]);
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    cleaners,
    assignments,
    tasks,
    availabilityMap,
    loading,
    error,
    loadCleaners,
    loadAssignments,
    loadTasks,
    assignCleaner,
    updateAssignmentStatus,
    unassignCleaner,
    getAssignmentsForDate,
    getAvailableCleaners,
    createCleaner,
    updateCleaner,
    deleteCleaner,
    refetch
  };
}; 