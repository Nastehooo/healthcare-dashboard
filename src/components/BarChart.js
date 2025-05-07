// src/components/BarChart.jsx

import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function BarChart({ selectedWaves }) {
  const [barData, setBarData] = useState(null);
  const [sampledData, setSampledData] = useState([]);

  useEffect(() => {
    fetch('https://server-1-01nj.onrender.com/api/bar-chart-data')
      .then(response => response.json())
      .then(data => {
        const grouped = {};

        // Group by VisitMonth-Year
        data.forEach(item => {
          if (item.VisitMonth && item.VisitYear && item.Cholesterol != null && item.HDL != null && item.LDL != null && item.Triglycerides != null) {
            const month = Math.round(item.VisitMonth).toString().padStart(2, '0');
            const key = `${month}-${Math.round(item.VisitYear)}`;
            if (!grouped[key]) {
              grouped[key] = [];
            }
            grouped[key].push(item);
          }
        });

        const tempSampled = [];
        Object.entries(grouped).forEach(([key, group]) => {
          const sampleSize = Math.min(5, group.length); // max 5 per month
          const shuffled = group.sort(() => 0.5 - Math.random());
          shuffled.slice(0, sampleSize).forEach(item => {
            tempSampled.push({
              visitMonthYear: key,
              cholesterol: item.Cholesterol,
              hdl: item.HDL,
              ldl: item.LDL,
              triglycerides: item.Triglycerides,
              sex: item.Sex,
              wave: item.Wave,
            });
          });
        });

        setSampledData(tempSampled);
      })
      .catch(error => console.error('Error fetching bar chart data:', error));
  }, []);

  useEffect(() => {
    if (sampledData.length === 0) return;

    // 🔥 Filter based on selected wave
    let filteredData = sampledData;
    if (selectedWaves) {
      filteredData = sampledData.filter(item => selectedWaves.includes(item.wave));
    }

    const allLabels = [...new Set(filteredData.map(item => item.visitMonthYear))].sort((a, b) => {
      const [ma, ya] = a.split('-').map(Number);
      const [mb, yb] = b.split('-').map(Number);
      return ya - yb || ma - mb;
    });

    // Prepare datasets
    const datasets = [
      {
        label: 'Cholesterol (g/l)',
        data: [],
        backgroundColor: 'rgba(156, 39, 176, 0.3)', // purple-light
      },
      {
        label: 'HDL (g/l)',
        data: [],
        backgroundColor: 'rgba(3, 169, 244, 0.3)', // blue-light
      },
      {
        label: 'LDL (g/l)',
        data: [],
        backgroundColor: 'rgba(255, 235, 59, 0.3)', // yellow-light
      },
      {
        label: 'Triglycerides (g/l)',
        data: [],
        backgroundColor: 'rgba(244, 67, 54, 0.3)', // pink-light
      },
    ];

    allLabels.forEach(label => {
      const monthData = filteredData.filter(item => item.visitMonthYear === label);

      // Average if multiple values for the same month
      const avg = (arr, key) => arr.reduce((sum, val) => sum + (val[key] || 0), 0) / arr.length || 0;

      datasets[0].data.push(avg(monthData, 'cholesterol'));
      datasets[1].data.push(avg(monthData, 'hdl'));
      datasets[2].data.push(avg(monthData, 'ldl'));
      datasets[3].data.push(avg(monthData, 'triglycerides'));
    });

    setBarData({
      labels: allLabels,
      datasets,
    });
  }, [sampledData, selectedWaves]);

  if (!barData) {
    return <div>Loading Bar Chart...</div>;
  }

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <Bar
        data={barData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: {
                  size: 14
                }
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Concentration (g/l)',
                font: {
                  size: 16
                }
              },
            },
            x: {
              title: {
                display: true,
                text: 'Visit Month-Year',
                font: {
                  size: 16
                }
              },
              ticks: {
                font: {
                  size: 14
                }
              }
            },
          },
        }}
      />
    </div>
  );
}

export default BarChart;
