import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AffiliationProductionOverTime = () => {
  const [productionData, setProductionData] = useState({});
  const [selectedAffiliations, setSelectedAffiliations] = useState([]);
  const [availableAffiliations, setAvailableAffiliations] = useState([]);
  const [error, setError] = useState(null);
  const [affiliationsToShow, setAffiliationsToShow] = useState(10);
  const [showMoreButton, setShowMoreButton] = useState(true);
  const [expandedLegend, setExpandedLegend] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/get-data/');
        const papers = response.data;
        
        const affiliationProduction = {};
        const allAffiliations = new Set();

        papers.forEach(paper => {
          const year = parseInt(paper.Year);
          if (paper.Affiliations && year) {
            const affiliations = paper.Affiliations.split(';').map(aff => aff.trim());
            affiliations.forEach(affiliation => {
              if (affiliation) {
                allAffiliations.add(affiliation);
                if (!affiliationProduction[affiliation]) {
                  affiliationProduction[affiliation] = {};
                }
                affiliationProduction[affiliation][year] = (affiliationProduction[affiliation][year] || 0) + 1;
              }
            });
          }
        });

        setProductionData(affiliationProduction);
        const sortedAffiliations = Array.from(allAffiliations).sort();
        setAvailableAffiliations(sortedAffiliations);
        
        // Select top 50 papers by default
        const top50 = sortedAffiliations.slice(0, 50);
        setSelectedAffiliations(top50);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  const handleAffiliationSelect = (affiliation) => {
    setSelectedAffiliations(prev => 
      prev.includes(affiliation) 
        ? prev.filter(a => a !== affiliation)
        : [...prev, affiliation]
    );
  };

  const handleShowMoreAffiliations = () => {
    if (affiliationsToShow + 10 >= availableAffiliations.length) {
      setAffiliationsToShow(availableAffiliations.length);
      setShowMoreButton(false);
    } else {
      setAffiliationsToShow(affiliationsToShow + 10);
    }
  };

  const handleShowLessAffiliations = () => {
    setAffiliationsToShow(10);
    setShowMoreButton(true);
  };

  const createChartData = () => {
    const years = Array.from(new Set(selectedAffiliations.flatMap(aff => Object.keys(productionData[aff] || {})))).sort();
    return {
      labels: years,
      datasets: selectedAffiliations.map((affiliation, index) => ({
        label: affiliation,
        data: years.map(year => productionData[affiliation][year] || 0),
        borderColor: `hsl(${index * 137.5 % 360}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 137.5 % 360}, 70%, 50%, 0.5)`,
      }))
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: false  // Hide the default legend
      },
      title: { display: true, text: 'Affiliation\'s Production Over Time' },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Number of Publications' }
      },
      x: {
        title: { display: true, text: 'Year' }
      }
    }
  };

  const toggleLegend = () => {
    setExpandedLegend(!expandedLegend);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1 style={{
        fontSize: "30px",
        fontWeight: "bold",
        marginBottom: "20px",
        marginTop: "20px",
        fontFamily: "Georgia",
        color: "#0b5c1e",
        textAlign: "center",
        textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
      }}>Affiliation's Production Over Time</h1>
      
      <div style={{ margin: '20px 0', textAlign: 'center' }}>
        <h2>Select Affiliations:</h2>
        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
          {availableAffiliations.slice(0, affiliationsToShow).map(affiliation => (
            <div key={affiliation} style={{ margin: '5px 0' }}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedAffiliations.includes(affiliation)}
                  onChange={() => handleAffiliationSelect(affiliation)}
                />
                {affiliation}
              </label>
            </div>
          ))}
        </div>
        {showMoreButton && (
          <button onClick={handleShowMoreAffiliations} style={{ marginTop: '10px' }}>
            Show More Affiliations
          </button>
        )}
        {!showMoreButton && (
          <button onClick={handleShowLessAffiliations} style={{ marginTop: '10px' }}>
            Show Less Affiliations
          </button>
        )}
      </div>

      <div style={{ height: '600px', width: '80%', margin: '0 auto' }}>
        {selectedAffiliations.length > 0 ? (
          <Line data={createChartData()} options={options} />
        ) : (
          <p>Please select at least one affiliation to display the chart.</p>
        )}
      </div>

      {/* Custom Legend */}
      <div style={{ width: '80%', margin: '20px auto', textAlign: 'center' }}>
        <button onClick={toggleLegend} style={{ marginBottom: '10px' }}>
          {expandedLegend ? 'Hide Legend' : 'Show Legend'}
        </button>
        {expandedLegend && (
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
            {selectedAffiliations.map((affiliation, index) => (
              <div key={affiliation} style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: `hsla(${index * 137.5 % 360}, 70%, 50%, 0.5)`,
                    marginRight: '10px'
                  }}
                ></div>
                {affiliation}
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
};

export default AffiliationProductionOverTime;