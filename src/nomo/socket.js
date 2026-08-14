import io from 'socket.io-client';

const isProduction = import.meta.env.PROD;

// In production, we connect to the same URL serving the page.
// In development, we connect to the backend port (3001).
const URL = isProduction 
  ? undefined 
  : `${window.location.protocol}//${window.location.hostname}:3005`;

const socket = io(URL, { 
    autoConnect: false,
    transports: ['websocket']
});

export default socket;