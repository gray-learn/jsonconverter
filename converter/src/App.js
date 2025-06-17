import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useParams,
} from "react-router-dom";
import FormTable from "./FormTable.js";
import MainGrid from "./MainGrid"; // Import the MainGrid component
import MainList from "./MainList"; // Import the MainGrid component
import MainForm from "./MainForm";

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

  const { ruleId } = useParams();
  const [query, setQuery] = useState(initialQuery);
  const [searchQuery, setSearchQuery] = useState("");

  // Toggle the visibility of JSONForms
  const toggleFormVisibility = () => {
    setShowForm(!showForm); // Toggle the state between true and false
  };

  return (
    <Router>
      <h1 className="bg-blue-900 text-3xl font-semibold text-white px-8 py-3 flex justify-between items-center">
        Generic GUI Config
      </h1>

      <MainGrid>
        {/* <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> */}

        <Routes>
          {/* ECNS */}
          <Route
            path="/mainlist/Ecns"
            element={<MainList type="Form-ECNS" />}
          />
          <Route
            path={`/mainlist/Ecns/:ruleId`}
            element={
              <MainForm Title="ECNS" Key="Form-ECNS" IsPreview={false} />
            }
          />

          {/* ECNS */}

          <Route
            path={`/mainlist/BATCH_HOLD/:ruleId`}
            element={
              <MainForm
                Title="HoldLot"
                Key="Form-BATCH_HOLD"
                IsPreview={false}
              />
            }
          />
          <Route
            path={`/mainlist/BATCH_RELEASE/:ruleId`}
            element={
              <MainForm
                Title="HoldRealease"
                Key="Form-BATCH_RELEASE"
                IsPreview={false}
              />
            }
          />
          <Route
            path="/demo"
            element={<MainForm Title="Demo" Key="demoform_jsonform" />}
          />
          <Route
            path="/"
            element={<FormTable searchQuery={searchQuery} IsPreview={false} />}
          />
        </Routes>
      </MainGrid>
    </Router>
  );
};

export default App;
