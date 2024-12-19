import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Scatter } from "react-chartjs-2";
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const AuthorCount = () => {
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState("scatter");
  const [showLegend, setShowLegend] = useState(true);
  const [maxDisplayCount, setMaxDisplayCount] = useState(25);
  const [authorCounts, setAuthorCounts] = useState([]);
  const [chartColor, setChartColor] = useState("#2563eb");
  const [borderColor, setBorderColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(12);
  const [chartTitle, setChartTitle] = useState("Unique Authors vs Papers Published");
  const [showGrid, setShowGrid] = useState(true);
  const [error, setError] = useState(null);
  const [noDataMessage, setNoDataMessage] = useState("");
  const [pointColor, setPointColor] = useState('#000000');

  
  // New state for axis label customization
  const [xAxisLabel, setXAxisLabel] = useState("Number of Authors");
  const [yAxisLabel, setYAxisLabel] = useState("Number of Papers");
  const [xAxisLabelSize, setXAxisLabelSize] = useState(12);
  const [yAxisLabelSize, setYAxisLabelSize] = useState(12);
  const [showChartTitle, setShowChartTitle] = useState(true);

  const styles = {
    container: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "16px",
    },
    chartPanel: {
      flex: "2",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      padding: "24px",
      marginRight: "16px",
    },
    controlPanel: {
      flex: "1",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      padding: "12px",
      fontSize: "12px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    title: {
      fontSize: "12px",
      fontWeight: "bold",
    },
    chartContainer: {
      height: "500px",
      position: "relative",
    },
    downloadButton: {
      width: "100%",
      backgroundColor: "#2563eb",
      color: "white",
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      marginBottom: "10px",
    },
    label: {
      marginBottom: "8px",
    },
    inputRange: {
      width: "100%",
    },
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/get-data/");
      if (!response.ok) {
        throw new Error('Failed to fetch author data');
      }
      const data = await response.json();
      processAuthorData(data);
    } catch (err) {
      setError("Error fetching data: " + err.message);
      setNoDataMessage("Unable to load data");
    }
  };

  const processAuthorData = (data) => {
    const papersByAuthorCount = new Map();
  
    data.forEach((item) => {
      if (item.Authors) {
        const authors = item.Authors.split(";").map(author => author.trim());
        const authorCount = authors.length;
  
        papersByAuthorCount.set(
          authorCount,
          (papersByAuthorCount.get(authorCount) || 0) + 1
        );
      }
    });
  
    const result = Array.from(papersByAuthorCount.entries())
      .sort((a, b) => a[0] - b[0]);
  
    setAuthorCounts(result);
    setNoDataMessage(result.length === 0 ? "No data available" : "");
  };

  const exportToCSV = () => {
    const header = `${xAxisLabel},${yAxisLabel}\n`;
    const csvData = authorCounts
      .map(([authorCount, paperCount]) => `${authorCount},${paperCount}`)
      .join('\n');
    const blob = new Blob([header + csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'author_papers_data.csv');
  };

  const handleDownload = (format) => {
    const chartElement = chartRef.current?.chartInstance?.canvas;
    if (!chartElement) return;

    if (format === 'png') {
      const originalBackground = chartElement.style.background;
      chartElement.style.background = 'white';
      
      toPng(chartElement, {
        backgroundColor: '#ffffff',
        style: { background: 'white' },
      })
        .then((dataUrl) => {
          saveAs(dataUrl, 'author_papers_chart.png');
          chartElement.style.background = originalBackground;
        })
        .catch((err) => {
          console.error('Error downloading chart:', err);
          chartElement.style.background = originalBackground;
        });
    }
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        grid: {
          display: showGrid,
          drawBorder: true,
        },
        title: {
          display: true,
          text: xAxisLabel,
          color: 'black',
          font: {
            size: xAxisLabelSize,
          },
        },
        ticks: {
          color: pointColor,
          font: {
            size: fontSize,
          },
        },
        border: {
          color: 'black',
        },
      },
      y: {
        type: 'linear',
        grid: {
          display: showGrid,
          drawBorder: true,
        },
        title: {
          display: true,
          text: yAxisLabel,
          color: 'black',
          font: {
            size: yAxisLabelSize,
          },
        },
        ticks: {
          color: '#000000',
          font: {
            size: fontSize,
          },
        },
        border: {
          color: '#000000',
        },
      },
    },
    plugins: {
      legend: {
        display: showLegend,
        labels: {
          color: 'black',
          font: {
            size: fontSize,
          },
        },
      },
      title: {
        display: showChartTitle,
        text: chartTitle,
        font: {
          size: 16,
        },
        color: 'black',
      },
      tooltip: {
        enabled: true,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return `Authors: ${context.parsed.x}, Papers: ${context.parsed.y}`;
          }
        }
      },
      datalabels: {
        display: false
      }
    },
    elements: {
      point: {
        radius: 5,
        hoverRadius: 7,
      },
    },
  };

  return (
    <div style={styles.container}>
      {/* Chart Panel */}
      <div style={styles.chartPanel}>
        {error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <>
            <div style={styles.chartContainer}>
              {authorCounts.length > 0 ? (
                <Scatter
                  ref={chartRef}
                  data={{
                    datasets: [
                      {
                        label: "Number of Papers per Author Group Size",
                        data: authorCounts.map(([authorCount, paperCount]) => ({
                          x: authorCount,
                          y: paperCount,
                        })),
                        backgroundColor: pointColor,
                        borderColor: borderColor,
                        borderWidth: 1,
                      },
                    ],
                  }}
                  options={chartOptions}
                />
              ) : (
                <div>{noDataMessage || "Loading data..."}</div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Control Panel */}
      <div style={{ marginLeft: '40px', flex: '0 0 300px',fontSize:'12px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '10px' }}>
              Point Color:
              <input
                type="color"
                value={pointColor}
                onChange={(e) => setPointColor(e.target.value)}
                style={{ marginLeft: '10px' }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: '10px' }}>
              Font Size:
              <input
                type="range"
                min="8"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                style={{ marginLeft: '10px', width: '120px' }}
              />
              <span style={{ marginLeft: '5px' }}>{fontSize}</span>
            </label>

            <div style={{ display: 'flex' }}>
              <label style={{ display: 'block', marginBottom: '10px', marginLeft: '3px' }}>
                Show Chart Title:
                <input
                  type="checkbox"
                  checked={showChartTitle}
                  onChange={(e) => setShowChartTitle(e.target.checked)}
                  style={{ marginLeft: '10px' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '10px', marginLeft: '3px' }}>
                Show Legend:
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                  style={{ marginLeft: '10px' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '10px', marginLeft: '3px' }}>
                Show Grid:
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  style={{ marginLeft: '10px' }}
                />
              </label>
            </div>

            <label style={{ display: 'block', marginBottom: '10px' }}>
              X-Axis Label Size:
              <input
                type="range"
                min="8"
                max="24"
                value={xAxisLabelSize}
                onChange={(e) => setXAxisLabelSize(parseInt(e.target.value))}
                style={{ marginLeft: '10px', width: '120px' }}
              />
              <span style={{ marginLeft: '5px' }}>{xAxisLabelSize}</span>
            </label>

            <label style={{ display: 'block', marginBottom: '10px' }}>
              Y-Axis Label Size:
              <input
                type="range"
                min="8"
                max="24"
                value={yAxisLabelSize}
                onChange={(e) => setYAxisLabelSize(parseInt(e.target.value))}
                style={{ marginLeft: '10px', width: '120px' }}
              />
              <span style={{ marginLeft: '5px' }}>{yAxisLabelSize}</span>
            </label>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px' }}>
                X-Axis Label:
                <input
                  type="text"
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  style={{ marginLeft: '10px', width: '100%' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '10px' }}>
                Y-Axis Label:
                <input
                  type="text"
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  style={{ marginLeft: '10px', width: '100%' }}
                />
              </label>

              <div style={{ textAlign: "center", marginTop: "5px" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleDownload("png")}
                  style={{ marginRight: "10px" }}
                >
                  <FontAwesomeIcon
                    icon={faDownload}
                    style={{ marginRight: "5px" }}
                  />
                  PNG
                </button>
                <button className="btn btn-secondary" onClick={exportToCSV}>
                  <FontAwesomeIcon
                    icon={faDownload}
                    style={{ marginRight: "5px" }}
                  />
                  CSV
                </button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default AuthorCount;