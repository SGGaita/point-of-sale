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
  useTheme,
} from "@mui/material";
import Sidebar from "@/components/dashboard/Sidebar";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const drawerWidth = 260;

export default function OrdersPage() {
  const router = useRouter();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [waiterFilter, setWaiterFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Sorting
  const [sortField, setSortField] = useState("timestamp");
  const [sortOrder, setSortOrder] = useState("desc");

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedOrders = [...orders].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case "order_number":
        aValue = a.order_number;
        bValue = b.order_number;
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      case "timestamp":
        aValue = new Date(a.timestamp).getTime();
        bValue = new Date(b.timestamp).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1800px", width: "100%" }}>
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
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
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
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                    }
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                      Total Orders
                    </Typography>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "text.secondary" }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                    {summary.total}
                  </Typography>
                </Paper>
              </Box>
              
              <Box sx={{ flex: "1 1 200px", minWidth: "180px" }}>
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
                      boxShadow: "0 2px 8px rgba(46,125,50,0.15)"
                    }
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                      Paid
                    </Typography>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main" }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mb: 0.5 }}>
                    {summary.paid}
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="success.dark" sx={{ fontSize: '0.75rem' }}>
                    {formatCurrency(summary.totalRevenue)}
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
                      boxShadow: "0 2px 8px rgba(211,47,47,0.15)"
                    }
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                      Unpaid
                    </Typography>
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "error.main" }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700} color="error.main" sx={{ mb: 0.5 }}>
                    {summary.unpaid}
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color="error.dark" sx={{ fontSize: '0.75rem' }}>
                    {formatCurrency(summary.unpaidAmount)}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}

          {/* Filters */}
          <Paper elevation={0} sx={{ p: 3, mb: 3, border: 1, borderColor: "divider", borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <FilterListIcon />
              <Typography variant="h6" fontWeight={600}>
                Filters
              </Typography>
            </Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
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
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
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
              </Box>
              <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ flex: "1 1 200px", minWidth: "200px" }}>
                <TextField
                  fullWidth
                  size="small"
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button 
                variant="contained" 
                onClick={() => {
                  setPagination({ ...pagination, page: 1 });
                  fetchOrders();
                }}
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
                Apply Filters
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setStatusFilter("ALL");
                  setWaiterFilter("");
                  setStartDate("");
                  setEndDate("");
                  setPagination({ ...pagination, page: 1 });
                }}
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
          <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fafafa' }}>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: "0.75rem",
                        py: 1.5,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        cursor: "pointer",
                        userSelect: "none",
                        "&:hover": { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.04)' }
                      }}
                      onClick={() => handleSort("order_number")}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        Order #
                        {sortField === "order_number" && (
                          sortOrder === "asc" ? <ArrowUpwardIcon sx={{ fontSize: '1rem' }} /> : <ArrowDownwardIcon sx={{ fontSize: '1rem' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Waiter</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Customer</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: "0.75rem",
                        py: 1.5,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        cursor: "pointer",
                        userSelect: "none",
                        "&:hover": { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.04)' }
                      }}
                      onClick={() => handleSort("status")}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        Status
                        {sortField === "status" && (
                          sortOrder === "asc" ? <ArrowUpwardIcon sx={{ fontSize: '1rem' }} /> : <ArrowDownwardIcon sx={{ fontSize: '1rem' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell 
                      sx={{ 
                        fontWeight: 700, 
                        fontSize: "0.75rem",
                        py: 1.5,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        cursor: "pointer",
                        userSelect: "none",
                        "&:hover": { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.04)' }
                      }}
                      onClick={() => handleSort("timestamp")}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        Date
                        {sortField === "timestamp" && (
                          sortOrder === "asc" ? <ArrowUpwardIcon sx={{ fontSize: '1rem' }} /> : <ArrowDownwardIcon sx={{ fontSize: '1rem' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, fontSize: "0.75rem", py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</TableCell>
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
                    sortedOrders.map((order) => (
                      <TableRow 
                        key={order.id} 
                        hover
                        sx={{ 
                          "&:hover": { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)' },
                          transition: "background-color 0.2s"
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, py: 1.5, fontSize: '0.875rem' }}>{order.order_number}</TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>{order.waiter}</TableCell>
                        <TableCell sx={{ color: order.customer_name ? "text.primary" : "text.secondary", py: 1.5, fontSize: '0.875rem' }}>
                          {order.customer_name || "Walk-in"}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ fontSize: '0.875rem' }}>
                            {formatCurrency(order.total)}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={getDisplayStatus(order.status)}
                            color={getStatusColor(order.status)}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.7rem', height: 24 }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: "0.875rem", py: 1.5 }}>{formatDate(order.timestamp)}</TableCell>
                        <TableCell align="center" sx={{ py: 1.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleViewOrder(order)}
                            sx={{ 
                              color: "primary.main",
                              "&:hover": { 
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.08)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <VisibilityIcon sx={{ fontSize: '1.1rem' }} />
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
              <Box sx={{ 
                p: 2, 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                borderTop: 1,
                borderColor: "divider",
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
                flexWrap: "wrap",
                gap: 2
              }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {((pagination.page - 1) * pagination.pageSize) + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} orders
                </Typography>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={(e, page) => setPagination({ ...pagination, page })}
                  color="primary"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      fontWeight: 600
                    },
                    "& .Mui-selected": {
                      bgcolor: theme.palette.mode === 'dark' ? 'primary.main !important' : '#000 !important',
                      color: theme.palette.mode === 'dark' ? '#000 !important' : '#fff !important',
                      "&:hover": {
                        bgcolor: theme.palette.mode === 'dark' ? 'primary.dark !important' : '#1a1a1a !important'
                      }
                    }
                  }}
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
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)',
            bgcolor: 'background.paper'
          }
        }}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{ pb: 1.5, pt: 2, px: 2.5, borderBottom: 1, borderColor: "divider" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
                    Order #{selectedOrder.order_number}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    {formatDate(selectedOrder.timestamp)}
                  </Typography>
                </Box>
                <Chip
                  label={getDisplayStatus(selectedOrder.status)}
                  color={getStatusColor(selectedOrder.status)}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.7rem', height: 24 }}
                />
              </Box>
            </DialogTitle>
            
            <DialogContent sx={{ px: 2.5, py: 2 }}>
              {/* Order Information */}
              <Box sx={{ display: "flex", gap: 2, mb: 2, pb: 2, borderBottom: 1, borderColor: "divider" }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Waiter
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                    {selectedOrder.waiter}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Customer
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: selectedOrder.customer_name ? "text.primary" : "text.secondary", fontSize: '0.875rem' }}>
                    {selectedOrder.customer_name || "Walk-in"}
                  </Typography>
                </Box>
              </Box>

              {/* Order Items */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, fontSize: '0.875rem' }}>
                  Items
                </Typography>
                <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflow: "hidden" }}>
                  {selectedOrder.orderItems?.map((item, index) => (
                    <Box 
                      key={item.id}
                      sx={{ 
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.25,
                        bgcolor: index % 2 === 0 
                          ? (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafafa')
                          : 'background.paper',
                        borderBottom: index < selectedOrder.orderItems.length - 1 ? 1 : 0,
                        borderColor: "divider"
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.875rem' }}>
                          {item.itemName}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40, textAlign: "center", fontSize: '0.8rem' }}>
                          × {item.quantity}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80, textAlign: "right", fontSize: '0.8rem' }}>
                          {formatCurrency(item.price)}
                        </Typography>
                        <Typography variant="body2" fontWeight={600} sx={{ minWidth: 90, textAlign: "right", fontSize: '0.875rem' }}>
                          {formatCurrency(item.totalPrice)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  
                  {/* Total */}
                  <Box 
                    sx={{ 
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#f5f5f5',
                      borderTop: 2,
                      borderColor: "divider"
                    }}
                  >
                    <Typography variant="body1" fontWeight={700} sx={{ fontSize: '0.95rem' }}>
                      Total
                    </Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
                      {formatCurrency(selectedOrder.total)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Status Update */}
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, fontSize: '0.875rem' }}>
                  Update Status
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  {["PENDING", "PAID"].map((status) => (
                    <Button
                      key={status}
                      variant={selectedOrder.status === status ? "contained" : "outlined"}
                      color={getStatusColor(status)}
                      onClick={() => handleStatusUpdate(selectedOrder.order_number, status)}
                      disabled={updatingStatus || selectedOrder.status === status}
                      fullWidth
                      sx={{
                        py: 0.875,
                        fontWeight: 600,
                        fontSize: "0.8rem"
                      }}
                    >
                      {updatingStatus && selectedOrder.status !== status ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        getDisplayStatus(status)
                      )}
                    </Button>
                  ))}
                </Box>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: 1, borderColor: "divider" }}>
              <Button 
                onClick={() => setDialogOpen(false)}
                variant="text"
                sx={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: "text.secondary"
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
