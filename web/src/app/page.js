"use client";

import { Box, Typography, Button, Paper } from "@mui/material";
import { useRouter } from "next/navigation";
import SystemBrand from "@/components/auth/SystemBrand";

export default function Home() {
  const router = useRouter();

  const features = [
    { title: "Sales Management", description: "Track and manage all your sales transactions" },
    { title: "Inventory Control", description: "Real-time inventory tracking and alerts" },
    { title: "Analytics & Reports", description: "Comprehensive business insights and reports" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fafafa",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 4,
          px: 3,
        }}
      >
        <Box
          sx={{
            maxWidth: "1200px",
            width: "100%",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 4, md: 8 },
          }}
        >
          <Box 
            sx={{ 
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", md: "flex-start" },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            <SystemBrand />
            <Typography 
              variant="h2" 
              component="h1" 
              fontWeight={700}
              sx={{ 
                mb: 2,
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                lineHeight: 1.2,
              }}
            >
              Modern Point of Sale System
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                mb: 4,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Streamline your business operations with our powerful, intuitive POS solution. 
              Manage sales, inventory, and analytics all in one place.
            </Typography>

            <Box 
              sx={{ 
                display: "flex", 
                gap: 2, 
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
              }}
            >
              <Button
                variant="contained"
                onClick={() => router.push("/login")}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  fontSize: "1.1rem",
                  minWidth: "160px",
                }}
              >
                Sign In
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/login")}
                sx={{ 
                  px: 4, 
                  py: 1.5,
                  fontSize: "1.1rem",
                  minWidth: "160px",
                  borderColor: "#000",
                  color: "#000",
                  "&:hover": {
                    borderColor: "#000",
                    bgcolor: "rgba(0,0,0,0.04)",
                  },
                }}
              >
                Learn More
              </Button>
            </Box>
          </Box>

          <Box 
            sx={{ 
              flex: 1,
              display: "flex", 
              flexDirection: "column", 
              gap: 3,
              width: "100%",
              maxWidth: { xs: "100%", md: "500px" },
            }}
          >
            {features.map((feature, index) => (
              <Paper
                key={index}
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "#fff",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © 2026 Point of Sale System. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
