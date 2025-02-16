import React from "react";
import { Link } from "react-router-dom";

const FormTable = ({ searchQuery }) => {
  const data = [
    {
      FormTitle: "Form_Demo",
      FormType: "Eqp",
      Owner: "Owner 1",
      Description: "Description 1",
      MustField: "EqpId – Primary key",
      UserDefinedField: "UDATA - filter",
      link: "/formdemo", // Store the link here
    },
    {
      FormTitle: "Main",
      FormType: "Lot",
      Owner: "Owner 2",
      Description: "Description 3",
      MustField: "LotId – Primary key",
      UserDefinedField: "UDATA - filter 2",
      link: "/jsonform", // Store the link here
    },
    {
        FormTitle: "Drink",
        FormType: "Drink",
        Owner: "Owner 2",
        Description: "Description 3",
        MustField: "LotId – Primary key",
        UserDefinedField: "UDATA - filter 2",
        link: "/drink", // Store the link here
      },
    // Add more data here
  ];

  // Filter data based on the search query
  const filteredData = data.filter((item) =>
    item.FormTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      <table className="min-w-full bg-white table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 text-left font-medium text-gray-600">
              Title
            </th>
            <th className="py-2 px-4 text-left font-medium text-gray-600">
              Form Type
            </th>
            <th className="py-2 px-4 text-left font-medium text-gray-600">
              Owner
            </th>
            <th className="py-2 px-4 text-left font-medium text-gray-600">
              Description
            </th>
            <th className="py-2 px-4 text-left font-medium text-gray-600">
              Must Field
            </th>
            <th className="py-2 px-4 text-left font-medium text-gray-600">
              User Defined Field
            </th>
            <th className="py-2 px-4 text-left font-medium text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index} className="border-t hover:bg-gray-50">
              <td className="py-2 px-4">{row.FormTitle}</td>
              <td className="py-2 px-4">{row.FormType}</td>
              <td className="py-2 px-4">{row.Owner}</td>
              <td className="py-2 px-4">{row.Description}</td>
              <td className="py-2 px-4">{row.MustField}</td>
              <td className="py-2 px-4">{row.UserDefinedField}</td>
              <td className="py-2 px-4">
                <Link
                  to={row.link}
                  className="text-blue-500 hover:text-blue-700"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FormTable;
