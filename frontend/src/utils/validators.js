export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePassword = (password) => password.length >= 6;
export const validatePhone = (phone) => /^\d{10,}$/.test(phone.replace(/\D/g, ''));
