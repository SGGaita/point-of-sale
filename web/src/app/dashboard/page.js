"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Alert,
  useTheme,
} from "@mui/material";
import Sidebar from "@/components/dashboard/Sidebar";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const drawerWidth = 260;

export default function DashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

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
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/dashboard/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard statistics");
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
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

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDisplayStatus = (status) => {
    if (status === "PENDING") {
      return "UNPAID";
    }
    return status;
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

  if (!user) {
    return null;
  }

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
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: "1600px", width: "100%" }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user.name || "User"}. Here's your business overview.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {stats && (
            <>
              {/* Today's Stats */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2.5 }}>
                <Box sx={{ flex: "1 1 160px", minWidth: "140px" }}>
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
                        boxShadow: "0 2px 8px rgba(46,125,50,0.15)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: "0.7rem" }}>
                        Today's Revenue
                      </Typography>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "success.main" }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="success.main" sx={{ mb: 0.5 }}>
                      {formatCurrency(stats.todayStats.revenue)}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {stats.todayStats.revenueChange >= 0 ? (
                        <TrendingUpIcon fontSize="small" sx={{ color: "success.main" }} />
                      ) : (
                        <TrendingDownIcon fontSize="small" sx={{ color: "error.main" }} />
                      )}
                      <Typography variant="caption" fontWeight={600} color={stats.todayStats.revenueChange >= 0 ? "success.dark" : "error.dark"}>
                        {stats.todayStats.revenueChange >= 0 ? "+" : ""}{stats.todayStats.revenueChange}% from yesterday
                      </Typography>
                    </Box>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 160px", minWidth: "140px" }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: 1,
                      borderColor: "primary.main",
                      borderRadius: 2,
                      height: "100%",
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.1)' : '#e3f2fd',
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "primary.dark",
                        boxShadow: "0 2px 8px rgba(25,118,210,0.15)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: "0.7rem" }}>
                        Today's Orders
                      </Typography>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main" }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="primary.main" sx={{ mb: 0.5 }}>
                      {stats.todayStats.orders}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      {stats.todayStats.ordersChange >= 0 ? (
                        <TrendingUpIcon fontSize="small" sx={{ color: "success.main" }} />
                      ) : (
                        <TrendingDownIcon fontSize="small" sx={{ color: "error.main" }} />
                      )}
                      <Typography variant="caption" fontWeight={600} color={stats.todayStats.ordersChange >= 0 ? "success.dark" : "error.dark"}>
                        {stats.todayStats.ordersChange >= 0 ? "+" : ""}{stats.todayStats.ordersChange}% from yesterday
                      </Typography>
                    </Box>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 160px", minWidth: "140px" }}>
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
                        borderColor: "#000",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: "0.7rem" }}>
                        Total Products
                      </Typography>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#9e9e9e" }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                      {stats.overallStats.totalProducts}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Menu items available
                    </Typography>
                  </Paper>
                </Box>

                <Box sx={{ flex: "1 1 160px", minWidth: "140px" }}>
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
                        boxShadow: "0 2px 8px rgba(211,47,47,0.15)",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600, fontSize: "0.7rem" }}>
                        Unpaid Orders
                      </Typography>
                      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "error.main" }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="error.main" sx={{ mb: 0.5 }}>
                      {stats.overallStats.pendingOrders}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Requires attention
                    </Typography>
                  </Paper>
                </Box>
              </Box>

              {/* Charts Section */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3 }}>
                {/* Revenue Chart */}
                <Box sx={{ flex: "1 1 500px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: "divider", borderRadius: 2, height: "100%" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="h6" fontWeight={700}>
                        Revenue Trend (Last 7 Days)
                      </Typography>
                      {selectedDay && (
                        <Chip
                          label="Click to clear selection"
                          size="small"
                          onDelete={() => setSelectedDay(null)}
                          sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.1)' : '#e3f2fd' }}
                        />
                      )}
                    </Box>
                    {selectedDay && (
                      <Box sx={{ mb: 2, p: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(102, 187, 106, 0.1)' : '#f1f8f4', borderRadius: 1, border: 1, borderColor: "success.light" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Selected: {selectedDay.date}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 3, mt: 0.5 }}>
                          <Box>
                            <Typography variant="body2" fontWeight={700} color="success.main">
                              {formatCurrency(selectedDay.revenue)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Revenue
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={700} color="primary.main">
                              {selectedDay.orders}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Orders
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart 
                        data={stats.dailyRevenue}
                        onClick={(data) => {
                          if (data && data.activePayload) {
                            setSelectedDay(data.activePayload[0].payload);
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          style={{ cursor: "pointer" }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value) => formatCurrency(value)}
                          contentStyle={{ 
                            borderRadius: 8, 
                            border: "1px solid #e0e0e0",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                          }}
                          cursor={{ stroke: "#2e7d32", strokeWidth: 2, strokeDasharray: "5 5" }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#2e7d32" 
                          strokeWidth={2} 
                          dot={{ r: 5, fill: "#2e7d32", strokeWidth: 2, stroke: "#fff", cursor: "pointer" }}
                          activeDot={{ r: 7, fill: "#1b5e20", strokeWidth: 3, stroke: "#fff", cursor: "pointer" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 1 }}>
                      💡 Click on any point to view details
                    </Typography>
                  </Paper>
                </Box>

                {/* Orders Chart */}
                <Box sx={{ flex: "1 1 500px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: "divider", borderRadius: 2, height: "100%" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="h6" fontWeight={700}>
                        Orders Volume (Last 7 Days)
                      </Typography>
                      {selectedDay && (
                        <Chip
                          label="Click to clear selection"
                          size="small"
                          onDelete={() => setSelectedDay(null)}
                          sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.1)' : '#e3f2fd' }}
                        />
                      )}
                    </Box>
                    {selectedDay && (
                      <Box sx={{ mb: 2, p: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.1)' : '#e3f2fd', borderRadius: 1, border: 1, borderColor: "primary.light" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          Selected: {selectedDay.date}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 3, mt: 0.5 }}>
                          <Box>
                            <Typography variant="body2" fontWeight={700} color="primary.main">
                              {selectedDay.orders}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Orders
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={700} color="success.main">
                              {formatCurrency(selectedDay.revenue)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Revenue
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>
                              {selectedDay.orders > 0 ? formatCurrency(selectedDay.revenue / selectedDay.orders) : formatCurrency(0)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Avg Order
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    )}
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart 
                        data={stats.dailyRevenue}
                        onClick={(data) => {
                          if (data && data.activePayload) {
                            setSelectedDay(data.activePayload[0].payload);
                          }
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          style={{ cursor: "pointer" }}
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{ 
                            borderRadius: 8, 
                            border: "1px solid #e0e0e0",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                          }}
                          cursor={{ fill: "rgba(25, 118, 210, 0.1)" }}
                        />
                        <Bar 
                          dataKey="orders" 
                          fill="#1976d2" 
                          radius={[4, 4, 0, 0]}
                          cursor="pointer"
                          activeBar={{ fill: "#1565c0" }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center", mt: 1 }}>
                      💡 Click on any bar to view details
                    </Typography>
                  </Paper>
                </Box>
              </Box>

              {/* Bottom Section */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {/* Recent Orders */}
                <Box sx={{ flex: "1 1 500px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                      Recent Orders
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {stats.recentOrders.slice(0, 8).map((order) => (
                        <Box
                          key={order.id}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 1.5,
                            bgcolor: theme.palette.mode === 'dark' ? 'background.card' : '#fafafa',
                            borderRadius: 1,
                            border: 1,
                            borderColor: "divider",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              Order #{order.order_number}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.waiter} • {formatDate(order.timestamp)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(order.total)}
                            </Typography>
                            <Chip
                              label={getDisplayStatus(order.status)}
                              color={getStatusColor(order.status)}
                              size="small"
                              sx={{ fontWeight: 600, minWidth: 70 }}
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Box>

                {/* Top Selling Items */}
                <Box sx={{ flex: "1 1 400px", minWidth: "300px" }}>
                  <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                      Top Selling Items
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {stats.topItems.map((item, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 1.5,
                            bgcolor: theme.palette.mode === 'dark' ? 'background.card' : '#fafafa',
                            borderRadius: 1,
                            border: 1,
                            borderColor: "divider",
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {item.quantity} sold
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={700} color="success.main">
                            {formatCurrency(item.revenue)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
