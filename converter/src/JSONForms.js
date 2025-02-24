import React, { useState } from "react";
import { JsonForms } from "@jsonforms/react";
import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";
import { person } from "@jsonforms/examples"; // Assuming this is where your schema and initial data are coming from

import useExportDataToFile from "./hook/useExportDataToFile"; // Import the custom hook

const JSONForms = () => {
  // Load the schema and initial data
  // const uischema = person.uischema;
  const schema = require("./Multiple/schema.json"); // Importing the schema from schema.json
  const uischema = require("./Multiple/uischema.json");
  const initialData = person.data;
  const exportDataToFile = useExportDataToFile();

  // State to manage form data
  const [data, setData] = useState(initialData);

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <br />
      <br />
      <h1>Change Value</h1>
      {/* Render the JsonForms form */}
      <JsonForms
        schema={schema}
        uischema={uischema}
        data={data}
        renderers={materialRenderers}
        cells={materialCells}
        onChange={({ data }) => setData(data)} // Update the form data when it changes
      />
      <br />
      {/* Button to export the data to a JSON file */}
      <button onClick={() => exportDataToFile(schema)}>
        Export Data to JSON
      </button>
    </div>
  );
};

export default JSONForms;
