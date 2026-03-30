import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform, Share} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {colors, typography, spacing, borderRadius, shadows} from '../theme/theme';
import {syncService} from '../services/syncService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DocumentPicker from 'react-native-document-picker';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import {excelImportService} from '../services/excelImportService';

const OrdersView = ({orders = [], onMarkPaid, onPrintReceipt, onShowSnackbar}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [lastSyncTime, setLastSyncTime] = useState(null);

  const filters = [
    {id: 'all', label: 'All'},
    {id: 'paid', label: 'Paid'},
    {id: 'unpaid', label: 'Unpaid'},
  ];

  useEffect(() => {
    loadLastSyncTime();
    const interval = setInterval(loadLastSyncTime, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadLastSyncTime = async () => {
    try {
      const syncStatus = await AsyncStorage.getItem('orderSyncStatus');
      if (syncStatus) {
        const status = JSON.parse(syncStatus);
        if (status.lastSyncTimestamp) {
          setLastSyncTime(new Date(status.lastSyncTimestamp));
        }
      }
    } catch (error) {
      console.error('Error loading last sync time:', error);
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never synced';
    
    const now = new Date();
    const diffMs = now - lastSyncTime;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };


  const handleExportSalesData = async () => {
    const todayOrders = getFilteredOrders();
    
    if (todayOrders.length === 0) {
      onShowSnackbar && onShowSnackbar('No orders found for today to export', 'error');
      return;
    }

    try {
      // Calculate totals
      const totalSales = todayOrders.reduce((sum, order) => sum + order.total, 0);
      const paidOrders = todayOrders.filter(order => order.status === 'paid');
      const unpaidOrders = todayOrders.filter(order => order.status === 'unpaid' || order.status === 'pending');
      const paidTotal = paidOrders.reduce((sum, order) => sum + order.total, 0);
      const unpaidTotal = unpaidOrders.reduce((sum, order) => sum + order.total, 0);

      // Prepare Excel data
      const excelData = [];
      
      // Add summary rows
      excelData.push(['SALES DATA EXPORT']);
      excelData.push(['Date:', new Date().toLocaleDateString()]);
      excelData.push(['Time:', new Date().toLocaleTimeString()]);
      excelData.push([]);
      excelData.push(['SUMMARY']);
      excelData.push(['Total Orders:', todayOrders.length]);
      excelData.push(['Paid Orders:', paidOrders.length, `${paidTotal} Ksh`]);
      excelData.push(['Unpaid Orders:', unpaidOrders.length, `${unpaidTotal} Ksh`]);
      excelData.push(['Total Sales:', `${totalSales} Ksh`]);
      excelData.push([]);
      excelData.push([]);
      
      // Add orders header
      excelData.push(['Order Number', 'Waiter', 'Customer Name', 'Status', 'Total', 'Items']);
      
      // Add order rows
      todayOrders.forEach(order => {
        const itemsText = order.items.map(item => 
          `${item.name} x${item.quantity}`
        ).join(', ');
        
        excelData.push([
          order.orderNumber,
          order.waiter,
          order.customerName || '',
          order.status,
          order.total,
          itemsText
        ]);
      });

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      
      // Set column widths
      ws['!cols'] = [
        {wch: 15}, // Order Number
        {wch: 15}, // Waiter
        {wch: 20}, // Customer Name
        {wch: 10}, // Status
        {wch: 10}, // Total
        {wch: 50}, // Items
      ];

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sales Data');

      // Generate Excel file
      const wbout = XLSX.write(wb, {type: 'base64', bookType: 'xlsx'});

      // Create filename with date
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `Sales_Export_${dateStr}.xlsx`;
      
      // Use appropriate directory based on platform
      let downloadPath;
      if (Platform.OS === 'android') {
        // For Android, use external storage Downloads folder
        const downloadDir = RNFS.DownloadDirectoryPath || RNFS.ExternalStorageDirectoryPath + '/Download';
        downloadPath = `${downloadDir}/${filename}`;
      } else {
        // For iOS, use Documents directory
        downloadPath = `${RNFS.DocumentDirectoryPath}/${filename}`;
      }

      console.log('Export path:', downloadPath);
      console.log('File size (base64):', wbout.length);

      // Write file
      await RNFS.writeFile(downloadPath, wbout, 'base64');
      
      // Verify file was written
      const fileExists = await RNFS.exists(downloadPath);
      console.log('File exists after write:', fileExists);
      
      if (!fileExists) {
        throw new Error('File was not created successfully');
      }

      // Get file info
      const fileInfo = await RNFS.stat(downloadPath);
      console.log('File info:', fileInfo);

      // Show success with snackbar
      onShowSnackbar && onShowSnackbar(
        `Sales data exported successfully (${Math.round(fileInfo.size / 1024)}KB)`,
        'success'
      );

      // Optional: Show dialog with share option
      setTimeout(() => {
        Alert.alert(
          'File Downloaded',
          `File: ${filename}\nSize: ${Math.round(fileInfo.size / 1024)}KB\nLocation: ${downloadPath}`,
          [
            {text: 'OK'},
            {text: 'Share', onPress: async () => {
              try {
                await Share.share({
                  title: 'Export Sales Data',
                  message: `Sales data for ${new Date().toLocaleDateString()}`,
                  url: Platform.OS === 'android' ? `file://${downloadPath}` : downloadPath,
                });
              } catch (shareError) {
                console.error('Share error:', shareError);
              }
            }}
          ]
        );
      }, 500);

    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export sales data: ' + error.message);
    }
  };

  const handleImportFromExcel = async () => {
    try {
      // Pick Excel file
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.xlsx, DocumentPicker.types.xls],
      });

      // Show loading
      Alert.alert('Processing', 'Reading Excel file...');

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
        console.error('Import error:', error);
        Alert.alert('Error', 'Failed to import file: ' + error.message);
      }
    }
  };


  const getFilteredOrders = () => {
    let filtered = orders;

    // Filter by current date (only show today's orders)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    filtered = filtered.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= today && orderDate < tomorrow;
    });

    // Filter by status
    if (activeFilter === 'paid') {
      filtered = filtered.filter(order => order.status === 'paid');
    } else if (activeFilter === 'unpaid') {
      // Treat both 'unpaid' and 'pending' as unpaid
      filtered = filtered.filter(order => order.status === 'unpaid' || order.status === 'pending');
    }

    // Filter by search query (waiter name or order number)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.waiter.toLowerCase().includes(query) ||
        order.orderNumber.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'pending':
      case 'unpaid':
        return colors.danger; // Red for both pending and unpaid
      case 'paid':
        return colors.success; // Green
      default:
        return colors.placeholder; // Gray
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'pending':
      case 'unpaid':
        return colors.danger; // Red for both pending and unpaid
      case 'paid':
        return colors.success; // Green
      default:
        return colors.info; // Blue
    }
  };

  const renderActionButtons = (order) => {
    if (order.status === 'paid') {
      return (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.printButton, styles.fullWidthButton]}
            onPress={() => onPrintReceipt && onPrintReceipt(order)}
          >
            <Icon name="print" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Print Receipt</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (order.status === 'unpaid' || order.status === 'pending') {
      // Both unpaid and pending orders show the same action buttons
      return (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.markPaidButton]}
            onPress={() => onMarkPaid && onMarkPaid(order.id)}
          >
            <Icon name="check-circle" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Mark Paid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.printButton]}
            onPress={() => onPrintReceipt && onPrintReceipt(order)}
          >
            <Icon name="print" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Print Receipt</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.mainScrollView} contentContainerStyle={styles.mainScrollContent}>
        {/* Search and Filter Section */}
        <View style={styles.searchFilterCard}>
          {/* Search Field */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#95A5A6" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search orders by waiter, order number"
              placeholderTextColor="#95A5A6"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Buttons */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filterScrollView}
          >
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  activeFilter === filter.id && styles.activeFilterButton,
                ]}
                onPress={() => setActiveFilter(filter.id)}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    activeFilter === filter.id && styles.activeFilterButtonText,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Export Button */}
        <TouchableOpacity
          style={styles.exportButton}
          onPress={handleExportSalesData}
        >
          <Icon name="file-download" size={20} color={colors.white} />
          <Text style={styles.exportButtonText}>Export Sales Data</Text>
        </TouchableOpacity>

        {/* Last Synced Indicator */}
        <View style={styles.syncStatusContainer}>
          <Icon name="cloud-done" size={18} color={colors.success} />
          <Text style={styles.syncStatusText}>Last synced: {formatLastSync()}</Text>
        </View>

        {/* Orders List */}
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>Orders will appear here once created</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
        <View key={order.id} style={[
          styles.orderCard,
          {borderLeftWidth: 5, borderLeftColor: getStatusBorderColor(order.status)}
        ]}>
          <View style={styles.orderHeader}>
            <View style={styles.orderHeaderLeft}>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <View style={[
                styles.syncBadge,
                order.is_synced ? styles.syncBadgeSynced : styles.syncBadgeNotSynced
              ]}>
                <Icon 
                  name={order.is_synced ? "cloud-done" : "cloud-off"} 
                  size={12} 
                  color={order.is_synced ? colors.success : colors.warning} 
                />
                <Text style={[
                  styles.syncBadgeText,
                  order.is_synced ? styles.syncBadgeTextSynced : styles.syncBadgeTextNotSynced
                ]}>
                  {order.is_synced ? 'Synced' : 'Not Synced'}
                </Text>
              </View>
            </View>
            <Text style={[styles.orderStatus, {color: getStatusTextColor(order.status)}]}>
              {order.status === 'paid' ? 'Paid' : 'Unpaid'}
            </Text>
          </View>
          
          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Waiter/Waitress:</Text>
            <Text style={styles.orderValue}>{order.waiter}</Text>
          </View>

          {order.customerName && (
            <View style={styles.orderInfo}>
              <Text style={styles.orderLabel}>Customer:</Text>
              <Text style={styles.orderValue}>{order.customerName}</Text>
            </View>
          )}

          <View style={styles.orderInfo}>
            <Text style={styles.orderLabel}>Time:</Text>
            <Text style={styles.orderValue}>
              {new Date(order.timestamp).toLocaleTimeString()}
            </Text>
          </View>

          <View style={styles.itemsSection}>
            <Text style={styles.itemsTitle}>Items:</Text>
            {order.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={styles.itemName}>
                  {item.name} x{item.quantity}
                </Text>
                <Text style={styles.itemPrice}>{item.totalPrice} Ksh</Text>
              </View>
            ))}
          </View>

          <View style={styles.orderTotal}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{order.total} Ksh</Text>
          </View>

          {renderActionButtons(order)}
        </View>
      ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    paddingBottom: 16,
  },
  searchFilterCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 0,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.inputBackground,
    marginRight: 8,
  },
  activeFilterButton: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeFilterButtonText: {
    color: colors.white,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  exportButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  syncStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    gap: 8,
  },
  syncStatusText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  syncBadgeSynced: {
    backgroundColor: '#E8F5E9',
  },
  syncBadgeNotSynced: {
    backgroundColor: '#FFF3E0',
  },
  syncBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  syncBadgeTextSynced: {
    color: colors.success,
  },
  syncBadgeTextNotSynced: {
    color: colors.warning,
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  orderInfo: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  orderLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    marginRight: 8,
  },
  orderValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  itemsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  itemPrice: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  orderTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  markPaidButton: {
    backgroundColor: colors.success,
  },
  printButton: {
    backgroundColor: colors.primary,
  },
  fullWidthButton: {
    flex: 1,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default OrdersView;
