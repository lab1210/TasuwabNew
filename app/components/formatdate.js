const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    // If it's already a Date object
    if (dateString instanceof Date) {
      return dateString.toLocaleString();
    }
    // If it's a string that can be parsed to Date
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
  } catch {
    return "N/A";
  }
};

export default formatDate;
