import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import initialEntries from '../data/dailyEntries.json';
import { fetchCloudEntries, saveCloudEntries } from '../services/jsonbin';

const TimelineContext = createContext();

export function loadAndMergeEntries() {
  try {
    const saved = localStorage.getItem('bess_journal_entries');
    if (!saved) return initialEntries;

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) return initialEntries;

    const map = new Map();
    initialEntries.forEach((e) => map.set(e.id, e));
    parsed.forEach((e) => map.set(e.id, { ...map.get(e.id), ...e }));

    return Array.from(map.values()).sort((a, b) => a.id - b.id);
  } catch (e) {
    return initialEntries;
  }
}

export function useNow(enabled = true, intervalMs = 1000) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [enabled, intervalMs]);

  return now;
}

export function TimelineProvider({ children }) {
  const [isSyncing, setIsSyncing] = useState(false);
  const isDevMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('dev');
  
  const [entries, setEntries] = useState(() => loadAndMergeEntries());

  const getUnlockDate = useCallback((entry) => {
    if (entry && entry.unlockDate) {
      return new Date(entry.unlockDate);
    }
    const base = new Date('2026-09-07T00:00:00');
    base.setDate(base.getDate() + (((entry && entry.id) || 1) - 1));
    return base;
  }, []);

  const getUnlockStatus = useCallback((entryOrId, now = new Date()) => {
    const entry = typeof entryOrId === 'object'
      ? entryOrId
      : (entries.find((e) => e.id === Number(entryOrId)) || { id: Number(entryOrId) });

    const unlockDate = getUnlockDate(entry);
    const isUnlocked = isDevMode || now >= unlockDate;
    const timeLeft = Math.max(0, unlockDate - now);

    return {
      isUnlocked,
      unlockDate,
      timeLeft
    };
  }, [entries, isDevMode, getUnlockDate]);

  const getLatestUnlockedId = useCallback((entryList) => {
    const list = entryList || entries;
    const now = new Date();
    const unlocked = list.filter((e) => {
      const unlockDate = getUnlockDate(e);
      return isDevMode || now >= unlockDate;
    });

    if (unlocked.length > 0) {
      return unlocked[unlocked.length - 1].id;
    }
    return list[0]?.id || 1;
  }, [entries, isDevMode, getUnlockDate]);

  const [selectedDayId, setSelectedDayId] = useState(() => getLatestUnlockedId(loadAndMergeEntries()));

  const syncWithCloud = useCallback(async () => {
    setIsSyncing(true);
    const cloudEntries = await fetchCloudEntries();
    setIsSyncing(false);
    if (cloudEntries && Array.isArray(cloudEntries) && cloudEntries.length > 0) {
      setEntries(cloudEntries);
      localStorage.setItem('bess_journal_entries', JSON.stringify(cloudEntries));
      const latestId = getLatestUnlockedId(cloudEntries);
      setSelectedDayId(latestId);
    }
  }, [getLatestUnlockedId]);

  const syncWithCloudRef = useRef(syncWithCloud);
  useEffect(() => {
    syncWithCloudRef.current = syncWithCloud;
  }, [syncWithCloud]);

  const saveEntries = async (updatedEntries) => {
    setEntries(updatedEntries);
    localStorage.setItem('bess_journal_entries', JSON.stringify(updatedEntries));
    window.dispatchEvent(new Event('journal_entries_updated'));
    await saveCloudEntries(updatedEntries);
  };

  const saveHerReaction = async (dayId, reactionText) => {
    const updated = entries.map((e) => {
      if (e.id === Number(dayId)) {
        return {
          ...e,
          herReaction: reactionText,
          reactionDate: new Date().toISOString(),
        };
      }
      return e;
    });

    setEntries(updated);
    localStorage.setItem('bess_journal_entries', JSON.stringify(updated));
    window.dispatchEvent(new Event('journal_entries_updated'));
    await saveCloudEntries(updated);
  };

  // Fetch from cloud ONCE on mount and when tab gains focus
  useEffect(() => {
    if (syncWithCloudRef.current) {
      syncWithCloudRef.current();
    }

    const handleFocus = () => {
      if (syncWithCloudRef.current) {
        syncWithCloudRef.current();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const resetToJSON = () => {
    localStorage.removeItem('bess_journal_entries');
    setEntries(initialEntries);
    setSelectedDayId(getLatestUnlockedId(initialEntries));
    window.dispatchEvent(new Event('journal_entries_updated'));
  };

  const activeEntry = entries.find((e) => e.id === Number(selectedDayId)) || entries[0];

  const formatTimeLeft = (ms) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <TimelineContext.Provider
      value={{
        entries,
        setEntries,
        saveEntries,
        saveHerReaction,
        selectedDayId,
        setSelectedDayId,
        activeEntry,
        getUnlockStatus,
        formatTimeLeft,
        isDevMode,
        isSyncing,
        syncWithCloud,
        resetToJSON,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  return useContext(TimelineContext);
}
