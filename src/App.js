import React, { useState } from "react";
import Select from "react-select";
import ScatterPlot from "./components/ScatterPlot";
import BarChart from "./components/BarChart";
import MapChart from "./components/MapChart";
import Animation from "./components/GapminderChart";
import "./App.css";

// Full wave options for maps & animation
const waveYears = [
  "2002–2003", "2004–2005", "2006–2007", "2008–2009", "2010–2011",
  "2012–2013", "2014–2015", "2016–2017", "2018–2019", "2020–2021"
];

// Limit options for Scatter Plot & Bar Chart (Wave 2, 4, 6, 8 only)
const limitedOptions = [
  { value: "Wave 2", label: "Wave 2 (2004–2005)" },
  { value: "Wave 4", label: "Wave 4 (2008–2009)" },
  { value: "Wave 6", label: "Wave 6 (2012–2013)" },
  { value: "Wave 8", label: "Wave 8 (2016–2017)" }
];

// Full options for other charts
const fullOptions = waveYears.map((years, i) => ({
  value: `Wave ${i + 1}`,
  label: `Wave ${i + 1} (${years})`
}));

const App = () => {
  const [selectedWaves] = useState([]);
  const [barChartWave, setBarChartWave] = useState([]);
  const [scatterPlotWave, setScatterPlotWave] = useState([]);
  const [mapChartWave, setMapChartWave] = useState([]);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="App">
      <div className="dashboard-header">
        <button className="info-button" onClick={() => setShowModal(true)}>Help</button>
        <h1>Healthcare Dashboard</h1>
      </div>

      {/* First row of charts with limited dropdowns */}
      <div className="dashboard-row">
        <div className="chart-card">
          <div className="dropdown-button">
            <Select
              options={limitedOptions}
              isMulti
              className="select-dropdown"
              placeholder="Select Waves"
              onChange={(selected) => setBarChartWave(selected ? selected.map((o) => o.value) : [])}
              isClearable
            />
          </div>
          <h2>Health Metrics</h2>
          <p className="chart-description">
            This <strong>bar chart</strong> visualizes key health indicators. Only Waves <strong>2, 4, 6, and 8</strong> are available for selection.
          </p>
          <div className="card-content">
            <BarChart selectedWaves={barChartWave} />
          </div>
        </div>

        <div className="chart-card">
          <div className="dropdown-button">
            <Select
              options={limitedOptions}
              isMulti
              className="select-dropdown"
              placeholder="Select Waves"
              onChange={(selected) => setScatterPlotWave(selected ? selected.map((o) => o.value) : [])}
              isClearable
            />
          </div>
          <h2>Blood Pressure Scatter Plot</h2>
          <p className="chart-description">
            This <strong>scatter plot</strong> tracks blood pressure readings each month across selected waves. Only Waves <strong>2, 4, 6, and 8</strong> are available.
          </p>
          <div className="card-content">
            <ScatterPlot selectedWaves={scatterPlotWave} />
          </div>
        </div>
      </div>

      {/* Second row of charts with full dropdowns */}
      <div className="dashboard-row">
        <div className="map-card">
          <div className="dropdown-button">
               <Select
              options={fullOptions}
              isMulti
              className="select-dropdown"
              placeholder="Select Waves"
              onChange={(selected) => setMapChartWave(selected ? selected.map((o) => o.value) : [])}
              isClearable
              menuPortalTarget={document.body}
              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
          <h2>Hearing Aid Usage by UK Region</h2>
          <p className="chart-description">
            This <strong>map</strong> visualizes hearing aid usage across UK regions. All waves are available for selection.
          </p>
          <div className="card-content">
            <MapChart selectedWaves={mapChartWave} />
          </div>
        </div>

        <div className="chart-card">
          <h2>Wealth & Health of United Kingdom</h2>
          <p className="chart-description">
            The <strong>Gapminder-style animation</strong> explores wealth, life expectancy, and illness rates in England.  
            This visualization runs continuously across all waves.
          </p>
          <Animation selectedWaves={selectedWaves} />
        </div>
      </div>

      {/* Information Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>About the English Longitudinal Study of Ageing (ELSA)</h2>
            <p>
              The English Longitudinal Study of Ageing (ELSA) tracks health, financial, and social trends
              among older adults in England. This dashboard visualizes various aspects of ELSA data, including
              health metrics, blood pressure, wealth, and more.
            </p>

            <h3>How to Use the Dashboard</h3>
            <p>
              This dashboard allows you to explore the data across various "waves," which represent different
              periods of time. The charts and maps below allow you to visualize different health metrics,
              such as blood pressure, and demographic details, like gender and region.
            </p>

            <h4>1. Health Metrics (Bar Chart)</h4>
            <p>
              This bar chart visualizes key health indicators like blood pressure across different waves.
              You can select multiple waves (Wave 2, Wave 4, Wave 6, Wave 8) using the dropdown.
              The bar chart will update to show the health data for the selected waves.
            </p>

            <h4>2. Blood Pressure Scatter Plot</h4>
            <p>
              The scatter plot shows blood pressure readings (systolic and diastolic) for both males and females
              across selected waves. You can choose specific waves to visualize by using the dropdown. The points
              in the chart represent individual readings, where the X-axis is the visit month/year and the Y-axis
              represents systolic blood pressure.
            </p>
            <h5>Interactive Features of the Scatter Plot</h5>
            <ul>
              <li><strong>Zoom In/Out:</strong> You can zoom in and out on the plot to view the data points in greater detail. This allows you to focus on a specific time range and see the trends more clearly.</li>
              <li><strong>Drag to Explore:</strong> You can click and drag the chart horizontally to explore different months and years. This makes it easier to navigate across the scatter plot without losing context.</li>
              <li><strong>Click Data Points:</strong> By clicking on any of the data points, a detailed tooltip will appear showing more information about the blood pressure readings, including systolic/diastolic values, the wave number, and the gender of the individual.</li>
            </ul>

            <h4>3. Hearing Aid Usage (Map)</h4>
            <p>
              This map visualizes hearing aid usage across different regions in the UK. You can select multiple waves
              to compare how hearing aid usage has changed over time. The map will update based on the waves you choose.
            </p>
            <h5>Interactive Features of the Map</h5>
            <ul>
              <li><strong>Play Button:</strong> You can use the play button to animate the map over time. This will automatically show how hearing aid usage has evolved across different years. The map will cycle through the selected waves to give a dynamic view of the data.</li>
              <li><strong>Slider:</strong> You can also use the slider to manually drag through the years and examine how hearing aid usage varies across the selected waves year by year. This provides a more controlled way to explore the data.</li>
            </ul>

            <h4>4. Wealth & Health (Gapminder-style Animation)</h4>
            <p>
              This animation shows the relationship between wealth, life expectancy, and illness rates in England
              over time. It plays continuously and updates the visuals across all waves, helping to track changes
              in these factors over time.
            </p>

            <button className="close-button" onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
