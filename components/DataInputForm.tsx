
import React, { useState, useEffect, useCallback } from 'react';
import { PowerStationId, DailyPowerRecord } from '../types';
import { POWER_STATION_CONFIGS } from '../constants';
import { formatDateToYYYYMMDD, parseRecoveryInput } from '../services/dataService';
import { CalendarDaysIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';


interface DataInputFormProps {
  onSubmit: (date: string, stationInputs: Record<PowerStationId, string>) => boolean;
  records: DailyPowerRecord[]; // To check for existing dates and prefill
}

const DataInputForm: React.FC<DataInputFormProps> = ({ onSubmit, records }) => {
  const [selectedDate, setSelectedDate] = useState<string>(formatDateToYYYYMMDD(new Date()));
  const [stationInputs, setStationInputs] = useState<Record<PowerStationId, string>>(
    POWER_STATION_CONFIGS.reduce((acc, station) => {
      acc[station.id] = '';
      return acc;
    }, {} as Record<PowerStationId, string>)
  );
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadDataForDate = useCallback((date: string) => {
    const record = records.find(r => r.date === date);
    if (record) {
      const inputs = POWER_STATION_CONFIGS.reduce((acc, stationConf) => {
        acc[stationConf.id] = record.stationData[stationConf.id]?.input || '';
        return acc;
      }, {} as Record<PowerStationId, string>);
      setStationInputs(inputs);
    } else {
      // Reset inputs if no record for this date
      setStationInputs(
        POWER_STATION_CONFIGS.reduce((acc, station) => {
          acc[station.id] = '';
          return acc;
        }, {} as Record<PowerStationId, string>)
      );
    }
  }, [records]);
  
  useEffect(() => {
    loadDataForDate(selectedDate);
  }, [selectedDate, loadDataForDate]);

  const handleInputChange = (stationId: PowerStationId, value: string) => {
    setStationInputs(prev => ({ ...prev, [stationId]: value }));
    setFormMessage(null); 
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    setFormMessage(null);
  };
  
  const validateInputs = (): boolean => {
    for (const station of POWER_STATION_CONFIGS) {
        const input = stationInputs[station.id];
        if (input.trim() === '') continue; // Allow empty inputs, treat as 0 recovery
        if (parseRecoveryInput(input) === null) {
            setFormMessage({ type: 'error', text: `Invalid input for ${station.name}. Use numbers or simple expressions like '60-12'.` });
            return false;
        }
    }
    return true;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateInputs()) return;

    const success = onSubmit(selectedDate, stationInputs);
    if (success) {
      setFormMessage({ type: 'success', text: `Record for ${selectedDate} ${records.find(r=>r.date === selectedDate) ? 'updated' : 'added'} successfully!` });
      // Optionally clear form if it's a new entry, or keep values if updating
      // For now, it keeps values based on useEffect reloading data for the selectedDate
    } else {
      setFormMessage({ type: 'error', text: 'Failed to save record. Please check inputs.' });
    }
  };

  const isEditing = records.some(r => r.date === selectedDate && Object.values(r.stationData).some(sd => sd.input !== ''));


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
          Select Date
        </label>
        <div className="relative">
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="mt-1 block w-full pl-10 pr-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            required
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CalendarDaysIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {POWER_STATION_CONFIGS.map(station => (
          <div key={station.id}>
            <label htmlFor={station.id} className="block text-sm font-medium text-gray-700">
              {station.name} ({station.capacityWh}Wh) - Recovery (%)
            </label>
            <input
              type="text"
              id={station.id}
              value={stationInputs[station.id]}
              onChange={e => handleInputChange(station.id, e.target.value)}
              placeholder="e.g., 75 or 80-10"
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        ))}
      </div>

      {formMessage && (
        <div className={`p-3 rounded-md text-sm ${formMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'} flex items-center`}>
          {formMessage.type === 'success' ? <CheckCircleIcon className="h-5 w-5 mr-2"/> : <ExclamationCircleIcon className="h-5 w-5 mr-2"/>}
          {formMessage.text}
        </div>
      )}

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
      >
        {isEditing ? 'Update Entry' : 'Add Entry'}
      </button>
    </form>
  );
};

export default DataInputForm;
