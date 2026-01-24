"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  CircularProgress,
  Divider,
  Chip,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ReceiptIcon from "@mui/icons-material/Receipt";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AssessmentIcon from "@mui/icons-material/Assessment";
import DownloadIcon from "@mui/icons-material/Download";
import Sidebar from "@/components/dashboard/Sidebar";

const drawerWidth = 260;

export default function ReportsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [salesReport, setSalesReport] = useState(null);
  const [deliveryReport, setDeliveryReport] = useState(null);
  const [stockReport, setStockReport] = useState(null);
  const [expenseReport, setExpenseReport] = useState(null);
  const [profitabilityReport, setProfitabilityReport] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const userData = localStorage.getItem("pos_user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchReports();
  }, [router, mounted]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSalesReport(),
        fetchDeliveryReport(),
        fetchStockReport(),
        fetchExpenseReport(),
        fetchProfitabilityReport(),
      ]);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReport = async () => {
    try {
      const response = await fetch(`/api/reports/sales?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      if (response.ok) {
        setSalesReport(data);
      }
    } catch (error) {
      console.error("Error fetching sales report:", error);
      setSalesReport({
        salesByItem: [],
        salesByType: { DINE_IN: 0, TAKEAWAY: 0, DELIVERY: 0 },
        totalSales: 0,
      });
    }
  };

  const fetchDeliveryReport = async () => {
    try {
      const response = await fetch(`/api/reports/delivery?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      if (response.ok) {
        setDeliveryReport(data);
      }
    } catch (error) {
      console.error("Error fetching delivery report:", error);
      setDeliveryReport({
        totalDeliveries: 0,
        salesByStaff: [],
        totalDeliveryFees: 0,
      });
    }
  };

  const fetchStockReport = async () => {
    try {
      const response = await fetch(`/api/reports/stock?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      if (response.ok) {
        setStockReport(data);
      }
    } catch (error) {
      console.error("Error fetching stock report:", error);
      setStockReport({
        items: [],
        totalOpeningStock: 0,
        totalStockUsed: 0,
        totalClosingStock: 0,
      });
    }
  };

  const fetchExpenseReport = async () => {
    try {
      const response = await fetch(`/api/reports/expenses?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      if (response.ok) {
        setExpenseReport(data);
      }
    } catch (error) {
      console.error("Error fetching expense report:", error);
      setExpenseReport({
        expenses: [],
        totalExpenses: 0,
      });
    }
  };

  const fetchProfitabilityReport = async () => {
    try {
      const response = await fetch(`/api/reports/profitability?startDate=${startDate}&endDate=${endDate}`);
      const data = await response.json();
      if (response.ok) {
        setProfitabilityReport(data);
      }
    } catch (error) {
      console.error("Error fetching profitability report:", error);
      setProfitabilityReport({
        totalRevenue: 0,
        totalExpenses: 0,
        profit: 0,
        profitMargin: 0,
        dailySales: 0,
        morningSupplies: 0,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pos_user");
    router.push("/login");
  };

  const formatCurrency = (amount) => {
    return `KSh ${parseFloat(amount || 0).toFixed(2)}`;
  };

  const handleExportReport = () => {
    alert("Export functionality will be implemented with PDF generation");
  };

  if (!mounted || !user) return null;

  const reportTabs = [
    { label: "Sales Report", icon: <ReceiptIcon /> },
    { label: "Delivery Report", icon: <LocalShippingIcon /> },
    { label: "Stock Report", icon: <InventoryIcon /> },
    { label: "Expense Report", icon: <AttachMoneyIcon /> },
    { label: "Profitability", icon: <AssessmentIcon /> },
  ];

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
          bgcolor: "#fafafa",
        }}
      >
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1600px", width: "100%" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Reports & Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View detailed business reports and insights
            </Typography>
          </Box>

          <Paper elevation={0} sx={{ p: 3, mb: 3, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <TextField
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <TextField
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
              <Button variant="contained" onClick={fetchReports}>
                Generate Reports
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportReport}
              >
                Export
              </Button>
            </Box>
          </Paper>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
              {reportTabs.map((tab, index) => (
                <Tab key={index} label={tab.label} icon={tab.icon} iconPosition="start" />
              ))}
            </Tabs>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {activeTab === 0 && salesReport && (
                <Box>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Total Sales
                          </Typography>
                          <Typography variant="h4" fontWeight={700}>
                            {formatCurrency(salesReport.totalSales)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Dine-In Sales
                          </Typography>
                          <Typography variant="h5" fontWeight={600}>
                            {formatCurrency(salesReport.salesByType?.DINE_IN || 0)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Takeaway Sales
                          </Typography>
                          <Typography variant="h5" fontWeight={600}>
                            {formatCurrency(salesReport.salesByType?.TAKEAWAY || 0)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Delivery Sales
                          </Typography>
                          <Typography variant="h5" fontWeight={600}>
                            {formatCurrency(salesReport.salesByType?.DELIVERY || 0)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                      <Typography variant="h6" fontWeight={600}>
                        Sales by Item
                      </Typography>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                          <TableRow>
                            <TableCell><strong>Item Name</strong></TableCell>
                            <TableCell align="right"><strong>Quantity Sold</strong></TableCell>
                            <TableCell align="right"><strong>Unit Price</strong></TableCell>
                            <TableCell align="right"><strong>Total Sales</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {salesReport.salesByItem?.length > 0 ? (
                            salesReport.salesByItem.map((item, index) => (
                              <TableRow key={index} hover>
                                <TableCell>{item.itemName}</TableCell>
                                <TableCell align="right">{item.quantitySold}</TableCell>
                                <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                                <TableCell align="right">
                                  <Typography fontWeight={600}>
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
              )}

              {activeTab === 1 && deliveryReport && (
                <Box>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Total Deliveries
                          </Typography>
                          <Typography variant="h4" fontWeight={700}>
                            {deliveryReport.totalDeliveries || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Delivery Fees Collected
                          </Typography>
                          <Typography variant="h5" fontWeight={600}>
                            {formatCurrency(deliveryReport.totalDeliveryFees)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Average Delivery Value
                          </Typography>
                          <Typography variant="h5" fontWeight={600}>
                            {formatCurrency(
                              deliveryReport.totalDeliveries > 0
                                ? deliveryReport.totalDeliveryFees / deliveryReport.totalDeliveries
                                : 0
                            )}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                      <Typography variant="h6" fontWeight={600}>
                        Sales by Staff Member
                      </Typography>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                          <TableRow>
                            <TableCell><strong>Staff Name</strong></TableCell>
                            <TableCell align="right"><strong>Deliveries Handled</strong></TableCell>
                            <TableCell align="right"><strong>Total Sales</strong></TableCell>
                            <TableCell align="right"><strong>Delivery Fees</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {deliveryReport.salesByStaff?.length > 0 ? (
                            deliveryReport.salesByStaff.map((staff, index) => (
                              <TableRow key={index} hover>
                                <TableCell>{staff.staffName}</TableCell>
                                <TableCell align="right">{staff.deliveryCount}</TableCell>
                                <TableCell align="right">{formatCurrency(staff.totalSales)}</TableCell>
                                <TableCell align="right">{formatCurrency(staff.deliveryFees)}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">No delivery data available</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Box>
              )}

              {activeTab === 2 && stockReport && (
                <Box>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Total Opening Stock Value
                          </Typography>
                          <Typography variant="h5" fontWeight={600}>
                            {formatCurrency(stockReport.totalOpeningStock)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Total Stock Used Value
                          </Typography>
                          <Typography variant="h5" fontWeight={600}>
                            {formatCurrency(stockReport.totalStockUsed)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Total Closing Stock Value
                          </Typography>
                          <Typography variant="h5" fontWeight={600}>
                            {formatCurrency(stockReport.totalClosingStock)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                      <Typography variant="h6" fontWeight={600}>
                        Stock Movement by Item
                      </Typography>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                          <TableRow>
                            <TableCell><strong>Item Name</strong></TableCell>
                            <TableCell align="right"><strong>Opening Stock</strong></TableCell>
                            <TableCell align="right"><strong>Stock Used</strong></TableCell>
                            <TableCell align="right"><strong>Closing Stock</strong></TableCell>
                            <TableCell align="right"><strong>Unit</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {stockReport.items?.length > 0 ? (
                            stockReport.items.map((item, index) => (
                              <TableRow key={index} hover>
                                <TableCell>{item.itemName}</TableCell>
                                <TableCell align="right">{item.openingStock}</TableCell>
                                <TableCell align="right">{item.stockUsed}</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={item.closingStock}
                                    size="small"
                                    color={item.closingStock < 10 ? "error" : "default"}
                                  />
                                </TableCell>
                                <TableCell align="right">{item.unit}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">No stock data available</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Box>
              )}

              {activeTab === 3 && expenseReport && (
                <Box>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Total Expenses
                          </Typography>
                          <Typography variant="h4" fontWeight={700} color="error.main">
                            {formatCurrency(expenseReport.totalExpenses)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Number of Expenses
                          </Typography>
                          <Typography variant="h4" fontWeight={700}>
                            {expenseReport.expenses?.length || 0}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                      <Typography variant="h6" fontWeight={600}>
                        Daily Expenses
                      </Typography>
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                          <TableRow>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Category</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell align="right"><strong>Amount</strong></TableCell>
                            <TableCell><strong>Recorded By</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {expenseReport.expenses?.length > 0 ? (
                            expenseReport.expenses.map((expense, index) => (
                              <TableRow key={index} hover>
                                <TableCell>
                                  {new Date(expense.expenseDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Chip label={expense.category} size="small" />
                                </TableCell>
                                <TableCell>{expense.description}</TableCell>
                                <TableCell align="right">
                                  <Typography fontWeight={600} color="error.main">
                                    {formatCurrency(expense.amount)}
                                  </Typography>
                                </TableCell>
                                <TableCell>{expense.recordedBy}</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                <Typography color="text.secondary">No expenses recorded</Typography>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Box>
              )}

              {activeTab === 4 && profitabilityReport && (
                <Box>
                  <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={3}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Total Revenue
                          </Typography>
                          <Typography variant="h5" fontWeight={600} color="success.main">
                            {formatCurrency(profitabilityReport.totalRevenue)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Total Expenses
                          </Typography>
                          <Typography variant="h5" fontWeight={600} color="error.main">
                            {formatCurrency(profitabilityReport.totalExpenses)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Net Profit/Loss
                            </Typography>
                            {profitabilityReport.profit >= 0 ? (
                              <TrendingUpIcon color="success" fontSize="small" />
                            ) : (
                              <TrendingDownIcon color="error" fontSize="small" />
                            )}
                          </Box>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            color={profitabilityReport.profit >= 0 ? "success.main" : "error.main"}
                          >
                            {formatCurrency(profitabilityReport.profit)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Profit Margin
                          </Typography>
                          <Typography variant="h5" fontWeight={600}>
                            {profitabilityReport.profitMargin?.toFixed(2) || 0}%
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Daily Sales vs Morning Supplies
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Daily Sales
                            </Typography>
                            <Typography variant="h5" fontWeight={600}>
                              {formatCurrency(profitabilityReport.dailySales)}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Morning Supplies Cost
                            </Typography>
                            <Typography variant="h5" fontWeight={600}>
                              {formatCurrency(profitabilityReport.morningSupplies)}
                            </Typography>
                          </Box>
                          <Divider />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Difference
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              color={
                                profitabilityReport.dailySales - profitabilityReport.morningSupplies >= 0
                                  ? "success.main"
                                  : "error.main"
                              }
                            >
                              {formatCurrency(
                                profitabilityReport.dailySales - profitabilityReport.morningSupplies
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          Performance Summary
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        {profitabilityReport.profit >= 0 ? (
                          <Alert severity="success" sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight={600}>
                              Business is profitable!
                            </Typography>
                            <Typography variant="caption">
                              You're generating positive returns with a {profitabilityReport.profitMargin?.toFixed(2)}% profit margin.
                            </Typography>
                          </Alert>
                        ) : (
                          <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography variant="body2" fontWeight={600}>
                              Business is operating at a loss
                            </Typography>
                            <Typography variant="caption">
                              Review expenses and pricing strategy to improve profitability.
                            </Typography>
                          </Alert>
                        )}
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="body2">Revenue to Expense Ratio:</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {profitabilityReport.totalExpenses > 0
                                ? (profitabilityReport.totalRevenue / profitabilityReport.totalExpenses).toFixed(2)
                                : "N/A"}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="body2">Break-even Status:</Typography>
                            <Chip
                              label={profitabilityReport.profit >= 0 ? "Above Break-even" : "Below Break-even"}
                              size="small"
                              color={profitabilityReport.profit >= 0 ? "success" : "error"}
                            />
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
