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
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const CountryCount = () => {
  const [topCountries, setTopCountries] = useState([]);
  const [chartOrientation, setChartOrientation] = useState("horizontal");
  const [chartColor, setChartColor] = useState("#3498db");
  const [borderColor, setBorderColor] = useState("#2980b9");
  const [fontSize, setFontSize] = useState(12);
  const [yearRange, setYearRange] = useState([]);
  const [startYear, setStartYear] = useState("");
  const [endYear, setEndYear] = useState("");
  const [error, setError] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [noDataMessage, setNoDataMessage] = useState("");
  
  const [showChartTitle, setShowChartTitle] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [maxDisplayCount, setMaxDisplayCount] = useState(15);
  const [xAxisLabel, setXAxisLabel] = useState("Number of Publications");
  const [yAxisLabel, setYAxisLabel] = useState("Countries");
  const [xAxisLabelSize, setXAxisLabelSize] = useState(12);
  const [yAxisLabelSize, setYAxisLabelSize] = useState(12);

  const [originalData, setOriginalData] = useState([]);

  const extractCountry = (address) => {
    const countryMappings = {
      'United States': ['USA', 'United States', 'U.S.', 'U.S.A', 'America', 'United States of America'],
      'United Kingdom': ['UK', 'United Kingdom', 'Great Britain', 'England'],
      'China': ['China', 'P.R. China', 'People\'s Republic of China'],
      'India': ['India'],
      'Japan': ['Japan'],
      'Germany': ['Germany'],
      'France': ['France'],
      'Canada': ['Canada'],
      'Australia': ['Australia'],
      'Italy': ['Italy'],
      'Spain': ['Spain'],
      'Brazil': ['Brazil'],
      'South Korea': ['South Korea', 'Korea'],
      'Russia': ['Russia', 'Russian Federation'],
      'Switzerland': ['Switzerland'],
      'Pakistan': ['Pakistan']
    };

    for (const [country, keywords] of Object.entries(countryMappings)) {
      if (keywords.some(keyword => 
        address.toLowerCase().includes(keyword.toLowerCase())
      )) {
        return country;
      }
    }

    const parts = address.split(',');
    const lastPart = parts[parts.length - 1].trim();
    
    return lastPart.length > 2 && lastPart.length < 30 ? lastPart : 'Unknown';
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: chartOrientation === "horizontal" ? "y" : "x",
    plugins: {
      legend: {
        display: showLegend,
      },
      title: {
        display: showChartTitle,
        text: `Top ${maxDisplayCount} Countries by Number of Publications`,
        color: "#000000",
        font: {
          size: 16,
        },
      },
      tooltip: {
        enabled: true,
        bodyFont: {
          size: fontSize,
        },
      },
      datalabels: {
        anchor: chartOrientation === "horizontal" ? "end" : "end",
        align: chartOrientation === "horizontal" ? "right" : "top",
        color: "#000000",
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
        },
        ticks: {
          display: true,
          font: {
            size: fontSize,
          },
          precision: 0,
        },
        title: {
          display: true,
          text: xAxisLabel,
          color: "#000000",
          font: {
            size: xAxisLabelSize,
          },
        },
      },
      y: {
        display: true,
        grid: {
          display: showGrid,
          drawBorder: true,
        },
        ticks: {
          display: true,
          font: {
            size: fontSize,
          },
        },
        title: {
          display: true,
          text: yAxisLabel,
          color: "#000000",
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

  useEffect(() => {
    if (originalData.length > 0) {
      processCountryData(originalData);
    }
  }, [originalData, maxDisplayCount, startYear, endYear]);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/get-data/");
      const data = response.data;
      
      setOriginalData(data);
      
      const years = [...new Set(data.map((item) => item.Year))].sort();
      setYearRange(years);
      setStartYear(years[0]);
      setEndYear(years[years.length - 1]);
    } catch (err) {
      setError("Error fetching data: " + err.message);
    }
  };

  const handleYearChange = (e) => {
    const { name, value } = e.target;
    if (name === "startYear") {
      setStartYear(value);
    } else {
      setEndYear(value);
    }
  };

  const applyYearFilter = () => {
    processCountryData(originalData);
  };

  const handleSliderChange = (e) => {
    const newMaxCount = parseInt(e.target.value);
    setMaxDisplayCount(newMaxCount);
  };

  const processCountryData = (data = []) => {
    const filteredData = data.filter(
      (item) => parseInt(item.Year) >= parseInt(startYear) && 
                parseInt(item.Year) <= parseInt(endYear)
    );

    const countryCounts = {};
    filteredData.forEach((item) => {
      if (item.Correspondence_Address) {
        const country = extractCountry(item.Correspondence_Address);
        countryCounts[country] = (countryCounts[country] || 0) + 1;
      }
    });

    const sortedCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxDisplayCount);

    setTopCountries(sortedCountries);
    setNoDataMessage(
      sortedCountries.length === 0
        ? "No data available for the selected year range"
        : ""
    );
  };

  const handleDownload = () => {
    const chartElement = document.getElementById("bar-chart");
    if (chartElement) {
      toPng(chartElement, { backgroundColor: "#ffffff" })
        .then((dataUrl) => {
          saveAs(dataUrl, `top_countries_publications_${startYear}-${endYear}.png`);
        })
        .catch((err) => {
          console.error("Error downloading chart:", err);
        });
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      "Country,Number of Publications",
      ...topCountries.map(([country, count]) => `${country},${count}`)
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `top_countries_publications_${startYear}-${endYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sliderMax = Math.min(30, originalData.length > 0 
    ? [...new Set(
        originalData
          .map(item => item.Correspondence_Address ? extractCountry(item.Correspondence_Address) : null)
          .filter(country => country !== null)
      )].length 
    : 15);

  return (
    <div
      style={{
        margin: "auto",
        padding: "20px",
        maxWidth: "1400px",
        fontSize: "12px",
      }}
    >
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: "1", minWidth: "300px", maxWidth: "820px" }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {noDataMessage && (
            <div className="alert alert-warning">{noDataMessage}</div>
          )}

          <div style={{ width: "100%", height: "500px" }}>
            <div id="bar-chart" style={{ height: "100%", background: "white" }}>
              <Bar
                data={{
                  labels: topCountries.map((item) => item[0]),
                  datasets: [
                    {
                      label: "Number of Publications",
                      data: topCountries.map((item) => item[1]),
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
              *Showing {maxDisplayCount} countries{" "}
              {startYear && endYear && (
                <>
                  for years {startYear} - {endYear}
                </>
              )}
            </div>
          </div>
        </div>

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

export default CountryCount;