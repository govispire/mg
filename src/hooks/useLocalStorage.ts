
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      // Dispatch custom event for same-page synchronization
      window.dispatchEvent(new CustomEvent('local-storage-update', { detail: { key, value: valueToStore } }));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail && e.detail.key === key) {
        setStoredValue(e.detail.value);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('local-storage-update', handleUpdate);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('local-storage-update', handleUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}
