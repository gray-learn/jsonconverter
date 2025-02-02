import React, { useState } from 'react';
import { AutoForm, TextField } from 'uniforms-material';
import { JSONSchemaBridge } from 'uniforms-bridge-json-schema';
import axios from 'axios';
import Ajv from 'ajv';
const ajv = new Ajv({ allErrors: true, useDefaults: true });
const schema = {
    title: 'Person',
    type: 'object',
    properties: {
      firstName: { type: 'string' },
      lastName: { type: 'string' },
      age: {
        description: 'Age in years',
        type: 'integer',
        minimum: 0,
      },
    },
    required: ['firstName', 'lastName'],
  };
  
  function createValidator(schema) {
    const validator = ajv.compile(schema);
  
    return (model) => {



        validator(model);
        if (!validator.errors) return null;
        let err = validator.errors[0];
        alert(err.dataPath +'  '+ err.message)
        // Format errors into Uniforms expected format
        return {
          details: validator.errors.map((error) => ({
            name: error,
            // instancePath.replace("/", ""),
            message: error.message,
          })),
        };
    };
  }
  
  const validator = createValidator(schema);
  
// Create a bridge for Uniforms
const bridge = new JSONSchemaBridge({ schema, validator });

const SimpleForm = () => {
  const [formData, setFormData] = useState({});

  const handleSubmit = async (data) => {
    const errors = validator(data);

    if (errors) {
      const errorMessages = errors.details
        .map((error) => `${error.name}: ${error.message}`)
        .join("\n");
      alert(`Validation Errors:\n${errorMessages}`);
      return;
    }

    console.log("Form submitted successfully:", data);
  };

  return (
    <AutoForm schema={bridge} model={formData} onSubmit={handleSubmit}>
      <TextField name="firstName" />
      <TextField name="lastName" />
      <TextField name="age" type="number" />
      <button type="submit">Submit</button>
    </AutoForm>
  );
};

export default SimpleForm;
