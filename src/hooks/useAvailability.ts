import { useState, useEffect } from 'react';
import { CleanerAvailability, CleanerAvailabilityLink } from '@/types/booking';
import { availabilityUtils, availabilityLinkUtils } from '@/lib/firestore';
import { v4 as uuidv4 } from 'uuid';

export const useAvailability = () => {
  const [availability, setAvailability] = useState<CleanerAvailability | null>(null);
  const [availabilityLinks, setAvailabilityLinks] = useState<CleanerAvailabilityLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCleanerAvailability = async (cleanerId: string, month: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const availabilityData = await availabilityUtils.getByCleanerAndMonth(cleanerId, month);
      
      if (availabilityData) {
        setAvailability(availabilityData);
      } else {
        // Create new availability record
        const newAvailability: CleanerAvailability = {
          id: `temp-${cleanerId}-${month}`,
          cleanerId,
          month,
          availableDates: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setAvailability(newAvailability);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  const updateCleanerAvailability = async (cleanerId: string, month: string, availableDates: string[]) => {
    try {
      setLoading(true);
      setError(null);
      
      await availabilityUtils.updateAvailability(cleanerId, month, availableDates);
      
      // Update local state
      setAvailability(prev => prev ? {
        ...prev,
        availableDates,
        updatedAt: new Date().toISOString()
      } : null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
    } finally {
      setLoading(false);
    }
  };

  const getAllAvailabilityLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const linksData = await availabilityLinkUtils.getAll();
      setAvailabilityLinks(linksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch availability links');
    } finally {
      setLoading(false);
    }
  };

  const createAvailabilityLink = async (cleanerId: string, cleanerName: string, month: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const uniqueLink = uuidv4();
      const linkData = {
        cleanerId,
        cleanerName,
        month,
        uniqueLink
      };
      
      const linkId = await availabilityLinkUtils.create(linkData);
      
      const newLink: CleanerAvailabilityLink = {
        id: linkId,
        ...linkData,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      
      // Update local state
      setAvailabilityLinks(prev => [...prev, newLink]);
      
      return newLink;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create availability link');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityLink = async (uniqueLink: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const linkData = await availabilityLinkUtils.getByLink(uniqueLink);
      return linkData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch availability link');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deactivateAvailabilityLink = async (linkId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await availabilityLinkUtils.deactivate(linkId);
      
      // Update local state
      setAvailabilityLinks(prev => 
        prev.map(link => 
          link.id === linkId 
            ? { ...link, isActive: false }
            : link
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate availability link');
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await getAllAvailabilityLinks();
  };

  useEffect(() => {
    refetch();
  }, []);

  return {
    availability,
    availabilityLinks,
    loading,
    error,
    getCleanerAvailability,
    updateCleanerAvailability,
    getAllAvailabilityLinks,
    createAvailabilityLink,
    getAvailabilityLink,
    deactivateAvailabilityLink,
    refetch
  };
}; 