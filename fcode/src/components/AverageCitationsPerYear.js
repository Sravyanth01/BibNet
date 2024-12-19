import React, { useState, useEffect } from "react";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);


const CitationAnalysis = () => {
  const [selectedChartType, setSelectedChartType] = useState("average");
  const [visualizationType, setVisualizationType] = useState("line");
  const [lineColor, setLineColor] = useState("#000000");
  const [pointColor, setPointColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(12);
  const [xAxisLabelSize, setXAxisLabelSize] = useState(12);
  const [yAxisLabelSize, setYAxisLabelSize] = useState(12);
  const [showChartTitle, setShowChartTitle] = useState(true);
  const [xAxisLabel, setXAxisLabel] = useState("Year");
  const [yAxisLabel, setYAxisLabel] = useState("Citations");
  const [showLegend, setShowLegend] = useState(true);
  const [error, setError] = useState(null);
  const [yearRange, setYearRange] = useState([]);
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [noDataMessage, setNoDataMessage] = useState("");
  const [showGrid, setShowGrid] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [xAxisScale, setXAxisScale] = useState(1);

  const [chartData, setChartData] = useState({
    average: [],
    cumulative: [],
    median: [],
  });

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
          }
        },
        min: parseInt(startYear),
        max: parseInt(endYear),
        ticks: {
          color: '#000000',
          stepSize: xAxisScale,
          callback: (value) => value.toString(),
          font: {
            size: fontSize,
          },
          autoSkip: false,
          maxRotation: 45,
          minRotation: 90,
          count: 100
        },
        border: {
          color: '#000000',
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
          }
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
          color: '#333',
          font: {
            size: fontSize,
          },
        },
      },
      title: {
        display: showChartTitle,
        text: `Citation Analysis`,
        font: {
          size: 16,
          
        },
        color: 'black',
      },
      tooltip: {
        enabled: true,
        displayColors: false,
      },
      datalabels: {
        display: false,
      },
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 5,
      },
      line: {
        tension: 0.4,
      },
    },
  };
  

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/get-data/");
      const papers = response.data;
      if (papers && papers.length > 0) {
        const years = [...new Set(papers.map((item) => item.Year))].sort();
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        setStartYear(minYear);
        setEndYear(maxYear); // Set end year to minYear + 9
        setYearRange(years);
        processData(papers);
      } else {
        setNoDataMessage("No data available");
      }
    } catch (err) {
      setError("Error fetching data: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const processData = (papers) => {
    if (!papers || papers.length === 0) {
      setNoDataMessage("No data available");
      return;
    }

    let filteredPapers = papers;
    if (startYear && endYear) {
      filteredPapers = papers.filter(
        (paper) => paper.Year >= startYear && paper.Year <= endYear
      );
    }

    const yearCitations = {};
    filteredPapers.forEach(paper => {
      const year = parseInt(paper.Year);
      const citations = parseInt(paper.Citations) || 0;
      if (!yearCitations[year]) {
        yearCitations[year] = { total: 0, count: 0 };
      }
      yearCitations[year].total += citations;
      yearCitations[year].count += 1;
    });

    const years = Object.keys(yearCitations).sort();
    const averageCitations = years.map(year => ({
      x: parseInt(year),
      y: Math.round(yearCitations[year].total / yearCitations[year].count)
    }));

    const cumulativeCitations = years.map((year, index) => ({
      x: parseInt(year),
      y: averageCitations.slice(0, index + 1).reduce((sum, item) => sum + item.y, 0)
    }));

    const medianCitations = years.map(year => {
      const citations = filteredPapers
        .filter(paper => parseInt(paper.Year) === parseInt(year))
        .map(paper => parseInt(paper.Citations) || 0);
      return {
        x: parseInt(year),
        y: getMedian(citations)
      };
    });
    chartOptions.scales.x.min = parseInt(startYear); // Set the minimum value
    chartOptions.scales.x.max = parseInt(endYear);

    chartOptions.scales.x.ticks.callback = (value) => value.toString(); 

    setChartData({
      average: averageCitations,
      cumulative: cumulativeCitations,
      median: medianCitations,
    });

    setNoDataMessage(
      years.length === 0 ? "No data available for the selected year range" : ""
    );
  };

  const getMedian = (values) => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const handleYearChange = (e) => {
    const { name, value } = e.target;
    if (name === "startYear") setStartYear(value);
    else if (name === "endYear") setEndYear(value);
  };

  const applyYearFilter = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/get-data/");
      const filteredData = response.data.filter(
        (item) => item.Year >= startYear && item.Year <= endYear
      );
      processData(filteredData);
    } catch (err) {
      setError("Error applying filter: " + err.message);
    }
  };

  const exportToCSV = () => {
    const header = `${xAxisLabel},${yAxisLabel}\n`; // Create header with labels
    const titleRow = `${selectedChartType === "average" ? 'Average Citations per Year' : selectedChartType === "cumulative" ? 'Cumulative Citations' : 'Median Citations'}\n`; // Add chart title
    const csvData = chartData.average.map((item) => `${item.x},${item.y}`).join("\n");
    const blob = new Blob([titleRow + header + csvData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "chart_data.csv");
  };

  const handleDownload = (format) => {
    if (format === 'png') {
      const chartElement = document.getElementById("line-chart");
      if (chartElement) {
        const originalBackground = chartElement.style.background;
        chartElement.style.background = "white";
        toPng(chartElement, {
          backgroundColor: "#ffffff",
          style: {
            background: "white",
          },
        })
          .then((dataUrl) => {
            saveAs(dataUrl, "citation-analysis.png");
            chartElement.style.background = originalBackground;
          })
          .catch((err) => {
            console.error("Error downloading chart:", err);
            chartElement.style.background = originalBackground;
          });
      }
    } else if (format === 'excel') {
      console.log("Download as Excel not implemented yet.");
    }
  };

  const renderChart = () => {
    if (chartData[selectedChartType].length === 0) return null;

    const chartProps = {
      data: {
        datasets: [
          {
            label: selectedChartType === "average" ? 'Average Citations per Year' :
                  selectedChartType === "cumulative" ? 'Cumulative Citations' : 'Median Citations',
            data: chartData[selectedChartType],
            fill: false,
            borderColor: lineColor,
            backgroundColor: pointColor,
            pointBackgroundColor: pointColor,
            tension: 0.2,
          },
        ],
      },
      options: chartOptions,
    };

    return visualizationType === "line" ? 
      <Line {...chartProps} /> : 
      <Bar {...chartProps} />;
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ margin: "auto", padding: "20px", maxWidth: "1400px", fontSize: "12px" }}>
      <div style={{ display: " flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: "1", minWidth: "300px", maxWidth: "820px" }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {noDataMessage && <div className="alert alert-warning">{noDataMessage}</div>}

          <div style={{ width: "100%", height: "500px", marginBottom: "20px" }}>
            <div id="line-chart" style={{ height: "100%", background: "white" }}>
              {renderChart()}
            </div>
          </div>
        </div>

        <div style={{ marginLeft: "40px", flex: "0 0 300px" }}>
          <div style={{ marginBottom: "20px" }}>
            <label>Start Year: </label>
            <select name="startYear" value={startYear} onChange={handleYearChange}>
              {yearRange.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <label style={{ marginLeft: "20px" }}>End Year: </label>
            <select name="endYear" value={endYear} onChange={handleYearChange}>
              {yearRange.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <button
              className="btn btn-primary"
              style={{ marginTop: "10px", width: "100%" }}
              onClick={applyYearFilter}
            >
              Apply Filter
            </button>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "10px" }}>
              Citation Plot:
              <select
                value={selectedChartType}
                onChange={(e) => setSelectedChartType(e.target.value)}
                style={{ marginLeft: "10px" }}
              >
                <option value="average">Average Citations</option>
                <option value="cumulative">Cumulative Citations</option>
                <option value="median">Median Citations</option>
              </select>
            </label>

            <label style={{ display: "block", marginBottom: "10px" }}>
              Visualization Type:
              <select
                value={visualizationType}
                onChange={(e) => setVisualizationType(e.target.value)}
                style={{ marginLeft: "10px" }}
              >
                <option value="line">Line Plot</option>
                <option value="bar">Bar Plot</option>
              </select>
            </label>

            <div style={{display:"flex"}}>
            <label style={{ display: "block", marginBottom: "10px" }}>
              Line Color:
              <input
                type="color"
                value={lineColor}
                onChange={(e) => setLineColor(e.target.value)}
                style={{ marginLeft: "10px" }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "10px", marginLeft:"4px" }}>
              Point Color:
              <input
                type="color"
                value={pointColor}
                onChange={(e) => setPointColor(e.target.value)}
                style={{ marginLeft: "10px" }}
              />
            </label>
            </div>
            


            <label style={{ display: "block", marginBottom: "10px" }}>
              Font Size:
              <input
                type="range"
                min="8"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                style={{ marginLeft: "10px", width: "120px" }}
              />
              <span style={{ marginLeft: "5px" }}>{fontSize}</span>
            </label>

            {/* <label style={{ display: "block", marginBottom: "10px" }}>
              X-Axis Scale:
              <input
                type="range"
                min="1"
                max="15"
                value={xAxisScale}
                onChange={(e) => setXAxisScale(parseInt(e.target.value))}
                style={{ marginLeft: "10px", width: "120px" }}
              />
              <span style={{ marginLeft: "5px" }}>{xAxisScale}</span> 
            </label>  */}

            <div style={{display:"flex"}}>
            <label style={{ display: "block", marginBottom: "10px",marginLeft:"3px" }}>
              Show Chart Title:
              <input
                type="checkbox"
                checked={showChartTitle}
                onChange={(e) => setShowChartTitle(e.target.checked)}
                style={{ marginLeft: "10px" }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "10px",marginLeft:"3px" }}>
              Show Legend:
              <input
                type="checkbox"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
                style={{ marginLeft: "10px" }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "10px",marginLeft:"3px"}}>
              Show Grid:
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                style={{ marginLeft: "10px" }}
              />
            </label>
            </div>



            <label style={{ display: "block", marginBottom: "10px" }}>
              X-Axis Label Size:
              <input
                type="range"
                min="8"
                max="24"
                value={xAxisLabelSize}
                onChange={(e) => setXAxisLabelSize(parseInt(e.target.value))}
                style={{ marginLeft: "10px", width: "120px" }}
              />
              <span style={{ marginLeft: "5px" }}>{xAxisLabelSize}</span>
            </label>

            <label style={{ display: "block", marginBottom: "10px" }}>
              Y-Axis Label Size:
              <input
                type="range"
                min="8"
                max="24"
                value={yAxisLabelSize}
                onChange={(e) => setYAxisLabelSize(parseInt(e.target.value))}
                style={{ marginLeft: "10px", width: "120px" }}
              />
              <span style={{ marginLeft: "5px" }}>{yAxisLabelSize}</span>
            </label>



            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "10px" }}>
                X-Axis Label:
                <input
                  type="text"
                  value={xAxisLabel}
                  onChange={(e) => setXAxisLabel(e.target.value)}
                  style={{ marginLeft: "10px", width: "100%" }}
                />
              </label>

              <label style={{ display: "block", marginBottom: "10px" }}>
                Y-Axis Label:
                <input
                  type="text"
                  value={yAxisLabel}
                  onChange={(e) => setYAxisLabel(e.target.value)}
                  style={{ marginLeft: "10px", width: "100%" }}
                />
              </label>

              <div style={{ textAlign: "center", marginTop: "5px" }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleDownload('png')}
                  style={{ marginRight: "10px" }}
                >
                  <FontAwesomeIcon icon={faDownload} style={{ marginRight: "5px" }} />
                  PNG
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={exportToCSV}
                >
                  <FontAwesomeIcon icon={faDownload} style={{ marginRight: "5px" }} />
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

export default CitationAnalysis;