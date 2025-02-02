import React, { useState } from 'react';
import DynamicForm from './components/DynamicForm';
import './App.css';

import SimpleForm from './components/SimpleForm';


function App() {
  const [selectedForm, setSelectedForm] = useState('simpleForm');

  return (
    <div className="App">
      <h1>Simple JSON Form</h1>
      <DynamicForm formName={selectedForm} />
      <h1>Simple Uniforms Form</h1>
      <SimpleForm />
    </div>
  );
}

export default App;
