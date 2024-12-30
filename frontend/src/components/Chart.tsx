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
import { Option } from '../types/vote';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface VoteChartProps {
  options: Option[];
}

const Chart: React.FC<VoteChartProps> = ({ options }) => {
  const labels = options.map((option) => option.name);
  const data = {
    labels,
    datasets: [
      {
        label: '投票数',
        data: options.map((option) => option.votes),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
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
