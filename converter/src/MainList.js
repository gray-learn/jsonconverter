import React, { useState, useEffect } from "react";
import {
  useNavigate,
  useLocation,
  BrowserRouter as Router,
} from "react-router-dom";
import {
  formatQuery,
  // Field,
  QueryBuilder,
  RuleGroupType,
} from "react-querybuilder";

import "react-querybuilder/dist/query-builder.css";

const MainList = ({ type }) => {
  const { REACT_APP_GUI_FE, REACT_APP_GUI_API } = process.env;
  const [searchQuery, setSearchQuery] = useState("");
  const [systemName, setSystemName] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [iframeSrc, setIframeSrc] = useState(""); // New state to track iframe source

  // Check if the query parameter `isPreview=true` exists
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const isPreview = queryParams.get("isPreview") === "true";
    setShowPreview(isPreview);

    if (isPreview) {
      const ruleId = location.pathname.split("/").pop();
      fetchPreviewData(ruleId); // Fetch preview data based on the ruleId
    }
  }, [location]); // Fetch preview data (assuming you have an API to get it)
  const fetchPreviewData = async (ruleId) => {
    try {
      const response = await fetch(`/api/preview/${ruleId}`); // Replace with your actual API endpoint
      const data = await response.json();
      setPreviewData(data);
    } catch (error) {
      console.error("Error fetching preview data:", error);
    }
  };

  const [filteredData, setFilteredData] = useState([]); // State to store filtered data
  const [loading, setLoading] = useState(true); // State to track loading
  const [error, setError] = useState(null); // State to track error

  function transformStringToJson(jsonString) {
    // Use regular expression to replace \u0027 (escaped single quotes) with actual single quotes
    const transformedString = jsonString.replace(/\\u0027/g, "'");
    const jsonObject = JSON.parse(transformedString);
    return jsonObject;
  }
  const handleNewForm = () => {
    const now = Date.now();
    const systemName = type.split("-")[1];
    const timestamp = Math.floor(now / 1000);
    const link = `/mainlist/${systemName}/${timestamp}`;
    navigate(link);
  };

  const handleViewClick = (ruleId) => {
    const systemName = type.split("-")[1];
    const link = `/mainlist/${systemName}/${ruleId}`;
    navigate(link);
  };

  const handlePreviewClick = (ruleId) => {
    // console.log(type)

    const systemName = type.split("-")[1];
    const previewLink = `${REACT_APP_GUI_FE}/mainlist/${systemName}/${ruleId}?isPreview=true`;

    // Update the iframe source with the preview link
    setIframeSrc(previewLink);
  };

  const handleFilter = (query) => {
    setSearchQuery(query);
    const filteredDataCopy = [...filteredData];
    if (query) {
      filteredDataCopy.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(String(query).toLowerCase())
        )
      );
    }
    setFilteredData(filteredDataCopy);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Example of how you might determine your URL based on the `type` value
        const systemName = type.split("-")[1]; // Example of extracting part of the type

        setSystemName(systemName);

        const response = await fetch(`${REACT_APP_GUI_API}/${type}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const responseText = await response.text();
          const parsedData = JSON.parse(responseText);
          const transformedData = parsedData.map((item) => {
            // console.log(item.OWNER + '-----------------')
            let jsonObj = transformStringToJson(item.FORM_DATA);
            if (undefined !== jsonObj.update_time) {
              const date = new Date(item.UPDATETIME);

              // Format components with leading zeros
              const pad = (num) => num.toString().padStart(2, '0');

              const formatted =
                date.getFullYear() + '-' +
                pad(date.getMonth() + 1) + '-' +
                pad(date.getDate()) + ' ' +
                pad(date.getHours()) + ':' +
                pad(date.getMinutes()) + ':' +
                pad(date.getSeconds());
              jsonObj.update_time = formatted;
              jsonObj.owner = item.OWNER;
            } else {
              jsonObj.update_time = new Date();
            }
            // TODO
            // jsonObj.owner = item.OWNER;
            return jsonObj;
          });
          console.log(transformedData);
          setFilteredData(transformedData); // Set the state with fetched and transformed data

          setLoading(false); // Set loading to false when data is fetched
        } else {
          setError("Something went wrong"); // Set error if response is not ok
          setLoading(false); // Set loading to false in case of error
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred");
        setLoading(false); // Set loading to false if error occurs
      }
    };

    fetchData();
  }, [type]); // Dependency array includes `type` so the effect will run when `type` changes

  const handleBackClick = () => {
    navigate("/");
  };

  if (loading || error) {
    return (
      <img
        src="https://www.flaticon.com/free-icon/minion_891948" // Path to the image in the public folder
        alt="Loading..."
        style={{
          display: "flex",
          justifyContent: "center", // Center horizontally
          alignItems: "center", // Center vertically
          height: "30vh", // Full viewport height to center in the entire screen
        }}
      />
    ); // Show loading text until data is fetched
  }

  //   <Field
  //   name="searchQuery"
  //   options={[
  //     {
  //       label: "Search",
  //       value: "",
  //     },
  //     ...filteredData.map((row) => ({
  //       label: row.name,
  //       value: row.rule_id,
  //     })),
  //   ]}
  //   onChange={handleFilter}
  // />
  return (
    <div className="overflow-x-auto p-6">
      <nav className="bg-blue-900 text-white px-8 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-semibold"> {systemName}</h1>
      </nav>{" "}
      <table className="min-w-full bg-white table-auto border-separate border-spacing-0">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-6 text-left font-medium text-gray-600">
              RuleId
            </th>{" "}
            <th className="py-3 px-6 text-left font-medium text-gray-600">
              Owner
            </th>
            <th className="py-3 px-6 text-left font-medium text-gray-600">
              Actions
            </th>
            <th className="py-3 px-6 text-left font-medium text-gray-600">
              Updatetime
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr className="border-t hover:bg-gray-50">
              <td colSpan={2} className="py-4 px-6 text-center">
                Please Add New Rule
              </td>
            </tr>
          ) : (
            filteredData.map((row, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="py-3 px-6">{row.rule_id}</td>
                <td className="py-3 px-6">{row.owner}</td>
                <td className="py-3 px-6 flex flex-col space-y-2">
                  <button
                    onClick={() => handleViewClick(row.rule_id)} // Call handleViewClick with the row's rule_id
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handlePreviewClick(row.rule_id)} // Call handleViewClick with the row's rule_id
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Preview
                  </button>
                </td>
                <td className="py-3 px-6">{row.update_time}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="flex space-x-4 mb-6">
        <button
          type="button"
          className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={handleBackClick}
        >
          Back
        </button>
        <button
          type="button"
          className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-green-400"
          onClick={handleNewForm}
        >
          New
        </button>
      </div>
      <iframe
        id="embed-container"
        src={iframeSrc || "about:blank"} // Dynamically set iframe source
        width="100%"
        height="1300"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default MainList;
