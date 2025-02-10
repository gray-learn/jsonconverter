import React, { useState, useCallback } from "react";
import { JsonForms } from "@jsonforms/react";
import { ThemeProvider } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";
import useAjvValidator from "./AjvValidator"; // Import custom AJV hook
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";
import Dropdown from "./Dropdown"; // Import the Dropdown component
// Import schema dynamically
let initSchema = require("./schema.json");
let initUischema = require("./uiSchema.json");

const FormDemoJsonForms = () => {
  const [formData, setFormData] = useState({});
  const [dropdownControl, setDropdownControl] = useState({});
  const [dropdownKey, setDropdownKey] = useState({});
  const [dropDataValue, setDropDataValue] = useState({});
  const [schema, setSchema] = useState(initSchema);
  const [uiSchema, setUiSchema] = useState(initUischema);

  const ajv = useAjvValidator(); // Get the custom AJV instance
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Control dialog visibility
  const [errorMessages, setErrorMessages] = useState(""); // Store error messages

  // Handle form change
  const handleChange = useCallback(
    ({ data }) => {
      console.log(data);
      // Check if dropdown data has changed by comparing the previous and new state
      if (JSON.stringify(dropdownControl) !== JSON.stringify(data)) {
        console.log("Dropdown data has changed:", data);

        // If dropdownControl is not empty and data differs, update dropdownControl
        if (
          dropdownControl === undefined ||
          Object.keys(dropdownControl).length === 0
        ) {
          setDropdownControl(data);
          // const keys = [];
          const keyV = Object.keys(data)[0];
          // keys.push(keyV);
          setDropdownKey(keyV);
          setDropDataValue(data[keyV]);
          return;
        }
        console.log(dropdownControl);
        const diff = findDifference(dropdownControl, data);
        setDropdownKey(diff);
        setDropDataValue(data[diff]);
        // setDropdownControl(data);
        if (dropdownControl !== data) {
          setDropdownControl(data);
          setFormData(data); // Update form data
        }
      } else {
        console.log("No change in dropdown data, skipping update.");
      }
    },
    [dropdownControl] // Add dropdownControl as a dependency since it's part of the comparison
  );

  // Handle form submit
  const handleSubmit = useCallback(async ({ data }) => {
    console.log("Form submitted with data:", data);
  }, []);

  // Function to update the schema with valid locations from the Dropdown component
  const handleLocationChange = (selectedLocation) => {
    console.log(selectedLocation);
    const updatedSchema = { ...schema };
    updatedSchema.properties.nationality.enum = [selectedLocation]; // Update locations in schema
    setSchema(updatedSchema); // Update schema with selected location
  };

  const handleDropdownData = useCallback(
    (dropdownData) => {
      // Check if the current enum value is different from the new dropdown data
      const currentEnum = schema.properties.nationality.enum || [];

      // renew schema in dropdown
      // TODO
      if (JSON.stringify(currentEnum) !== JSON.stringify(dropdownData)) {
        console.log("Dropdown data has changed:", dropdownData);
        setSchema(dropdownData);
      } else {
        console.log("No change in dropdown data, skipping update.");
      }
    },
    [schema]
  ); // Empty dependency array, meaning the function won't be recreated unless necessary.

  const handleControlData = useCallback(
    (ruleData) => {
      if (JSON.stringify(uiSchema) !== JSON.stringify(ruleData)) {
        console.log("Rule data has changed:", ruleData);
        setUiSchema(ruleData);
      } else {
        console.log("No change in dropdown data, skipping update.");
      }
    },
    [schema]
  ); // Empty dependency array, meaning the function won't be recreated unless necessary.

  const findDifference = (obj1, obj2) => {
    const diffKeys = [];
    for (const key in obj1) {
      if (!(key in obj2) || obj1[key] !== obj2[key]) {
        diffKeys.push(key);
        // return key;// TODO
      }
    }
    for (const key in obj2) {
      if (!(key in obj1) || obj1[key] !== obj2[key]) {
        if (!diffKeys.includes(key)) {
          diffKeys.push(key);
          // return key;// TODO
        }
      }
    }
    return diffKeys.join("");
  };

  // TODO
  // oracle

  // TODO
  // db2

  const customizedTheme = createTheme({
    jsonforms: {
      input: {
        delete: {
          backgroundColor: "yellow",
          color: "black",
          borderRadius: "4px",
          fontSize: "14px",
          padding: "8px 16px",
          "&:hover": {
            backgroundColor: "orange", // Hover effect
          },
          transition: "background-color 0.3s", // Smooth hover transition
        },
        // Example: adding styles for a text field
        textField: {
          backgroundColor: "#f0f0f0", // Light grey background
          border: "1px solid #ccc", // Grey border
          borderRadius: "8px",
          padding: "10px",
          "&:focus": {
            borderColor: "#3f51b5", // Blue border on focus
          },
          "&::placeholder": {
            color: "#999", // Placeholder text color
          },
        },
        // Example: button styles
        button: {
          backgroundColor: "#3f51b5", // Blue button
          color: "#fff", // White text
          border: "none",
          borderRadius: "4px",
          padding: "10px 20px",
          fontSize: "16px",
          "&:hover": {
            backgroundColor: "#303f9f", // Darker blue on hover
          },
          transition: "background-color 0.3s", // Smooth hover transition
        },
      },
      // You can also style other parts of the jsonforms
      layout: {
        spacing: 8, // Layout spacing between elements
      },
      // Add additional customization if needed
    },
  });

  const handleValidationErrors = () => {
    // TODO
    // Open the dialog and show initial loading message
    // setIsDialogOpen(true);
    setErrorMessages("Validating data... Please wait.");

    // Run validation
    const valid = ajv.validate(schema, formData);

    console.log("Validation result:", valid);
    if (!valid) {
      // Collect error messages if validation fails
      const errors = ajv.errors
        .map((error) => {
          // return `Error in ${error.instancePath}: ${error.message}`; // Retrieve the error message and its path
          return `${error.message}`; // Retrieve the error message and its path
        })
        .join("\n"); // Join all errors into a single string

      // Set error messages
      setErrorMessages(`Validation Rules: ${errors}`);
    } else {
      // If the data is valid
      setErrorMessages("Data is valid!");
    }
  };

  const closeDialog = () => {
    // Close the dialog
    setIsDialogOpen(false);
  };

  return (
    <div className="">
      <h2 className="">JSON Forms Preview</h2>
      <div className="">
        {/* <ThemeProvider theme={customizedTheme}> */}
        <JsonForms
          schema={schema}
          uischema={uiSchema}
          data={formData}
          onChange={handleChange}
          renderers={materialRenderers} // Use material renderers for UI components
          cells={materialCells} // Use material cells for form fields
          // additionalErrors={customValidate()}
          // validationMode={"ValidateAndShow"}
          ajv={ajv}
        />
        {/* </ThemeProvider> */}
        {/* Use the Dropdown component and handle location changes */}

        <Dropdown
          schema={schema}
          uiSchema={uiSchema}
          dropDataKey={dropdownKey} // Part2 TODO
          dropDataValue={dropDataValue} // Part2 TODO
          onChange={handleLocationChange}
          onSendData={handleDropdownData} // Part1
          onControlData={handleControlData} // Part2 TODO
        />
        {isDialogOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-2xl">
              <h3 className="text-xl font-semibold mb-4">Validation Errors</h3>
              <textarea
                rows="10"
                cols="50"
                value={errorMessages}
                readOnly
                disabled
                className="w-full p-2 border border-gray-300 rounded mb-4 bg-gray-100 text-gray-700"
              />
              <button
                onClick={closeDialog}
                className="bg-red-500 text-white p-2 rounded hover:bg-red-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
        <button type="button" onClick={handleValidationErrors}>
          Validate Form
        </button>
        <button type="button" onClick={() => handleSubmit({ data: formData })}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default FormDemoJsonForms;
