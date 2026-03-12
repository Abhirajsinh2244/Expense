// // src/hooks/useLocalStorage.ts
// import { useState, useEffect } from 'react';

// // The generic type <T> ensures that the stored value and the setter function 
// // maintain strict type alignment with whatever initialValue is provided.
// export function useLocalStorage<T>(
//   key: string, 
//   initialValue: T
// ): [T, (value: T | ((val: T) => T)) => void] {
  
//   const [storedValue, setStoredValue] = useState<T>(() => {
//     try {
//       const item = window.localStorage.getItem(key);
//       return item ? JSON.parse(item) : initialValue;
//     } catch (error) {
//       console.error("Error reading localStorage", error);
//       return initialValue;
//     }
//   });

//   useEffect(() => {
//     try {
//       window.localStorage.setItem(key, JSON.stringify(storedValue));
//     } catch (error) {
//       console.error("Error setting localStorage", error);
//     }
//   }, [key, storedValue]);

//   return [storedValue, setStoredValue];
// }