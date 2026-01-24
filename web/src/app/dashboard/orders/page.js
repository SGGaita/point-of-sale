"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Chip,
  IconButton,
  Snackbar,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PaymentIcon from "@mui/icons-material/Payment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import Sidebar from "@/components/dashboard/Sidebar";

const drawerWidth = 260;

const orderStatusColors = {
  PENDING: { color: "warning", label: "Pending" },
  PREPARING: { color: "info", label: "Preparing" },
  READY: { color: "success", label: "Ready" },
  COMPLETED: { color: "default", label: "Completed" },
  CANCELLED: { color: "error", label: "Cancelled" },
};

const paymentStatusColors = {
  UNPAID: { color: "error", label: "Unpaid" },
  PARTIAL: { color: "warning", label: "Partial" },
  PAID: { color: "success", label: "Paid" },
  REFUNDED: { color: "default", label: "Refunded" },
};

const orderTypeIcons = {
  DINE_IN: <RestaurantIcon />,
  TAKEAWAY: <ShoppingBagIcon />,
  DELIVERY: <LocalShippingIcon />,
};

const paymentMethods = [
  { value: "CASH", label: "Cash" },
  { value: "MPESA", label: "M-Pesa" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const [paymentFormData, setPaymentFormData] = useState({
    paymentMethod: "CASH",
    amount: "",
    referenceNumber: "",
    notes: "",
  });
  
  const [statusFormData, setStatusFormData] = useState({
    orderStatus: "",
  });

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
    fetchOrders();
  }, [router, mounted]);

  const fetchOrders = async (status = null) => {
    try {
      let url = "/api/orders";
      if (status) {
        url += `?status=${status}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pos_user");
    router.push("/login");
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    const statusMap = ["", "PENDING", "PREPARING", "READY", "COMPLETED"];
    fetchOrders(statusMap[newValue] || null);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setOpenViewDialog(true);
  };

  const handleOpenPaymentDialog = (order) => {
    setSelectedOrder(order);
    const remaining = parseFloat(order.total_amount) - parseFloat(order.amount_paid || 0);
    setPaymentFormData({
      paymentMethod: "CASH",
      amount: remaining.toFixed(2),
      referenceNumber: "",
      notes: "",
    });
    setOpenPaymentDialog(true);
  };

  const handleOpenStatusDialog = (order) => {
    setSelectedOrder(order);
    setStatusFormData({
      orderStatus: order.order_status,
    });
    setOpenStatusDialog(true);
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...paymentFormData,
          createdBy: user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Payment recorded successfully!");
        fetchOrders();
        setOpenPaymentDialog(false);
      } else {
        showSnackbar(data.error || "Failed to record payment", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: statusFormData.orderStatus,
          updatedBy: user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Order status updated successfully!");
        fetchOrders();
        setOpenStatusDialog(false);
      } else {
        showSnackbar(data.error || "Failed to update status", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!confirm("Mark this order as completed? This will reduce inventory stock.")) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: "COMPLETED",
          updatedBy: user?.id,
        }),
      });

      if (response.ok) {
        showSnackbar("Order completed successfully!");
        fetchOrders();
      } else {
        showSnackbar("Failed to complete order", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    setSubmitting(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSnackbar("Order cancelled successfully!");
        fetchOrders();
      } else {
        showSnackbar("Failed to cancel order", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `KSh ${parseFloat(amount || 0).toFixed(2)}`;
  };

  if (!mounted || !user) return null;

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
              Orders Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage customer orders
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab label="All Orders" />
              <Tab label="Pending" />
              <Tab label="Preparing" />
              <Tab label="Ready" />
              <Tab label="Completed" />
            </Tabs>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell><strong>Order #</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Customer</strong></TableCell>
                    <TableCell><strong>Items</strong></TableCell>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Payment</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {order.order_number}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          {orderTypeIcons[order.order_type]}
                          <Typography variant="body2">
                            {order.order_type.replace('_', ' ')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {order.customer_name || "Walk-in"}
                        {order.table_number && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Table {order.table_number}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{order.order_items?.length || 0} items</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(order.total_amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={orderStatusColors[order.order_status]?.label}
                          color={orderStatusColors[order.order_status]?.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={paymentStatusColors[order.payment_status]?.label}
                          color={paymentStatusColors[order.payment_status]?.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(order.order_date).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(order.order_date).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleViewOrder(order)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {order.payment_status !== 'PAID' && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenPaymentDialog(order)}
                          >
                            <PaymentIcon fontSize="small" />
                          </IconButton>
                        )}
                        {order.order_status !== 'COMPLETED' && order.order_status !== 'CANCELLED' && (
                          <>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleCompleteOrder(order.id)}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No orders found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* View Order Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details - {selectedOrder?.order_number}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Order Type</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedOrder.order_type.replace('_', ' ')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Customer</Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedOrder.customer_name || "Walk-in"}
                  </Typography>
                </Grid>
                {selectedOrder.customer_phone && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedOrder.customer_phone}
                    </Typography>
                  </Grid>
                )}
                {selectedOrder.table_number && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">Table Number</Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedOrder.table_number}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>Order Items</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrder.order_items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.item_name}</TableCell>
                        <TableCell align="right">{item.quantity} {item.unit}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell align="right">{formatCurrency(item.total_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Box sx={{ minWidth: 250 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>{formatCurrency(selectedOrder.subtotal)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography>Tax:</Typography>
                    <Typography>{formatCurrency(selectedOrder.tax_amount)}</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6">{formatCurrency(selectedOrder.total_amount)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography color="success.main">Paid:</Typography>
                    <Typography color="success.main">{formatCurrency(selectedOrder.amount_paid)}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography color="error.main">Balance:</Typography>
                    <Typography color="error.main">
                      {formatCurrency(parseFloat(selectedOrder.total_amount) - parseFloat(selectedOrder.amount_paid || 0))}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          {selectedOrder?.order_status !== 'COMPLETED' && (
            <Button
              variant="outlined"
              onClick={() => {
                setOpenViewDialog(false);
                handleOpenStatusDialog(selectedOrder);
              }}
            >
              Update Status
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <form onSubmit={handleRecordPayment}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Payment Method"
                select
                value={paymentFormData.paymentMethod}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, paymentMethod: e.target.value })}
                required
                fullWidth
              >
                {paymentMethods.map((method) => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Amount"
                type="number"
                value={paymentFormData.amount}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, amount: e.target.value })}
                required
                fullWidth
                inputProps={{ step: "0.01", min: "0" }}
              />

              {paymentFormData.paymentMethod === 'MPESA' && (
                <TextField
                  label="M-Pesa Code"
                  value={paymentFormData.referenceNumber}
                  onChange={(e) => setPaymentFormData({ ...paymentFormData, referenceNumber: e.target.value })}
                  fullWidth
                />
              )}

              <TextField
                label="Notes"
                multiline
                rows={2}
                value={paymentFormData.notes}
                onChange={(e) => setPaymentFormData({ ...paymentFormData, notes: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenPaymentDialog(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : "Record Payment"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Update Order Status</DialogTitle>
        <form onSubmit={handleUpdateStatus}>
          <DialogContent>
            <TextField
              label="Order Status"
              select
              value={statusFormData.orderStatus}
              onChange={(e) => setStatusFormData({ ...statusFormData, orderStatus: e.target.value })}
              required
              fullWidth
            >
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="PREPARING">Preparing</MenuItem>
              <MenuItem value="READY">Ready</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenStatusDialog(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : "Update Status"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
