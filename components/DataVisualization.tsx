
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DailyPowerRecord, TimeRangeFilter } from '../types';

interface DataVisualizationProps {
  records: DailyPowerRecord[];
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ records }) => {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('30d');

  const filteredAndSortedRecords = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        // No specific start date for 'all', use all records
        return [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      default:
        startDate.setDate(now.getDate() - 30); // Default to 30 days
    }
    
    const startTime = startDate.getTime();
    return records
      .filter(record => new Date(record.date).getTime() >= startTime)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [records, timeRange]);

  const dailyGenerationData = useMemo(() => {
    return filteredAndSortedRecords.map(record => ({
      date: record.date,
      totalWh: record.totalWhGenerated,
    }));
  }, [filteredAndSortedRecords]);

  const cumulativeGenerationData = useMemo(() => {
    let cumulativeTotal = 0;
    return filteredAndSortedRecords.map(record => {
      cumulativeTotal += record.totalWhGenerated;
      return {
        date: record.date,
        cumulativeWh: cumulativeTotal,
      };
    });
  }, [filteredAndSortedRecords]);

  const timeRangeOptions: { value: TimeRangeFilter; label: string }[] = [
    { value: '30d', label: 'Past 30 Days' },
    { value: '90d', label: 'Past 90 Days' },
    { value: '1y', label: 'Past 1 Year' },
    { value: 'all', label: 'All Time' },
  ];

  if (records.length === 0) {
    return (
      <div className="text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12A2.25 2.25 0 0 0 20.25 14.25V3m-16.5 0h16.5m-16.5 0H3.75m16.5 0H20.25m0 0V3m0 0h-.01M3.75 6.75h16.5M3.75 10.5h16.5m-16.5 3.75h16.5M3.75 12h16.5m-16.5 0V3.75M7.5 3v11.25m6-11.25v11.25m6-11.25v11.25M5.25 5.25h13.5" />
        </svg>
        <p className="text-xl text-gray-600">No data available to display charts.</p>
        <p className="text-sm text-gray-500 mt-2">Add some entries using the form above to see your generation statistics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center space-x-2 sm:space-x-4 mb-6">
        {timeRangeOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setTimeRange(option.value)}
            className={`px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium rounded-md transition-colors duration-150
              ${timeRange === option.value ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-100 border border-blue-600'}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="p-6 bg-white shadow-lg rounded-lg">
        <h3 className="text-xl font-semibold mb-6 text-gray-700">Daily Power Generation (Wh)</h3>
        {dailyGenerationData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyGenerationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
                labelStyle={{ fontWeight: 'bold', color: '#333' }}
              />
              <Legend />
              <Bar dataKey="totalWh" fill="#3b82f6" name="Total Wh Generated" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-8">No data for the selected period.</p>
        )}
      </div>

      <div className="p-6 bg-white shadow-lg rounded-lg">
        <h3 className="text-xl font-semibold mb-6 text-gray-700">Cumulative Power Generation (Wh)</h3>
         {cumulativeGenerationData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cumulativeGenerationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px' }}
                labelStyle={{ fontWeight: 'bold', color: '#333' }}
              />
              <Legend />
              <Line type="monotone" dataKey="cumulativeWh" stroke="#10b981" strokeWidth={2} name="Cumulative Wh" dot={false} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
           <p className="text-center text-gray-500 py-8">No data for the selected period.</p>
        )}
      </div>
    </div>
  );
};

export default DataVisualization;
