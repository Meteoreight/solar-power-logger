
import { PowerStationConfig, PowerStationId } from './types';

export const POWER_STATION_CONFIGS: PowerStationConfig[] = [
  { id: PowerStationId.RIVER2, name: 'River2', capacityWh: 256 },
  { id: PowerStationId.RIVER3, name: 'River3', capacityWh: 230 },
  { id: PowerStationId.DELTA3, name: 'Delta3', capacityWh: 1024 },
  { id: PowerStationId.EB3A, name: 'EB3A', capacityWh: 268 },
];

export const APP_TITLE = "Solar Power Logger";
