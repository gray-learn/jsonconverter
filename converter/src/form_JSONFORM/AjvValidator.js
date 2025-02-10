import { useMemo } from "react";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import ajvErrors from "ajv-errors";

/**
 * Custom AJV instance provider
 */
const useAjvValidator = () => {
  return useMemo(() => {
    const ajvInstance = new Ajv({
      allErrors: true, // Show all validation errors
      strict: false, // Allow extra properties
      verbose: true, // Provide detailed error messages
      $data: true, // Enable custom validation with reference to data
    });

    addFormats(ajvInstance); // Adds support for date, email, etc.
    ajvErrors(ajvInstance); // Adds custom error messages

    // Custom validation for email format
    ajvInstance.addFormat("customEmail", {
      type: "string",
      validate: (email) => /^[\w-.]+@[\w-]+.[a-zA-Z]{2,7}$/.test(email),
    });
    //  TODO
    ajvInstance.addKeyword({
      keyword: "maxLengthStr",
      modifying: true,
      compile: (minLength) => {
        return (data) => {
          // Check if the data is a string and its length is less than minLength
          if (typeof data === "string" && data.length < minLength) {
            return false; // This will trigger the validation error
          }
          return true; // Valid if the string length is >= minLength
        };
      },
      errors: true, // Allow error messages to be triggered
    });
    return ajvInstance;
  }, []);
};

export default useAjvValidator;
