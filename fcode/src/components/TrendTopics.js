// TrendTopics.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const TrendTopics = () => {
  const [trendData, setTrendData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLegend, setExpandedLegend] = useState(false);

  useEffect(() => {
    const fetchTrendTopics = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/get-trend-topics/');
        setTrendData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching trend topics:', error);
        setError('Failed to fetch trend topics. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchTrendTopics();
  }, []);

  const prepareChartData = () => {
    const years = Object.keys(trendData).sort();
    const allTopics = new Set();
    years.forEach(year => {
      trendData[year].forEach(([topic]) => allTopics.add(topic));
    });

    const datasets = Array.from(allTopics).map(topic => ({
      label: topic,
      data: years.map(year => {
        const topicData = trendData[year].find(([t]) => t === topic);
        return topicData ? topicData[1] : 0;
      }),
      fill: false,
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }));

    return {
      labels: years,
      datasets,
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false, // Hide default legend
      },
      title: {
        display: true,
        text: 'Trend Topics Over Time',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Year',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Frequency',
        },
        beginAtZero: true,
      },
    },
  };

  const toggleLegend = () => {
    setExpandedLegend(!expandedLegend);
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

  if (isLoading) return <div style={{...pageStyle, textAlign: 'center', marginTop: '50px'}}>Loading...</div>;
  if (error) return <div style={{...pageStyle, textAlign: 'center', marginTop: '50px', color: 'red'}}>{error}</div>;

  const chartData = prepareChartData();

// TrendTopics.js (continued)

return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Trend Topics</h1>
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <Line data={chartData} options={options} />
      </div>

      {/* Legend toggle button */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={toggleLegend} style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}>
          {expandedLegend ? 'Hide Legend' : 'Show Legend'}
        </button>
      </div>

      {/* Custom Legend */}
      {expandedLegend && (
        <div style={{
          maxHeight: '200px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          borderRadius: '5px',
          padding: '10px',
          marginTop: '20px',
        }}>
          {chartData.datasets.map((dataset, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              margin: '5px 0',
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: dataset.borderColor,
                marginRight: '10px',
              }}></div>
              <span>{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendTopics;