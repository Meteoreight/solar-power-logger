
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import DataInputForm from './components/DataInputForm';
import DataVisualization from './components/DataVisualization';
import DataTablePage from './components/DataTablePage';
import { DailyPowerRecord, PowerStationId } from './types';
import { POWER_STATION_CONFIGS, APP_TITLE } from './constants';
import { calculatePowerRecord, loadRecordsFromStorage, saveRecordsToStorage } from './services/dataService';

const App: React.FC = () => {
  const [records, setRecords] = useState<DailyPowerRecord[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const loadedRecords = await loadRecordsFromStorage();
        setRecords(loadedRecords);
      } catch (error) {
        console.error("Failed to load records:", error);
        // Optionally set an error state here to inform the user
      } finally {
        setIsDataLoaded(true);
      }
    };
    fetchRecords();
  }, []);

  useEffect(() => {
    const saveRecords = async () => {
      if (isDataLoaded) {
        try {
          await saveRecordsToStorage(records);
        } catch (error) {
          console.error("Failed to save records:", error);
          // Optionally set an error state here to inform the user
        }
      }
    };
    saveRecords();
  }, [records, isDataLoaded]);

  const addOrUpdateRecord = useCallback((date: string, stationInputs: Record<PowerStationId, string>) => {
    const newRecord = calculatePowerRecord(date, stationInputs, POWER_STATION_CONFIGS);
    if (!newRecord) return false;

    setRecords(prevRecords => {
      const existingRecordIndex = prevRecords.findIndex(r => r.date === date);
      if (existingRecordIndex > -1) {
        const updatedRecords = [...prevRecords];
        updatedRecords[existingRecordIndex] = newRecord;
        return updatedRecords;
      } else {
        // Add new record and sort
        const updatedRecords = [...prevRecords, newRecord];
        return updatedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
    });
    return true;
  }, []);

  const deleteRecord = useCallback((date: string) => {
    setRecords(prevRecords => prevRecords.filter(record => record.date !== date));
  }, []);
  
  const importRecords = useCallback((importedRecords: DailyPowerRecord[]) => {
    // Basic merge strategy: overwrite existing dates, add new ones.
    // More sophisticated merging could be implemented if needed.
    setRecords(prevRecords => {
      const recordsMap = new Map(prevRecords.map(r => [r.date, r]));
      importedRecords.forEach(ir => recordsMap.set(ir.date, ir));
      return Array.from(recordsMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }, []);

  if (!isDataLoaded) {
    return <div className="flex justify-center items-center h-screen"><p className="text-xl">Loading data...</p></div>;
  }
  
  const showDataInputForm = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-grow p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">{APP_TITLE}</h1>
        
        {showDataInputForm && (
           <div className="mb-8 p-6 bg-white shadow-lg rounded-lg">
             <h2 className="text-2xl font-semibold mb-4 text-gray-700">Add New / Edit Entry</h2>
             <DataInputForm onSubmit={addOrUpdateRecord} records={records} />
           </div>
        )}

        <Routes>
          <Route path="/" element={
            <DataVisualization records={records} />
          } />
          <Route path="/table" element={
            <DataTablePage 
              records={records} 
              onDelete={deleteRecord} 
              onEditSubmit={addOrUpdateRecord}
              onImport={importRecords}
            />
          } />
        </Routes>
      </main>
      {/* Footer has been removed as per user request */}
    </div>
  );
};

export default App;
