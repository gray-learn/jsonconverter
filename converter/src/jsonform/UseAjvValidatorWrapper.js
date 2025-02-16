import { useMemo, useEffect} from "react";
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
    // Custom validation format
    ajvInstance.addFormat("eqp_ope_f", {
      type: "string",
      validate: (v) => /^[0-9]+(\.[0-9]+)+$/.test(v),
    });

    ajvInstance.addKeyword({
      keyword: "eqp_ope",
      modifying: true,
      compile: (a) => {
        console.log(a); // true
        return (v) => /^[0-9]+(\.[0-9]+)+$/.test(v);
      },
      errors: true,
    });
    ajvInstance.addKeyword({
      keyword: "maxLengthStr",
      modifying: true,
      compile: (maxLength) => {
        console.log(maxLength);

        return (data) => {
          // TODO：Testing Valid Logic

          // Check if the data is a string and its length is less than minLength
          if (typeof data === "string" && data.length < maxLength) {
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
// Wrapper Component that uses the useAjvValidator hook
const UseAjvValidatorWrapper = ({ onAjvReady }) => {
  const ajv = useAjvValidator(); // Call the custom hook to get the AJV instance

  // Pass ajv to the parent component through the callback
  useEffect(() => {
    if (onAjvReady) {
      onAjvReady(ajv); // Pass AJV instance back to the parent
      console.log(ajv)
    }
  }, [ajv, onAjvReady]);
  return <div>AJV is ready</div>;
};

export default UseAjvValidatorWrapper;
