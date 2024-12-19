import React from "react";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

const DownloadButton = () => {
  const handleDownload = () => {
    const chartElement = document.getElementById("bar-chart");
    if (chartElement) {
      toPng(chartElement, { backgroundColor: "#ffffff" })
        .then((dataUrl) => {
          saveAs(dataUrl, "publisher-chart.png");
        })
        .catch((err) => {
          console.error("Error downloading chart:", err);
        });
    }
  };

  return (
    <button className="btn btn-primary" onClick={handleDownload}>
      <FontAwesomeIcon icon={faDownload} style={{ marginRight: "5px" }} />
      Download Chart
    </button>
  );
};

export default DownloadButton;
