import { createRequire } from 'node:module';

// astronomy-engine 2.x publishes ESM syntax in a .js file without declaring
// type: module. Use its supported CommonJS entry on Node rather than relying
// on runtime-specific automatic module detection. Browsers keep the ESM build.
const require = createRequire(import.meta.url);
export const { Body, GeoVector, Ecliptic, SunPosition } = require('astronomy-engine');
