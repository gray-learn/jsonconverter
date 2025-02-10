// src/components/Dropdown.js
import React, { useState, useEffect } from "react";

// Simulate fetching options for locations
const fetchLocationOptions = async () => {
  try {
    // Simulating an API delay using setTimeout
    const response = await new Promise((resolve, reject) => {
      setTimeout(() => {
        // Randomly simulate a failed API response
        const success = Math.random() > 0.1; // 90% chance to succeed, 10% chance to fail

        if (success) {
          resolve({
            data: [
              { value: "US", label: "United States" },
              { value: "CA", label: "Canada" },
              { value: "JP", label: "Japan" },
              { value: "TW", label: "Taiwan" },
            ],
          });
        } else {
          reject("Failed to fetch location options from the server.");
        }
      }, 1500); // Simulate delay of 1.5 seconds
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching location options:", error);
    return [];
  }
};

const Dropdown = ({
  schema,
  uiSchema,
  dropDataKey,
  dropDataValue,
  onChange,
  onSendData,
  onControlData,
}) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Part 1 Need to Existign Datasource
  useEffect(() => {
    // Fetch location options on mount
    const getLocations = async () => {
      const locationData = await fetchLocationOptions();

      // Get the allowed nationality options from the schema
      const allowedNationalities = schema?.properties?.nationality?.enum || [];

      // Filter the location data to include only valid nationalities
      const validLocations = locationData.filter((location) =>
        allowedNationalities.includes(location.value)
      );

      const updatedLocations = validLocations.map((v) => v.value);

      if (updatedLocations.length > 0) {
        // setLocations(validLocations);

        const dropdownschema = (prevSchema) => {
          const updatedSchema = {
            ...prevSchema,
            properties: {
              ...prevSchema.properties,
              nationality: {
                ...prevSchema.properties.nationality,
                enum: updatedLocations, // Update nationality in schema
              },
            },
          };
          console.log("Updated schema:", updatedSchema);
          return updatedSchema; // Update schema with selected nationality
        };

        onSendData(dropdownschema);
      } else {
        setError("No valid locations found.");
      }
      setLoading(false);
    };

    getLocations();
  }, [schema, onSendData]);

  useEffect(() => {
    // Fetch location options on mount
    const techs = schema?.properties?.tech?.enum || [];
    const operations = schema?.properties?.operation?.enum || [];
    const parts = schema?.properties?.part?.enum || [];

    // Accessing dropDataKey's property names
    console.log(dropDataKey);
    const keyType = dropDataKey;
    switch (keyType) {
      case "tech": {
        // return new Promise((resolve) => {
        // const rule = createDropdownRule("5F", "part", "HIDE");
        // console.log(rule);
        // if (dropDataValue === "VIS") {
        //   updateRuleSchema(schema, ["a", "b", "c"]);
        //   onControlData("Jack");
        // } else if (dropDataValue === "VSMC") {
        //   updateRuleSchema(schema, ["a", "b", "c"]);
        //   onControlData("Jack");
        // }
        // vis 1.2
        //  vsmc 456
        break;
      }
      case "part": {
        if (dropDataValue === "5F") {
          const rule = createDropdownRule("part", "operation", "DISABLE", [
            "4F",
            "5F",
          ]);
          console.log(rule);
          const updatedRuleSchema = updateRuleSchema(uiSchema, rule);
          console.log(updatedRuleSchema);
          onControlData(updatedRuleSchema);
        }
        break;
      }
      case "operation": {
        break;
      }
      default: {
        break;
      }
    }
    // };
  }, [schema, onControlData, dropDataKey, dropDataValue]);

  const createDropdownRule = (parent, child, rule, value) => {
    // Build the JSON structure dynamically
    const jsonStructure = {
      type: "Control",
      scope: `#/properties/${child}`,
      rule: {
        effect: rule,
        condition: {
          scope: `#/properties/${parent}`,
          schema: {
            // const: true,
            enum: value,
          },
        },
      },
    };

    // Return the JSON structure
    return jsonStructure;
  };

  // Function to update schema
  const updateRuleSchema = (prevSchema, rule) => {
    // TODO　rule LOGIC

    const key = rule.scope; // e.g., "#/properties/part"

    const updatedSchema = {
      ...prevSchema,
      elements: prevSchema.elements.map((element) => {
        if (element.type === "Group" && element.elements) {
          console.log(element.elements);
          return {
            ...element,
            elements: element.elements.map((nestedElement) => {
              // TODO
              if (nestedElement.scope === key) {
                // Update the rule condition to use dropdownData dynamically

                // const nestMock = {
                //   ...nestedElement,
                //   rule: {
                //     ...nestedElement.rule,
                //     condition: {
                //       ...nestedElement.rule.condition,
                //       schema: {
                //         ...nestedElement.rule.condition.schema,
                //         // enum: dropdownData, // dynamically set the enum
                //       },
                //     },
                //   },
                // };

                return rule;
              }
              return nestedElement;
            }),
          };
        }
        return element;
      }),
    };

    // const updatedSchema = {
    //   ...prevSchema,
    //   elements: prevSchema.elements.map((element) => {
    //     // Check if the element's scope matches the child
    //     if (element.type === "Group" && element.elements) {
    //       return {
    //         ...element,
    //         elements: element.elements.map((nestedElement) => {
    //           // Update the enum of the specific control (child) dynamically
    //           if (nestedElement.scope === child) {
    //             return {
    //               ...nestedElement,
    //               rule: nestedElement.rule
    //                 ? {
    //                     ...nestedElement.rule,
    //                     condition: {
    //                       ...nestedElement.rule.condition,
    //                       schema: {
    //                         ...nestedElement.rule.condition.schema,
    //                         enum: dropdownData, // Update the enum dynamically
    //                       }
    //                     }
    //                   }
    //                 : {
    //                     effect: "HIDE",
    //                     condition: {
    //                       scope: "#/properties/tech", // You can replace this condition logic as needed
    //                       schema: {
    //                         enum: dropdownData,
    //                       }
    //                     }
    //                   }
    //             };
    //           }
    //           return nestedElement;
    //         }),
    //       };
    //     }
    //     return element;
    //   }),
    // };

    console.log("Updated schema:", updatedSchema);
    return updatedSchema; // Return updated schema
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return <></>;
};

export default Dropdown;
