import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FormTable from "./FormTable.js";
import SearchBar from "./SearchBar";
import MainGrid from "./MainGrid"; 
import FormDemoJsonForms from "./jsonform/FormDemoJsonForms"; // Import the child component
// import SQLHoldLot from "./jsonform_SQLHoldlot/SQLHoldLot"; // Import the child component
// TODO!!!!!!!!!
import MainForm from "./MainForm";


import {
  formatQuery,
  Field,
  QueryBuilder,
  RuleGroupType,
} from "react-querybuilder";
import "react-querybuilder/dist/query-builder.css";
import "./index.css";
const App = () => {
  // State to control the visibility of JSONForms
  const [showForm, setShowForm] = useState(false);

  // Set up the initial query state properly
  const initialQuery = {
    combinator: "and", // Combining rules with AND by default
    rules: [], // Initially no rules
  };

  // State for the search query
  const [searchQuery, setSearchQuery] = useState("");

  // Toggle the visibility of JSONForms
  const toggleFormVisibility = () => {
    setShowForm(!showForm); // Toggle the state between true and false
  };

  return (
    <Router>
      <MainGrid>
        <h1 className="text-3xl font-semibold mb-6">Form Rules Dashboard</h1>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <Routes>
          <Route path="/formdemo" element={<FormDemoJsonForms />} />
          {/* <Route
            path="/holdlot"
            element={<MainForm Title="HoldLot" Key="jsonform_SQLHoldlot" />}
          /> */}
          <Route
            path="/demo"
            element={<MainForm Title="Demo" Key="jsonform" />}
          />

          <Route path="/" element={<FormTable searchQuery={searchQuery} />} />
        </Routes>
      </MainGrid>
    </Router>
  );
};

export default App;
