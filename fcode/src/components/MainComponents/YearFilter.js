import React from "react";

const YearFilter = ({ startYear, endYear, yearRange, handleYearChange, applyYearFilter }) => (
  <div style={{ marginBottom: "20px" }}>
    <label>Start Year: </label>
    <select name="startYear" value={startYear} onChange={handleYearChange}>
      {yearRange?.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>

    <label style={{ marginLeft: "20px" }}>End Year: </label>
    <select name="endYear" value={endYear} onChange={handleYearChange}>
      {yearRange?.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>

    <button className="btn btn-primary" onClick={applyYearFilter} style={{ marginTop: "10px", width: "100%" }}>
      Apply Filter
    </button>
  </div>
);

export default YearFilter;
