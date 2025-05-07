import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as d3 from 'd3';
import GapminderSlider from './GapminderSlider';
import './GapminderChart.css';

const GapminderChart = () => {
  const chartRef = useRef();
  const [data, setData] = useState([]);
  const [waves, setWaves] = useState([]);
  const [currentWaveIndex, setCurrentWaveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  const waveYears = [
    "2002–2003", "2004–2005", "2006–2007", "2008–2009", "2010–2011",
    "2012–2013", "2014–2015", "2016–2017", "2018–2019", "2020–2021"
  ];

  useEffect(() => {
    fetch('https://server-1-01nj.onrender.com/api/animation')
      .then(res => res.json())
      .then(json => {
        const cleaned = json.map(d => ({
          region: d.region,
          wave: d.Wave,
          avgIncome: +d.Average_Income,
          illness: +d.IllnessPercentage,
        }));
        setData(cleaned);

        const uniqueWaves = [...new Set(cleaned.map(d => d.wave))]
          .map(wave => parseInt(wave.replace(/\D/g, ''), 10))
          .sort((a, b) => a - b);

        setWaves(uniqueWaves);
      });

    return () => clearInterval(intervalRef.current);
  }, []);

  const filteredData = useCallback(() => {
    return data.filter(d => parseInt(d.wave.replace(/\D/g, ''), 10) === waves[currentWaveIndex]);
  }, [data, currentWaveIndex, waves]); 

  const drawChart = useCallback(() => {
    d3.select(chartRef.current).selectAll('*').remove();

    if (!data.length || !waves.length) return;

    const margin = { top: 50, right: 50, bottom: 50, left: 70 },
          width = 1000 - margin.left - margin.right,
          height = 700 - margin.top - margin.bottom;

    const svg = d3.select(chartRef.current)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLog()
      .domain([100, d3.max(data, d => d.avgIncome) * 1.1])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.illness) * 1.1])
      .range([height, 0]);

    const size = d3.scaleSqrt()
      .domain([0, d3.max(data, d => d.avgIncome)])
      .range([5, 20]);

    const color = d3.scaleOrdinal(d3.schemeTableau10);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(6, "~s"));

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height + 40)
      .attr('text-anchor', 'middle')
      .text('Average Income (£)')
      .style('font-family', 'Comfortaa, cursive');

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -50)
      .attr('text-anchor', 'middle')
      .text('Long Standing Illness (%)')
      .style('font-family', 'Comfortaa, cursive');

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '150px')
      .style('fill', '#ccc')
      .style('opacity', 0.3)
      .text(waveYears[currentWaveIndex]);

    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('padding', '8px')
      .style('background', 'white')
      .style('border', '1px solid black')
      .style('font-family', 'Comfortaa, cursive')
      .style('pointer-events', 'none');

    const filtered = filteredData();

    svg.selectAll('circle')
      .data(filtered)
      .enter()
      .append('circle')
      .attr('cx', d => x(d.avgIncome))
      .attr('cy', d => y(d.illness))
      .attr('r', d => size(d.avgIncome))
      .attr('fill', d => color(d.region))
      .attr('opacity', 0.8)
      .on('mouseover', function (event, d) {
        tooltip.style('visibility', 'visible')
          .html(`
            <strong>${d.region}</strong><br/>
            Income: £${d.avgIncome.toFixed(2)}<br/>
            Illness: ${d.illness.toFixed(1)}%
          `);
        d3.select(this).attr('stroke', 'black').attr('stroke-width', 2);
      })
      .on('mousemove', function (event) {
        tooltip.style('top', `${event.pageY + 10}px`)
               .style('left', `${event.pageX + 10}px`);
      })
      .on('mouseout', function () {
        tooltip.style('visibility', 'hidden');
        d3.select(this).attr('stroke', null);
      });
  }, [data, waves, currentWaveIndex]);  // ✅ Added dependencies to ensure proper re-renders

  useEffect(() => {
    drawChart();
  }, [drawChart, currentWaveIndex]);

  useEffect(() => {
    if (isPlaying && waves.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentWaveIndex(prev => (prev + 1) % waves.length);
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, waves]);

  const togglePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div>
      <div ref={chartRef}></div>

      <div className="slider-container">
        <button
          onClick={togglePlayPause}
          className="play-button"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <GapminderSlider
          waveYears={waveYears}
          currentWaveIndex={currentWaveIndex}
          onWaveChange={setCurrentWaveIndex}
        />
      </div>
    </div>
  );
};

export default GapminderChart;
