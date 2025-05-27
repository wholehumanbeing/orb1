/**
 * Central data module for philosopher information
 *
 * This module will eventually import and combine data from:
 * - ancientPhilosophers.ts
 * - medievalPhilosophers.ts
 * - modernPhilosophers.ts
 * - contemporaryPhilosophers.ts
 */

export * from "./philosophers"
export * from "../types/philosopher"

// Future imports will be added here as data is populated:
// import { ancientPhilosophers } from './ancientPhilosophers';
// import { medievalPhilosophers } from './medievalPhilosophers';
// import { modernPhilosophers } from './modernPhilosophers';
// import { contemporaryPhilosophers } from './contemporaryPhilosophers';

// export const allPhilosophers: PhilosopherData[] = [
//   ...ancientPhilosophers,
//   ...medievalPhilosophers,
//   ...modernPhilosophers,
//   ...contemporaryPhilosophers
// ];
