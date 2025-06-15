import React from 'react';

interface CumulativeStatsDisplayProps {
  cumulative7DaysWh: number;
  cumulative30DaysWh: number;
}

const CumulativeStatsDisplay: React.FC<CumulativeStatsDisplayProps> = ({ cumulative7DaysWh, cumulative30DaysWh }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center sm:text-left">Quick Stats</h3>
      <div className="flex flex-col sm:flex-row justify-around items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg w-full sm:w-auto">
          <p className="text-sm text-gray-500 mb-1">Last 7 Days</p>
          <p className="text-2xl font-bold text-blue-600">
            {cumulative7DaysWh.toLocaleString()} <span className="text-lg font-medium text-gray-600">Wh</span>
          </p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg w-full sm:w-auto">
          <p className="text-sm text-gray-500 mb-1">Last 30 Days</p>
          <p className="text-2xl font-bold text-green-600">
            {cumulative30DaysWh.toLocaleString()} <span className="text-lg font-medium text-gray-600">Wh</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CumulativeStatsDisplay;
