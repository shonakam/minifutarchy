'use client';

import React from 'react';

interface SliderProps {
  value: number; // スライダーの値 (0.0 - 1.0)
  onChange: (value: number) => void; // 値変更時のコールバック
}

const Slider: React.FC<SliderProps> = ({ value, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-2">
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={handleInputChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none focus:outline-none"
      />
    </div>
  );
};

export default Slider;
