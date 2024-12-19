import React from "react";

const ChartControls = ({
  chartOrientation,
  setChartOrientation,
  chartColor,
  setChartColor,
  borderColor,
  setBorderColor,
  fontSize,
  setFontSize,
  showChartTitle,
  setShowChartTitle,
  showLegend,
  setShowLegend,
  showGrid,
  setShowGrid,
  xAxisLabel,
  setXAxisLabel,
  yAxisLabel,
  setYAxisLabel,
}) => (
  <div style={{ marginBottom: "20px" }}>
    <label>Chart Orientation: </label>
    <select value={chartOrientation} onChange={(e) => setChartOrientation(e.target.value)}>
      <option value="horizontal">Horizontal</option>
      <option value="vertical">Vertical</option>
    </select>

    <label>Chart Color: </label>
    <input type="color" value={chartColor} onChange={(e) => setChartColor(e.target.value)} />

    <label>Border Color: </label>
    <input type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} />

    <label>Font Size: </label>
    <input type="range" min="8" max="24" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} />

    <label>Show Chart Title: </label>
    <input type="checkbox" checked={showChartTitle} onChange={(e) => setShowChartTitle(e.target.checked)} />

    <label>Show Legend: </label>
    <input type="checkbox" checked={showLegend} onChange={(e) => setShowLegend(e.target.checked)} />

    <label>Show Grid: </label>
    <input type="checkbox" checked={showGrid} onChange={(e) => setShowGrid(e.target.checked)} />

    <label>X-Axis Label: </label>
    <input type="text" value={xAxisLabel} onChange={(e) => setXAxisLabel(e.target.value)} />

    <label>Y-Axis Label: </label>
    <input type="text" value={yAxisLabel} onChange={(e) => setYAxisLabel(e.target.value)} />
  </div>
);

export default ChartControls;
