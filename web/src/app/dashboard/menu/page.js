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
  Switch,
  FormControlLabel,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import Sidebar from "@/components/dashboard/Sidebar";

const drawerWidth = 260;

const menuCategories = [
  { value: "breakfast", label: "Breakfast", color: "#ff9800" },
  { value: "beef", label: "Beef", color: "#d32f2f" },
  { value: "meals", label: "Meals", color: "#1976d2" },
  { value: "beverages", label: "Beverages", color: "#388e3c" },
  { value: "other", label: "Other", color: "#757575" },
];

export default function MenuPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "breakfast",
    price: "",
    unit: "portion",
    inventoryItemId: "",
    preparationTime: "",
    imageUrl: "",
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
    fetchMenuItems();
    fetchInventoryItems();
  }, [router, mounted]);

  const fetchMenuItems = async (category = null) => {
    try {
      let url = "/api/menu";
      if (category && category !== "all") {
        url += `?category=${category}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setMenuItems(data.menuItems || []);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch("/api/inventory?type=cooked");
      const data = await response.json();
      
      if (response.ok) {
        setInventoryItems(data.items || []);
      }
    } catch (error) {
      console.error("Error fetching inventory items:", error);
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

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    fetchMenuItems(category);
  };

  const handleOpenAddDialog = () => {
    setFormData({
      name: "",
      description: "",
      category: "breakfast",
      price: "",
      unit: "portion",
      inventoryItemId: "",
      preparationTime: "",
      imageUrl: "",
    });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      category: item.category,
      price: item.price,
      unit: item.unit,
      inventoryItemId: item.inventory_item_id || "",
      preparationTime: item.preparation_time || "",
      imageUrl: item.image_url || "",
    });
    setOpenEditDialog(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          createdBy: user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Menu item added successfully!");
        fetchMenuItems(selectedCategory);
        setOpenAddDialog(false);
      } else {
        showSnackbar(data.error || "Failed to add menu item", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/menu/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Menu item updated successfully!");
        fetchMenuItems(selectedCategory);
        setOpenEditDialog(false);
      } else {
        showSnackbar(data.error || "Failed to update menu item", "error");
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
      const response = await fetch(`/api/menu/${selectedItem.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showSnackbar("Menu item deleted successfully!");
        fetchMenuItems(selectedCategory);
        setOpenDeleteDialog(false);
      } else {
        showSnackbar("Failed to delete menu item", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const response = await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isAvailable: !item.is_available,
        }),
      });

      if (response.ok) {
        showSnackbar(`Menu item ${!item.is_available ? 'enabled' : 'disabled'} successfully!`);
        fetchMenuItems(selectedCategory);
      }
    } catch (error) {
      showSnackbar("Failed to update availability", "error");
    }
  };

  const getCategoryColor = (category) => {
    return menuCategories.find(c => c.value === category)?.color || "#757575";
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
          <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                Menu Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your restaurant menu items
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              Add Menu Item
            </Button>
          </Box>

          {/* Category Filter */}
          <Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label="All"
              onClick={() => handleCategoryFilter("all")}
              color={selectedCategory === "all" ? "primary" : "default"}
              sx={{ fontWeight: selectedCategory === "all" ? 600 : 400 }}
            />
            {menuCategories.map((category) => (
              <Chip
                key={category.value}
                label={category.label}
                onClick={() => handleCategoryFilter(category.value)}
                sx={{
                  bgcolor: selectedCategory === category.value ? category.color : "transparent",
                  color: selectedCategory === category.value ? "#fff" : "text.primary",
                  fontWeight: selectedCategory === category.value ? 600 : 400,
                  border: `1px solid ${category.color}`,
                }}
              />
            ))}
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">Total Items</Typography>
                  <Typography variant="h5" fontWeight={700}>{menuItems.length}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">Available</Typography>
                  <Typography variant="h5" fontWeight={700} color="success.main">
                    {menuItems.filter(i => i.is_available).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">Unavailable</Typography>
                  <Typography variant="h5" fontWeight={700} color="error.main">
                    {menuItems.filter(i => !i.is_available).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">Categories</Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {new Set(menuItems.map(i => i.category)).size}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
              <Table>
                <TableHead sx={{ bgcolor: "#f5f5f5" }}>
                  <TableRow>
                    <TableCell><strong>Item Name</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Price</strong></TableCell>
                    <TableCell><strong>Unit</strong></TableCell>
                    <TableCell><strong>Prep Time</strong></TableCell>
                    <TableCell><strong>Available</strong></TableCell>
                    <TableCell align="right"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {menuItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.name}
                        </Typography>
                        {item.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={menuCategories.find(c => c.value === item.category)?.label || item.category}
                          size="small"
                          sx={{
                            bgcolor: getCategoryColor(item.category),
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(item.price)}
                        </Typography>
                      </TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>
                        {item.preparation_time ? `${item.preparation_time} min` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={item.is_available}
                          onChange={() => handleToggleAvailability(item)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditDialog(item)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            setSelectedItem(item);
                            setOpenDeleteDialog(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {menuItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No menu items found. Add your first menu item.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>

      {/* Add Menu Item Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Menu Item</DialogTitle>
        <form onSubmit={handleSubmitAdd}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />

              <TextField
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
              />

              <TextField
                label="Category"
                select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                fullWidth
              >
                {menuCategories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </TextField>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    fullWidth
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Unit"
                    select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                    fullWidth
                  >
                    <MenuItem value="portion">Portion</MenuItem>
                    <MenuItem value="kg">Kilogram (kg)</MenuItem>
                    <MenuItem value="piece">Piece</MenuItem>
                    <MenuItem value="plate">Plate</MenuItem>
                    <MenuItem value="cup">Cup</MenuItem>
                    <MenuItem value="bottle">Bottle</MenuItem>
                    <MenuItem value="set">Set</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <TextField
                label="Link to Inventory Item (Optional)"
                select
                value={formData.inventoryItemId}
                onChange={(e) => setFormData({ ...formData, inventoryItemId: e.target.value })}
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {inventoryItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Preparation Time (minutes)"
                type="number"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                fullWidth
                inputProps={{ min: "0" }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenAddDialog(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : "Add Item"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Menu Item Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Menu Item</DialogTitle>
        <form onSubmit={handleSubmitEdit}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              <TextField
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />

              <TextField
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
              />

              <TextField
                label="Category"
                select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                fullWidth
              >
                {menuCategories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </TextField>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    fullWidth
                    inputProps={{ step: "0.01", min: "0" }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Unit"
                    select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    required
                    fullWidth
                  >
                    <MenuItem value="portion">Portion</MenuItem>
                    <MenuItem value="kg">Kilogram (kg)</MenuItem>
                    <MenuItem value="piece">Piece</MenuItem>
                    <MenuItem value="plate">Plate</MenuItem>
                    <MenuItem value="cup">Cup</MenuItem>
                    <MenuItem value="bottle">Bottle</MenuItem>
                    <MenuItem value="set">Set</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <TextField
                label="Link to Inventory Item (Optional)"
                select
                value={formData.inventoryItemId}
                onChange={(e) => setFormData({ ...formData, inventoryItemId: e.target.value })}
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {inventoryItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Preparation Time (minutes)"
                type="number"
                value={formData.preparationTime}
                onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                fullWidth
                inputProps={{ min: "0" }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenEditDialog(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : "Update Item"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Menu Item</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedItem?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={submitting}>
            {submitting ? <CircularProgress size={20} /> : "Delete"}
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
