import React, { useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const Sources = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
        {
            label: "Document Type",
            data: [],
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
          {
            label: "Number of Authors",
            data: [],
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      });
    
      const [chartData2, setChartData2] = useState({
        labels: [],
        datasets: [
          {
            label: "Document Type",
            data: [],
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 1,
          },
        ],
      });
    
      const [chartData3, setChartData3] = useState({
        labels: [],
        datasets: [
          {
            label: "Language",
            data: [],
            backgroundColor: "rgba(255, 206, 86, 0.2)",
            borderColor: "rgba(255, 206, 86, 1)",
            borderWidth: 1,
          },
        ],
      });
    
      useEffect(() => {
        const fetchChartData = async () => {
          try {
            const response = await fetch("http://127.0.0.1:8000/api/get-data/");
            const data = await response.json();
    
            // Create a dictionary to store the count of each document type
            const documentTypeCount = {};
            data.forEach((item) => {
              if (documentTypeCount[item.Document]) {
                documentTypeCount[item.Document]++;
              } else {
                documentTypeCount[item.Document] = 1;
              }
            });
    
            // Create a dictionary to store the count of each author
            const authorCountByDocumentType = {};
            data.forEach((item) => {
                if (authorCountByDocumentType[item.Document]) {
                    if (authorCountByDocumentType[item.Document].includes(item.Authors)) {
                    // do nothing
                    } else {
                    authorCountByDocumentType[item.Document].push(item.Authors);
                    }
                } else {
                    authorCountByDocumentType[item.Document] = [item.Authors];
                }
            });

            const authorCounts = {};
            Object.keys(authorCountByDocumentType).forEach((documentType) => {
                authorCounts[documentType] = authorCountByDocumentType[documentType].length;
            });
    
            // Create a dictionary to store the count of each language
            const languageCount = {};
            data.forEach((item) => {
              if (languageCount[item.Language]) {
                languageCount[item.Language]++;
              } else {
                languageCount[item.Language] = 1;
              }
            });
    
            // Set the chart data
            setChartData({
              labels: Object.keys(documentTypeCount),
              datasets: [
                {
                  label: "Document Type",
                  data: Object.values(documentTypeCount),
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  borderColor: "rgba(255, 99, 132, 1)",
                  borderWidth: 1,
                },
                {
                  label: "Number of Authors",
                  data: Object.values(authorCounts),
                  backgroundColor: "rgba(54, 162, 235, 0.2)",
                  borderColor: "rgba(54, 162, 235, 1)",
                  borderWidth: 1,
                },
              ],
            });
    
            setChartData2({
              labels: Object.keys(documentTypeCount),
              datasets: [
                {
                  label: "Document Type",
                  data: Object.values(documentTypeCount),
                  backgroundColor: [
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(255, 206, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                  ],
                  borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)",
                    "rgba(255, 159, 64, 1)",
                  ],
                  borderWidth: 1,
                },
              ],
            });
    
            setChartData3({
              labels: Object.keys(languageCount),
              datasets: [
                {
                  label: "Language",
                  data: Object.values(languageCount),
                  backgroundColor: "rgba(255, 206, 86, 0.2)",
                  borderColor: "rgba(255, 206, 86, 1)",
                  borderWidth: 1,
                },
              ],
            });
          } catch (error) {
            console.error("Error fetching chart data:", error);
          }
        };
    
        fetchChartData();
      }, []);
    

  return (
    <div style={{ textAlign: "center" }}>
      <h1 style={{ fontSize: "36px",
        fontWeight: "bold",
        marginBottom: "20px",
        fontFamily: "Montserrat",
        color: "#A020F0",
        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)", }}>
        Sources- Analysis Graphs of the dataset
      </h1>
      <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "800px", height: "400px", margin: "20px" }}>
        <Bar
            data={chartData}
            options={{
            title: {
                display: true,
                text: "Document Type vs Number of Authors",
            },
            scales: {
                y: 
                {
                    
                    beginAtZero: true,
                    
                },
                
            },
            }}
        />
        </div>
        <div style={{ width: "800px", height: "400px", margin: "20px" }}>
        <Pie
            data={chartData2}
            options={{
            title: {
                display: true,
                text: "Document Type Distribution",
            },
            }}
        />
        </div>
        <div style={{ width: "800px", height: "400px", margin: "20px" }}>
        <Pie
            data={chartData3}
            options={{
            title: {
                display: true,
                text: "Language Distribution",
            },
            }}
        />
        </div>
        </div>
        </div>

  );
};

export default Sources;