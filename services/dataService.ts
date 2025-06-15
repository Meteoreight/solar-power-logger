
import { DailyPowerRecord, PowerStationId, PowerStationConfig, StationDailyData } from '../types';

const LOCAL_STORAGE_KEY = 'solarPowerRecords';

/**
 * Parses a recovery input string (e.g., "50", "60-12") into a percentage.
 * Allows simple arithmetic like "X-Y" or "X+Y".
 * Returns null if input is invalid.
 */
export const parseRecoveryInput = (input: string): number | null => {
  if (!input || input.trim() === '') return 0; // Treat empty as 0%

  const trimmedInput = input.trim();
  
  // Try simple number first
  if (!isNaN(Number(trimmedInput))) {
    const value = parseFloat(trimmedInput);
    return (value >= 0 && value <= 1000) ? value : null; // Allow > 100 for sums, cap later if needed
  }

  // Try simple expression like "X-Y" or "X+Y"
  // This is a very basic parser. For more complex math, a library would be better.
  const parts = trimmedInput.match(/([0-9.]+)\s*([-+])\s*([0-9.]+)/);
  if (parts && parts.length === 4) {
    const num1 = parseFloat(parts[1]);
    const operator = parts[2];
    const num2 = parseFloat(parts[3]);

    if (isNaN(num1) || isNaN(num2)) return null;

    let result: number;
    if (operator === '-') {
      result = num1 - num2;
    } else if (operator === '+') {
      result = num1 + num2;
    } else {
      return null; // Should not happen with current regex
    }
    return (result >= 0 && result <= 1000) ? result : null;
  }
  
  return null; // Invalid format
};


export const calculatePowerRecord = (
  date: string,
  stationInputs: Record<PowerStationId, string>,
  configs: PowerStationConfig[]
): DailyPowerRecord | null => {
  const stationData: Record<PowerStationId, StationDailyData> = {} as Record<PowerStationId, StationDailyData>;
  let totalWhGenerated = 0;
  let hasValidInput = false;

  for (const config of configs) {
    const inputStr = stationInputs[config.id] || '';
    const recoveredPercentage = parseRecoveryInput(inputStr);

    if (recoveredPercentage === null && inputStr.trim() !== '') {
      console.error(`Invalid input for ${config.name}: ${inputStr}`);
      // If strict validation is needed, return null here or throw error
      // For now, we'll allow record creation but this station will have 0 Wh if input is invalid
      stationData[config.id] = { input: inputStr, recoveredPercentage: 0, recoveredWh: 0 };
      continue; 
    }
    
    const percentage = Math.max(0, Math.min(recoveredPercentage || 0, 100)); // Cap at 0-100%
    const recoveredWh = (percentage / 100) * config.capacityWh;
    
    stationData[config.id] = {
      input: inputStr,
      recoveredPercentage: percentage,
      recoveredWh: recoveredWh,
    };
    totalWhGenerated += recoveredWh;
    if (inputStr.trim() !== '') hasValidInput = true;
  }
  
  // Only create a record if there's at least one valid input or if forced (e.g. user explicitly enters 0s)
  // For simplicity, we create a record even if all inputs are empty (resulting in 0 Wh)
  // if (!hasValidInput && Object.values(stationInputs).every(s => s.trim() === '')) return null;


  return {
    date,
    stationData,
    totalWhGenerated,
  };
};

export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// API Interaction Functions
export const loadRecordsFromStorage = async (): Promise<DailyPowerRecord[]> => {
  try {
    const response = await fetch('/api/records');
    if (!response.ok) {
      console.error(`Error fetching records: ${response.status} ${response.statusText}`);
      return [];
    }
    const records: DailyPowerRecord[] = await response.json();
    // Sort by date descending, as was the previous behavior
    return records.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error loading records from API:", error);
    return [];
  }
};

export const saveRecordsToStorage = async (records: DailyPowerRecord[]): Promise<void> => {
  try {
    const response = await fetch('/api/records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(records),
    });
    if (!response.ok) {
      console.error(`Error saving records: ${response.status} ${response.statusText}`);
      // Consider how to handle this error more gracefully in the UI
    }
  } catch (error) {
    console.error("Error saving records to API:", error);
  }
};

// CSV Export/Import
export const exportRecordsToCSV = (records: DailyPowerRecord[], configs: PowerStationConfig[]): void => {
  if (records.length === 0) return;

  const headers = ['Date', ...configs.map(c => `${c.id}_Input`), 'TotalWhGenerated'];
  const csvRows = [headers.join(',')];

  const sortedRecords = [...records].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const record of sortedRecords) {
    const row = [
      record.date,
      ...configs.map(c => record.stationData[c.id]?.input || ''),
      record.totalWhGenerated.toFixed(2)
    ];
    csvRows.push(row.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `solar_power_records_${formatDateToYYYYMMDD(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const importRecordsFromCSV = (file: File, configs: PowerStationConfig[]): Promise<DailyPowerRecord[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvString = event.target?.result as string;
        const rows = csvString.split('\n').map(row => row.trim()).filter(row => row.length > 0);
        if (rows.length < 2) { // Header + at least one data row
          throw new Error("CSV file is empty or has no data rows.");
        }

        const headerRow = rows[0].split(',');
        const dateIndex = headerRow.findIndex(h => h.toLowerCase() === 'date');
        if (dateIndex === -1) throw new Error("CSV missing 'Date' column.");

        const stationInputIndices: Record<PowerStationId, number> = {} as Record<PowerStationId, number>;
        configs.forEach(config => {
          const idx = headerRow.findIndex(h => h.toLowerCase() === `${config.id.toLowerCase()}_input`);
          if (idx === -1) throw new Error(`CSV missing '${config.id}_Input' column.`);
          stationInputIndices[config.id] = idx;
        });

        const importedRecords: DailyPowerRecord[] = [];
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',');
          const date = values[dateIndex];
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { // Basic date format validation
            console.warn(`Skipping row ${i+1} due to invalid date format: ${date}`);
            continue;
          }

          const stationInputs: Record<PowerStationId, string> = {} as Record<PowerStationId, string>;
          configs.forEach(config => {
            stationInputs[config.id] = values[stationInputIndices[config.id]] || '';
          });
          
          const record = calculatePowerRecord(date, stationInputs, configs);
          if (record) {
            importedRecords.push(record);
          } else {
             console.warn(`Skipping row ${i+1} due to calculation error or invalid data.`);
          }
        }
        resolve(importedRecords);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};
