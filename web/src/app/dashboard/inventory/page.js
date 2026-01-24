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
  IconButton,
  Snackbar,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Divider,
  Autocomplete,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Sidebar from "@/components/dashboard/Sidebar";

const drawerWidth = 260;

const itemTypes = [
  { value: "RAW", label: "Raw Material" },
  { value: "COOKED", label: "Cooked Item" },
];

const rawCategories = [
  "Food",
  "Beverages",
];

const cookedCategories = [
  "Food",
  "Beverages",
];

const units = [
  { value: "litres", label: "Litres" },
  { value: "kg", label: "Kilograms" },
  { value: "units", label: "Units" },
  { value: "pieces", label: "Pieces" },
  { value: "servings", label: "Servings" },
  { value: "cups", label: "Cups" },
  { value: "grams", label: "Grams" },
];

export default function InventoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [dailyEntries, setDailyEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openMorningEntryDialog, setOpenMorningEntryDialog] = useState(false);
  const [openClosingStockDialog, setOpenClosingStockDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [formData, setFormData] = useState({
    name: "",
    type: "RAW",
    category: "",
    unit: "litres",
    currentStock: "0",
    minStockLevel: "0",
  });
  const [morningEntries, setMorningEntries] = useState({});
  const [closingEntries, setClosingEntries] = useState({});
  const [wastageEntries, setWastageEntries] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [closingSearchQuery, setClosingSearchQuery] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("pos_user");
    if (!userData) {
      router.push("/login");
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    
    if (parsedUser.role !== "ADMIN" && parsedUser.role !== "MANAGER") {
      router.push("/dashboard");
      return;
    }
    
    setUser(parsedUser);
    fetchInventoryItems();
    fetchDailyEntries();
  }, [router]);

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch("/api/inventory");
      const data = await response.json();
      if (response.ok) {
        setInventoryItems(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyEntries = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/inventory/daily?date=${today}`);
      const data = await response.json();
      if (response.ok) {
        setDailyEntries(data.entries || []);
        const entriesMap = {};
        data.entries?.forEach(entry => {
          entriesMap[entry.inventoryItemId] = entry.openingStock || 0;
        });
        setMorningEntries(entriesMap);
      }
    } catch (error) {
      console.error("Error fetching daily entries:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pos_user");
    router.push("/login");
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setFormData({
      name: "",
      type: "RAW",
      category: "",
      unit: "litres",
      currentStock: "0",
      minStockLevel: "0",
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenEditDialog = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      category: item.category || "",
      unit: item.unit,
      currentStock: item.current_stock?.toString() || "0",
      minStockLevel: item.min_stock_level?.toString() || "0",
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedItem(null);
  };

  const handleOpenDeleteDialog = (item) => {
    setSelectedItem(item);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedItem(null);
  };

  const handleOpenMorningEntry = () => {
    setOpenMorningEntryDialog(true);
  };

  const handleCloseMorningEntry = () => {
    setOpenMorningEntryDialog(false);
  };

  const handleOpenClosingStock = () => {
    setOpenClosingStockDialog(true);
    // Pre-populate with current stock values
    const entries = {};
    const wastage = {};
    rawItems.forEach(item => {
      entries[item.id] = item.current_stock;
      wastage[item.id] = 0;
    });
    setClosingEntries(entries);
    setWastageEntries(wastage);
  };

  const handleCloseClosingStock = () => {
    setOpenClosingStockDialog(false);
    setClosingSearchQuery("");
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If type changes, reset category to empty so user selects appropriate one
    if (name === "type") {
      setFormData({
        ...formData,
        type: value,
        category: "",
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleMorningEntryChange = (itemId, value) => {
    setMorningEntries({
      ...morningEntries,
      [itemId]: value,
    });
  };

  const handleClosingStockChange = (itemId, value) => {
    setClosingEntries({
      ...closingEntries,
      [itemId]: value,
    });
  };

  const handleWastageChange = (itemId, value) => {
    setWastageEntries({
      ...wastageEntries,
      [itemId]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          currentStock: parseFloat(formData.currentStock),
          minStockLevel: parseFloat(formData.minStockLevel),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Inventory item added successfully!");
        fetchInventoryItems();
        handleCloseDialog();
      } else {
        showSnackbar(data.error || "Failed to add item", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          currentStock: parseFloat(formData.currentStock),
          minStockLevel: parseFloat(formData.minStockLevel),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Item updated successfully!");
        fetchInventoryItems();
        handleCloseEditDialog();
      } else {
        showSnackbar(data.error || "Failed to update item", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);

    try {
      const response = await fetch(`/api/inventory/${selectedItem.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSnackbar("Item deleted successfully!");
        fetchInventoryItems();
        handleCloseDeleteDialog();
      } else {
        showSnackbar("Failed to delete item", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveMorningEntries = async () => {
    setSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const entries = Object.entries(morningEntries).map(([itemId, stock]) => ({
        inventoryItemId: itemId,
        openingStock: parseFloat(stock) || 0,
        entryDate: today,
        enteredBy: user.id,
      }));

      const response = await fetch("/api/inventory/daily", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entries }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Morning stock entries saved successfully!");
        fetchInventoryItems();
        fetchDailyEntries();
        handleCloseMorningEntry();
      } else {
        showSnackbar(data.error || "Failed to save entries", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveClosingStock = async () => {
    setSubmitting(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const entries = Object.entries(closingEntries).map(([itemId, closingStock]) => ({
        inventoryItemId: itemId,
        closingStock: parseFloat(closingStock) || 0,
        wastage: parseFloat(wastageEntries[itemId]) || 0,
        entryDate: today,
        enteredBy: user.id,
      }));

      const response = await fetch("/api/inventory/daily/closing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ entries }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("End-of-day closing stock saved successfully!");
        fetchInventoryItems();
        fetchDailyEntries();
        handleCloseClosingStock();
      } else {
        showSnackbar(data.error || "Failed to save closing stock", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryOptions = () => {
    return formData.type === "RAW" ? rawCategories : cookedCategories;
  };

  const getLowStockItems = () => {
    return inventoryItems.filter(item => 
      item.current_stock <= item.min_stock_level && item.is_active
    );
  };

  const getRawItems = () => inventoryItems.filter(item => item.type === "RAW" && item.is_active);
  const getCookedItems = () => inventoryItems.filter(item => item.type === "COOKED" && item.is_active);

  if (!user) {
    return null;
  }

  const lowStockItems = getLowStockItems();
  const rawItems = getRawItems();
  const cookedItems = getCookedItems();

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
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1400px", width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                Inventory & Supply Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track daily opening stock, raw materials, and cooked items
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={handleOpenMorningEntry}
                sx={{ px: 2, py: 1.5, fontSize: '0.875rem' }}
              >
                Morning Entry
              </Button>
              <Button
                variant="outlined"
                onClick={handleOpenClosingStock}
                sx={{ 
                  px: 2, 
                  py: 1.5, 
                  fontSize: '0.875rem',
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  '&:hover': {
                    borderColor: '#7b1fa2',
                    bgcolor: 'rgba(156, 39, 176, 0.04)'
                  }
                }}
              >
                End of Day Summary
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{ px: 2, py: 1.5, fontSize: '0.875rem' }}
              >
                Add Item
              </Button>
            </Box>
          </Box>

          {/* Alert Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: "#fff3e0", borderLeft: "4px solid #ff9800" }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <WarningIcon sx={{ color: "#ff9800", fontSize: '1.2rem' }} />
                    <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                      Low Stock Alert
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700} color="#ff9800" sx={{ my: 0.5 }}>
                    {lowStockItems.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Items below minimum level
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: "#e8f5e9", borderLeft: "4px solid #4caf50" }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <CheckCircleIcon sx={{ color: "#4caf50", fontSize: '1.2rem' }} />
                    <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                      Raw Materials
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700} color="#4caf50" sx={{ my: 0.5 }}>
                    {rawItems.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Active raw materials
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ bgcolor: "#e3f2fd", borderLeft: "4px solid #2196f3" }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                    <CheckCircleIcon sx={{ color: "#2196f3", fontSize: '1.2rem' }} />
                    <Typography variant="subtitle1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                      Cooked Items
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight={700} color="#2196f3" sx={{ my: 0.5 }}>
                    {cookedItems.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Active cooked items
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Tabs and Search */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              borderBottom: 1, 
              borderColor: 'divider',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Tabs value={activeTab} onChange={handleTabChange} sx={{ flex: 1 }}>
                <Tab label="Raw Materials" />
                <Tab label="Cooked Items" />
                <Tab label={`Low Stock (${lowStockItems.length})`} />
              </Tabs>
              <Box sx={{ p: 2, minWidth: 300 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search inventory..."
                  value={tableSearchQuery}
                  onChange={(e) => setTableSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        🔍
                      </Box>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#f5f5f5',
                      '&:hover': {
                        bgcolor: '#eeeeee',
                      },
                      '&.Mui-focused': {
                        bgcolor: '#fff',
                      }
                    }
                  }}
                />
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <CircularProgress />
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  Loading inventory...
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#fafafa" }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>Item Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }} align="center">Current Stock</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }} align="center">Min Level</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }} align="center">Unit</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }} align="center">Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.875rem', color: 'text.primary' }} align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(activeTab === 0 ? rawItems : activeTab === 1 ? cookedItems : lowStockItems)
                      .filter(item => item.name.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                      .map((item) => (
                      <TableRow 
                        key={item.id} 
                        hover
                        sx={{
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.02)'
                          },
                          transition: 'background-color 0.2s'
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          <Typography variant="body1" fontWeight={600} sx={{ fontSize: '0.95rem' }}>
                            {item.name}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={item.category || "Uncategorized"}
                            size="small"
                            sx={{ 
                              bgcolor: item.type === "RAW" ? "#e8f5e9" : "#e3f2fd",
                              color: item.type === "RAW" ? "#2e7d32" : "#1976d2",
                              fontWeight: 500,
                              fontSize: '0.75rem'
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: 60,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: item.current_stock <= item.min_stock_level ? 'rgba(211, 47, 47, 0.08)' : 'rgba(46, 125, 50, 0.08)'
                          }}>
                            <Typography 
                              variant="body1" 
                              fontWeight={700}
                              color={item.current_stock <= item.min_stock_level ? "#d32f2f" : "#2e7d32"}
                              sx={{ fontSize: '0.95rem' }}
                            >
                              {item.current_stock}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                            {item.min_stock_level}
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Chip
                            label={item.unit}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          {item.current_stock <= item.min_stock_level ? (
                            <Chip
                              label="Low Stock"
                              size="small"
                              color="error"
                              icon={<WarningIcon sx={{ fontSize: '1rem' }} />}
                              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            />
                          ) : (
                            <Chip
                              label="In Stock"
                              size="small"
                              color="success"
                              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                            />
                          )}
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2 }}>
                          <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                            <IconButton
                              onClick={() => handleOpenEditDialog(item)}
                              size="small"
                              sx={{
                                color: "#1976d2",
                                "&:hover": { 
                                  bgcolor: "rgba(25, 118, 210, 0.08)",
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s'
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() => handleOpenDeleteDialog(item)}
                              size="small"
                              sx={{
                                color: "#d32f2f",
                                "&:hover": { 
                                  bgcolor: "rgba(211, 47, 47, 0.08)",
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s'
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(activeTab === 0 ? rawItems : activeTab === 1 ? cookedItems : lowStockItems)
                      .filter(item => item.name.toLowerCase().includes(tableSearchQuery.toLowerCase()))
                      .length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Typography variant="h6" color="text.secondary" fontWeight={500}>
                              {tableSearchQuery ? `No items found matching "${tableSearchQuery}"` : 'No items found in this category'}
                            </Typography>
                            {tableSearchQuery && (
                              <Typography variant="body2" color="text.secondary">
                                Try adjusting your search terms
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Add Item Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
          Add Inventory Item
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Type"
                name="type"
                select
                value={formData.type}
                onChange={handleChange}
                required
                fullWidth
              >
                {itemTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
              <Autocomplete
                freeSolo
                options={getCategoryOptions()}
                value={formData.category}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, category: newValue || "" });
                }}
                onInputChange={(event, newInputValue) => {
                  setFormData({ ...formData, category: newInputValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    required
                    placeholder="Select or type custom category"
                  />
                )}
              />
              <TextField
                label="Unit"
                name="unit"
                select
                value={formData.unit}
                onChange={handleChange}
                required
                fullWidth
              >
                {units.map((unit) => (
                  <MenuItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Current Stock"
                name="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ step: "0.01", min: "0" }}
              />
              <TextField
                label="Minimum Stock Level"
                name="minStockLevel"
                type="number"
                value={formData.minStockLevel}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ step: "0.01", min: "0" }}
                helperText="Alert when stock falls below this level"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button onClick={handleCloseDialog} variant="outlined" disabled={submitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {submitting ? "Adding..." : "Add Item"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
          Edit Inventory Item
        </DialogTitle>
        <form onSubmit={handleEdit}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                label="Type"
                name="type"
                select
                value={formData.type}
                onChange={handleChange}
                required
                fullWidth
              >
                {itemTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
              <Autocomplete
                freeSolo
                options={getCategoryOptions()}
                value={formData.category}
                onChange={(event, newValue) => {
                  setFormData({ ...formData, category: newValue || "" });
                }}
                onInputChange={(event, newInputValue) => {
                  setFormData({ ...formData, category: newInputValue });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    required
                    placeholder="Select or type custom category"
                  />
                )}
              />
              <TextField
                label="Unit"
                name="unit"
                select
                value={formData.unit}
                onChange={handleChange}
                required
                fullWidth
              >
                {units.map((unit) => (
                  <MenuItem key={unit.value} value={unit.value}>
                    {unit.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Current Stock"
                name="currentStock"
                type="number"
                value={formData.currentStock}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ step: "0.01", min: "0" }}
              />
              <TextField
                label="Minimum Stock Level"
                name="minStockLevel"
                type="number"
                value={formData.minStockLevel}
                onChange={handleChange}
                required
                fullWidth
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button onClick={handleCloseEditDialog} variant="outlined" disabled={submitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {submitting ? "Updating..." : "Update Item"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Morning Stock Entry Dialog */}
      <Dialog 
        open={openMorningEntryDialog} 
        onClose={handleCloseMorningEntry} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '85vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          fontSize: '1.5rem',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          Morning Stock Entry
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    🔍
                  </Box>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f5f5f5',
                  '&:hover': {
                    bgcolor: '#eeeeee',
                  },
                  '&.Mui-focused': {
                    bgcolor: '#fff',
                  }
                }
              }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {rawItems.filter(item => 
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).length} items • Enter opening stock for raw materials
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {rawItems
              .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((item) => (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(0, 0, 0, 0.01)'
                  }
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                      {item.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Chip
                        label={item.category || 'Uncategorized'}
                        size="small"
                        sx={{ 
                          height: 20,
                          fontSize: '0.7rem',
                          bgcolor: '#e3f2fd',
                          color: '#1976d2'
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Current: <strong>{item.current_stock} {item.unit}</strong>
                      </Typography>
                    </Box>
                  </Box>
                  <TextField
                    type="number"
                    label={`Opening Stock (${item.unit})`}
                    value={morningEntries[item.id] || ""}
                    onChange={(e) => handleMorningEntryChange(item.id, e.target.value)}
                    sx={{ width: 180 }}
                    size="small"
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Box>
              </Paper>
            ))}
            {rawItems.filter(item => 
              item.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No items found matching "{searchQuery}"
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseMorningEntry} variant="outlined" disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveMorningEntries} 
            variant="contained" 
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {submitting ? "Saving..." : "Save Entries"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* End-of-Day Closing Stock Dialog */}
      <Dialog 
        open={openClosingStockDialog} 
        onClose={handleCloseClosingStock} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '85vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 600, 
          fontSize: '1.5rem',
          borderBottom: '1px solid',
          borderColor: 'divider',
          pb: 2
        }}>
          End-of-Day Closing Stock Summary
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search items..."
              value={closingSearchQuery}
              onChange={(e) => setClosingSearchQuery(e.target.value)}
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: (
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    🔍
                  </Box>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  bgcolor: '#f5f5f5',
                  '&:hover': {
                    bgcolor: '#eeeeee',
                  },
                  '&.Mui-focused': {
                    bgcolor: '#fff',
                  }
                }
              }}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {rawItems.filter(item => 
              item.name.toLowerCase().includes(closingSearchQuery.toLowerCase())
            ).length} items • Enter closing stock and wastage for raw materials
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {rawItems
              .filter(item => item.name.toLowerCase().includes(closingSearchQuery.toLowerCase()))
              .map((item) => {
                const openingStock = dailyEntries.find(e => e.inventory_item_id === item.id)?.opening_stock || item.current_stock;
                const closingStock = parseFloat(closingEntries[item.id]) || 0;
                const wastage = parseFloat(wastageEntries[item.id]) || 0;
                const stockUsed = openingStock - closingStock - wastage;
                
                return (
                  <Paper
                    key={item.id}
                    elevation={0}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1.5,
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'secondary.main',
                        bgcolor: 'rgba(0, 0, 0, 0.01)'
                      }
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Box>
                          <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                            {item.name}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Chip
                              label={item.category || 'Uncategorized'}
                              size="small"
                              sx={{ 
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: '#e3f2fd',
                                color: '#1976d2'
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              Opening: <strong>{openingStock} {item.unit}</strong>
                            </Typography>
                          </Box>
                        </Box>
                        <Chip
                          label={`Used: ${stockUsed.toFixed(2)} ${item.unit}`}
                          size="small"
                          color={stockUsed > 0 ? "primary" : "default"}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      
                      <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                          type="number"
                          label={`Closing Stock (${item.unit})`}
                          value={closingEntries[item.id] || ""}
                          onChange={(e) => handleClosingStockChange(item.id, e.target.value)}
                          sx={{ flex: 1 }}
                          size="small"
                          inputProps={{ step: "0.01", min: "0" }}
                        />
                        <TextField
                          type="number"
                          label={`Wastage (${item.unit})`}
                          value={wastageEntries[item.id] || ""}
                          onChange={(e) => handleWastageChange(item.id, e.target.value)}
                          sx={{ flex: 1 }}
                          size="small"
                          inputProps={{ step: "0.01", min: "0" }}
                          helperText="Spoiled or damaged"
                        />
                      </Box>
                    </Box>
                  </Paper>
                );
              })}
            {rawItems.filter(item => 
              item.name.toLowerCase().includes(closingSearchQuery.toLowerCase())
            ).length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No items found matching "{closingSearchQuery}"
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={handleCloseClosingStock} variant="outlined" disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSaveClosingStock} 
            variant="contained" 
            color="secondary"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {submitting ? "Saving..." : "Save Closing Stock"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.5rem' }}>
          Delete Item
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedItem?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button onClick={handleCloseDeleteDialog} variant="outlined" disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="contained" 
            color="error"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {submitting ? "Deleting..." : "Delete"}
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
