import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const RadarChart = ({ data }) => {
  const chartData = {
    labels: [
      'Liked by Students',
      'Difficulty',
      'Practicality',
      'Collaborative',
      'Rewarding',
      'Instruction Quality'
    ],
    datasets: [
      {
        label: 'Course Vibe',
        data: [
          data.liked,
          data.difficulty,
          data.practicality,
          data.collaborative,
          data.rewarding,
          data.instruction
        ],
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2
      }
    ]
  };

  const options = {
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 5,
        ticks: {
          stepSize: 1,
          color: '#ccc'
        },
        pointLabels: {
          color: '#eee',
          font: {
            size: 12
          }
        },
        grid: {
          color: '#555'
        }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return <Radar data={chartData} options={options} />;
};

export default RadarChart;