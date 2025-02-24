// utils/tools/useCreateDropdownRule.js
import { useState, useCallback } from 'react';

const useCreateDropdownRule = () => {
  const [dropdownRule, setDropdownRule] = useState(null);

  const createDropdownRule = useCallback((parent, child, rule, value) => {
    // Build the JSON structure dynamically
    console.log(parent)
    const jsonStructure = {
      type: "Control",
      scope: `#/properties/${child}`,
      rule: {
        effect: rule,
        condition: {
          scope: `#/properties/${parent}`,
          schema: {
            enum: value,  // Set the enum values dynamically
          },
        },
      },
    };

    // Update the state with the generated rule
    setDropdownRule(jsonStructure);

    // Return the JSON structure if needed
    return jsonStructure;
  }, []);

  return { dropdownRule, createDropdownRule };
};

export default useCreateDropdownRule;
