"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  Alert,
} from "@mui/material";
import Link from "next/link";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle registration logic here
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    console.log("Registration attempt:", formData);
    // In a real app, you would make an API call here
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <TextField
        id="name"
        name="name"
        label="Full Name"
        type="text"
        fullWidth
        required
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter your full name"
      />

      <TextField
        id="email"
        name="email"
        label="Email"
        type="email"
        fullWidth
        required
        value={formData.email}
        onChange={handleChange}
        placeholder="Enter your email"
      />

      <TextField
        id="password"
        name="password"
        label="Password"
        type="password"
        fullWidth
        required
        value={formData.password}
        onChange={handleChange}
        placeholder="Enter your password"
      />

      <TextField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        fullWidth
        required
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="Confirm your password"
      />

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 1 }}
      >
        Create Account
      </Button>

      <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
        Already have an account?{" "}
        <MuiLink component={Link} href="/login" underline="hover">
          Sign in
        </MuiLink>
      </Typography>
    </Box>
  );
}
