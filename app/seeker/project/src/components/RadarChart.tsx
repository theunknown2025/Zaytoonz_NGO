import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { JobRequirement } from '../types';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  requirements: JobRequirement[];
}

const RadarChart: React.FC<RadarChartProps> = ({ requirements }) => {
  const data = {
    labels: requirements.map(req => req.category),
    datasets: [
      {
        label: 'Your Match',
        data: requirements.map(req => req.score / req.maxScore * 100),
        backgroundColor: 'rgba(14, 165, 233, 0.2)',
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(14, 165, 233, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(14, 165, 233, 1)',
      },
      {
        label: 'Required',
        data: requirements.map(() => 100),
        backgroundColor: 'rgba(20, 184, 166, 0.1)',
        borderColor: 'rgba(20, 184, 166, 0.6)',
        borderWidth: 1,
        pointBackgroundColor: 'rgba(20, 184, 166, 0.6)',
        borderDash: [5, 5],
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'rgba(0, 0, 0, 0)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw.toFixed(1)}%`;
          }
        }
      }
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-[400px] p-4 bg-white rounded-lg shadow-sm animate-fade-in">
      <Radar data={data} options={options} />
    </div>
  );
};

export default RadarChart;