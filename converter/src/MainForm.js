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

// Form1

const MainForm = ({ Title, Key }) => {
    const [useAjvValidator, setAjvValidator] = useState(null);
    
    const [initSchema, setInitSchema] = useState(null);
    const [initUischema, setInitUischema] = useState(null);
    const [schema, setSchema] = useState(null);
    const [uiSchema, setUiSchema] = useState(null);
    const [ajv, setAjv] = useState(null); // State to hold the AJV instance
    
    const [DropdownComponent, setDropdownComponent] = useState(null);
    const [UseAjvValidatorWrapper, setUseAjvValidatorWrapper] = useState(null);

    // TODO Dynamically import the AjvValidator 
    useEffect(() => {
        console.log(Key);
        import(`./${Key}/UseAjvValidatorWrapper`)
          .then((module) => setUseAjvValidatorWrapper(() => module.default))
          .catch((error) => console.error("Error loading component:", error));
          console.log(UseAjvValidatorWrapper)
    }, [Key]);

    // TODO Dynamically import the Dropdown components
    useEffect(() => {
      console.log(Key);
      import(`./${Key}/Dropdown`)
        .then((module) => setDropdownComponent(() => module.default))
        .catch((error) => console.error("Error loading component:", error));
        console.log(DropdownComponent)
    }, [Key]);

    useEffect(() => {
        console.log(Key);
        const loadModules = async () => {
            try {
                // Dynamically import JS files and JSON files
                const schema = require(`./${Key}/schema.json`);
                const uischema = require(`./${Key}/uiSchema.json`);
                
                setInitSchema(schema);
                setSchema(schema);
                setUiSchema(uischema);
                // setAjv(setAjv)
                // console.log(setAjv);
            } catch (error) {
                console.error("Error loading modules:", error);
            }
        };

        loadModules();
    }, [Key]); // Depend on Key to re-run the effect when Key changes

    const [formData, setFormData] = useState({});
    const [dropdownControl, setDropdownControl] = useState({});
    const [dropdownKey, setDropdownKey] = useState({});
    const [dropDataValue, setDropDataValue] = useState({});

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

    // Handle form submit
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

    const findDifference = (obj1, obj2) => {
        const diffKeys = [];
        for (const key in obj1) {
            if (!(key in obj2) || obj1[key] !== obj2[key]) {
                diffKeys.push(key);
            }
        }
        for (const key in obj2) {
            if (!(key in obj1) || obj1[key] !== obj2[key]) {
                if (!diffKeys.includes(key)) {
                    diffKeys.push(key);
                }
            }
        }
        return diffKeys.join("");
    };

    const handleValidationErrors = () => {
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

    if (!schema || !uiSchema) {
        return <div>Loading Schema...</div>;
    }
    if (!DropdownComponent) {
        return <div>Loading Dropdown...</div>; // Show loading state if Dropdown is not loaded yet
    }
    // if (!ajv) {
    //     return <div>Loading AJV...</div>;
    // }

    return (
        <div className="">
            <Suspense fallback={<div>Loading...</div>}>
                {ajv && (
                    <>
                        <h2 className="">{Title}</h2>
                        <div className="">
                            <JsonForms
                                schema={schema}
                                uischema={uiSchema}
                                data={formData}
                                onChange={handleChange}
                                renderers={materialRenderers} // Use material renderers for UI components
                                cells={materialCells} // Use material cells for form fields
                                ajv={ajv}
                            />

                            <DropdownComponent
                                schema={schema}
                                uiSchema={uiSchema}
                                dropDataKey={dropdownKey}
                                dropDataValue={dropDataValue}
                                onSendData={handleDropdownData}
                                onControlData={handleControlData}
                            />
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
                            <button type="button" onClick={handleValidationErrors}>
                                Validate Form
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSubmit({ data: formData })}
                            >
                                Submit
                            </button>
                        </div>
                        <UseAjvValidatorWrapper onAjvReady={setAjv} />
                    </>
                )}
            </Suspense>
        </div>
    );
};

export default MainForm;
