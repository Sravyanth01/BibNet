// Author.js
// Author.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Author = () => {
  const [topAuthors, setTopAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/get-most-cited-authors/');
        setTopAuthors(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = {
    labels: topAuthors.map(author => author.Authors),
    datasets: [
      {
        label: 'Number of Citations',
        data: topAuthors.map(author => author.citations),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Top 10 Most Cited Authors',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Citations',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Authors',
        },
      },
    },
};

const pageStyle = {
  padding: '20px',
  maxWidth: '1200px',
  margin: '0 auto',
};

const titleStyle = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#2c3e50',
  textAlign: 'center',
  marginBottom: '30px',
};

const chartContainerStyle = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  marginBottom: '30px',
};

if (isLoading) return <div style={{...pageStyle, textAlign: 'center', marginTop: '50px'}}>Loading...</div>;
if (error) return <div style={{...pageStyle, textAlign: 'center', marginTop: '50px', color: 'red'}}>{error}</div>;

return (
  <div style={pageStyle}>
    <h1 style={titleStyle}>Author Analysis</h1>
    <div style={chartContainerStyle}>
      <Bar options={chartOptions} data={chartData} />
    </div>
    <div style={{
      backgroundColor: '#f8f9fa',
      padding: '30px',
      borderRadius: '15px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: '20px',
        textAlign: 'center',
      }}>Top 10 Most Cited Authors</h2>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr style={{backgroundColor: '#e9ecef'}}>
            <th style={tableHeaderStyle}>Rank</th>
            <th style={tableHeaderStyle}>Author</th>
            <th style={tableHeaderStyle}>Number of Citations</th>
          </tr>
        </thead>
        <tbody>
          {topAuthors.map((author, index) => (
            <tr key={index} style={{backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'}}>
              <td style={tableCellStyle}>{index + 1}</td>
              <td style={tableCellStyle}>{author.Authors}</td>
              <td style={tableCellStyle}>{author.citations}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
};

const tableHeaderStyle = {
padding: '12px',
textAlign: 'left',
borderBottom: '2px solid #dee2e6',
fontWeight: 'bold',
};

const tableCellStyle = {
padding: '12px',
textAlign: 'left',
borderBottom: '1px solid #dee2e6',
};

export default Author;