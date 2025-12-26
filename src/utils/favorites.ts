/**
 * Favorites Utility - Manages faculty favorites in localStorage
 */

const STORAGE_KEY = 'insiderNavs_favoriteFaculty';

/**
 * Get all favorite faculty IDs from localStorage
 */
export const getFavorites = (): number[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

/**
 * Check if a faculty is in favorites
 */
export const isFavorite = (facultyId: number): boolean => {
  return getFavorites().includes(facultyId);
};

/**
 * Add a faculty to favorites
 */
export const addFavorite = (facultyId: number): void => {
  const favorites = getFavorites();
  if (!favorites.includes(facultyId)) {
    favorites.push(facultyId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }
};

/**
 * Remove a faculty from favorites
 */
export const removeFavorite = (facultyId: number): void => {
  const favorites = getFavorites().filter(id => id !== facultyId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
};

/**
 * Toggle favorite status for a faculty
 * Returns the new favorite status
 */
export const toggleFavorite = (facultyId: number): boolean => {
  if (isFavorite(facultyId)) {
    removeFavorite(facultyId);
    return false;
  } else {
    addFavorite(facultyId);
    return true;
  }
};
