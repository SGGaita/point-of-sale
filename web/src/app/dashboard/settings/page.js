"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  InputAdornment,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BusinessIcon from "@mui/icons-material/Business";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Sidebar from "@/components/dashboard/Sidebar";

const drawerWidth = 260;

const currencyOptions = [
  { code: 'KES', name: 'Kenya Shillings', symbol: 'KSh' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
];

export default function SettingsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({
    // Currency
    currency_code: 'KES',
    currency_name: 'Kenya Shillings',
    currency_symbol: 'KSh',
    currency_position: 'before',
    decimal_places: '2',
    
    // Tax
    vat_rate: '16',
    vat_enabled: 'true',
    tax_inclusive: 'false',
    
    // Business
    business_name: 'My Restaurant',
    business_address: '',
    business_phone: '',
    business_email: '',
    receipt_footer: 'Thank you for your business!',
    
    // Notifications
    low_stock_threshold: '10',
    enable_email_notifications: 'false',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const userData = localStorage.getItem("pos_user");
    if (!userData) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(userData));
    fetchSettings();
  }, [router, mounted]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const data = await response.json();
      
      if (response.ok) {
        const settingsMap = {};
        const formDataMap = {};
        
        data.settings.forEach(setting => {
          settingsMap[setting.setting_key] = setting;
          formDataMap[setting.setting_key] = setting.setting_value;
        });
        
        setSettings(settingsMap);
        setFormData(prev => ({ ...prev, ...formDataMap }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("pos_user");
    router.push("/login");
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleCurrencyChange = (currencyCode) => {
    const currency = currencyOptions.find(c => c.code === currencyCode);
    if (currency) {
      setFormData(prev => ({
        ...prev,
        currency_code: currency.code,
        currency_name: currency.name,
        currency_symbol: currency.symbol,
      }));
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);

    try {
      const updates = Object.keys(formData).map(async (key) => {
        const setting = settings[key];
        if (setting) {
          return fetch(`/api/settings/${setting.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              settingValue: formData[key],
              updatedBy: user?.id,
            }),
          });
        }
      });

      await Promise.all(updates);
      
      showSnackbar("Settings saved successfully!");
      fetchSettings();
    } catch (error) {
      showSnackbar("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (!mounted || !user) return null;

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
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "1200px", width: "100%" }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              System Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Configure your restaurant's system preferences
            </Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {/* Currency Settings */}
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                      <AttachMoneyIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Currency Settings
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                      <TextField
                        label="Currency"
                        select
                        value={formData.currency_code}
                        onChange={(e) => handleCurrencyChange(e.target.value)}
                        fullWidth
                      >
                        {currencyOptions.map((currency) => (
                          <MenuItem key={currency.code} value={currency.code}>
                            {currency.name} ({currency.symbol})
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        label="Currency Symbol"
                        value={formData.currency_symbol}
                        onChange={(e) => handleChange('currency_symbol', e.target.value)}
                        fullWidth
                        helperText="Symbol to display (e.g., KSh, $, €)"
                      />

                      <TextField
                        label="Symbol Position"
                        select
                        value={formData.currency_position}
                        onChange={(e) => handleChange('currency_position', e.target.value)}
                        fullWidth
                      >
                        <MenuItem value="before">Before Amount (KSh 100)</MenuItem>
                        <MenuItem value="after">After Amount (100 KSh)</MenuItem>
                      </TextField>

                      <TextField
                        label="Decimal Places"
                        type="number"
                        value={formData.decimal_places}
                        onChange={(e) => handleChange('decimal_places', e.target.value)}
                        fullWidth
                        inputProps={{ min: 0, max: 4 }}
                        helperText="Number of decimal places to display"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Tax Settings */}
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                      <ReceiptIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Tax Settings
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.vat_enabled === 'true'}
                            onChange={(e) => handleChange('vat_enabled', e.target.checked ? 'true' : 'false')}
                          />
                        }
                        label="Enable VAT"
                      />

                      <TextField
                        label="VAT Rate"
                        type="number"
                        value={formData.vat_rate}
                        onChange={(e) => handleChange('vat_rate', e.target.value)}
                        fullWidth
                        disabled={formData.vat_enabled !== 'true'}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        }}
                        helperText="Value Added Tax percentage"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.tax_inclusive === 'true'}
                            onChange={(e) => handleChange('tax_inclusive', e.target.checked ? 'true' : 'false')}
                            disabled={formData.vat_enabled !== 'true'}
                          />
                        }
                        label="Tax Inclusive Pricing"
                      />
                      
                      <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
                        {formData.tax_inclusive === 'true' 
                          ? 'Prices include tax (tax is calculated from total)'
                          : 'Tax is added to prices at checkout'}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Business Information */}
              <Grid item xs={12}>
                <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                      <BusinessIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Business Information
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2.5}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Business Name"
                          value={formData.business_name}
                          onChange={(e) => handleChange('business_name', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Business Phone"
                          value={formData.business_phone}
                          onChange={(e) => handleChange('business_phone', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Business Email"
                          type="email"
                          value={formData.business_email}
                          onChange={(e) => handleChange('business_email', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Business Address"
                          value={formData.business_address}
                          onChange={(e) => handleChange('business_address', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <TextField
                          label="Receipt Footer Message"
                          value={formData.receipt_footer}
                          onChange={(e) => handleChange('receipt_footer', e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                          helperText="Message displayed at the bottom of receipts"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Notification Settings */}
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
                      <NotificationsIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Notifications
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                      <TextField
                        label="Low Stock Threshold"
                        type="number"
                        value={formData.low_stock_threshold}
                        onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
                        fullWidth
                        helperText="Alert when inventory falls below this quantity"
                      />

                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.enable_email_notifications === 'true'}
                            onChange={(e) => handleChange('enable_email_notifications', e.target.checked ? 'true' : 'false')}
                          />
                        }
                        label="Enable Email Notifications"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Save Button */}
              <Grid item xs={12}>
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={fetchSettings}
                    disabled={saving}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    onClick={handleSaveSettings}
                    disabled={saving}
                    sx={{ px: 4 }}
                  >
                    {saving ? "Saving..." : "Save Settings"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          )}
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
