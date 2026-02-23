"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Alert,
  useTheme,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Sidebar from "@/components/dashboard/Sidebar";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const drawerWidth = 260;
const COLORS = ['#2e7d32', '#1976d2', '#f57c00', '#d32f2f', '#7b1fa2', '#00897b', '#c62828', '#5e35b1'];

export default function ReportsPage() {
  const router = useRouter();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("pos_user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reports');
      }
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pos_user");
    router.push("/login");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleExportReport = () => {
    if (!reportData) return;
    
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${startDate}-to-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = () => {
    if (!reportData) return '';
    
    let csv = 'Sales Report\n';
    csv += `Date Range: ${startDate} to ${endDate}\n\n`;
    csv += 'Summary\n';
    csv += `Total Revenue,${reportData.summary.totalRevenue}\n`;
    csv += `Total Orders,${reportData.summary.totalOrders}\n`;
    csv += `Paid Orders,${reportData.summary.paidOrders}\n`;
    csv += `Average Order Value,${reportData.summary.avgOrderValue}\n\n`;
    csv += 'Sales by Item\n';
    csv += 'Item Name,Quantity Sold,Unit Price,Total Sales\n';
    reportData.salesByItem.forEach(item => {
      csv += `${item.itemName},${item.quantitySold},${item.unitPrice},${item.totalSales}\n`;
    });
    return csv;
  };

  if (!user) return null;

  if (loading) {
    return (
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar user={user} onLogout={handleLogout} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: { md: `calc(100% - ${drawerWidth}px)` },
            bgcolor: "background.default",
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar user={user} onLogout={handleLogout} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          width: { md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "1800px", width: "100%" }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Sales Reports & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Comprehensive business insights and performance metrics
            </Typography>
          </Box>

          {/* Date Range Filter */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: 1, borderColor: "divider", borderRadius: 2 }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <CalendarTodayIcon sx={{ color: "text.secondary" }} />
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ minWidth: 180 }}
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                sx={{ minWidth: 180 }}
              />
              <Button 
                variant="contained" 
                onClick={fetchReports}
                sx={{
                  px: 2.5,
                  py: 1,
                  fontSize: '0.875rem',
                  bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : '#000',
                  color: theme.palette.mode === 'dark' ? '#000' : '#fff',
                  "&:hover": { 
                    bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : '#1a1a1a'
                  }
                }}
              >
                Generate Report
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportReport}
                disabled={!reportData}
                sx={{
                  px: 2.5,
                  py: 1,
                  fontSize: '0.875rem',
                  borderColor: 'divider',
                  color: 'text.primary',
                  "&:hover": { 
                    borderColor: theme.palette.mode === 'dark' ? 'primary.main' : '#000',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(0,0,0,0.04)'
                  }
                }}
              >
                Export CSV
              </Button>
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {reportData && (
            <>
              {/* Summary Cards */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
                <Box sx={{ flex: "1 1 180px", minWidth: "160px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: "success.main",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(102, 187, 106, 0.1)' : '#f1f8f4',
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "success.dark",
                        boxShadow: "0 2px 8px rgba(46,125,50,0.15)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                        Total Revenue
                      </Typography>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main" }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {formatCurrency(reportData.summary.totalRevenue)}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 200px", minWidth: "180px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: "primary.main",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.1)' : '#e3f2fd',
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "primary.dark",
                        boxShadow: "0 2px 8px rgba(25,118,210,0.15)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                        Total Orders
                      </Typography>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main" }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      {reportData.summary.totalOrders}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 200px", minWidth: "180px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      height: "100%",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: theme.palette.mode === 'dark' ? 'primary.main' : '#000',
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                        Avg Order Value
                      </Typography>
                      <TrendingUpIcon sx={{ fontSize: '1rem', color: "success.main" }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700}>
                      {formatCurrency(reportData.summary.avgOrderValue)}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 200px", minWidth: "180px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: "error.main",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : '#fef5f5',
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "error.dark",
                        boxShadow: "0 2px 8px rgba(211,47,47,0.15)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                        Unpaid Amount
                      </Typography>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "error.main" }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="error.main">
                      {formatCurrency(reportData.statusBreakdown.unpaidAmount)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>

              {/* Charts Section */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
                {/* Daily Sales Chart */}
                <Box sx={{ flex: "1 1 450px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: "divider", borderRadius: 2, height: "100%" }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                      Daily Revenue Trend
                    </Typography>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={reportData.dailySales}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{ borderRadius: 8, border: "1px solid #e0e0e0", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#2e7d32" strokeWidth={2} dot={{ r: 4, fill: "#2e7d32" }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Box>

                {/* Daily Orders Chart */}
                <Box sx={{ flex: "1 1 450px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: "divider", borderRadius: 2, height: "100%" }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                      Daily Orders Volume
                    </Typography>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={reportData.dailySales}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ borderRadius: 8, border: "1px solid #e0e0e0", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                        />
                        <Bar dataKey="orders" fill="#1976d2" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Box>
              </Box>

              {/* Top Items Chart */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
                <Box sx={{ flex: "1 1 450px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                      Top 8 Items by Revenue
                    </Typography>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart data={reportData.salesByItem.slice(0, 8)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="itemName" type="category" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{ borderRadius: 8, border: "1px solid #e0e0e0" }}
                        />
                        <Bar dataKey="totalSales" fill="#f57c00" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 350px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                      Sales by Waiter
                    </Typography>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={reportData.salesByWaiter.slice(0, 8)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.waiter}: ${formatCurrency(entry.totalSales)}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="totalSales"
                        >
                          {reportData.salesByWaiter.slice(0, 8).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Box>
              </Box>

              {/* Tables Section */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
                {/* Sales by Item Table */}
                <Box sx={{ flex: "1 1 100%", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafafa' }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Sales by Item
                      </Typography>
                    </Box>
                    <TableContainer sx={{ maxHeight: 350 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fafafa' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Item Name</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Quantity Sold</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Unit Price</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Sales</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.salesByItem.length > 0 ? (
                            reportData.salesByItem.map((item, index) => (
                              <TableRow key={index} hover sx={{ "&:hover": { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)' } }}>
                                <TableCell sx={{ py: 1.5 }}>
                                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                                    {item.itemName}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 1.5 }}>
                                  <Chip 
                                    label={item.quantitySold} 
                                    size="small" 
                                    sx={{ fontWeight: 600, fontSize: '0.7rem', height: 24, bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.2)' : '#e3f2fd', color: "primary.main" }} 
                                  />
                                </TableCell>
                                <TableCell align="right" sx={{ py: 1.5 }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                    {formatCurrency(item.unitPrice)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 1.5 }}>
                                  <Typography variant="body2" fontWeight={700} color="success.main" sx={{ fontSize: '0.875rem' }}>
                                    {formatCurrency(item.totalSales)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">No sales data available</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Box>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {/* Sales by Waiter Table */}
                <Box sx={{ flex: "1 1 500px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafafa' }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Performance by Waiter
                      </Typography>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fafafa' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Waiter</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Orders</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Sales</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.salesByWaiter.length > 0 ? (
                            reportData.salesByWaiter.map((waiter, index) => (
                              <TableRow key={index} hover sx={{ "&:hover": { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)' } }}>
                                <TableCell sx={{ py: 1.5 }}>
                                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                                    {waiter.waiter}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 1.5 }}>
                                  <Chip 
                                    label={waiter.orderCount} 
                                    size="small" 
                                    sx={{ fontWeight: 600, fontSize: '0.7rem', height: 24 }} 
                                  />
                                </TableCell>
                                <TableCell align="right" sx={{ py: 1.5 }}>
                                  <Typography variant="body2" fontWeight={700} color="success.main" sx={{ fontSize: '0.875rem' }}>
                                    {formatCurrency(waiter.totalSales)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">No waiter data available</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Box>

                {/* Top Customers Table */}
                <Box sx={{ flex: "1 1 500px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                    <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafafa' }}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        Top Customers
                      </Typography>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fafafa' }}>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Customer</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Orders</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Spent</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reportData.topCustomers.length > 0 ? (
                            reportData.topCustomers.map((customer, index) => (
                              <TableRow key={index} hover sx={{ "&:hover": { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)' } }}>
                                <TableCell sx={{ py: 1.5 }}>
                                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                                    {customer.customerName}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ py: 1.5 }}>
                                  <Chip 
                                    label={customer.orderCount} 
                                    size="small" 
                                    sx={{ fontWeight: 600, fontSize: '0.7rem', height: 24 }} 
                                  />
                                </TableCell>
                                <TableCell align="right" sx={{ py: 1.5 }}>
                                  <Typography variant="body2" fontWeight={700} color="success.main" sx={{ fontSize: '0.875rem' }}>
                                    {formatCurrency(customer.totalSpent)}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">No customer data available</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
