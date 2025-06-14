
import React, { useState, useCallback } from 'react';
import { DailyPowerRecord, PowerStationId } from '../types';
import { POWER_STATION_CONFIGS } from '../constants';
import Modal from './Modal';
import DataInputForm from './DataInputForm'; // Re-using for editing
import CsvTools from './CsvTools';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';


interface DataTablePageProps {
  records: DailyPowerRecord[];
  onDelete: (date: string) => void;
  onEditSubmit: (date: string, stationInputs: Record<PowerStationId, string>) => boolean;
  onImport: (records: DailyPowerRecord[]) => void;
}

const DataTablePage: React.FC<DataTablePageProps> = ({ records, onDelete, onEditSubmit, onImport }) => {
  const [editingRecord, setEditingRecord] = useState<DailyPowerRecord | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (record: DailyPowerRecord) => {
    setEditingRecord(record);
    setIsEditModalOpen(true);
  };

  const handleDelete = (date: string) => {
    if (window.confirm(`Are you sure you want to delete the record for ${date}?`)) {
      onDelete(date);
    }
  };

  const handleEditFormSubmit = useCallback((date: string, stationInputs: Record<PowerStationId, string>): boolean => {
    const success = onEditSubmit(date, stationInputs);
    if (success) {
      setIsEditModalOpen(false);
      setEditingRecord(null);
    }
    return success;
  }, [onEditSubmit]);

  const filteredRecords = records.filter(record => 
    record.date.includes(searchTerm) || 
    Object.values(record.stationData).some(sd => sd.input.toLowerCase().includes(searchTerm.toLowerCase())) ||
    record.totalWhGenerated.toString().includes(searchTerm)
  ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-8">
      <div className="p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Data Management</h2>
        <CsvTools records={records} onImport={onImport} />
      </div>

      <div className="p-6 bg-white shadow-lg rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2 sm:mb-0">All Records</h2>
          <input 
            type="text"
            placeholder="Search records..."
            className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm w-full sm:w-auto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {filteredRecords.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {records.length === 0 ? "No records yet. Add some data or import a CSV." : "No records match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  {POWER_STATION_CONFIGS.map(station => (
                    <th key={station.id} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{station.name} Input</th>
                  ))}
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Wh</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.date} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.date}</td>
                    {POWER_STATION_CONFIGS.map(station => (
                      <td key={station.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.stationData[station.id]?.input || '-'}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.totalWhGenerated.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button onClick={() => handleEdit(record)} className="text-blue-600 hover:text-blue-800 transition-colors p-1" title="Edit">
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(record.date)} className="text-red-600 hover:text-red-800 transition-colors p-1" title="Delete">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isEditModalOpen && editingRecord && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Record for ${editingRecord.date}`}>
            <DataInputForm 
              onSubmit={(date, stationInputs) => handleEditFormSubmit(date, stationInputs)} 
              records={records} // Pass all records so DataInputForm can correctly prefill using its internal logic
            />
        </Modal>
      )}
    </div>
  );
};

export default DataTablePage;
