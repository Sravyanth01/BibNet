// Document.js
import React, { useState, useEffect } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

const Document = () => {
  const [chartData, setChartData] = useState({
    fundingSponsor: {
      labels: [],
      datasets: [
        {
          label: 'Number of Documents',
          data: [],
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    },
    documentType: {
      labels: [],
      datasets: [
        {
          label: 'Number of Documents',
          data: [],
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    },
    affiliations: {
      labels: [],
      datasets: [
        {
          label: 'Number of Documents',
          data: [],
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    },
    documentsPerYear: {
      labels: [],
      datasets: [
        {
          label: 'Number of Documents',
          data: [],
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
        },
      ],
    },
    subjectArea: {
      labels: [],
      datasets: [
        {
          label: 'Number of Documents',
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1,
        },
      ],
    },
  });

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/get-data/');
        const data = await response.json();

        const fundingSponsorData = {};
        const documentTypeData = {};
        const affiliationsData = {};
        const documentsPerYearData = {};
        const subjectAreaData = {};

        data.forEach((item) => {
          // Funding Sponsor
          if (item.Funding_Details) {
            const sponsors = item.Funding_Details.split(';');
            sponsors.forEach(sponsor => {
              const trimmedSponsor = sponsor.trim();
              if (trimmedSponsor) {
                fundingSponsorData[trimmedSponsor] = (fundingSponsorData[trimmedSponsor] || 0) + 1;
              }
            });
          }

          // Document Type
          if (item.Document) {
            documentTypeData[item.Document] = (documentTypeData[item.Document] || 0) + 1;
          }

          // Affiliations
          if (item.Affiliations) {
            const affiliations = item.Affiliations.split(';');
            affiliations.forEach(affiliation => {
              const trimmedAffiliation = affiliation.trim();
              if (trimmedAffiliation) {
                // Document.js (continued)

                affiliationsData[trimmedAffiliation] = (affiliationsData[trimmedAffiliation] || 0) + 1;
              }
            });
          }

          // Documents per Year
          if (item.Year) {
            documentsPerYearData[item.Year] = (documentsPerYearData[item.Year] || 0) + 1;
          }

          // Subject Area (using first topic from Index_Keywords)
          if (item.Index_Keywords) {
            const firstTopic = item.Index_Keywords.split(';')[0].trim();
            if (firstTopic) {
              subjectAreaData[firstTopic] = (subjectAreaData[firstTopic] || 0) + 1;
            }
          }
        });

        // Sort and limit data
        const sortedFundingSponsors = Object.entries(fundingSponsorData).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const sortedAffiliations = Object.entries(affiliationsData).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const sortedSubjectAreas = Object.entries(subjectAreaData).sort((a, b) => b[1] - a[1]).slice(0, 50);

        const getRandomColor = () => {
          return `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.6)`;
        };

        setChartData({
          fundingSponsor: {
            labels: sortedFundingSponsors.map(([sponsor]) => sponsor),
            datasets: [
              {
                label: 'Number of Documents',
                data: sortedFundingSponsors.map(([, count]) => count),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
              },
            ],
          },
          documentType: {
            labels: Object.keys(documentTypeData),
            datasets: [
              {
                label: 'Number of Documents',
                data: Object.values(documentTypeData),
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
              },
            ],
          },
          affiliations: {
            labels: sortedAffiliations.map(([affiliation]) => affiliation),
            datasets: [
              {
                label: 'Number of Documents',
                data: sortedAffiliations.map(([, count]) => count),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
              },
            ],
          },
          documentsPerYear: {
            labels: Object.keys(documentsPerYearData).sort(),
            datasets: [
              {
                label: 'Number of Documents',
                data: Object.values(documentsPerYearData),
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
              },
            ],
          },
          subjectArea: {
            labels: sortedSubjectAreas.map(([topic]) => topic),
            datasets: [
              {
                label: 'Number of Documents',
                data: sortedSubjectAreas.map(([, count]) => count),
                backgroundColor: sortedSubjectAreas.map(() => getRandomColor()),
                borderColor: sortedSubjectAreas.map(() => getRandomColor()),
                borderWidth: 1,
              },
            ],
          },
        });
      // Document.js (continued)

    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  fetchChartData();
}, []);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: '',
    },
  },
  scales: {
    x: {
      ticks: {
        maxRotation: 90,
        minRotation: 90
      }
    },
    y: {
      beginAtZero: true
    }
  }
};

return (
  <div className="container">
    <h1 style={{
      fontSize: "30px",
      fontWeight: "bold",
      marginBottom: "20px",
      marginTop: "20px",
      fontFamily: "Georgia",
      color: "#0b5c1e",
      textAlign: "center",
      textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
    }}>Document Overall Chart Analysis</h1>
    
    <div className="row">
      <div className="col-md-6" style={{ height: '400px', marginTop: '30px',marginBottom: '30px' }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "light",
          marginBottom: "20px",
          fontFamily: "Georgia",
          color: "#117027",
          textAlign: "center",
        }}>Top 10 Funding Sponsors</h2>
        <Bar
          data={chartData.fundingSponsor}
          options={{
            ...chartOptions,
            indexAxis: 'y',
            plugins: {
              ...chartOptions.plugins,
              title: { display: true, text: 'Number of Documents by Funding Sponsor' },
            },
          }}
        />
      </div>
      <div className="col-md-6" style={{ height: '400px', marginBottom: '30px', marginTop: '30px' }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "light",
          marginBottom: "20px",
          fontFamily: "Georgia",
          color: "#117027",
          textAlign: "center",
        }}>Document Types</h2>
        <Bar
          data={chartData.documentType}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              title: { display: true, text: 'Number of Documents by Document Type' },
            },
          }}
        />
      </div>
    </div>
    
    <div className="row">
      <div className="col-md-6" style={{ height: '400px', marginBottom: '30px', marginTop: '30px' }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "light",
          marginBottom: "20px",
          fontFamily: "Georgia",
          color: "#117027",
          textAlign: "center",
        }}>Top 10 Affiliations</h2>
        <Bar
          data={chartData.affiliations}
          options={{
            ...chartOptions,
            indexAxis: 'y',
            plugins: {
              ...chartOptions.plugins,
              title: { display: true, text: 'Number of Documents by Affiliations' },
            },
            
          }}
        />
      </div>
      <div className="col-md-6" style={{ height: '400px', marginBottom: '30px', marginTop: '30px' }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "light",
          marginBottom: "20px",
          fontFamily: "Georgia",
          color: "#117027",
          textAlign: "center",
        }}>Documents per Year</h2>
        <Line
          data={chartData.documentsPerYear}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              title: { display: true, text: 'Number of Documents per Year' },
            },
          }}
        />
      </div>
    </div>
    
    <div className="row">
      <div className="col-md-12" style={{ height: '600px', marginBottom: '30px', marginTop: '30px' }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "light",
          marginBottom: "20px",
          fontFamily: "Georgia",
          color: "#117027",
          textAlign: "center",
        }}>Top 50 Subject Areas</h2>
        <Bar
          data={chartData.subjectArea}
          options={{
            ...chartOptions,
            indexAxis: 'y',
            plugins: {
              ...chartOptions.plugins,
              title: { display: true, text: 'Number of Documents by Subject Area' },
              legend: { display: false },
            },
          }}
        />
      </div>
    </div>
  </div>
);
};

export default Document;
