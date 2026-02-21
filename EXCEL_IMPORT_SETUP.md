# Excel Import Setup Guide

## Required Dependencies

To enable Excel import functionality, you need to install the following packages:

```bash
npm install react-native-document-picker xlsx react-native-fs
```

## Platform-Specific Setup

### iOS
```bash
cd ios && pod install && cd ..
```

### Android
No additional setup required after npm install.

## Usage

### Excel File Format

The Excel file should have the following columns (in any order):

| Order Number | Waiter | Customer Name | Date | Time | Status | Total | Items |
|--------------|--------|---------------|------|------|--------|-------|-------|
| ORD001 | Noorah | John Doe | 2026-01-30 | 14:30 | paid | 1500 | Ugali Fry (Small) x2, Beef Stew (Large) x1 |
| ORD002 | Valary | Jane Smith | 2026-01-30 | 15:00 | unpaid | 800 | Chapati (Medium) x3 |

### Field Descriptions

- **Order Number**: Unique identifier for the order (required)
- **Waiter**: Name of the waiter (required, must match existing waiter in system)
- **Customer Name**: Name of the customer (optional)
- **Date**: Order date in format YYYY-MM-DD or Excel date (required)
- **Time**: Order time in format HH:MM or Excel time (required)
- **Status**: Either "paid" or "unpaid" (required)
- **Total**: Total order amount in Ksh (required)
- **Items**: Comma-separated list of items in format "Name (Size) xQuantity" (required)

### Items Format Examples

```
Ugali Fry (Small) x2, Beef Stew (Large) x1, Chapati (Medium) x3
Rice (Large) x1, Chicken (Small) x2
Tea x1, Mandazi x5
```

## Implementation Code

### Update OrdersView.js

Replace the placeholder import function with:

```javascript
import DocumentPicker from 'react-native-document-picker';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import {excelImportService} from '../services/excelImportService';

const handleImportFromExcel = async () => {
  try {
    // Pick Excel file
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
    });

    // Read file
    const fileContent = await RNFS.readFile(result[0].uri, 'base64');
    
    // Parse Excel
    const workbook = XLSX.read(fileContent, {type: 'base64'});
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      Alert.alert('Error', 'The Excel file is empty');
      return;
    }

    // Show loading
    Alert.alert('Importing', 'Processing orders...');

    // Process imported data
    const results = await excelImportService.processImportedData(data);

    // Show results
    let message = `Successfully imported: ${results.success} orders\n`;
    if (results.failed > 0) {
      message += `Failed: ${results.failed} orders\n\n`;
      if (results.errors.length > 0) {
        message += 'Errors:\n' + results.errors.slice(0, 5).join('\n');
        if (results.errors.length > 5) {
          message += `\n... and ${results.errors.length - 5} more errors`;
        }
      }
    }

    Alert.alert(
      results.failed > 0 ? 'Import Completed with Errors' : 'Import Successful',
      message,
      [{text: 'OK'}]
    );

  } catch (error) {
    if (error.code !== 'DOCUMENT_PICKER_CANCELED') {
      Alert.alert('Error', 'Failed to import file: ' + error.message);
    }
  }
};
```

## Sample Excel Template

A sample Excel template is available in the project root: `ORDER_IMPORT_TEMPLATE.xlsx`

You can create this template with the column headers and a few sample rows to help users understand the format.

## Notes

- The import will validate all data before creating orders
- Invalid rows will be skipped and reported in the results
- Order numbers should be unique
- Waiter names should match existing waiters in the system
- Items format is flexible but should follow the pattern shown above
- Dates and times can be in Excel format or text format
