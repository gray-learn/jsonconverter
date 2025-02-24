import React, { useState } from "react";
import exportDataToFile from "./JSONForms"; // Import the child component
import "./form.css";
import useExportDataToFile from './hook/useExportDataToFile'; // Import the custom hook

// Example schema based on your JSON structure

const CrudForm = () => {
  const schema = require("./schema.json"); // Importing the schema from schema.json
  const [formData, setFormData] = useState({});
  const [schemaProperties, setSchemaProperties] = useState(schema.properties);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [eidtDialogOpen, setEditDialogOpen] = useState(false);
  const [editFieldObj, setEditFieldObj] = useState(null);
  const [editFieldKey, setEditFieldKey] = useState("");
  const [newFieldDescription, setNewFieldDescription] = useState("");
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("string");
  const [isEnum, setIsEnum] = useState(false);
  const [enumValues, setEnumValues] = useState("");

  const exportDataToFile = useExportDataToFile();
  // A function to handle changes in form data

  const handleField = (e, fieldPath) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,  // Update the form data at the field name with the new value
    });
  };

  const handleChange = (e, path = "") => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    // Handle nested fields (like personalData)
    if (path) {
      const keys = path.split(".");
      setFormData((prevState) => {
        const updatedState = { ...prevState };
        let current = updatedState;
        keys.forEach((key, idx) => {
          if (idx === keys.length - 1) {
            current[key] = fieldValue;
          } else {
            current[key] = current[key] || {};
            current = current[key];
          }
        });
        return updatedState;
      });
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: fieldValue,
      }));
    }
  };

  // Recursive function to render form fields based on schema
  const renderFormFields = (properties, parentPath = "") => {
    console.log(properties)
    return Object.keys(properties).map((key) => {
      const field = properties[key];
      const fieldPath = parentPath ? `${parentPath}.${key}` : key;
      console.log(fieldPath)
      if (field.type === "object") {// recursive
        return (
          <div key={fieldPath}>
            <h3>{key}</h3>
            {renderFormFields(field.properties, fieldPath)}
          </div>
        );
      }

      switch (field.type) {
        case "string":
          return (
            <div key={fieldPath}>
              <label>{key}</label>
              {/* <label>{field.description || key}</label> */}
              <label>
                {JSON.stringify(field, null, 2)}
                <button key={key} type="button" onClick={() => editField(key)}>
                  edit
                </button>
                <button
                  key={key}
                  type="button"
                  onClick={() => removeField(key)}
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  Delete
                </button>
              </label>
              <input
                type="text"
                name={key}
                value={formData[key] || ''}
                onChange={(e) => handleChange(e, fieldPath)}
                required={field.minLength && field.minLength > 0}
              />
            </div>
          );
        case "boolean":
          return (
            <div key={fieldPath}>
              <label>{key}</label>
              <label>
                {JSON.stringify(field, null, 2)}
                <button key={key} type="button" onClick={() => editField(key)}>
                  edit
                </button>
                <button
                  key={key}
                  type="button"
                  onClick={() => removeField(key)}
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  delete
                </button>
              </label>

              {/* <input
                type="checkbox"
                name={key}
                checked={formData[key] || false}
                onChange={(e) => handleChange(e, fieldPath)}
              /> */}
            </div>
          );
        case "integer":
          return (
            <div key={fieldPath}>
              <label>{key}</label>
              {/* <label>{field.description || key}</label> */}
              <label>
                {JSON.stringify(field, null, 2)}
                <button key={key} type="button" onClick={() => editField(key)}>
                  edit
                </button>
                <button
                  key={key}
                  type="button"
                  onClick={() => removeField(key)}
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  delete
                </button>
              </label>
            </div>
          );
        case "number":
          return (
            <div key={fieldPath}>
              <h3>{key}: </h3>
              {/* <label>{field.description || key}</label> */}
              <label>
                {JSON.stringify(field, null, 2)}
                minimum {field.minimum !== ''? (
                  <input
                    type="number"
                    name={field.minimum}  // Use field key as name
                    value={field.minimum || ''}  // Use form data or default value
                    onChange={(e) => handleField(e, fieldPath)}  // Handle input change
                  />
                ) : null}
                maximum {field.maximum !== ''? (
                  <input
                    type="number"
                    name={field.maximum}  // Use field key as name
                    value={field.maximum || ''}  // Use form data or default value
                    onChange={(e) => handleField(e, fieldPath)}  // Handle input change
                  />
                ) : null}
                default {field.default !== ''? (
                  <input
                    type="number"
                    name={field.default}  // Use field key as name
                    value={field.default || ''}  // Use form data or default value
                    onChange={(e) => handleField(e, fieldPath)}  // Handle input change
                  />
                ) : null}
                <button key={key} type="button" onClick={() => editField(key)}>
                  edit
                </button>
                <button
                  key={key}
                  type="button"
                  onClick={() => removeField(key)}
                  style={{ backgroundColor: "red", color: "white" }}
                >
                  delete
                </button>
              </label>
              {/* <input
                type="number"
                name={key}
                value={formData[key] || ''}
                onChange={(e) => handleChange(e, fieldPath)}
              /> */}
            </div>
          );
        case "string" && field.format === "date":
          return (
            <div key={fieldPath}>
              <label>{key}</label>
              <label>
                {JSON.stringify(field, null, 2)}
                <button key={key} type="button" onClick={() => editField(key)}>
                  edit
                </button>
                <button
                  key={key}
                  type="button"
                  onClick={() => removeField(key)}
                >
                  delete
                </button>
              </label>
              {/* <input
                type="date"
                name={key}
                value={formData[key] || ''}
                onChange={(e) => handleChange(e, fieldPath)}
              /> */}
            </div>
          );
        case "string" && field.enum:
          return (
            <div key={fieldPath}>
              <label>{key}</label>
              {/* <select
                name={key}
                value={formData[key] || ""}
                onChange={(e) => handleChange(e, fieldPath)}
              >
                {field.enum.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select> */}
              <button key={key} type="button" onClick={() => editField(key)}>
                edit
              </button>
              <button
                key={key}
                type="button"
                onClick={() => removeField(key)}
                style={{ backgroundColor: "red", color: "white" }}
              >
                Delete
              </button>
            </div>
          );
        default:
          return null;
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data:", formData);
  };

  // Remove a field from properties
  const removeField = (fieldKey) => {
    const updatedProperties = { ...schemaProperties };
    delete updatedProperties[fieldKey];
    setSchemaProperties(updatedProperties);
  };

  const editField = (fieldKey) => {
    const updatedProperties = { ...schemaProperties };
    console.log(updatedProperties[fieldKey]);
    // setSchemaProperties(updatedProperties);

    const field = updatedProperties[fieldKey];

    if (field) {
      console.log(field);

      setEditFieldKey(fieldKey);
      setEditFieldObj(field);
      console.log(editFieldObj);

      // setNewFieldName(field.name || '');
      // setNewFieldDescription(field.description || '');
      // setNewFieldType(field.type || 'string');
      // setEnumValues(field.enumValues || '');
      setEditDialogOpen(true);
    }
  };

  const getInputType = (type) => {
    switch (type) {
      case "number":
        return "number";
      case "boolean":
        return "checkbox";
      case "string":
        return "text";
      default:
        return "text";
    }
  };

  const addNewField = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditDialogOpen(false);
  };

  const exportFile = () => {
    // Update schema's properties
    // const updatedSchema = { ...schema, properties: {  } };
    Object.defineProperty(schema, 'properties', {schemaProperties});
    // Trigger export of the updated schema object
    exportDataToFile(schema);
  };

  const handleSaveNewField = () => {
    // TODO
    // const newFieldKey = `newField${Object.keys(schemaProperties).length + 1}`;
    const newFieldKey = newFieldName;
    const field = {
      //   name: newFieldName,
      description: newFieldDescription,
      type: newFieldType,
    };

    if (isEnum) {
      field.enum = enumValues.split(",").map((val) => val.trim());
    }

    const updatedProperties = {
      ...schemaProperties,
      [newFieldKey]: field,
    };

    setSchemaProperties(updatedProperties);
    setDialogOpen(false);
  };
  return (
    <div>
      <h1>----------------------------------------------</h1>
      <h1>Change Field Spec</h1>
      {/* <form onSubmit={handleSubmit}> */}
      {renderFormFields(schemaProperties)}
      {/* <button type="submit">Submit</button>
      </form> */}
      <h1>----------------------------------------------</h1>
      <button onClick={addNewField}>Add New Field</button>
      {/* Dialog for adding a new field */}
      {dialogOpen && (
        <div className="dialog">
          <h3>Add New Field</h3>
          <label>
            Name:
            <input
              type="text"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
            />
          </label>
          <br />
          <label>
            Description:
            <input
              type="text"
              value={newFieldDescription}
              onChange={(e) => setNewFieldDescription(e.target.value)}
            />
          </label>
          <br />

          <label>
            Type:
            <select
              value={newFieldType}
              onChange={(e) => setNewFieldType(e.target.value)}
            >
              <option value="string">String</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="dropdown">Dropdown</option>
            </select>
          </label>
          <br />

          {newFieldType === "dropdown" && (
            <label>
              Enum (comma-separated values):
              <input
                type="text"
                value={enumValues}
                onChange={(e) => setEnumValues(e.target.value)}
                placeholder="e.g., option1, option2"
              />
            </label>
          )}

          {newFieldType === "boolean" && <p>Field type will be Boolean</p>}

          <div>
            <button onClick={handleDialogClose}>Cancel</button>
            <button onClick={handleSaveNewField}>Save</button>
          </div>
        </div>
      )}

      {eidtDialogOpen && (
        <div className="dialog" key={editFieldObj}>
          <h3>Edit Field</h3>
          <label>{editFieldKey}</label>
          {/* <label>{editFieldObj.description || fieldPath}</label> */}
          {/* <input
                    type={getInputType(editFieldObj.type)}
                    name={fieldPath}
                    value={formData[fieldPath] || ''}
                    onChange={(e) => handleChange(e, fieldPath)}
                /> */}
          <pre>{JSON.stringify(editFieldObj, null, 2)}</pre>
          {/* TODO */}
          {/* minimum {editFieldObj.minimum === ''? (
                  <input
                    type="number"
                    name={editFieldObj.minimum}  // Use field key as name
                    value={editFieldObj.minimum || ''}  // Use form data or default value
                    onChange={(e) => handleField(e)}  // Handle input change
                  />
                ) : null} */}
          <div>
            <button onClick={handleDialogClose}>Cancel</button>
            <button onClick={handleSaveNewField}>Save</button>
          </div>
        </div>
      )}

      {/* Display the schema properties */}
      <h1>----------------------------------------------</h1>
      <pre>{JSON.stringify(schema, null, 2)}</pre>
      <button onClick={exportFile()}>
        Export Data to JSON
      </button>
    </div>
  );
};

export default CrudForm;
