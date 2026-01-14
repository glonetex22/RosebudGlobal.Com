/**
 * Validate email
 */
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate required field
 */
export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value, min) => {
  if (typeof value === 'string') {
    return value.length >= min;
  }
  return false;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value, max) => {
  if (typeof value === 'string') {
    return value.length <= max;
  }
  return false;
};

/**
 * Validate number
 */
export const validateNumber = (value) => {
  return !isNaN(value) && !isNaN(parseFloat(value));
};

/**
 * Validate positive number
 */
export const validatePositiveNumber = (value) => {
  return validateNumber(value) && parseFloat(value) > 0;
};

/**
 * Validate URL
 */
export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate phone number
 */
export const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10;
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
};

/**
 * Validate SKU format
 */
export const validateSKU = (sku) => {
  const re = /^[A-Z0-9-]+$/;
  return re.test(sku);
};
