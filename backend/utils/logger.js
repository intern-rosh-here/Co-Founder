const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

exports.log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  console.log(logMessage);
};

exports.error = (message) => exports.log(message, 'error');
exports.info = (message) => exports.log(message, 'info');
exports.warn = (message) => exports.log(message, 'warn');
