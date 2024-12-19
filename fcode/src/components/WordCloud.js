import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { toPng } from 'html-to-image';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const WordCloud = () => {
  const [wordCloudImage, setWordCloudImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [words, setWords] = useState([]);

  useEffect(() => {
    const fetchWordCloud = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/generate-word-cloud/', {
          responseType: 'text',
        });
        setWordCloudImage(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching word cloud:', error);
        setError('Failed to fetch word cloud. Please try again later.');
        setIsLoading(false);
      }
    };

    const fetchWords = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/word-frequencies/');
        setWords(response.data);
      } catch (error) {
        console.error('Error fetching word frequencies:', error);
      }
    };

    fetchWordCloud();
    fetchWords();
  }, []);

  const exportToCSV = () => {
    if (words.length === 0) {
      alert('No word data available to export.');
      return;
    }

    const header = 'Word,Frequency\n';
    const csvData = words.map(word => `${word.text},${word.value}`).join('\n');
    const blob = new Blob([header + csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "word_frequencies.csv");
  };

  const handleDownload = (format) => {
    const wordCloudElement = document.getElementById("word-cloud-image");
    
    if (!wordCloudElement) {
      alert('Word cloud image not found.');
      return;
    }

    if (format === 'png') {
      toPng(wordCloudElement, {
        backgroundColor: "#ffffff",
      })
        .then((dataUrl) => {
          saveAs(dataUrl, "word_cloud.png");
        })
        .catch((err) => {
          console.error("Error downloading word cloud:", err);
          alert('Failed to download word cloud image.');
        });
    } else if (format === 'svg') {
      // This would require backend support to provide SVG
      alert('SVG download not implemented.');
    }
  };


  const pageStyle = {
    padding: '20px',
    maxWidth: '900px',
    margin: '0 auto',
    fontFamily: "'Arial', sans-serif",
  };

  const titleStyle = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#34495e',
    textAlign: 'center',
    marginBottom: '20px',
    textTransform: 'uppercase',
  };

  const cardStyle = {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 8px 15px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  const cardHoverStyle = {
    transform: 'translateY(-10px)',
    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.3)',
  };

  const imageStyle = {
    maxWidth: '100%',
    height: '300px',
    borderRadius: '8px',
    border: '2px solid #dcdcdc',
    transition: 'box-shadow 0.3s ease',
  };

  const loadingStyle = {
    ...pageStyle,
    textAlign: 'center',
    marginTop: '50px',
    fontSize: '24px',
    color: '#7f8c8d',
  };

  const errorStyle = {
    ...pageStyle,
    textAlign: 'center',
    marginTop: '50px',
    color: '#e74c3c',
    fontSize: '24px',
    fontWeight: 'bold',
  };

  if (isLoading) return <div style={loadingStyle}>Loading...</div>;

  if (error) return <div style={errorStyle}>{error}</div>;

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Word Cloud</h1>
      <div
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = cardHoverStyle.transform;
          e.currentTarget.style.boxShadow = cardHoverStyle.boxShadow;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
          e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.2)';
        }}
      >
        {wordCloudImage && (
          <img
            id="word-cloud-image"
            src={`data:image/png;base64,${wordCloudImage}`}
            alt="Word Cloud"
            style={imageStyle}
          />
        )}
      </div>
      <div style={{ textAlign: "center", marginTop: "5px" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleDownload('png')}
                  style={{ marginRight: "10px" }}
                >
                  <FontAwesomeIcon icon={faDownload} style={{ marginRight: "5px" }} />
                  PNG
                </button>
                {/* <button
                  className="btn btn-secondary"
                  onClick={exportToCSV}
                >
                  <FontAwesomeIcon icon={faDownload} style={{ marginRight: "5px" }} />
                  CSV
                </button> */}
              </div>
    </div>
  );
};

export default WordCloud;