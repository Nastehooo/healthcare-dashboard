import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapChart.css";

const MapChart = ({ selectedWaves }) => {
  const [geoData, setGeoData] = useState(null);
  const [mapData, setMapData] = useState([]);
  const [regionWavePercentages, setRegionWavePercentages] = useState({});

  useEffect(() => {
    // Fetch GeoJSON data (regions)
    fetch("https://server-1-01nj.onrender.com/api/geo")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("GeoJSON data fetch error:", err));

    // Fetch map chart data (hehear values)
    fetch("https://server-1-01nj.onrender.com/api/map-chart-data")
      .then((res) => res.json())
      .then((data) => setMapData(data))
      .catch((err) => console.error("Map chart data fetch error:", err));
  }, []);

  // Calculate percentage of hearing aid usage per region/wave
  useEffect(() => {
    const percentages = {};

    mapData.forEach((item) => {
      const region = item.gor;
      const wave = item.wave;

      if (region && wave && item.hehear !== null && item.hehear !== undefined) {
        if (!percentages[region]) {
          percentages[region] = {};
        }
        if (!percentages[region][wave]) {
          percentages[region][wave] = { usingAid: 0, total: 0 };
        }

        if (item.hehear === 1) {
          percentages[region][wave].usingAid += 1;
        }

        percentages[region][wave].total += 1;
      }
    });

    // Final percentage calculation
    Object.keys(percentages).forEach((region) => {
      Object.keys(percentages[region]).forEach((wave) => {
        const stats = percentages[region][wave];
        percentages[region][wave].percentage = stats.total
          ? (stats.usingAid / stats.total) * 100
          : 0;
      });
    });

    setRegionWavePercentages(percentages);
  }, [mapData]);

  // Color scale based on percentage
  const getColor = (percentage) => {
    if (percentage >= 60) return "#b30000"; // Very high usage
    if (percentage >= 40) return "#e34a33"; // High
    if (percentage >= 30) return "#fd8d3c"; // Moderate
    if (percentage >= 20) return "#fdbb84"; // Low
    if (percentage >= 10) return "#fef0d9"; // Very low
    return "#f0f0f0"; // No data or unknown
  };

  // Style each region based on average percentage across selected waves
  const style = (feature) => {
    const region = feature.properties?.rgn_name;
    let total = 0;
    let count = 0;

    selectedWaves.forEach((wave) => {
      if (regionWavePercentages[region]?.[wave]) {
        total += regionWavePercentages[region][wave].percentage;
        count += 1;
      }
    });

    const avgPercentage = count ? total / count : 0;

    return {
      fillColor: getColor(avgPercentage),
      weight: 1,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: count ? 0.8 : 0.3, // Dim if no data
    };
  };

  // Tooltips per region
  const onEachFeature = (feature, layer) => {
    const region = feature.properties?.rgn_name;

    let tooltipHtml = `<div style="font-size: 14px; font-weight: bold;">
      <strong>Region:</strong> ${region || "Unknown"}
      <hr style="border: 0.5px solid #ccc;">
    `;

    selectedWaves.forEach((wave) => {
      if (regionWavePercentages[region]?.[wave]) {
        const pct = regionWavePercentages[region][wave].percentage.toFixed(1);
        tooltipHtml += `
          <strong>${wave}:</strong> 
          <span style="color: #007BFF">${pct}% using hearing aid</span><br/>
        `;
      } else {
        tooltipHtml += `
          <strong>${wave}:</strong> 
          <span style="color: #999">No data available</span><br/>
        `;
      }
    });

    tooltipHtml += `</div>`;

    layer.bindTooltip(tooltipHtml, {
      className: "custom-tooltip",
      sticky: true,
      direction: "top",
      opacity: 1,
    });
  };

  return (
    <div>
      {geoData && selectedWaves.length > 0 && (
        <MapContainer center={[54.5, -2.5]} zoom={6} style={{ height: "800px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <GeoJSON data={geoData} style={style} onEachFeature={onEachFeature} />
        </MapContainer>
      )}
    </div>
  );
};

export default MapChart;
