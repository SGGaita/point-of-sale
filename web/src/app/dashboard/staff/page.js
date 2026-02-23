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
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import WorkIcon from "@mui/icons-material/Work";
import Sidebar from "@/components/dashboard/Sidebar";

const drawerWidth = 260;

const userRoles = [
  { value: "ADMIN", label: "Admin", color: "#000", description: "Full access to all features" },
  { value: "MANAGER", label: "Manager", color: "#1976d2", description: "Reports + daily operations" },
  { value: "CASHIER", label: "Cashier", color: "#ed6c02", description: "Sales only" },
  { value: "STOREKEEPER", label: "Storekeeper", color: "#2e7d32", description: "Inventory only" },
];

export default function StaffManagementPage() {
  const router = useRouter();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Staff (no accounts)
  const [staff, setStaff] = useState([]);
  const [positions, setPositions] = useState([]);
  
  // User accounts
  const [userAccounts, setUserAccounts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Dialogs
  const [openStaffDialog, setOpenStaffDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [openPositionDialog, setOpenPositionDialog] = useState(false);
  const [openEditStaffDialog, setOpenEditStaffDialog] = useState(false);
  const [openEditUserDialog, setOpenEditUserDialog] = useState(false);
  const [openEditPositionDialog, setOpenEditPositionDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // "staff", "user", "position"
  
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // Form data
  const [staffFormData, setStaffFormData] = useState({
    name: "",
    email: "",
    phone: "",
    positionId: "",
    hireDate: "",
    salary: "",
    notes: "",
  });
  
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER",
    phone: "",
  });
  
  const [positionFormData, setPositionFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("pos_user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchAllData();
  }, [router]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchStaff(),
      fetchUserAccounts(),
      fetchPositions(),
    ]);
    setLoading(false);
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch("/api/staff");
      const data = await response.json();
      if (response.ok) {
        setStaff(data.staff || []);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const fetchUserAccounts = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (response.ok) {
        setUserAccounts(data.users || []);
      }
    } catch (error) {
      console.error("Error fetching user accounts:", error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch("/api/positions?active=true");
      const data = await response.json();
      if (response.ok) {
        setPositions(data.positions || []);
      }
    } catch (error) {
      console.error("Error fetching positions:", error);
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

  // Staff handlers
  const handleOpenStaffDialog = () => {
    setStaffFormData({
      name: "",
      email: "",
      phone: "",
      positionId: "",
      hireDate: "",
      salary: "",
      notes: "",
    });
    setOpenStaffDialog(true);
  };

  const handleSubmitStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const positionName = positions.find(p => p.id === staffFormData.positionId)?.name || "";
      
      const response = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...staffFormData,
          positionName,
          createdBy: user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Staff member added successfully!");
        fetchStaff();
        setOpenStaffDialog(false);
      } else {
        showSnackbar(data.error || "Failed to add staff member", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const positionName = positions.find(p => p.id === staffFormData.positionId)?.name || "";
      
      const response = await fetch(`/api/staff/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...staffFormData,
          positionName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Staff member updated successfully!");
        fetchStaff();
        setOpenEditStaffDialog(false);
      } else {
        showSnackbar(data.error || "Failed to update staff member", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // User account handlers
  const handleOpenUserDialog = () => {
    setUserFormData({
      name: "",
      email: "",
      password: "",
      role: "CASHIER",
      phone: "",
    });
    setOpenUserDialog(true);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userFormData,
          createdBy: user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("User account created successfully!");
        fetchUserAccounts();
        setOpenUserDialog(false);
      } else {
        showSnackbar(data.error || "Failed to create user account", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updateData = {
        name: userFormData.name,
        email: userFormData.email,
        role: userFormData.role,
        phone: userFormData.phone,
      };

      if (userFormData.password) {
        updateData.password = userFormData.password;
      }

      const response = await fetch(`/api/users/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("User account updated successfully!");
        fetchUserAccounts();
        setOpenEditUserDialog(false);
      } else {
        showSnackbar(data.error || "Failed to update user account", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Position handlers
  const handleOpenPositionDialog = () => {
    setPositionFormData({ name: "", description: "" });
    setOpenPositionDialog(true);
  };

  const handleSubmitPosition = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/positions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...positionFormData,
          createdBy: user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Position created successfully!");
        fetchPositions();
        setOpenPositionDialog(false);
      } else {
        showSnackbar(data.error || "Failed to create position", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPosition = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch(`/api/positions/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(positionFormData),
      });

      const data = await response.json();

      if (response.ok) {
        showSnackbar("Position updated successfully!");
        fetchPositions();
        setOpenEditPositionDialog(false);
      } else {
        showSnackbar(data.error || "Failed to update position", "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    setSubmitting(true);

    try {
      let endpoint = "";
      if (deleteType === "staff") endpoint = `/api/staff/${selectedItem.id}`;
      else if (deleteType === "user") endpoint = `/api/users/${selectedItem.id}`;
      else if (deleteType === "position") endpoint = `/api/positions/${selectedItem.id}`;

      const response = await fetch(endpoint, { method: "DELETE" });

      if (response.ok) {
        showSnackbar(`${deleteType.charAt(0).toUpperCase() + deleteType.slice(1)} deleted successfully!`);
        if (deleteType === "staff") fetchStaff();
        else if (deleteType === "user") fetchUserAccounts();
        else if (deleteType === "position") fetchPositions();
        setOpenDeleteDialog(false);
      } else {
        showSnackbar(`Failed to delete ${deleteType}`, "error");
      }
    } catch (error) {
      showSnackbar("An error occurred. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleColor = (role) => {
    return userRoles.find((r) => r.value === role)?.color || "#666";
  };

  const getRoleLabel = (role) => {
    return userRoles.find((r) => r.value === role)?.label || role;
  };

  if (!user) return null;

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
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              Staff & User Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage employees, user accounts, and positions
            </Typography>
          </Box>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab icon={<BadgeIcon />} label="Staff (No Accounts)" iconPosition="start" />
              <Tab icon={<PersonIcon />} label="User Accounts" iconPosition="start" />
              <Tab icon={<WorkIcon />} label="Positions" iconPosition="start" />
            </Tabs>
          </Box>

          {/* Staff Tab */}
          {activeTab === 0 && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6">Staff Members (No Login Access)</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenStaffDialog}
                  sx={{
                    px: 2.5,
                    py: 1,
                    fontSize: '0.875rem',
                    bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : '#000',
                    color: theme.palette.mode === 'dark' ? '#000' : '#fff',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : '#1a1a1a',
                    }
                  }}
                >
                  Add Staff
                </Button>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Position</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Contact</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Hire Date</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staff.filter(s => s.is_active).map((member) => (
                      <TableRow key={member.id} hover sx={{ '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)' } }}>
                        <TableCell sx={{ py: 1.5, fontSize: '0.875rem', fontWeight: 600 }}>{member.name}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip label={member.positions?.name || member.position_name || "N/A"} size="small" sx={{ fontSize: '0.7rem', height: 24 }} />
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          {member.email && <div style={{ fontSize: '0.875rem' }}>{member.email}</div>}
                          {member.phone && <div style={{ fontSize: '0.8rem', color: theme.palette.text.secondary }}>{member.phone}</div>}
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>{member.hire_date ? new Date(member.hire_date).toLocaleDateString() : "N/A"}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip label="Active" color="success" size="small" sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600 }} />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedItem(member);
                              setStaffFormData({
                                name: member.name,
                                email: member.email || "",
                                phone: member.phone || "",
                                positionId: member.position_id || "",
                                hireDate: member.hire_date || "",
                                salary: member.salary || "",
                                notes: member.notes || "",
                              });
                              setOpenEditStaffDialog(true);
                            }}
                            sx={{
                              color: 'primary.main',
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.1)' : 'rgba(25, 118, 210, 0.08)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <EditIcon sx={{ fontSize: '1.1rem' }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedItem(member);
                              setDeleteType("staff");
                              setOpenDeleteDialog(true);
                            }}
                            sx={{
                              color: 'error.main',
                              '&:hover': {
                                bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(211, 47, 47, 0.08)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.2s'
                            }}
                          >
                            <DeleteIcon sx={{ fontSize: '1.1rem' }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {staff.filter(s => s.is_active).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No staff members found. Add your first staff member.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* User Accounts Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6">User Accounts (With Login Access)</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenUserDialog}
                  sx={{
                    px: 2.5,
                    py: 1,
                    fontSize: '0.875rem',
                    bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : '#000',
                    color: theme.palette.mode === 'dark' ? '#000' : '#fff',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : '#1a1a1a',
                    }
                  }}
                >
                  Add User Account
                </Button>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userAccounts.map((account) => (
                      <TableRow key={account.id} hover sx={{ '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)' } }}>
                        <TableCell sx={{ py: 1.5, fontSize: '0.875rem', fontWeight: 600 }}>{account.name}</TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>{account.email}</TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={getRoleLabel(account.role)}
                            sx={{ bgcolor: getRoleColor(account.role), color: "#fff", fontWeight: 600, fontSize: '0.7rem', height: 24 }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={account.isActive ? "Active" : "Inactive"}
                            color={account.isActive ? "success" : "default"}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 24, fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedItem(account);
                              setUserFormData({
                                name: account.name,
                                email: account.email,
                                password: "",
                                role: account.role,
                                phone: account.phone || "",
                              });
                              setOpenEditUserDialog(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedItem(account);
                              setDeleteType("user");
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {userAccounts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No user accounts found.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Positions Tab */}
          {activeTab === 2 && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                <Typography variant="h6">Job Positions</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenPositionDialog}
                  sx={{
                    px: 2.5,
                    py: 1,
                    fontSize: '0.875rem',
                    bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : '#000',
                    color: theme.palette.mode === 'dark' ? '#000' : '#fff',
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'primary.dark' : '#1a1a1a',
                    }
                  }}
                >
                  Add Position
                </Button>
              </Box>
              <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Table>
                  <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fafafa' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Position Name</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {positions.map((position) => (
                      <TableRow key={position.id} hover sx={{ '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)' } }}>
                        <TableCell sx={{ py: 1.5, fontSize: '0.875rem', fontWeight: 700 }}>{position.name}</TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>{position.description || "No description"}</TableCell>
                        <TableCell align="right" sx={{ py: 1.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedItem(position);
                              setPositionFormData({
                                name: position.name,
                                description: position.description || "",
                              });
                              setOpenEditPositionDialog(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedItem(position);
                              setDeleteType("position");
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {positions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                          <Typography color="text.secondary">No positions found. Add your first position.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Box>

      {/* Add Staff Dialog */}
      <Dialog open={openStaffDialog} onClose={() => setOpenStaffDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Staff Member</DialogTitle>
        <form onSubmit={handleSubmitStaff}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Full Name"
                value={staffFormData.name}
                onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={staffFormData.email}
                onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                fullWidth
              />
              <TextField
                label="Phone"
                value={staffFormData.phone}
                onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                fullWidth
              />
              <TextField
                label="Position"
                select
                value={staffFormData.positionId}
                onChange={(e) => setStaffFormData({ ...staffFormData, positionId: e.target.value })}
                fullWidth
              >
                {positions.map((pos) => (
                  <MenuItem key={pos.id} value={pos.id}>{pos.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Hire Date"
                type="date"
                value={staffFormData.hireDate}
                onChange={(e) => setStaffFormData({ ...staffFormData, hireDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Salary"
                type="number"
                value={staffFormData.salary}
                onChange={(e) => setStaffFormData({ ...staffFormData, salary: e.target.value })}
                fullWidth
              />
              <TextField
                label="Notes"
                multiline
                rows={3}
                value={staffFormData.notes}
                onChange={(e) => setStaffFormData({ ...staffFormData, notes: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenStaffDialog(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : "Add Staff"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Staff Dialog */}
      <Dialog open={openEditStaffDialog} onClose={() => setOpenEditStaffDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Staff Member</DialogTitle>
        <form onSubmit={handleEditStaff}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Full Name"
                value={staffFormData.name}
                onChange={(e) => setStaffFormData({ ...staffFormData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={staffFormData.email}
                onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                fullWidth
              />
              <TextField
                label="Phone"
                value={staffFormData.phone}
                onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                fullWidth
              />
              <TextField
                label="Position"
                select
                value={staffFormData.positionId}
                onChange={(e) => setStaffFormData({ ...staffFormData, positionId: e.target.value })}
                fullWidth
              >
                {positions.map((pos) => (
                  <MenuItem key={pos.id} value={pos.id}>{pos.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Hire Date"
                type="date"
                value={staffFormData.hireDate}
                onChange={(e) => setStaffFormData({ ...staffFormData, hireDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Salary"
                type="number"
                value={staffFormData.salary}
                onChange={(e) => setStaffFormData({ ...staffFormData, salary: e.target.value })}
                fullWidth
              />
              <TextField
                label="Notes"
                multiline
                rows={3}
                value={staffFormData.notes}
                onChange={(e) => setStaffFormData({ ...staffFormData, notes: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenEditStaffDialog(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : "Update Staff"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add User Account</DialogTitle>
        <form onSubmit={handleSubmitUser}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Full Name"
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Phone"
                value={userFormData.phone}
                onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                fullWidth
              />
              <TextField
                label="Password"
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                required
                fullWidth
                helperText="Minimum 6 characters"
              />
              <TextField
                label="Role"
                select
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                required
                fullWidth
              >
                {userRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label} - {role.description}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenUserDialog(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : "Create Account"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditUserDialog} onClose={() => setOpenEditUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User Account</DialogTitle>
        <form onSubmit={handleEditUser}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Full Name"
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Phone"
                value={userFormData.phone}
                onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                fullWidth
              />
              <TextField
                label="New Password"
                type="password"
                value={userFormData.password}
                onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                fullWidth
                helperText="Leave blank to keep current password"
              />
              <TextField
                label="Role"
                select
                value={userFormData.role}
                onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                required
                fullWidth
              >
                {userRoles.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label} - {role.description}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenEditUserDialog(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : "Update Account"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Add Position Dialog */}
      <Dialog open={openPositionDialog} onClose={() => setOpenPositionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Position</DialogTitle>
        <form onSubmit={handleSubmitPosition}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Position Name"
                value={positionFormData.name}
                onChange={(e) => setPositionFormData({ ...positionFormData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Description"
                multiline
                rows={3}
                value={positionFormData.description}
                onChange={(e) => setPositionFormData({ ...positionFormData, description: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenPositionDialog(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : "Add Position"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Position Dialog */}
      <Dialog open={openEditPositionDialog} onClose={() => setOpenEditPositionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Position</DialogTitle>
        <form onSubmit={handleEditPosition}>
          <DialogContent>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Position Name"
                value={positionFormData.name}
                onChange={(e) => setPositionFormData({ ...positionFormData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Description"
                multiline
                rows={3}
                value={positionFormData.description}
                onChange={(e) => setPositionFormData({ ...positionFormData, description: e.target.value })}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenEditPositionDialog(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : "Update Position"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {deleteType.charAt(0).toUpperCase() + deleteType.slice(1)}</DialogTitle>
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
