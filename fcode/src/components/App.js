import React, { useState, useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.css';
import axios from 'axios';

import "../NewStyle.css";

function App() {
  const [excelFile, setExcelFile] = useState(null);
  const [typeError, setTypeError] = useState(null);
  const [excelData, setExcelData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/get-data/');
        setExcelData(response.data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching data after reload:', error);
      }
    };
    fetchData();
  }, []);

  const handleFile = (e) => {
    let fileTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
    let selectedFile = e.target.files[0];
    if (selectedFile) {
      if (fileTypes.includes(selectedFile.type)) {
        setTypeError(null);
        setExcelFile(selectedFile);
      } else {
        setTypeError('Please select only CSV or Excel file types');
        setExcelFile(null);
      }
    } else {
      console.log('Please select your file');
    }
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (excelFile !== null) {
      await handleDelete(); // Delete old records before uploading
  
      const formData = new FormData();
      formData.append('myfile', excelFile);
  
      try {
        const postResponse = await axios.post('http://127.0.0.1:8000/api/upload-csv/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);  // Update progress
          }
        });
  
        console.log(postResponse.data.message);
  
        const getResponse = await axios.get('http://127.0.0.1:8000/api/get-data/');
        setExcelData(getResponse.data.slice(0, 6));
        setUploadProgress(0);  // Reset progress after completion
      } catch (error) {
        console.error('Error uploading file or fetching data:', error);
        setUploadProgress(0);  // Reset progress in case of error
      }
    }
  };
  

  const handleDelete = async () => {
    try {
      const deleteResponse = await axios.delete('http://127.0.0.1:8000/api/delete-all/');
      console.log(deleteResponse.data.message);
      setExcelData(null);
    } catch (error) {
      console.error('Error deleting records:', error);
    }
  };

  return (
    <div className="wrapper mt-3">
      {/* form */}
      <form className="form-group custom-form" onSubmit={handleFileSubmit}>
        <div className="d-flex flex-column align-items-center">
          <div className="mb-3">
            <input
              type="file"
              className="form-control form-control-sm"
              required
              onChange={handleFile}
            />
          </div>
          <button
            type="submit"
            className="btn btn-success btn-md"
          >
            UPLOAD
          </button>

          {typeError && (
            <div className="alert alert-danger mt-3" role="alert">{typeError}</div>
          )}
        </div>
      </form>

      {/* Progress bar */}
      {uploadProgress > 0 && (
        <div className="progress mt-3" style={{ width: '20%', margin: '0 auto' }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${uploadProgress}%` }}
            aria-valuenow={uploadProgress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {uploadProgress}%
          </div>
        </div>
      )}

<div className="viewer mt-3">
  {excelData && excelData.length > 0 ? (
    <>
      <div className="container">
        {/* Scrollable table container */}
        <div className="scrollable-container">
          <div className="table-responsive">
            <table className="table table-bordered table-striped small">
              <thead>
                <tr>
                  {Object.keys(excelData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {excelData.map((individualExcelData, index) => (
                  <tr key={index}>
                    {Object.keys(individualExcelData).map((key) => (
                      <td key={key}>{individualExcelData[key]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete button */}
      <div className="text-center mt-3">
        <button
          type="button"
          className="btn btn-danger btn-md"
          onClick={handleDelete}
        >
          DELETE ALL RECORDS
        </button>
      </div>
    </>
  ) : (
    <div></div>
  )}
</div>

    </div>
  );
}

export default App;
