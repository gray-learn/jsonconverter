import React, { useState, useCallback } from "react";
import { JsonForms } from "@jsonforms/react";


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
          const keys = [];
          const keyV = Object.keys(data)[0];
          keys.push(keyV);
          setDropdownKey(keys);
          setDropDataValue(data[keyV]);
          return;
        }
        console.log(dropdownControl);
        const diff = findDifference(dropdownControl, data);
        setDropdownKey(diff);
        setDropDataValue(data[diff[0]]);
        // setDropdownControl(data);
        if (dropdownControl !== data) {
          //   Iterate through the keys and log changes
          setDropdownControl(data);
          //     setFormData(data); // Update form data
        }
        // TODO
        // setUiSchema();
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


      // Compare arrays for differences
      // renew schema in dropdown
      // TODO
      if (JSON.stringify(currentEnum) !== JSON.stringify(dropdownData)) {
        console.log("Dropdown data has changed:", dropdownData);
        setSchema((prevSchema) => {
          const updatedSchema = {
            ...prevSchema,
            properties: {
              ...prevSchema.properties,
              nationality: {
                ...prevSchema.properties.nationality,
                enum: dropdownData, // Update nationality in schema
              },
            },
          };
          console.log("Updated schema:", updatedSchema);
          return updatedSchema; // Update schema with selected nationality
        });
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
    return diffKeys;
  };


  return (
    <div className="">
      <h2 className="">JSON Forms Preview</h2>
      <div className="">
        <JsonForms
          schema={schema}
          uischema={uiSchema}
          data={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          renderers={materialRenderers} // Use material renderers for UI components
          cells={materialCells} // Use material cells for form fields
          // validator={validator}
        />
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
      </div>
    </div>
  );
};


export default FormDemoJsonForms;