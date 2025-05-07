import React, { useEffect, useState } from 'react';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(PointElement, LinearScale, CategoryScale, Tooltip, Legend, zoomPlugin);

function ScatterPlot({ selectedWaves }) {
  const [scatterData, setScatterData] = useState(null);
  const [sampledData, setSampledData] = useState([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState(null);
  const [modalData, setModalData] = useState([]);

  const fetchAndSampleData = () => {
    fetch('https://server-1-01nj.onrender.com/api/scatter-data')
      .then(response => response.json())
      .then(data => {
        const grouped = {};
        data.forEach(item => {
          if (item.VisitMonth && item.VisitYear && item.SystolicBP && item.DiastolicBP && item.Sex) {
            const month = Math.round(item.VisitMonth).toString().padStart(2, '0');
            const key = `${month}-${Math.round(item.VisitYear)}`;
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(item);
          }
        });

        const tempSampled = [];
        Object.entries(grouped).forEach(([key, group]) => {
          const sampleSize = Math.min(5, group.length);
          const shuffled = group.sort(() => 0.5 - Math.random());
          shuffled.slice(0, sampleSize).forEach(item => {
            tempSampled.push({
              visitMonthYear: key,
              systolic: item.SystolicBP,
              diastolic: item.DiastolicBP,
              gender: item.Sex,
              wave: item.Wave,
            });
          });
        });

        setSampledData(tempSampled);
      })
      .catch(error => console.error('Error fetching data:', error));
  };

  useEffect(() => {
    fetchAndSampleData();
  }, []);

  useEffect(() => {
    if (sampledData.length === 0) return;

    let filteredData = sampledData;
    if (selectedWaves) {
      filteredData = sampledData.filter(item => selectedWaves.includes(item.wave));
    }

    const maleData = filteredData.filter(item => item.gender === 'Male').map(item => ({
      x: item.visitMonthYear,
      y: item.systolic,
      ...item,
    }));

    const femaleData = filteredData.filter(item => item.gender === 'Female').map(item => ({
      x: item.visitMonthYear,
      y: item.systolic,
      ...item,
    }));

    const allLabels = [...new Set(filteredData.map(item => item.visitMonthYear))].sort((a, b) => {
      const [ma, ya] = a.split('-').map(Number);
      const [mb, yb] = b.split('-').map(Number);
      return ya - yb || ma - mb;
    });

    setScatterData({
      labels: allLabels,
      datasets: [
        {
          label: 'Male',
          data: maleData,
          backgroundColor: 'rgba(3, 169, 244, 0.3)',
          borderColor: 'rgba(3, 169, 244, 0.3)',
          pointStyle: 'circle',
          pointRadius: 6,
          pointBorderWidth: 2,
          pointBackgroundColor: 'white',
        },
        {
          label: 'Female',
          data: femaleData,
          backgroundColor: 'rgba(255, 99, 132, 1)',
          borderColor: 'rgba(255, 99, 132, 1)',
          pointStyle: 'rect',
          pointRadius: 6,
          pointBorderWidth: 1,
        },
      ],
    });
  }, [sampledData, selectedWaves]);

  const handleClick = (event, chartElements) => {
    if (!chartElements.length) return;

    const datasetIndex = chartElements[0].datasetIndex;
    const index = chartElements[0].index;
    const clickedPoint = scatterData.datasets[datasetIndex].data[index];

    const targetMonth = clickedPoint.x;
    const details = sampledData.filter(item => item.visitMonthYear === targetMonth);
    setSelectedMonthYear(targetMonth);
    setModalData(details);
  };

  const closeModal = () => {
    setSelectedMonthYear(null);
    setModalData([]);
  };

  if (!scatterData) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ width: '100%', height: '600px', margin: '0 auto' }}>
      <Scatter
        data={scatterData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          onClick: (event, elements) => handleClick(event, elements),
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: 'Visit Month and Year',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Blood Pressure (Systolic)',
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: context => {
                  const point = context.raw;
                  return [
                    `Gender: ${point.gender}`,
                    `Systolic BP: ${point.systolic}`,
                    `Diastolic BP: ${point.diastolic}`,
                    `Wave: ${point.wave}`,
                  ];
                },
              },
            },
            legend: {
              position: 'top',
            },
            zoom: {
              pan: { enabled: true, mode: 'xy' },
              zoom: {
                pinch: { enabled: true },
                wheel: { enabled: true },
                mode: 'xy',
              },
            },
          },
        }}
      />

      {/* Modal */}
      {selectedMonthYear && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Details for {selectedMonthYear}</h3>
            <ul>
              {modalData.map((point, index) => (
                <li key={index}>
                  <strong>Gender:</strong> {point.gender}, <strong>Systolic:</strong> {point.systolic}, <strong>Diastolic:</strong> {point.diastolic}, <strong>Wave:</strong> {point.wave}
                </li>
              ))}
            </ul>
            <button onClick={closeModal} className="close-button">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScatterPlot;
