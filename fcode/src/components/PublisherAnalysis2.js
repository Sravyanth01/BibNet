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

const PublisherAnalysis2 = () => {
  const [topPublishers,setTopPublihers]=useState();
  const [selectedChartType, setSelectedChartType] = useState("average");
  const [visualizationType, setVisualizationType] = useState("line");
  const [lineColor, setLineColor] = useState("#000000");
  const [pointColor, setPointColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(12);
  const [xAxisLabelSize, setXAxisLabelSize] = useState(12);
  const [yAxisLabelSize, setYAxisLabelSize] = useState(12);
  const [showChartTitle, setShowChartTitle] = useState(true);
  const [xAxisLabel, setXAxisLabel] = useState("Decade");
  const [yAxisLabel, setYAxisLabel] = useState("Publications");
  const [showLegend, setShowLegend] = useState(true);
  const [error, setError] = useState(null);
  const [startYear,setStartYear]=useState();
  const [endYear,setEndYear]=useState();
  const [startDecade, setStartDecade] = useState("");
  const [endDecade, setEndDecade] = useState("");
  const [noDataMessage, setNoDataMessage] = useState("");
  const [showGrid, setShowGrid] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [decades, setDecades] = useState([]);

  const [chartData, setChartData] = useState({
    average: [],
    cumulative: [],
    median: [],
  });

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: "category",
        position: "bottom",
        grid: {
          display: showGrid,
          drawBorder: true,
        },
        title: {
          display: true,
          text: xAxisLabel,
          color: "black",
          font: {
            size: xAxisLabelSize,
          },
        },
        ticks: {
          color: "black",
          font: {
            size: fontSize,
          },
          autoSkip: false,
          maxRotation: 45,
        },
        border: {
          color: "black",
        },
      },
      y: {
        type: "linear",
        grid: {
          display: showGrid,
          drawBorder: true,
        },
        title: {
          display: true,
          text: yAxisLabel,
          color: "black",
          font: {
            size: yAxisLabelSize,
          },
        },
        ticks: {
          color: "#000000",
          font: {
            size: fontSize,
          },
        },
        border: {
          color: "#000000",
        },
      },
    },
    plugins: {
      legend: {
        display: showLegend,
        labels: {
          color: "black",
          font: {
            size: fontSize,
          },
        },
      },
      title: {
        display: showChartTitle,
        text: `Publication Analysis by Decade`,
        font: {
          size: 16,
        },
        color: "black",
      },
      tooltip: {
        enabled: true,
        displayColors: false,
      },
      datalabels: {
        display: false,
      },
    },
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDecadeStart = (year) => Math.floor(year / 10) * 10;
  const getDecadeLabel = (decadeStart) => `${decadeStart}s`;

  const processData = (papers) => {
    if (!papers || papers.length === 0) {
      setNoDataMessage("No data available");
      return;
    }

    // Group papers by decade
    const decadePublications = {};
    papers.forEach((paper) => {
      const year = parseInt(paper.Year);
      const decadeStart = getDecadeStart(year);
      const decadeLabel = getDecadeLabel(decadeStart);

      if (!decadePublications[decadeLabel]) {
        decadePublications[decadeLabel] = {
          publishers: {},
          total: 0,
        };
      }

      const publisher = paper.Publisher || "Unknown";
      if (!decadePublications[decadeLabel].publishers[publisher]) {
        decadePublications[decadeLabel].publishers[publisher] = 0;
      }

      decadePublications[decadeLabel].publishers[publisher]++;
      decadePublications[decadeLabel].total++;
    });

    // Sort decades chronologically
    const sortedDecades = Object.keys(decadePublications).sort();

    // Filter decades based on selection
    const filteredDecades = sortedDecades.filter((decade) => {
      const decadeYear = parseInt(decade);
      return (!startDecade || decadeYear >= parseInt(startDecade)) &&
             (!endDecade || decadeYear <= parseInt(endDecade));
    });

    // Calculate average publications per decade
    const averagePublications = filteredDecades.map((decade) => ({
      x: decade,
      y: decadePublications[decade].total,
    }));

    // Calculate cumulative publications
    const cumulativePublications = filteredDecades.map((decade, index) => ({
      x: decade,
      y: filteredDecades
        .slice(0, index + 1)
        .reduce((sum, d) => sum + decadePublications[d].total, 0),
    }));

    // Calculate median publications by publisher per decade
    const medianPublications = filteredDecades.map((decade) => ({
      x: decade,
      y: getMedian(Object.values(decadePublications[decade].publishers)),
    }));

    setChartData({
      average: averagePublications,
      cumulative: cumulativePublications,
      median: medianPublications,
    });

    // Set available decades for filtering
    const decadesList = sortedDecades.map(decade => ({
      value: decade,
      label: decade
    }));
    setDecades(decadesList);
    
    if (!startDecade && decadesList.length > 0) {
      setStartDecade(decadesList[0].value);
    }
    if (!endDecade && decadesList.length > 0) {
      setEndDecade(decadesList[decadesList.length - 1].value);
    }

    setNoDataMessage(filteredDecades.length === 0 ? "No data available for the selected decade range" : "");
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/get-data/");
      const papers = response.data;
      if (papers && papers.length > 0) {
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

  const getMedian = (values) => {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const handleDecadeChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDecade") setStartDecade(value);
    else if (name === "endDecade") setEndDecade(value);
  };

  const applyDecadeFilter = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/get-data/");
      processData(response.data);
    } catch (err) {
      setError("Error applying filter: " + err.message);
    }
  };

  // ... existing export and download functions ...

  const renderChart = () => {
    if (chartData[selectedChartType].length === 0) return null;

    const chartProps = {
      data: {
        labels: chartData[selectedChartType].map(item => item.x),
        datasets: [
          {
            label:
              selectedChartType === "average"
                ? "Average Publications per Decade"
                : selectedChartType === "cumulative"
                ? "Cumulative Publications"
                : "Median Publications per Decade",
            data: chartData[selectedChartType].map(item => item.y),
            fill: false,
            borderColor: lineColor,
            backgroundColor: pointColor,
            pointBackgroundColor: pointColor,
            tension: 0.4,
          },
        ],
      },
      options: chartOptions,
    };

    return visualizationType === "line" ? (
      <Line {...chartProps} />
    ) : (
      <Bar {...chartProps} />
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const exportToCSV = () => {
    // Ensure we have data to export
    if (topPublishers.length === 0) {
      alert("No data to export");
      return;
    }
  
    // Prepare CSV headers
    const headers = ["Publisher", "Number of Publications"];
  
    // Convert data to CSV format
    const csvData = topPublishers.map(([publisher, count]) => [
      publisher,
      count
    ]);
  
    // Create a CSV string
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.join(","))
    ].join("\n");
  
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  
    // Create a download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    
    // Set the filename with current date and year range
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `top_publishers_${startYear}-${endYear}_${currentDate}.csv`;
    link.setAttribute("download", filename);
  
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

    const handleDownload = (format) => {
      if (format === "png") {
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
              saveAs(dataUrl, "Publication-analysis.png");
              chartElement.style.background = originalBackground;
            })
            .catch((err) => {
              console.error("Error downloading chart:", err);
              chartElement.style.background = originalBackground;
            });
        }
      } else if (format === "excel") {
        console.log("Download as Excel not implemented yet.");
      }
    };

  return (
    <div style={{ margin: "auto", padding: "20px", maxWidth: "1400px", fontSize: "12px" }}>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
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
            <label>Start Decade: </label>
            <select
              name="startDecade"
              value={startDecade}
              onChange={handleDecadeChange}
              style={{ marginBottom: "10px" }}
            >
              {decades.map((decade) => (
                <option key={decade.value} value={decade.value}>
                  {decade.label}
                </option>
              ))}
            </select>

            <label style={{ marginLeft: "20px" }}>End Decade: </label>
            <select
              name="endDecade"
              value={endDecade}
              onChange={handleDecadeChange}
              style={{ marginBottom: "10px" }}
            >
              {decades.map((decade) => (
                <option key={decade.value} value={decade.value}>
                  {decade.label}
                </option>
              ))}
            </select>

            <button
              className="btn btn-primary"
              style={{ marginTop: "10px", width: "100%" }}
              onClick={applyDecadeFilter}
            >
              Apply Filter
            </button>
          </div>


          <div style={{  flex: "0 0 300px" }}>
          {/* <div style={{ marginBottom: "20px" }}>
            <label>Start Year: </label>
            <select
              name="startYear"
              value={startYear}
              onChange={handleYearChange}
            >
              {yearRange.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <label style={{ marginLeft: "20px" }}>End Year: </label>
            <select name="endYear" value={endYear} onChange={handleYearChange}>
              {yearRange.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            <button
              className="btn btn-primary"
              style={{ marginTop: "10px", width: "100%" }}
              onClick={applyYearFilter}
            >
              Apply Filter
            </button>
          </div> */}

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "10px" }}>
              Publication Plot:
              <select
                value={selectedChartType}
                onChange={(e) => setSelectedChartType(e.target.value)}
                style={{ marginLeft: "10px" }}
              >
                <option value="average">Average Number of Publications</option>
                <option value="cumulative">
                  Cumulative Number of Publications
                </option>
                <option value="median">Median Number of Publications</option>
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

            <div style={{ display: "flex" }}>
              <label style={{ display: "block", marginBottom: "10px" }}>
                Line Color:
                <input
                  type="color"
                  value={lineColor}
                  onChange={(e) => setLineColor(e.target.value)}
                  style={{ marginLeft: "10px" }}
                />
              </label>

              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  marginLeft: "4px",
                }}
              >
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
              <span style={{ marginLeft: "5px" }}>{xAxisScale}</span>{" "}
            </label> */}

            <div style={{ display: "flex" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  marginLeft: "3px",
                }}
              >
                Show Chart Title:
                <input
                  type="checkbox"
                  checked={showChartTitle}
                  onChange={(e) => setShowChartTitle(e.target.checked)}
                  style={{ marginLeft: "10px" }}
                />
              </label>

              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  marginLeft: "3px",
                }}
              >
                Show Legend:
                <input
                  type="checkbox"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                  style={{ marginLeft: "10px" }}
                />
              </label>

              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  marginLeft: "3px",
                }}
              >
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
    </div>
  );
};

export default PublisherAnalysis2;