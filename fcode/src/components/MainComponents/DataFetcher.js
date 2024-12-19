import React, { useEffect, useState } from "react";
import axios from "axios";

const DataFetcher = ({ onDataFetch }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/get-data/");
      const data = response.data;
      onDataFetch(data);
    } catch (err) {
      setError("Error fetching data: " + err.message);
    }
  };

  return error ? <div className="alert alert-danger">{error}</div> : null;
};

export default DataFetcher;
