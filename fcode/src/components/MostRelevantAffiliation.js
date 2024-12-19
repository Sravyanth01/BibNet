import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MostRelevantAffiliation = () => {
  const [affiliationData, setAffiliationData] = useState([]);
  const [citationData, setCitationData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/get-data/');
        const papers = response.data;
        
        const affiliationCounts = {};
        const affiliationCitations = {};

        papers.forEach(paper => {
          if (paper.Affiliations) {
            // Remove square brackets, quotes, and any unnecessary characters
            const cleanedAffiliations = paper.Affiliations.replace(/[\[\]'"]/g, '');
            
            // Split the cleaned affiliations list by semicolons
            const affiliations = cleanedAffiliations.split(';').map(aff => aff.trim());
            const citations = parseInt(paper.Citations) || 0;
            
            affiliations.forEach(affiliation => {
              if (affiliation) {
                affiliationCounts[affiliation] = (affiliationCounts[affiliation] || 0) + 1;
                affiliationCitations[affiliation] = (affiliationCitations[affiliation] || 0) + citations;
              }
            });
          }
        });

        console.log('Raw Affiliation Counts:', affiliationCounts);
        console.log('Raw Affiliation Citations:', affiliationCitations);

        // Sort and get top 10 affiliations by publication count
        const sortedAffiliations = Object.entries(affiliationCounts)
          .map(([affiliation, count]) => ({ affiliation, publications: count }))
          .sort((a, b) => b.publications - a.publications)
          .slice(0, 10);

        // Sort and get top 10 affiliations by citation count
        const sortedCitations = Object.entries(affiliationCitations)
          .map(([affiliation, citations]) => ({ affiliation, citations }))
          .sort((a, b) => b.citations - a.citations)
          .slice(0, 10);

        console.log('Processed Affiliations:', sortedAffiliations);
        console.log('Processed Citations:', sortedCitations);

        setAffiliationData(sortedAffiliations);
        setCitationData(sortedCitations);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching data. Please try again later.');
      }
    };

    fetchData();
  }, []);

  const createBarChartData = (data, label, color) => ({
    labels: data.map(item => item.affiliation),
    datasets: [
      {
        label: label,
        data: data.map(item => item[label.toLowerCase()]),
        backgroundColor: color,
        borderColor: color.replace('0.6', '1'),
        borderWidth: 1,
      },
    ],
  });

  const createDoughnutChartData = (data) => ({
    labels: data.map(item => item.affiliation),
    datasets: [
      {
        data: data.map(item => item.citations),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)',
          'rgba(40, 159, 64, 0.8)',
          'rgba(210, 199, 199, 0.8)',
        ],
        borderColor: 'rgba(255, 255, 255, 1)',
        borderWidth: 1,
      },
    ],
  });

  const barOptions = (title, yAxisLabel) => ({
    // ... (keep your existing options for bar chart)
  });

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'right',
        labels: {
          boxWidth: 20,
          font: { size: 10 }
        }
      },
      title: { 
        display: true, 
        text: 'Most Relevant Affiliations by Citations',
        font: { size: 16 }
      },
    },
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
      }}>Most Relevant Affiliations</h1>
      
      <div style={{ height: '600px', width: '80%', margin: '0 auto', marginBottom: '50px' }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "light",
          marginBottom: "20px",
          fontFamily: "Georgia",
          color: "#117027",
          textAlign: "center",
        }}>Affiliations with Most Publications</h2>
        {affiliationData.length > 0 ? (
          <Bar 
            data={createBarChartData(affiliationData, 'Publications', 'rgba(75, 192, 192, 0.6)')} 
            options={barOptions('Most Relevant Affiliations by Publications', 'Number of Publications')} 
          />
        ) : (
          <p>Loading publication data...</p>
        )}
      </div>

      <div style={{ height: '600px', width: '80%', margin: '0 auto' }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "light",
          marginBottom: "20px",
          fontFamily: "Georgia",
          color: "#117027",
          textAlign: "center",
        }}>Affiliations with Most Citations</h2>
        {citationData.length > 0 ? (
          <Doughnut 
            data={createDoughnutChartData(citationData)} 
            options={doughnutOptions} 
          />
        ) : (
          <p>Loading citation data...</p>
        )}
      </div>


    </div>
  );
};

export default MostRelevantAffiliation;