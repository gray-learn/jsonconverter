import { useState, useEffect } from "react";
import { z } from "zod";
/**
 * Custom Zod validator component
 */
const ZodValidator = ({ data }) => {
  const [validationResult, setValidationResult] = useState({
    isValid: true,
    errors: [],
  });

  useEffect(() => {
    // Define the Zod schema
    const schemaz = z.object({
      nationality: z.string().min(1, "Nationality is required"),

      sqlOpe: z
        .string()
        .regex(
          /SELECT\s\*\sFROM/,
          "SQL operation must not contain SELECT * FROM, specify columns"
        ),
    });

    // Validation function that uses Zod
    const validate = (data) => {
      try {
        console.log(data);
        schemaz.parse(data); // If valid, it will not throw
        setValidationResult({ isValid: true, errors: [] });
      } catch (error) {
        if (error instanceof z.ZodError) {
          console.log(
            error.errors.map((err) => ({
              message: err.message,
              path: err.path.join("."),
            }))
          );

          setValidationResult({
            isValid: false,
            errors: error.errors.map((err) => ({
              message: err.message,
              path: err.path.join("."),
            })),
          });
        } else {
          setValidationResult({ isValid: false, errors: [] });
        }
      }
    };

    // Run validation whenever 'data' changes
    validate(data);
  }, [data]);

  // Render the validation result (optional)
  return (
    <div>
      {!validationResult.isValid && (
        <ul>
          {validationResult.errors.map((error, index) => (
            <li key={index}>
              <strong>{error.path}:</strong> {error.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ZodValidator;
