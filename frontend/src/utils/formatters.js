export const formatDate = (date) => new Date(date).toLocaleDateString();
export const formatTime = (date) => new Date(date).toLocaleTimeString();
export const capitalizeWords = (str) => str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
