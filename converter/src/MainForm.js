import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useMemo,
} from "react";
import { JsonForms } from "@jsonforms/react";
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";

import useFindDifference from "./utils/tools/useFindDifference";

const MainForm = ({ Title, Key }) => {
  const { diffKeys, findDifference } = useFindDifference();
  const [DropdownComponent, setDropdownComponent] = useState(null);
  const [initSchema, setInitSchema] = useState(null);
  const [initUischema, setInitUischema] = useState(null);
  const [schema, setSchema] = useState(null);
  const [uiSchema, setUiSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [Dropdown, setDropdown] = useState(null);
  const [ZodValidator, setZodValidator] = useState(null);
  // Dynamically import the hook and set it in state
  const [dropdownControl, setDropdownControl] = useState({});
  const [dropdownKey, setDropdownKey] = useState({});
  const [dropDataValue, setDropDataValue] = useState({});

  //   console.log(AjvModule);
  //   const ajv = useAjvValidator(); // Get the custom AJV instance
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
          const keyV = Object.keys(data)[0];
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

  const handleSubmit = useCallback(
    async ({ data }) => {
      console.log("Form submitted with data:", data);
      // You can also log `formData` directly here
      console.log("Current formData:", formData);
    },
    [formData]
  ); // Make sure formData is included in the dependency array

  const handleDropdownData = useCallback(
    (dropdownData) => {
      const currentEnum = schema.properties.nationality.enum || [];
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

  const handleValidationErrors = () => {
    setErrorMessages("Validating data... Please wait.");
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  const initloadModules = useCallback(async () => {
    try {
      // Dynamically import JS files and JSON files
      const { default: schema } = await import(`./${Key}/schema.json`);
      const { default: uiSchema } = await import(`./${Key}/uiSchema.json`);

      setSchema(schema);
      setUiSchema(uiSchema);
      if (schema && uiSchema) {
        console.log(schema);
        console.log(uiSchema);
        console.log(formData);
        setInitSchema(schema);
        // Dynamically import the validation hook (useZodValidator)
        const { default: ZodValidator } = await import(`./${Key}/ZodValidator`);

        setZodValidator(<ZodValidator data={formData} />); // Store the hook
      }
    } catch (error) {
      console.error("Error loading modules:", error);
    }
  }, [Key, formData]); // Dependencies for the callback

  useEffect(() => {
    initloadModules(); // Call the memoized loadModules function when `Key` or `formData` changes
  }, [initloadModules]); // Dependency array includes `loadModules` callback

  useEffect(() => {
    console.log(Key);
    const loadModules = async () => {
      try {
        setSchema(schema);
        setUiSchema(uiSchema);
        if (schema && uiSchema) {
          const { default: Dropdown } = await import(`./${Key}/Dropdown`).catch(
            () => {
              console.error("Failed to load Dropdown component.");
              return null; // or return a fallback component
            }
          );
          if (Dropdown) {
            setDropdown(
              <Dropdown
                schema={schema}
                uiSchema={uiSchema}
                dropDataKey={dropdownKey} // Part2 TODO
                dropDataValue={dropDataValue} // Part2 TODO
                onSendData={handleDropdownData} // Part1
                onControlData={handleControlData} // Part2 TODO
              />
              // memoizedDropdown
            );
          }
        }
      } catch (error) {
        console.error("Error loading modules:", error);
      }
    };

    loadModules();
    // dependency : schema, uiSchema
  }, [schema, uiSchema]); 

  // Memoize the Dropdown component to avoid unnecessary re-renders
  // const memoizedDropdown = useMemo(() => {
  //   if (
  //     !DropdownComponent ||
  //     !(
  //       typeof DropdownComponent === "function" ||
  //       typeof DropdownComponent === "object"
  //     )
  //   ) {
  //     console.error("Dropdown component is invalid!");
  //     return null;
  //   }

  //   return (
  //     <Dropdown
  //       schema={schema}
  //       uiSchema={uiSchema}
  //       dropDataKey={dropdownKey}
  //       dropDataValue={dropDataValue}
  //       onSendData={handleDropdownData}
  //       onControlData={handleControlData}
  //     />
  //   );
  // }, [Dropdown, schema, uiSchema, dropdownKey, dropDataValue]);

  // const handleValidation = (data) => {
  //   const validationResult = validate(data);
  //   console.log(validationResult);
  // };

  if (!schema || !uiSchema || !Dropdown || !ZodValidator) {
    return <div>Loading...</div>; // Show loading state while waiting for the modules to load
  }

  return (
    <div className="">
      <Suspense fallback={<div>Loading...</div>}>
        <>
          <h2 className="">{Title}</h2>
          <div className="">
            <JsonForms
              schema={schema}
              uiSchema={uiSchema}
              data={formData}
              onChange={handleChange}
              renderers={materialRenderers} // Use material renderers for UI components
              cells={materialCells} // Use material cells for form fields
              // ajv={ajv}
            />

            {Dropdown}
            {ZodValidator}
            {/* {memoizedDropdown} */}

            {isDialogOpen && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-2xl">
                  <h3 className="text-xl font-semibold mb-4">
                    Validation Errors
                  </h3>
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

            <button
              type="button"
              onClick={() => handleSubmit({ data: formData })}
            >
              Submit
            </button>
          </div>
        </>
        {/* )} */}
      </Suspense>
    </div>
  );
};

export default MainForm;
