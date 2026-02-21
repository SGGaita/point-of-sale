import { database } from '../database';

export const excelImportService = {
  /**
   * Process imported Excel data and create orders
   * Expected format: {
   *   'Order Number': string,
   *   'Waiter': string,
   *   'Customer Name': string,
   *   'Date': string,
   *   'Time': string,
   *   'Status': string (paid/unpaid),
   *   'Total': number,
   *   'Items': string (comma-separated: "Item1 (Size) x2, Item2 (Size) x1")
   * }
   */
  async processImportedData(excelData) {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    const ordersCollection = database.collections.get('orders');

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];
      const rowNumber = i + 2; // Excel row number (assuming header in row 1)

      try {
        // Validate required fields
        const validation = this.validateRow(row, rowNumber);
        if (!validation.valid) {
          results.failed++;
          results.errors.push(validation.error);
          continue;
        }

        // Parse items
        const items = this.parseItems(row['Items']);
        if (items.length === 0) {
          results.failed++;
          results.errors.push(`Row ${rowNumber}: No valid items found`);
          continue;
        }

        // Parse date and time
        const timestamp = this.parseDateTime(row['Date'], row['Time']);

        // Create order in database
        await database.write(async () => {
          await ordersCollection.create(order => {
            order.orderNumber = String(row['Order Number']).trim();
            order.waiter = String(row['Waiter']).trim();
            order.customerName = row['Customer Name'] ? String(row['Customer Name']).trim() : '';
            order.items = items;
            order.total = parseFloat(row['Total']);
            order.status = String(row['Status']).toLowerCase().trim() === 'paid' ? 'paid' : 'unpaid';
            order.timestamp = timestamp;
            order.isSynced = false;
            order.syncedAt = null;
          });
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    }

    return results;
  },

  validateRow(row, rowNumber) {
    const requiredFields = ['Order Number', 'Waiter', 'Date', 'Time', 'Status', 'Total', 'Items'];
    
    for (const field of requiredFields) {
      if (!row[field] || String(row[field]).trim() === '') {
        return {
          valid: false,
          error: `Row ${rowNumber}: Missing required field '${field}'`,
        };
      }
    }

    // Validate status
    const status = String(row['Status']).toLowerCase().trim();
    if (status !== 'paid' && status !== 'unpaid') {
      return {
        valid: false,
        error: `Row ${rowNumber}: Status must be 'paid' or 'unpaid', got '${row['Status']}'`,
      };
    }

    // Validate total
    const total = parseFloat(row['Total']);
    if (isNaN(total) || total < 0) {
      return {
        valid: false,
        error: `Row ${rowNumber}: Invalid total amount '${row['Total']}'`,
      };
    }

    return { valid: true };
  },

  parseItems(itemsString) {
    // Expected format: "Ugali Fry (Small) x2, Beef Stew (Large) x1"
    const items = [];
    
    if (!itemsString) return items;

    const itemParts = String(itemsString).split(',');
    
    for (const part of itemParts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      // Match pattern: "Name (Size) xQuantity" or "Name (Size) x Quantity"
      const match = trimmed.match(/^(.+?)\s*\((.+?)\)\s*x\s*(\d+)$/i);
      
      if (match) {
        const [, name, size, quantity] = match;
        items.push({
          name: name.trim(),
          size: size.trim(),
          quantity: parseInt(quantity, 10),
          price: 0, // Price will need to be looked up or provided separately
        });
      } else {
        // Try simpler format: "Name xQuantity"
        const simpleMatch = trimmed.match(/^(.+?)\s*x\s*(\d+)$/i);
        if (simpleMatch) {
          const [, name, quantity] = simpleMatch;
          items.push({
            name: name.trim(),
            size: 'Regular',
            quantity: parseInt(quantity, 10),
            price: 0,
          });
        }
      }
    }

    return items;
  },

  parseDateTime(dateString, timeString) {
    try {
      // Try to parse various date formats
      let date;
      
      // Check if it's an Excel serial date number
      if (typeof dateString === 'number') {
        // Excel date serial number (days since 1900-01-01)
        date = new Date((dateString - 25569) * 86400 * 1000);
      } else {
        // Try parsing as string
        date = new Date(dateString);
      }

      // Parse time if provided
      if (timeString) {
        let timeStr = String(timeString);
        
        // If time is Excel serial (fraction of day)
        if (typeof timeString === 'number' && timeString < 1) {
          const totalSeconds = timeString * 86400;
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        // Parse time string (HH:MM or HH:MM:SS)
        const timeParts = timeStr.split(':');
        if (timeParts.length >= 2) {
          date.setHours(parseInt(timeParts[0], 10));
          date.setMinutes(parseInt(timeParts[1], 10));
          if (timeParts.length >= 3) {
            date.setSeconds(parseInt(timeParts[2], 10));
          }
        }
      }

      return date.getTime();
    } catch (error) {
      // If parsing fails, use current timestamp
      return Date.now();
    }
  },
};
