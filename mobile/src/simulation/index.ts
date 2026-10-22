export { runSimulation, findBottleneckIndex } from './engine';
export { DEFAULT_PARAMS, DEFAULT_STATIONS } from './defaults';
export { LIMITS, validateParams, hasErrors, InvalidParamsError } from './validation';
export type { ValidationErrors } from './validation';
export type { SimulationParams, SimulationResult, StationConfig, StationResult } from './types';
