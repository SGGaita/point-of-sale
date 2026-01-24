"use client";

import { Box, Container, Paper, Typography } from "@mui/material";
import SystemBrand from "@/components/auth/SystemBrand";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        bgcolor: "#fafafa",
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: 1,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "#000",
          color: "#fff",
          p: 6,
        }}
      >
        <Box sx={{ maxWidth: 480 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
            Sign in to access your Point of Sale system and manage your business operations efficiently.
          </Typography>
          <Box sx={{ mt: 6, display: "flex", flexDirection: "column", gap: 3 }}>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                ✓ Real-time Analytics
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Track sales and performance metrics instantly
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                ✓ Inventory Management
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Keep track of stock levels and alerts
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                ✓ Secure & Reliable
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Your data is protected with enterprise-grade security
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box sx={{ display: { xs: "block", md: "none" }, mb: 2 }}>
                <SystemBrand />
              </Box>
              <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                Sign In
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Enter your credentials to access your account
              </Typography>
            </Box>

            <LoginForm />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}
