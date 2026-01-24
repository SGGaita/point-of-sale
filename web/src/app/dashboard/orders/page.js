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
  Chip,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Pagination,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import Sidebar from "@/components/dashboard/Sidebar";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";

const drawerWidth = 260;

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [waiterFilter, setWaiterFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Dialog
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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
      fetchOrders();
    }
  }, [user, pagination.page, statusFilter, startDate, endDate]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (statusFilter && statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }
      if (waiterFilter) {
        params.append("waiter", waiterFilter);
      }
      if (startDate) {
        params.append("startDate", startDate);
      }
      if (endDate) {
        params.append("endDate", endDate);
      }

      const response = await fetch(`/api/orders/admin?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Failed to fetch orders");
      }

      const data = await response.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || pagination);
      setSummary(data.summary || null);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderNumber, newStatus) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch("/api/orders/admin", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderNumber, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      await fetchOrders();
      setDialogOpen(false);
      setSelectedOrder(null);
    } catch (err) {
      console.error("Error updating order status:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("pos_user");
    router.push("/login");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "success";
      case "UNPAID":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "default";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user) {
    return null;
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
          bgcolor: "#fafafa",
        }}
      >
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1600px", width: "100%" }}>
          {/* Header */}
          <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                Orders
              </Typography>
              <Typography variant="body1" color="text.secondary">
                View and manage all orders from mobile devices
              </Typography>
            </Box>
            <IconButton onClick={fetchOrders} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {/* Summary Cards */}
          {summary && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Orders
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {summary.total}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ border: 1, borderColor: "divider", bgcolor: "#e8f5e9" }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Paid Orders
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {summary.paid}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Revenue: {formatCurrency(summary.totalRevenue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ border: 1, borderColor: "divider", bgcolor: "#ffebee" }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Unpaid Orders
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="error.main">
                      {summary.unpaid}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Amount: {formatCurrency(summary.unpaidAmount)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={0} sx={{ border: 1, borderColor: "divider", bgcolor: "#fff3e0" }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Pending Orders
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {summary.pending}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, border: 1, borderColor: "divider" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <FilterListIcon />
              <Typography variant="h6" fontWeight={600}>
                Filters
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPagination({ ...pagination, page: 1 });
                    }}
                  >
                    <MenuItem value="ALL">All Status</MenuItem>
                    <MenuItem value="PAID">Paid</MenuItem>
                    <MenuItem value="UNPAID">Unpaid</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Waiter Name"
                  value={waiterFilter}
                  onChange={(e) => setWaiterFilter(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      setPagination({ ...pagination, page: 1 });
                      fetchOrders();
                    }
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button variant="contained" onClick={() => {
                setPagination({ ...pagination, page: 1 });
                fetchOrders();
              }}>
                Apply Filters
              </Button>
              <Button variant="outlined" onClick={() => {
                setStatusFilter("ALL");
                setWaiterFilter("");
                setStartDate("");
                setEndDate("");
                setPagination({ ...pagination, page: 1 });
              }}>
                Clear
              </Button>
            </Box>
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Orders Table */}
          <Paper elevation={0} sx={{ border: 1, borderColor: "divider" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Order #</strong></TableCell>
                    <TableCell><strong>Waiter</strong></TableCell>
                    <TableCell><strong>Customer</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">
                          No orders found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>{order.orderNumber}</TableCell>
                        <TableCell>{order.waiter}</TableCell>
                        <TableCell>{order.customerName || "—"}</TableCell>
                        <TableCell align="right">
                          <strong>{formatCurrency(order.total)}</strong>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(order.timestamp)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleViewOrder(order)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={(e, page) => setPagination({ ...pagination, page })}
                  color="primary"
                />
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Order Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h6" fontWeight={600}>
                  Order Details
                </Typography>
                <Chip
                  label={selectedOrder.status}
                  color={getStatusColor(selectedOrder.status)}
                  size="small"
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Order Number
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedOrder.orderNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Waiter
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedOrder.waiter}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Customer
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedOrder.customerName || "—"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDate(selectedOrder.timestamp)}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Order Items
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Item</strong></TableCell>
                      <TableCell align="center"><strong>Qty</strong></TableCell>
                      <TableCell align="right"><strong>Price</strong></TableCell>
                      <TableCell align="right"><strong>Total</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.orderItems?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                        <TableCell align="right">
                          <strong>{formatCurrency(item.totalPrice)}</strong>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <strong>Total:</strong>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight={700}>
                          {formatCurrency(selectedOrder.total)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                Update Status
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {["PENDING", "PAID", "UNPAID"].map((status) => (
                  <Button
                    key={status}
                    variant={selectedOrder.status === status ? "contained" : "outlined"}
                    color={getStatusColor(status)}
                    onClick={() => handleStatusUpdate(selectedOrder.orderNumber, status)}
                    disabled={updatingStatus || selectedOrder.status === status}
                  >
                    {status}
                  </Button>
                ))}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
