/**
 * Export array of data objects to CSV and trigger browser download
 * Adheres to RFC 4180 standard for comma-separated values.
 */

export const generateCsvContent = (columns, data) => {
  if (!data || data.length === 0) {
    return '';
  }

  const escapeCell = (value) => {
    if (value === null || value === undefined) {
      return '""';
    }
    const stringVal = String(value);
    // If string contains comma, quote, or newline, escape quotes and wrap in quotes
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n') || stringVal.includes('\r')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return `"${stringVal}"`;
  };

  const headers = columns.map((col) => escapeCell(col.header)).join(',');
  const rows = data.map((item) =>
    columns
      .map((col) => {
        let val;
        if (typeof col.getValue === 'function') {
          val = col.getValue(item);
        } else {
          val = item[col.key];
        }
        return escapeCell(val);
      })
      .join(',')
  );

  // UTF-8 BOM prefix (\uFEFF) ensures Excel opens Unicode characters correctly
  return '\uFEFF' + [headers, ...rows].join('\r\n');
};

export const exportToCsv = (filename, columns, data) => {
  if (!data || data.length === 0) {
    return false;
  }

  const csvContent = generateCsvContent(columns, data);

  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return true;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
};

