import { format, parseISO, differenceInDays } from 'date-fns';

// Currency formatting
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '-';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return formatter.format(amount);
};

// Number formatting
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('en-IN').format(num);
};

// Date formatting
export const formatDate = (date, formatStr = 'MMM d, yyyy') => {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
};

// Short date format
export const formatDateShort = (date) => {
  if (!date) return '-';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d');
};

// Date range formatting
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '-';
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const days = differenceInDays(end, start) + 1;
  return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')} · ${days} days`;
};

// Duration formatting
export const formatDuration = (days) => {
  if (!days || days <= 0) return '-';
  return `${days} ${days === 1 ? 'day' : 'days'}`;
};

// Time of day label
export const getTimeLabel = (time) => {
  const labels = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
  };
  return labels[time] || time;
};

// Budget label
export const getBudgetLabel = (budget) => {
  const labels = {
    budget: 'Budget',
    comfort: 'Comfort',
    luxury: 'Luxury',
  };
  return labels[budget] || budget;
};

// Budget description
export const getBudgetDescription = (budget) => {
  const descriptions = {
    budget: '₹2,000-5,000/day',
    comfort: '₹5,000-15,000/day',
    luxury: '₹15,000+/day',
  };
  return descriptions[budget] || '';
};

// Travel type label
export const getTravelTypeLabel = (type) => {
  const labels = {
    solo: 'Solo',
    couple: 'Couple',
    family: 'Family',
    group: 'Group',
  };
  return labels[type] || type;
};

// Trip status label and color
export const getTripStatus = (status) => {
  const statuses = {
    planning: { label: 'Planning', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    upcoming: { label: 'Upcoming', color: 'text-green-500', bg: 'bg-green-500/10' },
    completed: { label: 'Completed', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  };
  return statuses[status] || { label: status, color: 'text-gray-400', bg: 'bg-gray-500/10' };
};

// Category icon mapping
export const getCategoryIcon = (category) => {
  const icons = {
    sightseeing: 'Camera',
    food: 'Utensils',
    adventure: 'Mountain',
    culture: 'Landmark',
    shopping: 'ShoppingBag',
    relaxation: 'Coffee',
    transport: 'Car',
    other: 'MapPin',
  };
  return icons[category] || 'MapPin';
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Format relative time
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const d = typeof date === 'string' ? parseISO(date) : date;
  const diffInHours = (now - d) / (1000 * 60 * 60);
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
  if (diffInHours < 48) return 'Yesterday';
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
  return format(d, 'MMM d');
};

// Create Unsplash URL
export const getUnsplashUrl = (photoId, width = 800) => {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&q=80`;
};

// Debounce function
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
