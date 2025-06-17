import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useMemo,
  useRef,
} from "react";
import { JsonForms } from "@jsonforms/react";
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";
import axios from "axios";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useFindDifference from "./utils/tools/useFindDifference";

const MainForm = ({ Title, Key, IsPreview }) => {
  const { REACT_APP_GUI_API } = process.env;
  const { diffKeys, findDifference } = useFindDifference();
  const [isReadonly, setIsReadonly] = useState(true); //
  const [DropdownComponent, setDropdownComponent] = useState(null);
  const [initSchema, setInitSchema] = useState(null);
  const [schema, setSchema] = useState(null);
  const [uiSchema, setUiSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [Dropdown, setDropdown] = useState(null);
  const [ZodValidator, setZodValidator] = useState(null);
  // Dynamically import the hook and set it in state
  const [initRuleId, setInitRuleId] = useState("");
  const [dropdownControl, setDropdownControl] = useState({});
  const [dropdownKey, setDropdownKey] = useState({});
  const [dropDataValue, setDropDataValue] = useState({});
  const [formKey, setFormKey] = useState("");

  const [updateTime, setUpdateTime] = useState("");
  const [selectedHour, setSelectedHour] = useState(0); // Default to 0 hour
  const [selectedMinute, setSelectedMinute] = useState(0); // Default to 0 minute
  const [selectedSecond, setSelectedSecond] = useState(0); // Default to 0 second
  const [cronOption, setCronOption] = useState("every"); // Default option: "every hour/minute/second"

  const handleCronOptionChange = (e) => {
    setCronOption(e.target.value);
  };

  const [cronTime, setCronTime] = useState(""); // State to hold the generated cron expression

  const navigate = useNavigate();
  const location = useLocation();
  const { ruleId } = useParams();

  // useEffect hook to update the cronTime whenever selectedSecond, selectedMinute, or selectedHour changes
  useEffect(() => {
    // Initialize the cron fields
    let cronS = "*"; // Seconds - cron doesn't natively support seconds
    let cronM = "*"; // Minutes
    let cronH = "*"; // Hours

    if (selectedSecond > 0) {
      cronS = `*/${selectedSecond}`;
    }

    // Handle minutes
    if (selectedMinute > 0) {
      if (selectedSecond === 0) {
        cronS = `0`;
      }
      cronM = `*/${selectedMinute}`;
    }

    // Handle hours
    if (selectedHour > 0) {
      if (selectedMinute === 0) {
        cronM = `0`;
      }
      if (selectedSecond === 0) {
        cronS = `0`;
      }

      cronH = `*/${selectedHour}`;
    }

    const cronExpression =
      cronOption === "every"
        ? `${cronS} ${cronM} ${cronH} * * *`
        : `${selectedMinute} ${selectedHour} * * * * *`; // For every day at HH:MM
    console.log(cronExpression);

    setCronTime(cronExpression); // Update cronTime state
  }, [selectedSecond, selectedMinute, selectedHour]); // Dependencies, so effect runs when any of these states change

  // Parse the query parameter (assuming it's in the URL as ?isPreview=true or ?isPreview=false)
  const searchParams = new URLSearchParams(location.search);
  // console.log(searchParams.get("isPreview") === "true");
  IsPreview = searchParams.get("isPreview") === "true";

  const handleBackClick = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/fallbackPage"); // Define a fallback page in case there's no previous page in the history
    }
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false); // Control dialog visibility
  const [errorMessages, setErrorMessages] = useState(""); // Store error messages

  // Handle form change
  const handleChange = useCallback(
    ({ data }) => {
      console.log(data);
      if (typeof data === "string" || undefined === data) {
        return;
      }
      console.log(data);
      // Check if dropdown data has changed by comparing the previous and new state
      if (JSON.stringify(dropdownControl) !== JSON.stringify(data)) {
        if (initRuleId && initRuleId !== data.rule_id) {
          alert("RULEID cannot change");
          // TODO
          const fetchData = async () => {
            const link = `${REACT_APP_GUI_API}/queryFormRule`;

            try {
              const response = await axios.get(link, {
                headers: {
                  "Content-Type": "application/json",
                },
              });

              if (response.status !== 200) {
                console.error(
                  "Error: Unexpected response status",
                  response.status
                );
                alert("Failed to fetch data. Please try again.");
                return;
              }
            } catch (error) {
              if (error.response) {
                console.error("Server responded with error:", error.response);
                alert(
                  "Error: " + error.response.data.message ||
                    "An error occurred."
                );
              } else if (error.request) {
                // If the request was made but no response was received
                console.error("No response received:", error.request);
                alert("No response from server. Please check your connection.");
              } else {
                // Something else triggered the error
                console.error("Error in request:", error.message);
                alert("An unexpected error occurred. Please try again.");
              }
            }
          };

          fetchData();

          return;
        }
        console.log("Dropdown data has changed:", data);
        if (
          dropdownControl === undefined ||
          Object.keys(dropdownControl).length === 0
        ) {
          setDropdownControl(data);
          setInitRuleId(data.rule_id);
          const keyV = Object.keys(data)[0];
          setDropdownKey(keyV);
          setDropDataValue(data[keyV]);
          return;
        }
        console.log(dropdownControl);
        const diff = findDifference(dropdownControl, data);
        setDropdownKey(diff);
        setDropDataValue(data[diff]);
        if (dropdownControl !== data) {
          setDropdownControl(data);
          setInitRuleId(data.rule_id);
          setFormData(data); // Update form data
        }
      } else {
        console.log("No change in dropdown data, skipping update.");
      }
    },
    [dropdownControl] // Add dropdownControl as a dependency since it's part of the comparison
  );

  const handleDropdownData = useCallback(
    (dropdownData) => {
      // const currentEnum = schema.properties.nationality.enum || [];
      // if (JSON.stringify(currentEnum) !== JSON.stringify(dropdownData)) {
      //   console.log("Dropdown data has changed:", dropdownData);
      //   setSchema(dropdownData);
      // } else {
      //   console.log("No change in dropdown data, skipping update.");
      // }
    },
    [schema]
  );

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
  );

  const handleValidationErrors = () => {
    setErrorMessages("Validating data... Please wait.");
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
  };
  const fetchReleaseCodeFromApi = async () => {
    try {
      const response = await fetch(
        `${REACT_APP_GUI_API}/queryDropdownRelease`,
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const responseText = await response.text();

        console.log(responseText);
        // return responseText;
        const parsedData = JSON.parse(responseText);

        const result = parsedData.map((item) => ({
          value: item,
          label: item, // You can change the label as needed
        }));
        return result; // Return the parsed data
      } else {
        alert("Something went wrong");
        alert(response);
        return null;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred");
      return null;
    }
  };
  const fetchHoldCodeFromApi = async () => {
    try {
      const response = await fetch(`${REACT_APP_GUI_API}/queryDropdownHold`, {
        method: "GET",
      });
      if (response.ok) {
        const responseText = await response.text();

        console.log(responseText);
        // return responseText;
        const parsedData = JSON.parse(responseText);

        const result = parsedData.map((item) => ({
          value: item,
          label: item, // You can change the label as needed
        }));
        return result; // Return the parsed data
      } else {
        alert("Something went wrong");
        return null;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred");
      return null;
    }
  };

  const initloadModules = useCallback(async () => {
    try {
      const link = `${REACT_APP_GUI_API}/queryFormRule`;

      try {
        const fetchData = async () => {
          const link = `${REACT_APP_GUI_API}/queryFormRule`;

          try {
            const response = await axios.get(link, {
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (response.status !== 200) {
              console.error(
                "Error: Unexpected response status",
                response.status
              );
              alert("Failed to fetch data. Please try again.");
              return;
            }
          } catch (error) {
            if (error.response) {
              console.error("Server responded with error:", error.response);
              alert(
                "Error: " + error.response.data.message || "An error occurred."
              );
            } else if (error.request) {
              // If the request was made but no response was received
              console.error("No response received:", error.request);
              alert("No response from server. Please check your connection.");
            } else {
              // Something else triggered the error
              console.error("Error in request:", error.message);
              alert("An unexpected error occurred. Please try again.");
            }
          }
        };

        fetchData();
        // alert("Data fetched successfully!");
      } catch (error) {
        console.error("Error:", error);
        alert("There was an error fetching data.");
      }

      // Dynamically import JS files and JSON files
      const { default: schema } = await import(`./${Key}/schema.json`);
      const { default: uiSchema } = await import(`./${Key}/uiSchema.json`);

      setSchema(schema);
      setUiSchema(uiSchema);
      if (schema && uiSchema) {
        // console.log(schema);
        // console.log(uiSchema);
        // console.log(formData);
        setInitSchema(schema);
        // Dynamically import the validation hook (useZodValidator)
        const { default: ZodValidator } = await import(`./${Key}/ZodValidator`);
        if ("BATCH_RELEASE" === formKey) {
          const dropdownData = await fetchReleaseCodeFromApi();

          const dropHoldData = await fetchHoldCodeFromApi();

          const releaseCode = dropdownData.map((v) => v.value);
          const holdCode = dropHoldData.map((v) => v.value);

          const dropdownschema = (prevSchema) => {
            const updatedSchema = {
              ...prevSchema,
              properties: {
                ...prevSchema.properties,

                releasehold_reasoncode: {
                  ...prevSchema.properties.releasehold_reasoncode,
                  enum: releaseCode, // Update nationality in schema
                },
              },
            };
            console.log("Updated schema:", updatedSchema);
            return updatedSchema; // Update schema with selected nationality
          };
          setSchema(dropdownschema);
        }

        setZodValidator(<ZodValidator data={formData} />); // Store the hook
      }
    } catch (error) {
      console.error("Error loading modules:", error);
    }
  }, [Key, formData]); // Dependencies for the callback
  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault(); // Prevent form submission

      // if (isReadonly) {
      //   alert("Mode View Cannot Update");
      //   return;
      // }
      console.log("Form submitted with data:", formData); // Log formData

      const dataRequest = formData;
      const parts = Key.split("_");
      let systemName = Key.split("-")[1];
      const link = `${REACT_APP_GUI_API}/insert/${Key}/${systemName}`;

      try {
        // Axios request to send data
        console.log(cronTime);
        const response = await axios.post(
          link,
          {
            formData: dataRequest,
            cronjob: cronTime,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Success:", response.data);
        alert("Data inserted successfully!");
      } catch (error) {
        console.error("Error:", error);
        alert("There was an error sending data.");
      }
    },
    [formData, cronTime] // Dependencies
  );

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
  useEffect(() => {
    // Select all elements with id starting with "#/properties/sql"
    const sqlElements = document.querySelectorAll('[id^="#/properties/sql"]');

    // Loop over each matched element
    // sqlElements.forEach((element) => {
    //   // Check if it's an input and change it to a textarea
    //   if (element.tagName.toLowerCase() === "input") {
    //     // Create a new textarea element
    //     const textarea = document.createElement("textarea");
    //     textarea.value = element.value; // Transfer the input value to textarea

    //     // Apply styles
    //     textarea.style.height = "500px";
    //     textarea.style.width = "100%";

    //     // Set readonly property based on the isReadonly state
    //     if (isReadonly) {
    //       textarea.setAttribute("readonly", "true");
    //     } else {
    //       textarea.removeAttribute("readonly");
    //     }

    //     // Replace the input with the textarea
    //     element.replaceWith(textarea);
    //   }
    // });
  }, [isReadonly]); // Re-run this effect when `isReadonly` changes

  useEffect(() => {
    // Define an async function inside useEffect
    const fetchData = async () => {
      // query
      try {
        // axios

        // const update_time_now = (formData.update_time = new Date());
        // console.log(update_time_now);

        const parts = Key.split("_");
        const systemName = parts[1];
        const response = await axios.post(
          `${REACT_APP_GUI_API}/${Key}`,
          {}, // Body is empty if no data is needed, otherwise you can pass an object
          {
            headers: {
              "Content-Type": "application/json", // Set the content type
            },
          }
        );

        if (response.status === 200) {
          const parsedData = response.data; // Axios automatically parses JSON data

          console.log(parsedData);

          if (ruleId !== "") {
            const filteredData = parsedData
              .map((item) => {
                let jsonData = item.FORM_DATA;
                setUpdateTime(item.UPDATETIME);
                try {
                  // Check if the item is a string and needs to be parsed
                  if (typeof jsonData === "string") {
                    jsonData = JSON.parse(jsonData);
                  }

                  if (jsonData && "update_time" in jsonData) {
                    console.log(jsonData.update_time); // Access the `update_time` property
                  } else {
                    console.log("No update_time in item");
                  }

                  return jsonData; // Return the item after parsing
                } catch (error) {
                  console.error("Error parsing JSON:", error);
                  return null; // Return null if parsing fails
                }
              })
              .filter((item) => item && item.rule_id === ruleId); // Filter the data

            console.log(filteredData);
            // filteredData.forEach((item) => (item.update_time = new Date())); // Update the time

            // Ensure uniqueness by rule_id using a Map
            const uniqueData = Array.from(
              new Map(filteredData.map((item) => [item.rule_id, item])).values()
            );

            // Log unique data
            console.log(uniqueData);

            // Update the time for each unique item
            uniqueData.forEach((item) => (item.update_time = new Date()));

            const jsonStr = JSON.stringify(uniqueData[0]);
            setFormData(uniqueData[0]); // Set the form data state with the stringified JSON
            console.log(formData);
            return;
          }

          // If ruleId is not provided, update the `update_time` in the parsedData
          // parsedData.update_time = new Date();
          // setFormData(parsedData); // Set the form data state with the parsed data
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred");
      }
    };

    // Call the fetchData function
    fetchData();
  }, []); // Empty dependency array ensures it runs only once when the component mounts

  if (!schema || !uiSchema || !Dropdown || !ZodValidator) {
    return (
      <img
        src="https://www.flaticon.com/free-icon/minion_891948" // Path to the image in the public folder
        alt="Loading..."
        style={{
          display: "flex",
          justifyContent: "center", // Center horizontally
          alignItems: "center", // Center vertically
          height: "30vh", // Full viewport height to center in the entire screen
        }} // You can adjust the size of the image
      />
    );
  }

  return (
    <div className="overflow-x-auto p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <>
          <nav className="bg-blue-900 text-white px-8 py-3 flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Form Rules: {Title}</h1>
          </nav>

          <div className="">
            {/* <h1 className="text-3xl font-semibold mb-6">Form Rules: {Title}</h1>{" "} */}

            <div className="border border-gray-400 rounded-md p-6 bg-gray-50">
              <JsonForms
                schema={schema}
                uiSchema={uiSchema}
                data={formData}
                onChange={handleChange}
                renderers={materialRenderers} // Use material renderers for UI components
                cells={materialCells} // Use material cells for form fields
                readonly={isReadonly}
                // ajv={ajv}
              />
              <div className="mb-4">
                <label
                  // htmlFor="execution"
                  className="block text-gray-700 font-medium mb-2"
                >
                  Execution Period
                </label>
                {/* Cron option radio buttons */}
                <div className="mb-4 p-4">
                  <div className="flex">
                    <input
                      type="radio"
                      id="every"
                      name="cronOption"
                      value="every"
                      checked={cronOption === "every"}
                      onChange={handleCronOptionChange}
                      className="mr-2"
                    />
                    <label htmlFor="every" className="mr-4">
                      Every hour/minute/second
                    </label>

                    <input
                      type="radio"
                      id="daily"
                      name="cronOption"
                      value="daily"
                      checked={cronOption === "daily"}
                      onChange={handleCronOptionChange}
                      className="mr-2"
                    />
                    <label htmlFor="daily">Every day at </label>
                  </div>
                </div>

                {/* Time selection row */}
                <div className="flex gap-4">
                  {/* Hours Dropdown */}
                  <div className="w-1/4 mb-4">
                    {/* <label htmlFor="hours" className="block text-gray-700 mb-1">
                      Hours:
                    </label> */}
                    <select
                      id="hours"
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                    >
                      {[...Array(24).keys()].map((i) => (
                        <option key={i} value={i}>
                          {i} Hour(s)
                        </option>
                      ))}
                    </select>
                  </div>
                  <span>:</span>
                  {/* Minutes Dropdown */}
                  <div className="w-1/4 mb-4">
                    {/* <label
                      htmlFor="minutes"
                      className="block text-gray-700 mb-1"
                    >
                      Minutes:
                    </label> */}
                    <select
                      id="minutes"
                      value={selectedMinute}
                      onChange={(e) =>
                        setSelectedMinute(Number(e.target.value))
                      }
                      className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                    >
                      {[...Array(60).keys()].map((i) => (
                        <option key={i} value={i}>
                          {i} minute(s)
                        </option>
                      ))}
                    </select>
                  </div>{" "}
                  <span>:</span>
                  {/* Conditionally rendered Seconds Dropdown */}
                  {cronOption === "every" && (
                    <div className="w-1/4 mb-4">
                      {/* <label
                        htmlFor="seconds"
                        className="block text-gray-700 mb-1"
                      >
                        Seconds:
                      </label> */}
                      <select
                        id="seconds"
                        value={selectedSecond}
                        onChange={(e) =>
                          setSelectedSecond(Number(e.target.value))
                        }
                        className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-gray-700"
                      >
                        {[...Array(60).keys()].map((i) => (
                          <option key={i} value={i}>
                            {i} second(s)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="updateTime"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Update Time
                  </label>
                  <input
                    type="text"
                    id="updateTime"
                    readOnly
                    disabled
                    value={updateTime || ""} // Bind the value to updateTime
                    className="w-full p-2 border border-gray-300 rounded mb-4 bg-gray-100 text-gray-700"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="updateTime"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Owner
                  </label>
                  <input
                    type="text"
                    id="updateTime"
                    readOnly
                    disabled
                    className="w-full p-2 border border-gray-300 rounded mb-4 bg-gray-100 text-gray-700"
                  />
                </div>

              </div>

              {Dropdown}
              {/* {ZodValidator} */}
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
              <div className="px-8 py-3 flex space-x-4">
                {!IsPreview && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsReadonly(!isReadonly)} // Toggle between true and false
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                      {isReadonly ? "Edit" : "View"}
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit} // Trigger handleSubmit without passing formData manually
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                      onClick={() => {
                        setFormData({ rule_id: formData.rule_id });
                      }}
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-green-400"
                      onClick={handleBackClick}
                    >
                      Back
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      </Suspense>
    </div>
  );
};

export default MainForm;
