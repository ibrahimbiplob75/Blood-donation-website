export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateDaysSinceLastDonation = (lastDonationDate) => {
  const today = new Date();
  const lastDonation = new Date(lastDonationDate);
  const diffTime = Math.abs(today - lastDonation);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isDonorEligible = (lastDonationDate) => {
  const daysSince = calculateDaysSinceLastDonation(lastDonationDate);
  return daysSince >= 90; // 90 days minimum between donations
};

export const getUrgencyColor = (urgency) => {
  const colors = {
    normal: 'green',
    urgent: 'orange',
    emergency: 'red'
  };
  return colors[urgency] || 'gray';
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
