"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Button,
  CircularProgress,
  Chip,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Sidebar from "@/components/dashboard/Sidebar";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const drawerWidth = 260;
const COLORS = ['#2e7d32', '#d32f2f'];

export default function WaiterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const waiterName = decodeURIComponent(params.waiter);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsOpen, setOrderDetailsOpen] = useState(false);

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
      fetchWaiterReport();
    }
  }, [user, period]);

  const fetchWaiterReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports/waiters?period=${period}&waiter=${encodeURIComponent(waiterName)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch waiter report');
      }
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching waiter report:', err);
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

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "success";
      case "UNPAID":
      case "PENDING":
        return "error";
      default:
        return "default";
    }
  };

  const getDisplayStatus = (status) => {
    if (status === "PENDING") {
      return "UNPAID";
    }
    return status;
  };

  const handleViewOrder = async (orderId) => {
    try {
      console.log('Fetching order with ID:', orderId);
      const response = await fetch(`/api/orders/${orderId}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(`Failed to fetch order details: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }
      
      const data = await response.json();
      console.log('Order data received:', data);
      
      // API returns { order: {...} }, so we need to extract the order object
      const orderData = data.order || data;
      
      // Transform order_items to items for compatibility
      if (orderData.order_items) {
        orderData.items = orderData.order_items.map(item => ({
          item_name: item.item_name,
          quantity: item.quantity,
          price: item.unit_price || item.price || 0
        }));
      }
      
      setSelectedOrder(orderData);
      setOrderDetailsOpen(true);
    } catch (err) {
      console.error('Error fetching order details:', err);
      alert(`Error: ${err.message}`);
    }
  };

  const handleCloseOrderDetails = () => {
    setOrderDetailsOpen(false);
    setSelectedOrder(null);
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
            bgcolor: "#fafafa",
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  const pieData = reportData ? [
    { name: 'Paid', value: reportData.summary.paidOrders },
    { name: 'Unpaid', value: reportData.summary.unpaidOrders }
  ] : [];

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
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "1600px", width: "100%" }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              <IconButton onClick={() => router.push('/dashboard/waiters')} size="small">
                <ArrowBackIcon />
              </IconButton>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonIcon sx={{ fontSize: 32, color: "primary.main" }} />
                <Typography variant="h4" component="h1" fontWeight={700}>
                  {waiterName}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ ml: 7 }}>
              Individual performance breakdown and order history
            </Typography>
          </Box>

          {/* Period Selector and Tabs */}
          <Paper elevation={0} sx={{ p: 2, mb: 2.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="body2" fontWeight={600}>
                  Time Period:
                </Typography>
                <ToggleButtonGroup
                  value={period}
                  exclusive
                  onChange={(e, newPeriod) => newPeriod && setPeriod(newPeriod)}
                  size="small"
                >
                  <ToggleButton value="daily">Today</ToggleButton>
                  <ToggleButton value="weekly">Last 7 Days</ToggleButton>
                  <ToggleButton value="monthly">Last 30 Days</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                <Tab label="Overview" />
                <Tab label="Orders" />
              </Tabs>
            </Box>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          {reportData && activeTab === 0 && (
            <>
              {/* Summary Cards */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
                <Box sx={{ flex: "1 1 180px", minWidth: "160px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "primary.main",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor: "#e3f2fd",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                      Total Orders
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ mt: 1 }}>
                      {reportData.summary.totalOrders}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 180px", minWidth: "160px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "success.main",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor: "#f1f8f4",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                      Paid Orders
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mt: 1 }}>
                      {reportData.summary.paidOrders}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 180px", minWidth: "160px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "error.main",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor: "#fef5f5",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                      Unpaid Orders
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="error.main" sx={{ mt: 1 }}>
                      {reportData.summary.unpaidOrders}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 180px", minWidth: "160px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "success.main",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor: "#f1f8f4",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                      Total Revenue
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mt: 1 }}>
                      {formatCurrency(reportData.summary.totalRevenue)}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 180px", minWidth: "160px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "error.main",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor: "#fef5f5",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                      Unpaid Amount
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="error.main" sx={{ mt: 1 }}>
                      {formatCurrency(reportData.summary.unpaidAmount)}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 180px", minWidth: "160px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      height: "100%",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
                      Avg Order Value
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                      {formatCurrency(reportData.summary.avgOrderValue)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>

              {/* Charts */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
                {/* Daily Revenue */}
                <Box sx={{ flex: "1 1 450px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                      Daily Revenue
                    </Typography>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={reportData.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{ borderRadius: 8, border: "1px solid #e0e0e0" }}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#2e7d32" strokeWidth={2} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Box>

                {/* Daily Orders */}
                <Box sx={{ flex: "1 1 450px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                      Daily Orders (Paid vs Unpaid)
                    </Typography>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={reportData.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e0e0e0" }} />
                        <Legend />
                        <Bar dataKey="paidOrders" fill="#2e7d32" radius={[4, 4, 0, 0]} name="Paid" />
                        <Bar dataKey="unpaidOrders" fill="#d32f2f" radius={[4, 4, 0, 0]} name="Unpaid" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Box>
              </Box>

              {/* Paid vs Unpaid Pie Chart */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
                <Box sx={{ flex: "1 1 350px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                      Order Status Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={240}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Box>

                {/* Performance Summary */}
                <Box sx={{ flex: "1 1 450px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                      Performance Summary
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Success Rate (Paid Orders)
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {reportData.summary.totalOrders > 0 
                            ? ((reportData.summary.paidOrders / reportData.summary.totalOrders) * 100).toFixed(1)
                            : 0}%
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Revenue Generated
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="success.main">
                          {formatCurrency(reportData.summary.totalRevenue)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Outstanding Amount
                        </Typography>
                        <Typography variant="body2" fontWeight={700} color="error.main">
                          {formatCurrency(reportData.summary.unpaidAmount)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", p: 1.5, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Average Order Value
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(reportData.summary.avgOrderValue)}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </>
          )}

          {reportData && activeTab === 1 && (
            <>
              {/* Orders Table */}
              <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", bgcolor: "#fafafa" }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Order History ({reportData.orders?.length || 0} orders)
                  </Typography>
                </Box>
                <TableContainer sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                        <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Date & Time</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Payment Method</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.orders?.length > 0 ? (
                        reportData.orders.map((order) => (
                          <TableRow key={order.id} hover sx={{ "&:hover": { bgcolor: "rgba(0,0,0,0.02)" } }}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                #{order.order_number}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(order.timestamp).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(order.timestamp).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {order.customer_name || 'Walk-in'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" fontWeight={700}>
                                {formatCurrency(order.total)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={order.payment_method || 'N/A'}
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={getDisplayStatus(order.status)}
                                color={getStatusColor(order.status)}
                                size="small"
                                sx={{ fontWeight: 600, minWidth: 80 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                size="small"
                                onClick={() => handleViewOrder(order.id)}
                                sx={{ color: "primary.main" }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">No orders found for this period</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </>
          )}
        </Box>
      </Box>

      {/* Order Details Dialog */}
      <Dialog
        open={orderDetailsOpen}
        onClose={handleCloseOrderDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: 1, borderColor: "divider", pb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight={700}>
              Order #{selectedOrder?.order_number}
            </Typography>
            <Chip
              label={getDisplayStatus(selectedOrder?.status)}
              color={getStatusColor(selectedOrder?.status)}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedOrder && (
            <Box>
              {/* Order Info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Order Information
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Date & Time:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {new Date(selectedOrder.timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Customer:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedOrder.customer_name || 'Walk-in'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Waiter:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedOrder.waiter || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {selectedOrder.payment_method || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Order Items */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Order Items
                </Typography>
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                        <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Qty</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Price</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.item_name}</TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {formatCurrency(item.quantity * item.price)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 700, borderTop: 2 }}>
                          Total:
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: 16, borderTop: 2 }}>
                          {formatCurrency(selectedOrder.total)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: 1, borderColor: "divider", p: 2 }}>
          <Button onClick={handleCloseOrderDetails} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
