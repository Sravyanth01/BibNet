import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const OpenAccess = () => {
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState("bar");
  const [showLegend, setShowLegend] = useState(true);
  const [yearRange, setYearRange] = useState([]);
  const [maxDisplayCount, setMaxDisplayCount] = useState(15);
  const [accessTypes, setAccessTypes] = useState([]);
  const [showGrid, setShowGrid] = useState(true);
  const [chartOrientation, setChartOrientation] = useState("horizontal");
  const [chartColor, setChartColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(10);
  const [chartTitle, setChartTitle] = useState("Open Access Status");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const colors = [
    "#2563eb", "#dc2626", "#16a34a", "#ca8a04", "#9333ea",
    "#0891b2", "#be123c", "#15803d", "#854d0e", "#7e22ce"
  ];

  const styles = {
    container: {
      display: "flex",
      gap: "24px",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "16px"
    },
    chartPanel: {
      flex: "2",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      padding: "24px"
    },
    controlPanel: {
      flex: "1",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      padding: "24px",
      fontSize: "10px"
    },
    title: {
      fontSize: "20px",
      fontWeight: "bold",
      marginBottom: "16px"
    },
    chartContainer: {
      height: "500px",
      position: "relative"
    },
    loadingSpinner: {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    spinner: {
      width: "48px",
      height: "48px",
      border: "4px solid #2563eb",
      borderTopColor: "transparent",
      borderRadius: "50%",
      animation: "spin 1s linear infinite"
    },
    errorMessage: {
      position: "absolute",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#dc2626"
    },
    controlGroup: {
      marginBottom: "16px"
    },
    label: {
      display: "block",
      fontSize: "14px",
      fontWeight: "500",
      marginBottom: "8px"
    },
    select: {
      width: "100%",
      padding: "8px",
      border: "1px solid #e5e7eb",
      borderRadius: "6px",
      backgroundColor: "white"
    },
    checkbox: {
      width: "12px",
      height: "12px",
      marginRight: "8px"
    },
    range: {
      width: "100%"
    },
    colorPicker: {
      width: "100%",
      height: "40px",
      borderRadius: "6px"
    },
    downloadButton: {
      width: "100%",
      backgroundColor: "#2563eb",
      color: "white",
      padding: "8px 16px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer"
    },
    disabledButton: {
      opacity: "0.5",
      cursor: "not-allowed"
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/get-data/");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const years = [...new Set(data.map(item => item.Year))].sort();
      setYearRange(years);
      processAccessData(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const processAccessData = (data) => {
    const accessCounts = data.reduce((acc, item) => {
      const status = item.Open_Access || "Not Specified";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const sortedAccess = Object.entries(accessCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxDisplayCount);

    setAccessTypes(sortedAccess);
  };

  const chartData = {
    labels: accessTypes.map(([name]) => name || "Not Specified"),
    datasets: [
      {
        label: "Count",
        data: accessTypes.map(([, count]) => count),
        backgroundColor: chartType === "bar" ? chartColor : colors,
        borderColor: chartType === "bar" ? chartColor : colors,
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: chartOrientation === "horizontal" ? "y" : "x",
    plugins: {
      legend: {
        display: showLegend,
        position: "top",
        labels: {
          color: "#000000",
          font: {
            size: fontSize,
          },
        },
      },
      title: {
        display: true,
        text: chartTitle,
        color: "#000000",
        font: {
          size: 16,
        },
      },
      tooltip: {
        enabled: true,
        bodyFont: {
          size: fontSize,
          color: "#000000",
        },
      },
    },
    scales: chartType === "bar" ? {
      x: {
        display: true,
        beginAtZero: true,
        grid: {
          display: showGrid,
          drawBorder: true,
          borderColor: "#000000",
        },
        ticks: {
          display: true,
          color: "#000000",
          font: {
            size: fontSize,
          },
        },
        border: {
          color: '#000000',
        },
        title: {
          display: true,
          text: chartOrientation === "horizontal" ? "Number of Publications" : "Open Access Status",
          color: "#000000",
        },
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          display: showGrid,
          drawBorder: true,
          borderColor: "#000000",
        },
        border: {
          color: '#000000',
        },
        ticks: {
          display: true,
          color: "#000000",
          font: {
            size: fontSize,
          },
        },
        title: {
          display: true,
          text: chartOrientation === "horizontal" ? "Open Access Status" : "Number of Publications",
          color: "#000000",
        },
      },
    } : {},
  };

  const handleDownload = () => {
    if (!chartRef.current) return;
    
    const canvas = chartRef.current.canvas;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${chartTitle.toLowerCase().replace(/\s+/g, "-")}-${chartType}.png`;
    link.href = url;
    link.click();
  };

  return (
    <div style={styles.container}>
      <div style={styles.chartPanel}>
        <h2 style={styles.title}>{chartTitle}</h2>
        <div style={styles.chartContainer}>
          {isLoading ? (
            <div style={styles.loadingSpinner}>
              <div style={styles.spinner} />
            </div>
          ) : error ? (
            <div style={styles.errorMessage}>
              {error}
            </div>
          ) : (
            <Chart ref={chartRef} type={chartType} data={chartData} options={chartOptions} />
          )}
        </div>
      </div>

      <div style={styles.controlPanel}>
        <h2 style={styles.title}>Chart Options</h2>
        <div>
          <div style={styles.controlGroup}>
            <label style={styles.label}>Chart Type</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              style={styles.select}
            >
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="doughnut">Doughnut Chart</option>
            </select>
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.label}>Orientation</label>
            <select
              value={chartOrientation}
              onChange={(e) => setChartOrientation(e.target.value)}
              style={styles.select}
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>

          <div style={styles.controlGroup}>
            <label style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                style={styles.checkbox}
              />
              Show Grid
            </label>
          </div>

          <div style={styles.controlGroup}>
            <label style={{ display: "flex", alignItems: "center" }}>
              <input
                type="checkbox"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
                style={styles.checkbox}
              />
              Show Legend
            </label>
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.label}>
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="8"
              max="24"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              style={styles.range}
            />
          </div>

          <div style={styles.controlGroup}>
            <label style={styles.label}>Chart Color (Bar)</label>
            <input
              type="color"
              value={chartColor}
              onChange={(e) => setChartColor(e.target.value)}
              style={styles.colorPicker}
            />
          </div>

          <button
            onClick={handleDownload}
            disabled={isLoading || !!error}
            style={{
              ...styles.downloadButton,
              ...(isLoading || !!error ? styles.disabledButton : {})
            }}
          >
            Download Chart
          </button>
        </div>
      </div>
    </div>
  );
};

export default OpenAccess;