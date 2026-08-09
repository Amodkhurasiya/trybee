// INR currency formatter
export const formatINR = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '₹0';
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(value));
  } catch (e) {
    return `₹${value}`;
  }
};

export default formatINR;
