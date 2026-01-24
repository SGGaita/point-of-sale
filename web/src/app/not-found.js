"use client";

import { Box, Typography, Button, Container } from "@mui/material";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#fafafa",
        p: 3,
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 3,
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: 2,
              background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 700,
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            }}
          >
            404
          </Box>

          <Box>
            <Typography
              variant="h3"
              component="h1"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 2 }}
            >
              Page Not Found
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              The page you're looking for doesn't exist or has been moved.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={() => router.push("/dashboard")}
              sx={{
                py: 1.5,
              }}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.back()}
              sx={{
                py: 1.5,
                borderColor: "#000",
                color: "#000",
                "&:hover": {
                  borderColor: "#000",
                  bgcolor: "rgba(0,0,0,0.04)",
                },
              }}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
