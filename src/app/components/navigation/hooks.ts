// components/navigation/hooks.ts
"use client";

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Plant } from '../../../../types/plant'; // Adjust path as needed

export interface Notification {
  _id: string;
  message: string;
  date: string;
}

export const useSavedPlants = () => {
    const { data: session, status } = useSession();
    const [savedPlants, setSavedPlants] = useState<Plant[]>([]);

    const fetchSavedPlants = useCallback(async () => {
        if (status !== "authenticated" || !session?.user) {
            setSavedPlants([]);
            return;
        }
        const userId = (session.user as any)?.id || (session.user as any)?.sub;
        if (!userId) {
            setSavedPlants([]);
            return;
        }

        try {
            const res = await fetch(`/api/plant/saved?userId=${encodeURIComponent(String(userId))}`, { cache: 'no-store' });
            if (!res.ok) throw new Error('Failed to fetch saved plants');
            const data = await res.json();
            setSavedPlants(data.plants && Array.isArray(data.plants) ? data.plants : []);
        } catch (error) {
            console.error('[useSavedPlants] Error fetching plants:', error);
            setSavedPlants([]);
        }
    }, [status, session]);

    return { savedPlants, fetchSavedPlants, isLoading: status === 'loading' };
};

export const useNotifications = () => {
    const { status } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = useCallback(async () => {
        if (status !== "authenticated") {
            setNotifications([]);
            return;
        }
        try {
            // Simulating API call for notifications
            const mockNotifications: Notification[] = [
                { _id: "1", message: "Your plant needs watering!", date: "2025-05-25" },
                { _id: "2", message: "New article on plant care available.", date: "2025-05-24" },
            ];
            setNotifications(mockNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        }
    }, [status]);
    
    return { notifications, fetchNotifications, isLoading: status === 'loading' };
};