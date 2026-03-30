'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptIcon from '@mui/icons-material/Receipt';
import FilterListIcon from '@mui/icons-material/FilterList';
import Sidebar from '@/components/dashboard/Sidebar';
import supabase from '@/lib/supabase';

const drawerWidth = 260;

export default function ExpensesPage() {
  const router = useRouter();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');
  
  // Form state
  const [formData, setFormData] = useState({
    templateId: '',
    category: '',
    amount: '',
    quantity: '',
    unitCost: '',
    description: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('pos_user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  useEffect(() => {
    if (user) {
      loadExpenses();
      loadTemplates();
    }
  }, [user, dateRange, filter]);

  const handleLogout = () => {
    localStorage.removeItem('pos_user');
    router.push('/login');
  };

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('expense_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('expenses')
        .select('*, expense_templates(name, category, unit)')
        .order('timestamp', { ascending: false });

      // Apply date range filter
      const now = new Date();
      if (dateRange === 'today') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        query = query.gte('timestamp', startOfDay);
      } else if (dateRange === 'week') {
        const startOfWeek = new Date(now.setDate(now.getDate() - 7)).toISOString();
        query = query.gte('timestamp', startOfWeek);
      } else if (dateRange === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        query = query.gte('timestamp', startOfMonth);
      }

      // Apply category filter
      if (filter !== 'all') {
        query = query.eq('category', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateId) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        templateId,
        category: template.category,
        description: template.name,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const expenseData = {
        template_id: formData.templateId || null,
        category: formData.category,
        amount: parseFloat(formData.amount),
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        unit_cost: formData.unitCost ? parseFloat(formData.unitCost) : null,
        description: formData.description,
        timestamp: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('expenses')
        .insert([expenseData]);

      if (error) throw error;

      // Reset form and reload
      setFormData({
        templateId: '',
        category: '',
        amount: '',
        quantity: '',
        unitCost: '',
        description: '',
      });
      setShowAddModal(false);
      loadExpenses();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Failed to delete expense');
    }
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0).toFixed(2);
  };

  const getCategories = () => {
    const categories = [...new Set(templates.map(t => t.category))];
    return categories;
  };

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar user={user} onLogout={handleLogout} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '1800px', width: '100%' }}>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                Expenses Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track and manage your business expenses
              </Typography>
            </Box>
            <IconButton onClick={loadExpenses} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Box>

          {/* Stats Cards */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2.5 }}>
            <Box sx={{ flex: '1 1 200px', minWidth: '180px' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 2,
                  height: '100%',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: theme.palette.mode === 'dark' ? 'primary.main' : '#000',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                    Total Expenses
                  </Typography>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'text.secondary' }} />
                </Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                  {getTotalExpenses()} Ksh
                </Typography>
              </Paper>
            </Box>
            
            <Box sx={{ flex: '1 1 200px', minWidth: '180px' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  height: '100%',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(66, 165, 245, 0.1)' : '#f0f7ff',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.dark',
                    boxShadow: '0 2px 8px rgba(25,118,210,0.15)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                    Total Records
                  </Typography>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                </Box>
                <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ mb: 0.5 }}>
                  {expenses.length}
                </Typography>
              </Paper>
            </Box>
            
            <Box sx={{ flex: '1 1 200px', minWidth: '180px' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: 'warning.main',
                  borderRadius: 2,
                  height: '100%',
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 167, 38, 0.1)' : '#fff8e1',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'warning.dark',
                    boxShadow: '0 2px 8px rgba(245,124,0,0.15)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                    Categories
                  </Typography>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'warning.main' }} />
                </Box>
                <Typography variant="h4" fontWeight={700} color="warning.main" sx={{ mb: 0.5 }}>
                  {getCategories().length}
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* Filters and Actions */}
          <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  label="Date Range"
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filter}
                  label="Category"
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <MenuItem value="all">All Categories</MenuItem>
                  {getCategories().map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <IconButton onClick={loadExpenses} color="primary">
                <RefreshIcon />
              </IconButton>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddModal(true)}
            >
              Add Expense
            </Button>
          </Box>
        </Paper>

          {/* Expenses Table */}
          <TableContainer component={Paper}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : expenses.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No expenses found. Add your first expense to get started.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Cost</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id} hover>
                    <TableCell>
                      {new Date(expense.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={expense.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell align="right">
                      {expense.quantity || '-'}
                    </TableCell>
                    <TableCell align="right">
                      {expense.unit_cost ? `${expense.unit_cost} Ksh` : '-'}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {expense.amount} Ksh
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

          {/* Add Expense Dialog */}
          <Dialog open={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Expense</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="Template (Optional)"
              value={formData.templateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              margin="normal"
            >
              <MenuItem value="">None</MenuItem>
              {templates.map(template => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name} ({template.category})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              required
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              margin="normal"
            />

            <TextField
              fullWidth
              required
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              margin="normal"
            />

            <TextField
              fullWidth
              required
              type="number"
              label="Amount (Ksh)"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              margin="normal"
              inputProps={{ step: '0.01' }}
            />

            <TextField
              fullWidth
              type="number"
              label="Quantity (Optional)"
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              margin="normal"
              inputProps={{ step: '0.01' }}
            />

            <TextField
              fullWidth
              type="number"
              label="Unit Cost (Optional)"
              value={formData.unitCost}
              onChange={(e) => setFormData({...formData, unitCost: e.target.value})}
              margin="normal"
              inputProps={{ step: '0.01' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add Expense</Button>
          </DialogActions>
        </form>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
}
