import React, { useState, useEffect } from 'react';
import { Scatter } from 'react-chartjs-2';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const TeamSizeOverview = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pointColor, setPointColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(12);
  const [xAxisLabelSize, setXAxisLabelSize] = useState(12);
  const [yAxisLabelSize, setYAxisLabelSize] = useState(12);
  const [showChartTitle, setShowChartTitle] = useState(true);
  const [xAxisLabel, setXAxisLabel] = useState('Team Size (Number of Authors)');
  const [yAxisLabel, setYAxisLabel] = useState('Number of Teams');
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

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
          color: 'black',
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
        text: 'Team Size Distribution',
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
            return `Team Size: ${context.parsed.x}, Count: ${context.parsed.y}`;
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

// const chartOptions = { //Logarthmic
//     responsive: true,
//     scales: {
//       x: {
//         type: 'logarithmic',  // Changed to logarithmic
//         position: 'bottom',
//         grid: {
//           display: showGrid,
//           drawBorder: true,
//         },
//         title: {
//           display: true,
//           text: xAxisLabel,
//           color: 'black',
//           font: {
//             size: xAxisLabelSize,
//           },
//         },
//         ticks: {
//           color: 'black',
//           font: {
//             size: fontSize,
//           },
//           callback: function(value, index) {
//             return Number(value).toLocaleString()  // Format numbers with commas
//           }
//         },
//         border: {
//           color: 'black',
//         },
//       },
//       y: {
//         type: 'logarithmic',  // Changed to logarithmic
//         grid: {
//           display: showGrid,
//           drawBorder: true,
//         },
//         title: {
//           display: true,
//           text: yAxisLabel,
//           color: 'black',
//           font: {
//             size: yAxisLabelSize,
//           },
//         },
//         ticks: {
//           color: '#000000',
//           font: {
//             size: fontSize,
//           },
//           callback: function(value, index) {
//             return Number(value).toLocaleString()  // Format numbers with commas
//           }
//         },
//         border: {
//           color: '#000000',
//         },
//       },
//     },
//     plugins: {
//       legend: {
//         display: showLegend,
//         labels: {
//           color: 'black',
//           font: {
//             size: fontSize,
//           },
//         },
//       },
//       title: {
//         display: showChartTitle,
//         text: 'Team Size Distribution',
//         font: {
//           size: 16,
//         },
//         color: 'black',
//       },
//       tooltip: {
//         enabled: true,
//         displayColors: false,
//         callbacks: {
//           label: function(context) {
//             return `Team Size: ${context.parsed.x}, Count: ${context.parsed.y}`;
//           }
//         }
//       },
//       datalabels: {
//         display: false
//       }
//     },
//     elements: {
//       point: {
//         radius: 5,
//         hoverRadius: 7,
//       },
//     },
// };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/get-team-size/');
      if (!response.ok) {
        throw new Error('Failed to fetch team sizes');
      }
      const data = await response.json();
      const formattedData = Object.entries(data).map(([teamSize, count]) => ({
        x: parseInt(teamSize),
        y: count,
      }));
      setChartData(formattedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const header = `${xAxisLabel},${yAxisLabel}\n`;
    const csvData = chartData.map(item => `${item.x},${item.y}`).join('\n');
    const blob = new Blob([header + csvData], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'team_size_data.csv');
  };

  const handleDownload = (format) => {
    if (format === 'png') {
      const chartElement = document.getElementById('scatter-chart');
      if (chartElement) {
        const originalBackground = chartElement.style.background;
        chartElement.style.background = 'white';
        toPng(chartElement, {
          backgroundColor: '#ffffff',
          style: {
            background: 'white',
          },
        })
          .then((dataUrl) => {
            saveAs(dataUrl, 'team-size-analysis.png');
            chartElement.style.background = originalBackground;
          })
          .catch((err) => {
            console.error('Error downloading chart:', err);
            chartElement.style.background = originalBackground;
          });
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ margin: 'auto', padding: '20px', maxWidth: '1400px', fontSize: '12px' }}>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '300px', maxWidth: '820px' }}>
          <div style={{ width: '100%', height: '500px', marginBottom: '20px' }}>
            <div id="scatter-chart" style={{ height: '100%', background: 'white' }}>
              <Scatter
                data={{
                  datasets: [{
                    label: 'Team Size Distribution',
                    data: chartData,
                    backgroundColor: pointColor,
                  }],
                }}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        <div style={{ marginLeft: '40px', flex: '0 0 300px' }}>
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
    </div>
  );
};

export default TeamSizeOverview;