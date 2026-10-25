import io from 'socket.io-client';

const isProduction = import.meta.env.PROD;

// In production, we connect to the same URL serving the page.
// A separate hosted backend can be configured for a static frontend deployment.
const URL = import.meta.env.VITE_NOMO_SERVER_URL || (isProduction
  ? undefined 
  : `${window.location.protocol}//${window.location.hostname}:3080`);

const socket = io(URL, { 
    autoConnect: false,
    transports: ['polling', 'websocket']
});

export default socket;
