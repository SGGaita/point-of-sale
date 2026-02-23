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
  Button,
  CircularProgress,
  Chip,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Sidebar from "@/components/dashboard/Sidebar";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const drawerWidth = 260;

export default function WaitersReportPage() {
  const router = useRouter();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('daily');
  const [reportData, setReportData] = useState(null);

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
      fetchWaiterReports();
    }
  }, [user, period]);

  const fetchWaiterReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/reports/waiters?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch waiter reports');
      }
      const data = await response.json();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching waiter reports:', err);
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

  const handleViewWaiter = (waiterName) => {
    router.push(`/dashboard/waiters/${encodeURIComponent(waiterName)}`);
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
            bgcolor: "background.default",
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    );
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
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "1800px", width: "100%" }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Waiter Performance Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track individual waiter performance and sales metrics
            </Typography>
          </Box>

          {/* Period Selector */}
          <Paper elevation={0} sx={{ p: 2, mb: 2.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              <PersonIcon sx={{ color: "text.secondary" }} />
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
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          {reportData && (
            <>
              {/* Summary Cards */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
                <Box sx={{ flex: "1 1 180px", minWidth: "160px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: "success.main",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(102, 187, 106, 0.1)' : '#f1f8f4',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'success.dark',
                        boxShadow: '0 2px 8px rgba(46,125,50,0.15)',
                      },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                      Total Revenue
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mt: 0.5 }}>
                      {formatCurrency(reportData.summary.totalRevenue)}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 180px", minWidth: "160px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: "primary.main",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.1)' : '#e3f2fd',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)',
                      },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                      Total Orders
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
                      {reportData.summary.totalOrders}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 180px", minWidth: "160px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 2,
                      height: "100%",
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: theme.palette.mode === 'dark' ? 'primary.main' : '#000',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                      Avg Order Value
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5 }}>
                      {formatCurrency(reportData.summary.avgOrderValue)}
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 180px", minWidth: "160px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: "error.main",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.1)' : '#fef5f5',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'error.dark',
                        boxShadow: '0 2px 8px rgba(211,47,47,0.15)',
                      },
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: '0.7rem' }}>
                      Unpaid Amount
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="error.main" sx={{ mt: 0.5 }}>
                      {formatCurrency(reportData.summary.unpaidAmount)}
                    </Typography>
                  </Paper>
                </Box>
              </Box>

              {/* Charts */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
                {/* Daily Revenue Chart */}
                <Box sx={{ flex: "1 1 450px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                      Daily Revenue Trend
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

                {/* Daily Orders Chart */}
                <Box sx={{ flex: "1 1 450px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 2.5, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                      Paid vs Unpaid Orders
                    </Typography>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={reportData.dailyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e0e0e0" }} />
                        <Bar dataKey="paidOrders" fill="#2e7d32" radius={[4, 4, 0, 0]} name="Paid" />
                        <Bar dataKey="unpaidOrders" fill="#d32f2f" radius={[4, 4, 0, 0]} name="Unpaid" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Box>
              </Box>

              {/* Waiter Performance Table */}
              <Paper elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider", bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafafa' }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Waiter Performance Breakdown
                  </Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : '#fafafa' }}>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Waiter</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Orders</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Paid Orders</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Unpaid Orders</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Revenue</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Unpaid Amount</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Avg Order</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', py: 1.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData.waiterStats.length > 0 ? (
                        reportData.waiterStats.map((waiter, index) => (
                          <TableRow key={index} hover sx={{ "&:hover": { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.02)' } }}>
                            <TableCell sx={{ py: 1.5 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <PersonIcon sx={{ fontSize: '1.1rem', color: "text.secondary" }} />
                                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                                  {waiter.waiter}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.5 }}>
                              <Chip 
                                label={waiter.totalOrders} 
                                size="small" 
                                sx={{ fontWeight: 600, minWidth: 50, fontSize: '0.7rem', height: 24 }} 
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.5 }}>
                              <Chip 
                                label={waiter.paidOrders} 
                                size="small" 
                                color="success"
                                sx={{ fontWeight: 600, minWidth: 50, fontSize: '0.7rem', height: 24 }} 
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.5 }}>
                              <Chip 
                                label={waiter.unpaidOrders} 
                                size="small" 
                                color="error"
                                sx={{ fontWeight: 600, minWidth: 50, fontSize: '0.7rem', height: 24 }} 
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.5 }}>
                              <Typography variant="body2" fontWeight={700} color="success.main" sx={{ fontSize: '0.875rem' }}>
                                {formatCurrency(waiter.paidRevenue)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.5 }}>
                              <Typography variant="body2" fontWeight={700} color="error.main" sx={{ fontSize: '0.875rem' }}>
                                {formatCurrency(waiter.unpaidAmount)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.5 }}>
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.875rem' }}>
                                {formatCurrency(waiter.avgOrderValue)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleViewWaiter(waiter.waiter)}
                                sx={{
                                  px: 2,
                                  py: 0.5,
                                  fontSize: '0.75rem',
                                  borderColor: 'divider',
                                  color: 'text.primary',
                                  "&:hover": { 
                                    borderColor: theme.palette.mode === 'dark' ? 'primary.main' : '#000',
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(0,0,0,0.04)'
                                  }
                                }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">No waiter data available</Typography>
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
    </Box>
  );
}
