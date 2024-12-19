import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import StyledButton from "./StyledComponents/StyledButton";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const MainInformation = () => {
  const [topPublishers, setTopPublishers] = useState([]);
  const [chartOrientation, setChartOrientation] = useState("horizontal");
  const [chartColor, setChartColor] = useState("#000000");
  const [borderColor, setBorderColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(12);
  const [showChartTitle, setShowChartTitle] = useState(true);
  const [xAxisLabel, setXAxisLabel] = useState("Publishers");
  const [yAxisLabel, setYAxisLabel] = useState("Number of Publications");
  const [chartTitle, setChartTitle] = useState("Top Publishers");
  const [showLegend, setShowLegend] = useState(true);
  const [error, setError] = useState(null);
  const [yearRange, setYearRange] = useState([]);
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [noDataMessage, setNoDataMessage] = useState("");
  const [maxDisplayCount, setMaxDisplayCount] = useState(15);
  const [displayedPublishersCount, setDisplayedPublishersCount] = useState(0);
  const [sliderMax, setSliderMax] = useState(15);
  const [allPublishersData, setAllPublishersData] = useState([]);
  const [showGrid, setShowGrid] = useState(true);
  const [xAxisLabelSize, setXAxisLabelSize] = useState(12);
  const [yAxisLabelSize, setYAxisLabelSize] = useState(12);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: chartOrientation === "horizontal" ? "y" : "x",
    plugins: {
      legend: {
        display: showLegend,
        position: "top",
        labels: {
          color: "#000000", // Legend font color
          font: {
            size: fontSize,
          },
        },
      },
      title: {
        display: showChartTitle,
        text: `Top ${maxDisplayCount} Publishers`,
        color: "#000000", // Title font color
        font: {
          size: 16,
        },
      },
      tooltip: {
        enabled: true,
        bodyFont: {
          size: fontSize,
          color: "#000000", // Tooltip font color
        },
      },
      datalabels: {
        anchor: chartOrientation === "horizontal" ? "end" : "end",
        align: chartOrientation === "horizontal" ? "right" : "top",
        color: "#000000", // Data labels font color
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        borderRadius: 4,
        font: {
          weight: "bold",
          size: 12,
        },
        padding: 6,
        formatter: (value) => `${value}`,
        display: (context) => context.dataset.data[context.dataIndex] > 0,
      },
    },
    scales: {
      x: {
        display: true,
        beginAtZero: true,
        grid: {
          display: showGrid,
          drawBorder: true,
          borderColor: "#000000", // Set x-axis border color to black
        },
        ticks: {
          display: true,
          color: "#000000", // X-axis ticks color
          font: {
            size: fontSize,
          },
        },
        border: {
          color: "#000000",
        },
        title: {
          display: true,
          text: chartOrientation === "horizontal" ? yAxisLabel : xAxisLabel,
          color: "#000000", // X-axis title color
          font: {
            size: xAxisLabelSize,
          },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          display: showGrid,
          drawBorder: true,
          // Set y-axis border color to black
        },
        border: {
          color: "#000000",
        },
        ticks: {
          display: true,
          color: "#000000", // Y-axis ticks color
          font: {
            size: fontSize,
          },
        },
        title: {
          display: true,
          text: chartOrientation === "horizontal" ? xAxisLabel : yAxisLabel,
          color: "#000000", // Y-axis title color
          font: {
            size: yAxisLabelSize,
          },
        },
      },
    },
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/get-data/");
      const data = response.data;
      const years = [...new Set(data.map((item) => item.Year))].sort();
      setYearRange(years);
      setStartYear(years[0]);
      setEndYear(years[years.length - 1]);
      processPublisherData(data);
      console.log(data);
    } catch (err) {
      setError("Error fetching data: " + err.message);
    }
  };

  const processPublisherData = (data) => {
    let filteredData = data;
    if (startYear && endYear) {
      filteredData = data.filter(
        (item) => item.Year >= startYear && item.Year <= endYear
      );
    }

    const publisherCounts = {};
    filteredData.forEach((item) => {
      if (item.Publisher) {
        publisherCounts[item.Publisher] =
          (publisherCounts[item.Publisher] || 0) + 1;
      }
    });

    const sortedPublishers = Object.entries(publisherCounts).sort(
      (a, b) => b[1] - a[1]
    );

    setAllPublishersData(sortedPublishers);
    setDisplayedPublishersCount(sortedPublishers.length);

    const newSliderMax = Math.min(15, sortedPublishers.length);
    setSliderMax(newSliderMax);

    const newMaxDisplayCount = Math.min(maxDisplayCount, newSliderMax);
    setMaxDisplayCount(newMaxDisplayCount);

    const topN = sortedPublishers.slice(0, newMaxDisplayCount);
    setTopPublishers(topN);

    setNoDataMessage(
      sortedPublishers.length === 0
        ? "No data available for the selected year range"
        : ""
    );
  };

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
      processPublisherData(filteredData);

      // Explicitly update the topPublishers state
      const publisherCounts = {};
      filteredData.forEach((item) => {
        if (item.Publisher) {
          publisherCounts[item.Publisher] =
            (publisherCounts[item.Publisher] || 0) + 1;
        }
      });

      const sortedPublishers = Object.entries(publisherCounts).sort(
        (a, b) => b[1] - a[1]
      );
      const topN = sortedPublishers.slice(0, maxDisplayCount);
      setTopPublishers(topN);

      setDisplayedPublishersCount(sortedPublishers.length);
      setNoDataMessage(
        sortedPublishers.length === 0
          ? "No data available for the selected year range"
          : ""
      );
    } catch (err) {
      setError("Error applying filter: " + err.message);
    }
  };

  const handleSliderChange = (e) => {
    const newValue = parseInt(e.target.value);
    setMaxDisplayCount(newValue);
    if (allPublishersData.length > 0) {
      const topN = allPublishersData.slice(0, newValue);
      setTopPublishers(topN);
    }
  };

  const handleDownload = () => {
    const chartElement = document.getElementById("bar-chart");
    if (chartElement) {
      const originalBackground = chartElement.style.background;
      chartElement.style.background = "white";
      toPng(chartElement, {
        backgroundColor: "#ffffff", // Ensure white background
        style: {
          background: "white",
        },
      })
        .then((dataUrl) => {
          saveAs(dataUrl, "publisher-chart.png");
          chartElement.style.background = originalBackground;
        })
        .catch((err) => {
          console.error("Error downloading chart:", err);
          chartElement.style.background = originalBackground;
        });
    }
  };

  return (
    <div
      style={{
        margin: "auto",
        padding: "20px",
        maxWidth: "1400px",
        fontSize: "12px",
      }}
    >
      {/* <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
        Top Publishers by Number of Publications
      </h3> */}

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* Left side - Chart */}
        <div style={{ flex: "1", minWidth: "300px", maxWidth: "820px" }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {noDataMessage && (
            <div className="alert alert-warning">{noDataMessage}</div>
          )}

          <div style={{ width: "100%", height: "500px" }}>
            <div id="bar-chart" style={{ height: "100%", background: "white" }}>
              <Bar
                data={{
                  labels: topPublishers.map((item) => item[0]),
                  datasets: [
                    {
                      label: "Number of Publications",
                      data: topPublishers.map((item) => item[1]),
                      backgroundColor: chartColor,
                      borderColor: borderColor,
                      borderWidth: 1,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
            <div style={{ marginTop: "10px"}}>
              *Showing {maxDisplayCount} out of {displayedPublishersCount}{" "}
              publishers{" "}
              {startYear && endYear && (
                <>
                  for years {startYear} - {endYear}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Controls */}
        <div style={{ marginLeft: "40px", flex: "0 0 300px" }}>
          <div style={{ marginBottom: "20px" }}>
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
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label>Number of Publishers to Display: </label>
            <input
              type="range"
              min="1"
              max={sliderMax}
              value={maxDisplayCount}
              onChange={handleSliderChange}
              style={{ width: "100%" }}
            />
            <span>{maxDisplayCount}</span>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "10px" }}>
              Chart Orientation:
              <select
                value={chartOrientation}
                onChange={(e) => setChartOrientation(e.target.value)}
                style={{ marginLeft: "10px" }}
              >
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </label>

            <div style={{ display: "flex" }}>
              <label style={{ display: "block", marginBottom: "10px" }}>
                Chart Color:
                <input
                  type="color"
                  value={chartColor}
                  onChange={(e) => setChartColor(e.target.value)}
                  style={{ marginLeft: "10px" }}
                />
              </label>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  marginLeft: "10px",
                }}
              >
                Border Color:
                <input
                  type="color"
                  value={borderColor}
                  onChange={(e) => setBorderColor(e.target.value)}
                  style={{ marginLeft: "10px" }}
                />
              </label>
            </div>

            <label style={{ display: "block", marginBottom: "10px" }}>
              Graph Size:
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

              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <button
                  className="btn btn-primary"
                  onClick={handleDownload}
                  style={{ marginRight: "10px" }}
                >
                  <FontAwesomeIcon
                    icon={faDownload}
                    style={{ marginRight: "5px" }}
                  />
                  PNG
                </button>
                <button className="btn btn-secondary " onClick={exportToCSV}>
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

export default MainInformation;
