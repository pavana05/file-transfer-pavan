import { useState, useEffect, useCallback } from 'react';

export interface UploadHistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  shareUrl: string;
  sharePin?: string;
  uploadedAt: string;
  hasPassword?: boolean;
}

const STORAGE_KEY = 'lovable_upload_history';
const MAX_HISTORY_ITEMS = 50;

export function useUploadHistory() {
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (error) {
      console.error('Failed to load upload history:', error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  const saveHistory = useCallback((items: UploadHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save upload history:', error);
    }
  }, []);

  // Add a new upload to history
  const addToHistory = useCallback((item: Omit<UploadHistoryItem, 'id' | 'uploadedAt'>) => {
    const newItem: UploadHistoryItem = {
      ...item,
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      uploadedAt: new Date().toISOString(),
    };

    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      saveHistory(updated);
      return updated;
    });
  }, [saveHistory]);

  // Remove an item from history
  const removeFromHistory = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveHistory(updated);
      return updated;
    });
  }, [saveHistory]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
