// utils/tools/useFindDifference.js
import { useState, useCallback } from 'react';

const useFindDifference = () => {
  const [diffKeys, setDiffKeys] = useState([]);

  const findDifference = useCallback((obj1, obj2) => {
    const keys = [];
    for (const key in obj1) {
      if (!(key in obj2) || obj1[key] !== obj2[key]) {
        keys.push(key);
      }
    }
    for (const key in obj2) {
      if (!(key in obj1) || obj1[key] !== obj2[key]) {
        if (!keys.includes(key)) {
          keys.push(key);
        }
      }
    }
    setDiffKeys(keys);  // Store the result in state
    return keys.join("");  // Also return the result if needed
  }, []);

  return { diffKeys, findDifference };
};

export default useFindDifference;
