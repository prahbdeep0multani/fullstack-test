import { useState } from 'react';

const useLocalStorage = (key, initValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initValue;
    } catch (err) {
      return initValue;
    }
  });

  const setStoredValue = newValue => {
    try {
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      // silently ignore storage write errors
    }
  };

  return [value, setStoredValue];
};

export default useLocalStorage;
