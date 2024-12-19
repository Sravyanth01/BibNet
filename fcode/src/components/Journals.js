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

const Journals = () => {
  // State declarations
  const [showLegend, setShowLegend] = useState(true);
  const [error, setError] = useState(null);
  const [yearRange, setYearRange] = useState([]);
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [noDataMessage, setNoDataMessage] = useState("");
  const [maxDisplayCount, setMaxDisplayCount] = useState(15);
  const [displayedJournalsCount, setDisplayedJournalsCount] = useState(0);
  const [sliderMax, setSliderMax] = useState(15);
  const [topJournals, setTopJournals] = useState([]);
  const [showGrid, setShowGrid] = useState(true);
  const [chartOrientation, setChartOrientation] = useState("horizontal");
  const [chartColor, setChartColor] = useState("#000000");
  const [borderColor, setBorderColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(10);
  const [showChartTitle, setShowChartTitle] = useState(true);
  const [xAxisLabel, setXAxisLabel] = useState("Journals");
  const [yAxisLabel, setYAxisLabel] = useState("Number of Publications");
  const [chartTitle, setChartTitle] = useState("Top Journals by Publications");

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: chartOrientation === 'horizontal' ? 'y' : 'x',
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          color: '#000000',
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
        color: '#000000',
      },
      tooltip: {
        enabled: true,
      },
      datalabels: {
        anchor: chartOrientation === 'horizontal' ? 'end' : 'end',
        align: chartOrientation === 'horizontal' ? 'right' : 'top',
        color: '#000000',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 4,
        font: {
          weight: 'bold',
          size: fontSize,
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
        },
        ticks: {
          color: '#000000',
          font: {
            size: fontSize,
          },
        },
        title: {
          display: true,
          text: chartOrientation === 'horizontal' ? yAxisLabel : xAxisLabel,
          color: '#000000',
          font: {
            size: 14,
          },
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          display: showGrid,
          drawBorder: true,
        },
        ticks: {
          color: '#000000',
          font: {
            size: fontSize,
          },
        },
        title: {
          display: true,
          text: chartOrientation === 'horizontal' ? xAxisLabel : yAxisLabel,
          color: '#000000',
          font: {
            size: 14,
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
      processJournalData(data);
    } catch (err) {
      setError("Error fetching data: " + err.message);
    }
  };

  const processJournalData = (data, start = null, end = null) => {
    let filteredData = data;
    if (start && end) {
      filteredData = data.filter(
        (item) => item.Year >= start && item.Year <= end
      );
    }

    const journalCounts = {};
    filteredData.forEach((item) => {
      if (item['Source_title']) {
        journalCounts[item['Source_title']] =
          (journalCounts[item['Source_title']] || 0) + 1;
      }
    });

    const sortedJournals = Object.entries(journalCounts)
      .sort((a, b) => b[1] - a[1]);

    setDisplayedJournalsCount(sortedJournals.length);
    setSliderMax(Math.min(15, sortedJournals.length));
    setTopJournals(sortedJournals.slice(0, maxDisplayCount));
    setNoDataMessage(sortedJournals.length === 0 ? "No data available for the selected year range" : "");
  };

  const handleYearChange = (e) => {
    const { name, value } = e.target;
    if (name === "startYear") setStartYear(value);
    else if (name === "endYear") setEndYear(value);
  };

  const applyYearFilter = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/get-data/");
      processJournalData(response.data, startYear, endYear);
    } catch (err) {
      setError("Error applying filter: " + err.message);
    }
  };

  const handleSliderChange = (e) => {
    const newValue = parseInt(e.target.value);
    setMaxDisplayCount(newValue);
    processJournalData(topJournals, startYear, endYear);
  };

  const handleDownload = () => {
    const chartElement = document.getElementById("bar-chart");
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
          saveAs(dataUrl, "journals-chart.png");
          chartElement.style.background = originalBackground;
        })
        .catch((err) => {
          console.error("Error downloading chart:", err);
          chartElement.style.background = originalBackground;
        });
    }
  };

  return (
    <div style={{ margin: "auto", padding: "20px", maxWidth: "1400px", fontSize: "12px" }}>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* Chart Section */}
        <div style={{ flex: "1", minWidth: "300px", maxWidth: "820px" }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {noDataMessage && <div className="alert alert-warning">{noDataMessage}</div>}

          <div style={{ width: "100%", height: "500px" }}>
            <div id="bar-chart" style={{ height: "100%", background: "white" }}>
              <Bar
                data={{
                  labels: topJournals.map((item) => item[0]),
                  datasets: [
                    {
                      label: "Number of Publications",
                      data: topJournals.map((item) => item[1]),
                      backgroundColor: chartColor,
                      borderColor: borderColor,
                      borderWidth: 1,
                    },
                  ],
                }}
                options={chartOptions}
              />
            </div>
            <div style={{ marginTop: "10px" }}>
              *Showing {maxDisplayCount} out of {displayedJournalsCount} journals
              {startYear && endYear && ` for years ${startYear}-${endYear}`}
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div style={{ marginLeft: "40px", flex: "0 0 300px" }}>
          {/* Year Range Controls */}
          <div style={{ marginBottom: "20px" }}>
            <label>Start Year: </label>
            <select
              name="startYear"
              value={startYear}
              onChange={handleYearChange}
            >
              {yearRange.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <label style={{ marginLeft: "20px" }}>End Year: </label>
            <select 
              name="endYear" 
              value={endYear} 
              onChange={handleYearChange}
            >
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

          {/* Display Count Slider */}
          <div style={{ marginBottom: "20px" }}>
            <label>Number of Journals to Display: </label>
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

          {/* Chart Customization Controls */}
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

            <label style={{ display: "block", marginBottom: "10px" }}>
              Chart Color:
              <input
                type="color"
                value={chartColor}
                onChange={(e) => setChartColor(e.target.value)}
                style={{ marginLeft: "10px" }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "10px" }}>
              Border Color:
              <input
                type="color"
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                style={{ marginLeft: "10px" }}
              />
            </label>

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

            <label style={{ display: "block", marginBottom: "10px" }}>
              Show Chart Title:
              <input
                type="checkbox"
                checked={showChartTitle}
                onChange={(e) => setShowChartTitle(e.target.checked)}
                style={{ marginLeft: "10px" }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "10px" }}>
              Show Legend:
              <input
                type="checkbox"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
                style={{ marginLeft: "10px" }}
              />
            </label>

            <label style={{ display: "block", marginBottom: "10px" }}>
              Show Grid:
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                style={{ marginLeft: "10px" }}
              />
            </label>

            {/* Axis Labels */}
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
                Chart Title:
                <input
                  type="text"
                  value={chartTitle}
                  onChange={(e) => setChartTitle(e.target.value)}
                  style={{ marginLeft: "10px", width: "100%" }}
                />
              </label>
            </div>

            {/* Download Button */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                className="btn btn-primary"
                onClick={handleDownload}
                style={{ marginRight: "10px" }}
              >
                <FontAwesomeIcon icon={faDownload} style={{ marginRight: "5px" }} />
                Download Chart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journals;