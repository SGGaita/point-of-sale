"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Button,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PeopleIcon from "@mui/icons-material/People";
import BadgeIcon from "@mui/icons-material/Badge";
import PersonIcon from "@mui/icons-material/Person";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useTheme as useAppTheme } from "@/contexts/ThemeContext";

const drawerWidth = 260;

const navItems = [
  { icon: <DashboardIcon />, label: "Dashboard", path: "/dashboard" },
  { icon: <RestaurantMenuIcon />, label: "Menu", path: "/dashboard/menu" },
  { icon: <InventoryIcon />, label: "Inventory", path: "/dashboard/inventory" },
  { icon: <ShoppingCartIcon />, label: "Orders", path: "/dashboard/orders" },
  { icon: <ReceiptIcon />, label: "Expenses", path: "/dashboard/expenses" },
  { icon: <BadgeIcon />, label: "Staff", path: "/dashboard/staff" },
  { icon: <PersonIcon />, label: "Waiters", path: "/dashboard/waiters" },
  { icon: <AssessmentIcon />, label: "Reports", path: "/dashboard/reports" },
  { icon: <SettingsIcon />, label: "Settings", path: "/dashboard/settings" },
];

export default function Sidebar({ user, onLogout }) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const { mode, toggleTheme } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavClick = (path) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const drawerContent = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            background: mode === 'dark' 
              ? "linear-gradient(135deg, #90caf9 0%, #42a5f5 100%)"
              : "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
            color: mode === 'dark' ? "#000" : "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          POS
        </Box>
        <Typography
          variant="h6"
          sx={{
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          Point of Sale
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, py: 2 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavClick(item.path)}
                selected={isActive}
                sx={{
                  borderRadius: 1,
                  "&.Mui-selected": {
                    backgroundColor: mode === 'dark' ? "primary.main" : "#000",
                    color: mode === 'dark' ? "#000" : "#fff",
                    "&:hover": {
                      backgroundColor: mode === 'dark' ? "primary.dark" : "#1a1a1a",
                    },
                    "& .MuiListItemIcon-root": {
                      color: mode === 'dark' ? "#000" : "#fff",
                    },
                  },
                  "&:hover": {
                    backgroundColor: mode === 'dark' ? "rgba(144, 202, 249, 0.08)" : "rgba(0,0,0,0.04)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? (mode === 'dark' ? "#000" : "#fff") : "inherit",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      {/* Theme Toggle & User Section */}
      <Box sx={{ p: 2.5, borderTop: 1, borderColor: "divider" }}>
        <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              bgcolor: mode === 'dark' ? "rgba(144, 202, 249, 0.1)" : "rgba(0,0,0,0.04)",
              "&:hover": {
                bgcolor: mode === 'dark' ? "rgba(144, 202, 249, 0.2)" : "rgba(0,0,0,0.08)",
              },
            }}
          >
            {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: mode === 'dark' ? "primary.main" : "#000",
              color: mode === 'dark' ? "#000" : "#fff",
              width: 40,
              height: 40,
              fontWeight: 600,
            }}
          >
            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.name || "User"}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {user?.email}
            </Typography>
          </Box>
        </Box>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={onLogout}
          size="small"
          sx={{
            borderColor: "divider",
            color: "text.primary",
            "&:hover": {
              borderColor: mode === 'dark' ? "primary.main" : "#000",
              bgcolor: mode === 'dark' ? "rgba(144, 202, 249, 0.08)" : "rgba(0,0,0,0.04)",
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  if (!mounted) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: 1,
            borderColor: "divider",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: (theme) => theme.zIndex.drawer + 1,
            bgcolor: "background.paper",
            boxShadow: 2,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: 1,
            borderColor: "divider",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}
