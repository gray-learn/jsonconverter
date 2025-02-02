import React, { useEffect, useState } from 'react';
import { JsonForms } from '@jsonforms/react';
import { materialRenderers } from '@jsonforms/material-renderers';
import axios from 'axios';

const DynamicForm = ({ formName }) => {
  const [formData, setFormData] = useState({});
  const [formSchema, setFormSchema] = useState(null);
  const [formUiSchema, setFormUiSchema] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadForm(formName);
  }, [formName]);

  const loadForm = async (name) => {
    try {
      const schemaResponse = await fetch(`/schemas/${name}.schema.json`);
      const uiSchemaResponse = await fetch(`/forms/${name}.json`);

      setFormSchema(await schemaResponse.json());
      setFormUiSchema(await uiSchemaResponse.json());
    } catch (error) {
      console.error('Error loading form:', error);
    }
  };

  const validateData = async (data) => {
    const newErrors = {};
    if (!data.firstName) {
      newErrors.firstName = "First Name is required";
    }
    if (!data.lastName) {
      newErrors.lastName = "Last Name is required";
    }
    if (data.age && (data.age < 18 || data.age > 100)) {
      newErrors.age = "Age must be between 18 and 100";
      alert('Validation errors:', newErrors.age)
    }

    try {
      const response = await axios.get(`https://api.example.com/users?name=${data.firstName}`);
      if (response.data.length === 0) {
        newErrors.firstName = "Name does not exist";
      }
    } catch (error) {
      console.error("Error in AJAX validation", error);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValid = await validateData(formData);
    if (isValid) {
      console.log('Form submitted successfully:', formData);
    } else {
      // alert('Validation errors:', errors)
      console.error('Validation errors:', errors);
    }
  };

  return (
    <div>
      {formSchema && formUiSchema && (
        <form onSubmit={handleSubmit}>
          <JsonForms
            schema={formSchema}
            uischema={formUiSchema}
            data={formData}
            onChange={({ data }) => setFormData(data)}
            renderers={materialRenderers}
          />
          <button type="submit">Submit</button>
        </form>
      )}
    </div>
  );
};

export default DynamicForm;
