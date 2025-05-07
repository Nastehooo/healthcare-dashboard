import React, { useEffect, useRef } from 'react';
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import './GapminderChart.css';

const GapminderSlider = ({ waveYears, currentWaveIndex, onWaveChange }) => {
  const sliderRef = useRef(null);

  useEffect(() => {
    if (!sliderRef.current) return;

    // Initialize slider only if it's not already initialized
    if (!sliderRef.current.noUiSlider) {
      noUiSlider.create(sliderRef.current, {
        start: currentWaveIndex,
        step: 1,
        range: {
          min: 0,
          max: waveYears.length - 1
        },
        tooltips: {
          to: index => waveYears[parseInt(index)],
          from: value => waveYears.indexOf(value)
        },
        pips: {
          mode: 'steps',
          density: 10,
          format: {
            to: index => waveYears[index],
          }
        },
        connect: [true, false]
      });

      // Update the index when the slider value changes
      sliderRef.current.noUiSlider.on('update', (values) => {
        const index = parseInt(values[0]);
        if (index !== currentWaveIndex) {
          onWaveChange(index);
        }
      });
    }

    // Cleanup slider when component unmounts or waveYears change
    return () => {
      if (sliderRef.current && sliderRef.current.noUiSlider) {
        sliderRef.current.noUiSlider.destroy();
      }
    };
  }, [waveYears, currentWaveIndex, onWaveChange]);  // Add currentWaveIndex and onWaveChange to dependencies

  useEffect(() => {
    // Sync slider value if currentWaveIndex changes
    if (sliderRef.current?.noUiSlider) {
      sliderRef.current.noUiSlider.set(currentWaveIndex);
    }
  }, [currentWaveIndex]);

  return <div className="wave-slider-container"><div ref={sliderRef} className="nouislider-bar"></div></div>;
};

export default GapminderSlider;
