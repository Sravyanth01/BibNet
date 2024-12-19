import React from "react";
import { Bar } from "react-chartjs-2";

const BarChart = ({
  topPublishers,
  chartColor,
  borderColor,
  chartOptions,
  noDataMessage,
}) => {
  if (noDataMessage) {
    return <div className="alert alert-warning">{noDataMessage}</div>;
  }

  return (
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
  );
};

export default BarChart;
