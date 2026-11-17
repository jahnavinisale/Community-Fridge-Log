import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCsv, generateCsvContent } from './exportCsv.js';

describe('exportCsv utility', () => {
  it('returns empty string when data is null or empty', () => {
    expect(generateCsvContent([], [])).toBe('');
    expect(generateCsvContent([], null)).toBe('');
    expect(exportToCsv('test.csv', [], [])).toBe(false);
  });

  it('generates formatted CSV with BOM and headers', () => {
    const columns = [
      { header: 'Item Name', key: 'name' },
      { header: 'Quantity', key: 'quantity' },
    ];
    const data = [
      { name: 'Apples', quantity: 5 },
      { name: 'Milk', quantity: 2 },
    ];

    const csv = generateCsvContent(columns, data);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"Item Name","Quantity"');
    expect(csv).toContain('"Apples","5"');
    expect(csv).toContain('"Milk","2"');
  });

  it('properly escapes quotes, commas, and newlines', () => {
    const columns = [
      { header: 'Description', key: 'desc' },
      { header: 'Note', getValue: (row) => row.customNote },
    ];
    const data = [
      { desc: 'Milk, "Organic"', customNote: 'Keep chilled\nHandle with care' },
    ];

    const csv = generateCsvContent(columns, data);
    expect(csv).toContain('"Milk, ""Organic"""');
    expect(csv).toContain('"Keep chilled\nHandle with care"');
  });

  it('executes browser download flow when document is available', () => {
    const mockElement = {
      setAttribute: vi.fn(),
      style: {},
      click: vi.fn(),
    };

    global.document = {
      createElement: vi.fn(() => mockElement),
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
    };
    global.window = {};
    global.URL = {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    };

    const columns = [{ header: 'Name', key: 'name' }];
    const data = [{ name: 'Bread' }];

    const result = exportToCsv('bread.csv', columns, data);
    expect(result).toBe(true);
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockElement.setAttribute).toHaveBeenCalledWith('download', 'bread.csv');
    expect(mockElement.click).toHaveBeenCalled();

    delete global.document;
    delete global.window;
  });
});
