'use client';

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface VoteChartProps {
  support: number;
  oppose: number;
}

const Chart: React.FC<VoteChartProps> = ({ support, oppose }) => {
  const data = {
    labels: ['賛成', '反対'],
    datasets: [
      {
        label: '投票数',
        data: [support, oppose],
        backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(255, 99, 132, 0.2)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const optionsConfig = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <Bar data={data} options={optionsConfig} />
    </div>
  );
};

export default Chart;
