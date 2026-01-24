"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import Sidebar from "@/components/dashboard/Sidebar";

const drawerWidth = 260;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("pos_user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("pos_user");
    router.push("/login");
  };

  if (!user) {
    return null;
  }

  const stats = [
    { label: "Today's Sales", value: "$0.00", change: "+0%" },
    { label: "Total Products", value: "0", change: "—" },
    { label: "Pending Orders", value: "0", change: "—" },
    { label: "Total Customers", value: "0", change: "—" },
  ];

  const quickActions = [
    { label: "New Sale", description: "Create a new transaction" },
    { label: "View Reports", description: "Analytics and insights" },
    { label: "Manage Products", description: "Inventory management" },
    { label: "Settings", description: "System configuration" },
  ];

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
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              Welcome back, {user.name || "User"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your business today.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
              mb: 4,
            }}
          >
            {stats.map((stat, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  flex: "1 1 240px",
                  p: 3,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                  {stat.label}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                  <Typography variant="h4" component="div" fontWeight={700}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.change}
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
              Quick Actions
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  sx={{
                    flex: "1 1 220px",
                    p: 2.5,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 0.5,
                    borderColor: "divider",
                    textAlign: "left",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#000",
                      bgcolor: "rgba(0,0,0,0.02)",
                    },
                  }}
                >
                  <Typography variant="body1" fontWeight={600} color="text.primary">
                    {action.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {action.description}
                  </Typography>
                </Button>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
