import React, {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useMemo,
} from "react";

import { Link } from "react-router-dom";
import axios from "axios";
const FormTable = ({ searchQuery }) => {
  const {
    REACT_APP_GUI_API
  } = process.env;
  const [formRuleList, setFormRuleList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const link = `${REACT_APP_GUI_API}/queryFormRule`; // Update this to your API endpoint
      try {
        const response = await axios.get(link, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log(response.data);
        setFormRuleList(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Optionally set an error state to show a message if fetching fails
      }
    };

    fetchData();
  }, []);
  const data = [
    {
      FormTitle: "SQL-based Hold Release",
      FormType: "Lot",
      Owner: "VSMC",
      Description: "Hold Reaslease",
      MustField: "LotId – Primary key",
      UserDefinedField: "UDATA - filter 2",
      link: "/BATCH_RELEASE", // Store the link here
    },
    {
      FormTitle: "SQL-based Hold Lot",
      FormType: "Lot",
      Owner: "VSMC",
      Description: "HoldLot",
      MustField: "LotId – Primary key",
      UserDefinedField: "UDATA - filter 2",
      link: "/BATCH_HOLD", // Store the link here
    },

    {
      FormTitle: "SQL-based Hold Release L",
      FormType: "Lot",
      Owner: "VSMC",
      Description: "Hold Reaslease",
      MustField: "LotId – Primary key",
      UserDefinedField: "UDATA - filter 2",
      link: "/mainlist/BATCH_RELEASE", // Store the link here
    },
    {
      FormTitle: "SQL-based Hold Lo L",
      FormType: "Lot",
      Owner: "VSMC",
      Description: "HoldLot",
      MustField: "LotId – Primary key",
      UserDefinedField: "UDATA - filter 2",
      link: "/mainlist/BATCH_HOLD", // Store the link here
    },
    // Add more data here
  ];

  // Filter data based on the search query
  const filteredData = data.filter((item) =>
    item.FormTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="overflow-x-auto shadow-md rounded-lg px-4 py-6">
      <table className="min-w-full bg-white table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left font-medium">Title</th>
            {/* <th className="py-2 px-4 text-left font-medium">Form Type</th> */}
            <th className="py-2 px-4 text-left font-medium">Owner</th>
            <th className="py-2 px-4 text-left font-medium">Description</th>
            {/* <th className="py-2 px-4 text-left font-medium">Must Field</th> */}
            <th className="py-2 px-4 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {formRuleList.length > 0 ? (
            formRuleList.map((row, index) => (
              <tr key={index} className="border-t hover:bg-gray-50">
                <td className="py-2 px-4">{row.FORMTITLE}</td>
                {/* <td className="py-2 px-4">{row.FORMTYPE}</td> */}
                <td className="py-2 px-4">{row.OWNER}</td>
                <td className="py-2 px-4">{row.DESCRIPTION}</td>
                {/* <td className="py-2 px-4">{row.MUSTFIELD}</td> */}
                <td className="py-2 px-4">
                  <Link
                    to={row.CONFIG_PATH}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="py-2 px-4 text-center text-gray-500">
                No matching forms found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FormTable;
