import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

// Utility function to merge Tailwind classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format date utilities
export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'PPP');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'PPP p');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Status color utilities
export const getStatusColor = (status) => {
  const colors = {
    OPEN: 'bg-red-100 text-red-800 border-red-200',
    ACKNOWLEDGED: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    RESOLVED: 'bg-green-100 text-green-800 border-green-200',
    ARCHIVED: 'bg-gray-100 text-gray-800 border-gray-200',
    DUPLICATE: 'bg-purple-100 text-purple-800 border-purple-200',
  };
  return colors[status] || colors.OPEN;
};

export const getStatusBadgeColor = (status) => {
  const colors = {
    OPEN: 'bg-red-500',
    ACKNOWLEDGED: 'bg-blue-500',
    IN_PROGRESS: 'bg-yellow-500',
    RESOLVED: 'bg-green-500',
    ARCHIVED: 'bg-gray-500',
    DUPLICATE: 'bg-purple-500',
  };
  return colors[status] || colors.OPEN;
};

// Role utilities
export const getRoleColor = (role) => {
  const colors = {
    CITIZEN: 'bg-blue-100 text-blue-800',
    STEWARD: 'bg-green-100 text-green-800',
    SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  };
  return colors[role] || colors.CITIZEN;
};

// Reputation utilities
export const getReputationLevel = (score) => {
  if (score >= 5000) return { level: 'Super Citizen', color: 'text-purple-600' };
  if (score >= 2500) return { level: 'Naagrik Hero', color: 'text-red-600' };
  if (score >= 1000) return { level: 'Community Leader', color: 'text-orange-600' };
  if (score >= 500) return { level: 'Change Maker', color: 'text-yellow-600' };
  if (score >= 250) return { level: 'Naagrik Champion', color: 'text-green-600' };
  if (score >= 100) return { level: 'Community Helper', color: 'text-blue-600' };
  if (score >= 50) return { level: 'Active Citizen', color: 'text-indigo-600' };
  return { level: 'New Reporter', color: 'text-gray-600' };
};

// File utilities
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isValidImageType = (type) => {
  const supportedTypes = (process.env.NEXT_PUBLIC_SUPPORTED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
  return supportedTypes.includes(type);
};

export const isValidVideoType = (type) => {
  const supportedTypes = (process.env.NEXT_PUBLIC_SUPPORTED_VIDEO_TYPES || 'video/mp4,video/webm').split(',');
  return supportedTypes.includes(type);
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

// URL utilities
export const generateShareUrl = (issueId) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/issues/${issueId}`;
};

// Debounce utility
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Local storage utilities
export const getFromStorage = (key, defaultValue = null) => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting ${key} from localStorage:`, error);
    return defaultValue;
  }
};

export const setToStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting ${key} to localStorage:`, error);
  }
};

export const removeFromStorage = (key) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
};

// Text utilities
export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};
