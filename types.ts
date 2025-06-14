
export enum PowerStationId {
  RIVER2 = 'River2',
  RIVER3 = 'River3',
  DELTA3 = 'Delta3',
  EB3A = 'EB3A',
}

export interface PowerStationConfig {
  id: PowerStationId;
  name: string;
  capacityWh: number;
}

export interface StationDailyData {
  input: string; // e.g., "50" or "70-10"
  recoveredPercentage: number;
  recoveredWh: number;
}

export interface DailyPowerRecord {
  date: string; // YYYY-MM-DD, unique key
  stationData: Record<PowerStationId, StationDailyData>;
  totalWhGenerated: number;
}

// For chart data
export interface ChartDataPoint {
  date: string;
  value: number;
}

export type TimeRangeFilter = '30d' | '90d' | '1y' | 'all';
