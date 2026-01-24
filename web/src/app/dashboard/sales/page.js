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
  Grid,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PaymentIcon from "@mui/icons-material/Payment";
import ReceiptIcon from "@mui/icons-material/Receipt";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import Sidebar from "@/components/dashboard/Sidebar";

const drawerWidth = 260;

const orderTypes = [
  { value: "DINE_IN", label: "Dine In", icon: <RestaurantIcon /> },
  { value: "TAKEAWAY", label: "Takeaway", icon: <ShoppingBagIcon /> },
  { value: "DELIVERY", label: "Delivery", icon: <LocalShippingIcon /> },
];

const paymentMethods = [
  { value: "CASH", label: "Cash" },
  { value: "MPESA", label: "M-Pesa" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

export default function SalesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [activeTab, setActiveTab] = useState(0);
  const [menuItems, setMenuItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [categories, setCategories] = useState([]);
  
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState("DINE_IN");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  
  const [openCheckoutDialog, setOpenCheckoutDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountReceived, setAmountReceived] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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
    fetchMenuItems();
    fetchRecentOrders();
  }, [router, mounted]);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/menu");
      const data = await response.json();
      
      if (response.ok) {
        setMenuItems(data.items || []);
        const uniqueCategories = ["ALL", ...new Set(data.items.map(item => item.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch("/api/orders?limit=10");
      const data = await response.json();
      
      if (response.ok) {
        setRecentOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching recent orders:", error);
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

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    showSnackbar(`${item.name} added to cart`);
  };

  const updateQuantity = (itemId, change) => {
    setCart(cart.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setTableNumber("");
    setDeliveryAddress("");
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.16;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      showSnackbar("Cart is empty", "error");
      return;
    }
    setOpenCheckoutDialog(true);
    setAmountReceived(calculateTotal().toFixed(2));
  };

  const handleCompleteOrder = async () => {
    if (!paymentMethod) {
      showSnackbar("Please select a payment method", "error");
      return;
    }

    if (paymentMethod === "MPESA" && !referenceNumber) {
      showSnackbar("Please enter M-Pesa reference number", "error");
      return;
    }

    setSubmitting(true);

    try {
      const orderData = {
        orderType,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        tableNumber: orderType === "DINE_IN" ? tableNumber : null,
        deliveryAddress: orderType === "DELIVERY" ? deliveryAddress : null,
        items: cart.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity,
          unitPrice: parseFloat(item.price),
        })),
        subtotal: calculateSubtotal(),
        taxAmount: calculateTax(),
        totalAmount: calculateTotal(),
        paymentMethod,
        amountReceived: parseFloat(amountReceived),
        referenceNumber: referenceNumber || null,
        createdBy: user?.id,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Order completed successfully!");
        clearCart();
        setOpenCheckoutDialog(false);
        setPaymentMethod("CASH");
        setReferenceNumber("");
        fetchRecentOrders();
      } else {
        showSnackbar(data.error || "Failed to complete order", "error");
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

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.is_available;
  });

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
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1800px", width: "100%" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Point of Sale
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create new sales and manage transactions
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label="New Sale" />
              <Tab label="Recent Orders" />
            </Tabs>
          </Box>

          {activeTab === 0 ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", mb: 3 }}>
                  <Box sx={{ mb: 3 }}>
                    <TextField
                      fullWidth
                      placeholder="Search menu items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                    {categories.map(category => (
                      <Chip
                        key={category}
                        label={category}
                        onClick={() => setSelectedCategory(category)}
                        color={selectedCategory === category ? "primary" : "default"}
                        sx={{ cursor: "pointer" }}
                      />
                    ))}
                  </Box>

                  {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {filteredItems.map(item => (
                        <Grid item xs={12} sm={6} md={4} key={item.id}>
                          <Card
                            elevation={0}
                            sx={{
                              border: "1px solid",
                              borderColor: "divider",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              "&:hover": {
                                boxShadow: 2,
                                transform: "translateY(-2px)",
                              },
                            }}
                            onClick={() => addToCart(item)}
                          >
                            <CardContent>
                              <Typography variant="h6" fontWeight={600} gutterBottom>
                                {item.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                                {item.description || "No description"}
                              </Typography>
                              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="h6" color="primary" fontWeight={700}>
                                  {formatCurrency(item.price)}
                                </Typography>
                                <Chip label={item.category} size="small" />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                      {filteredItems.length === 0 && (
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: "center", py: 8 }}>
                            <Typography color="text.secondary">No items found</Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", position: "sticky", top: 20 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                    <ShoppingCartIcon />
                    <Typography variant="h6" fontWeight={600}>
                      Current Order
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <TextField
                      select
                      fullWidth
                      label="Order Type"
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value)}
                      size="small"
                    >
                      {orderTypes.map(type => (
                        <MenuItem key={type.value} value={type.value}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {type.icon}
                            {type.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Customer Name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Customer Phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      size="small"
                    />
                    {orderType === "DINE_IN" && (
                      <TextField
                        fullWidth
                        label="Table Number"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        size="small"
                      />
                    )}
                    {orderType === "DELIVERY" && (
                      <TextField
                        fullWidth
                        label="Delivery Address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        size="small"
                        multiline
                        rows={2}
                      />
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ maxHeight: 300, overflowY: "auto", mb: 3 }}>
                    {cart.length === 0 ? (
                      <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography color="text.secondary" variant="body2">
                          Cart is empty
                        </Typography>
                      </Box>
                    ) : (
                      cart.map(item => (
                        <Box key={item.id} sx={{ mb: 2, pb: 2, borderBottom: "1px solid", borderColor: "divider" }}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 1 }}>
                            <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                              {item.name}
                            </Typography>
                            <IconButton size="small" onClick={() => removeFromCart(item.id)} color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <IconButton size="small" onClick={() => updateQuantity(item.id, -1)}>
                                <RemoveIcon fontSize="small" />
                              </IconButton>
                              <Typography variant="body2" sx={{ minWidth: 30, textAlign: "center" }}>
                                {item.quantity}
                              </Typography>
                              <IconButton size="small" onClick={() => updateQuantity(item.id, 1)}>
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(parseFloat(item.price) * item.quantity)}
                            </Typography>
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Subtotal:</Typography>
                      <Typography variant="body2">{formatCurrency(calculateSubtotal())}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Tax (16%):</Typography>
                      <Typography variant="body2">{formatCurrency(calculateTax())}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="h6" fontWeight={700}>Total:</Typography>
                      <Typography variant="h6" fontWeight={700}>{formatCurrency(calculateTotal())}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={clearCart}
                      disabled={cart.length === 0}
                    >
                      Clear
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleCheckout}
                      disabled={cart.length === 0}
                      startIcon={<PaymentIcon />}
                    >
                      Checkout
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                    <TableRow>
                      <TableCell><strong>Order #</strong></TableCell>
                      <TableCell><strong>Customer</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Items</strong></TableCell>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Date</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map(order => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {order.order_number}
                          </Typography>
                        </TableCell>
                        <TableCell>{order.customer_name || "Walk-in"}</TableCell>
                        <TableCell>{order.order_type?.replace('_', ' ')}</TableCell>
                        <TableCell>{order.order_items?.length || 0} items</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(order.total_amount)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={order.order_status} size="small" color="primary" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(order.order_date).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {recentOrders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No recent orders</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
      </Box>

      <Dialog open={openCheckoutDialog} onClose={() => setOpenCheckoutDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">{formatCurrency(calculateSubtotal())}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="body2">Tax (16%):</Typography>
                  <Typography variant="body2">{formatCurrency(calculateTax())}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6" fontWeight={700}>Total:</Typography>
                  <Typography variant="h6" fontWeight={700}>{formatCurrency(calculateTotal())}</Typography>
                </Box>
              </Box>
            </Box>

            <TextField
              label="Payment Method"
              select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              fullWidth
            >
              {paymentMethods.map(method => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Amount Received"
              type="number"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              required
              fullWidth
              inputProps={{ step: "0.01", min: "0" }}
            />

            {parseFloat(amountReceived) > calculateTotal() && (
              <Alert severity="info">
                Change: {formatCurrency(parseFloat(amountReceived) - calculateTotal())}
              </Alert>
            )}

            {paymentMethod === "MPESA" && (
              <TextField
                label="M-Pesa Reference Number"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                required
                fullWidth
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenCheckoutDialog(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCompleteOrder}
            disabled={submitting}
            startIcon={<ReceiptIcon />}
          >
            {submitting ? <CircularProgress size={20} /> : "Complete Order"}
          </Button>
        </DialogActions>
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
