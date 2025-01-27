import React from "react";

interface DurationAdjusterProps {
	duration: number;
	onChange: (newDuration: number) => void;
}

function formatDuration(seconds: number): string {
	const ONE_DAY = 24 * 60 * 60;
	const ONE_MONTH = ONE_DAY * 30;
	const ONE_YEAR = ONE_MONTH * 12;
  
	const years = Math.floor(seconds / ONE_YEAR);
	const months = Math.floor((seconds % ONE_YEAR) / ONE_MONTH);
	const days = Math.floor((seconds % ONE_MONTH) / ONE_DAY);
  
	let result = "";
	if (years > 0) result += `${years}year `;
	if (months > 0) result += `${months}month `;
	if (days > 0) result += `${days}day `;
  
	return result.trim();
  }

const DurationAdjuster: React.FC<DurationAdjusterProps> = ({
  duration,
  onChange,
}) => {
  // 時間単位の増減量
  const ONE_DAY = 24 * 60 * 60;
  const SEVEN_DAYS = ONE_DAY * 7;
  const ONE_MONTH = ONE_DAY * 30;

  const handleIncrease = (value: number) => {
    onChange(duration + value);
  };

  const handleDecrease = (value: number) => {
    const newDuration = duration - value;
    onChange(newDuration > 0 ? newDuration : 0); // 0未満にならないように調整
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-sm text-gray-400">Duration: {formatDuration(duration)}</p>
      <div className="flex space-x-12">
	  <div className="flex space-x-2">
        {/* 増加ボタン */}
        <button
		  type="button"
          className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
          onClick={() => handleIncrease(ONE_DAY)}
		  >
          +1d
        </button>
        <button
		  type="button"
          className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
          onClick={() => handleIncrease(SEVEN_DAYS)}
        >
          +7d
        </button>
        <button
		  type="button"
          className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600"
          onClick={() => handleIncrease(ONE_MONTH)}
        >
          +1m
        </button>
      </div>

	  {/* リセットボタン */}
	  <div className="flex space-x-2">
	  <button
	      type="button"
          className="px-4 py-2 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600"
          onClick={() => handleIncrease(-duration)}
        >
          reset
        </button>
	  </div>

      <div className="flex space-x-2">
        {/* 減少ボタン */}
        <button
		  type="button"
          className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
          onClick={() => handleDecrease(ONE_DAY)}
        >
          -1d
        </button>
        <button
		  type="button"
          className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
          onClick={() => handleDecrease(SEVEN_DAYS)}
		  >
          -7d
        </button>
        <button
		  type="button"
          className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600"
          onClick={() => handleDecrease(ONE_MONTH)}
		  >
          -1m
        </button>
      </div>
	</div>
    </div>
  );
};

export default DurationAdjuster;
