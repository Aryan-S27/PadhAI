import { useState, useEffect, useCallback } from 'react';
import type { Bookmark } from '../types/roadmaps';

const BOOKMARKS_KEY = 'roadmap-bookmarks';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  }, [bookmarks]);

  const addBookmark = useCallback((roadmapId: string, title: string, url: string) => {
    setBookmarks(prev => {
      if (prev.some(b => b.roadmapId === roadmapId)) return prev;
      return [...prev, { roadmapId, title, addedAt: new Date().toISOString(), url }];
    });
  }, []);

  const removeBookmark = useCallback((roadmapId: string) => {
    setBookmarks(prev => prev.filter(b => b.roadmapId !== roadmapId));
  }, []);

  const isBookmarked = useCallback((roadmapId: string) => {
    return bookmarks.some(b => b.roadmapId === roadmapId);
  }, [bookmarks]);

  const toggleBookmark = useCallback((roadmapId: string, title: string, url: string) => {
    if (isBookmarked(roadmapId)) {
      removeBookmark(roadmapId);
    } else {
      addBookmark(roadmapId, title, url);
    }
  }, [isBookmarked, removeBookmark, addBookmark]);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, toggleBookmark };
}
