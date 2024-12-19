import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
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

const MostRelevantAuthors = () => {
  const [authorData, setAuthorData] = useState([]);
  const [affiliationData, setAffiliationData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/get-data/');
        const papers = response.data;
        
        // Process data for most relevant authors
        const authorCounts = {};
        // Process data for authors with most affiliations
        const authorAffiliations = {};

        papers.forEach(paper => {
          if (paper.Authors && paper.Authors_with_Affiliations) {
            const cleanedAuthorList = paper.Authors.replace(/[\[\]'"]/g, '');
            const authors = cleanedAuthorList.split(";").map(author => author.trim());
            
            const affiliations = paper.Authors_with_Affiliations.split(';').map(aff => aff.trim());
            
            authors.forEach((author, index) => {
              if (author) {
                // Count publications
                authorCounts[author] = (authorCounts[author] || 0) + 1;
                
                // Count unique affiliations
                if (!authorAffiliations[author]) {
                  authorAffiliations[author] = new Set();
                }
                if (affiliations[index]) {
                  authorAffiliations[author].add(affiliations[index]);
                }
              }
            });
          }
        });

        // Process author publication data
        const sortedAuthors = Object.entries(authorCounts)
          .map(([author, count]) => ({ author, publications: count }))
          .sort((a, b) => b.publications - a.publications)
          .slice(0, 10);

        // Process author affiliation data
        const sortedAffiliations = Object.entries(authorAffiliations)
          .map(([author, affiliationsSet]) => ({ author, affiliationCount: affiliationsSet.size }))
          .sort((a, b) => b.affiliationCount - a.affiliationCount)
          .slice(0, 10);

        setAuthorData(sortedAuthors);
        setAffiliationData(sortedAffiliations);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const createChartData = (data, label) => ({
    labels: data.map(item => item.author),
    datasets: [
      {
        label: label,
        data: data.map(item => label === 'Number of Publications' ? item.publications : item.affiliationCount),
        backgroundColor: label === 'Number of Publications' ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)',
      },
    ],
  });

  const options = (title, yAxisLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: title },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: yAxisLabel }
      },
      x: {
        title: { display: true, text: 'Authors' }
      }
    }
  });

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
      }}>Author Analysis</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        <div style={{ height: '400px', width: '45%', minWidth: '300px', margin: '10px' }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "light",
            marginBottom: "15px",
            fontFamily: "Georgia",
            color: "#117027",
            textAlign: "center",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
          }}>Most Relevant Authors</h2>
          {authorData.length > 0 ? (
            <Bar 
              data={createChartData(authorData, 'Number of Publications')} 
              options={options('Most Relevant Authors', 'Number of Publications')} 
            />
          ) : (
            <p>Loading data...</p>
          )}
        </div>
        
        <div style={{ height: '400px', width: '45%', minWidth: '300px', margin: '10px' }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "light",
            marginBottom: "15px",
            fontFamily: "Georgia",
            color: "#117027",
            textAlign: "center",
            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
          }}>Authors with Most Affiliations</h2>
          {affiliationData.length > 0 ? (
            <Bar 
              data={createChartData(affiliationData, 'Number of Affiliations')} 
              options={options('Authors with Most Affiliations', 'Number of Affiliations')} 
            />
          ) : (
            <p>Loading data...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MostRelevantAuthors;