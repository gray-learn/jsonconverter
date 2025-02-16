import React from "react";

const SearchBar = ({ searchQuery, setSearchQuery }) => {
    // Handle input change
    const handleInputChange = (event) => {
        setSearchQuery(event.target.value); // Update the searchQuery state
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                placeholder="Search..."
                className="border p-2 rounded-md w-full"
            />
        </div>
    );
};

export default SearchBar;
