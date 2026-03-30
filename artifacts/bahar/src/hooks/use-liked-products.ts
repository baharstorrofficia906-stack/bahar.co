import { useState, useEffect } from "react";

const STORAGE_KEY = "bahar_liked_products";

function getLikedIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLikedIds(ids: number[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useLikedProducts() {
  const [likedIds, setLikedIdsState] = useState<number[]>(getLikedIds);

  useEffect(() => {
    setLikedIds(likedIds);
  }, [likedIds]);

  const isLiked = (id: number) => likedIds.includes(id);

  const toggleLike = (id: number) => {
    setLikedIdsState(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const clearLikes = () => setLikedIdsState([]);

  return { likedIds, isLiked, toggleLike, clearLikes };
}
