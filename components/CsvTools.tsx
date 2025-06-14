
import React, { useState, useCallback, useRef } from 'react';
import { DailyPowerRecord, PowerStationId } from '../types';
import { POWER_STATION_CONFIGS } from '../constants';
import { exportRecordsToCSV, importRecordsFromCSV } from '../services/dataService';
import { ArrowUpTrayIcon, ArrowDownTrayIcon, DocumentTextIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';


interface CsvToolsProps {
  records: DailyPowerRecord[];
  onImport: (newRecords: DailyPowerRecord[]) => void;
}

const CsvTools: React.FC<CsvToolsProps> = ({ records, onImport }) => {
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    exportRecordsToCSV(records, POWER_STATION_CONFIGS);
  }, [records]);

  const handleImport = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = event.target.files?.[0];
    if (file) {
      try {
        const importedRecords = await importRecordsFromCSV(file, POWER_STATION_CONFIGS);
        onImport(importedRecords);
        setImportSuccess(`${importedRecords.length} records imported successfully.`);
      } catch (error) {
        if (error instanceof Error) {
            setImportError(`Error importing CSV: ${error.message}`);
        } else {
            setImportError('An unknown error occurred during import.');
        }
        
      } finally {
        // Reset file input to allow re-uploading the same file if needed
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    }
  }, [onImport]);

  const downloadTemplate = () => {
    const header = `Date,${POWER_STATION_CONFIGS.map(s => `${s.id}_Input`).join(',')}\n`;
    const exampleRow = `2024-07-21,50,60-12,75,40+10\n`;
    const csvContent = header + exampleRow;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'example_import_template.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Export Data</h3>
        <button
          onClick={handleExport}
          disabled={records.length === 0}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-150"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Export to CSV
        </button>
        {records.length === 0 && <p className="text-xs text-gray-500 mt-1">No data to export.</p>}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Import Data from CSV</h3>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
             <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
            >
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Download Template
            </button>
        </div>
       
        {importError && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 mr-1 text-red-500"/> {importError}
          </p>
        )}
        {importSuccess && <p className="mt-2 text-sm text-green-600">{importSuccess}</p>}
         <p className="text-xs text-gray-500 mt-2">
            Expected CSV format: Date (YYYY-MM-DD), then one column per power station for recovery input (e.g., River2_Input, River3_Input, ...).
        </p>
      </div>
    </div>
  );
};

export default CsvTools;
