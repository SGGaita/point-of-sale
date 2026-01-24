import { Box, Typography } from "@mui/material";

export default function SystemBrand() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1.5,
        mb: 3,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: 2,
          background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: 1.5,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
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
  );
}
