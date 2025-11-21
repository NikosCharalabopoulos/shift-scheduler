// staffgrid/src/pages/Login.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
} from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export default function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("pass1234");

  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await login(email, password);
    if (res.ok) window.location.href = "/dashboard";
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e293b 100%)",
        color: "common.white",
        px: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 960 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          alignItems="stretch"
        >
          {/* Left hero */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "common.white",
                  boxShadow: "0 10px 25px rgba(15,23,42,0.7)",
                }}
              >
                <CalendarMonthIcon fontSize="small" />
              </Box>
              <Typography variant="h5" fontWeight={700}>
                StaffGrid
              </Typography>
            </Stack>

            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ mb: 1, lineHeight: 1.1 }}
            >
              Smarter scheduling<br />for modern teams.
            </Typography>

            <Typography
              variant="body1"
              sx={{ mb: 3, color: "rgba(248,250,252,0.75)" }}
            >
              Manage shifts, time off and availability in one place —
              for managers and employees.
            </Typography>
          </Box>

          {/* Login card */}
          <Paper
            sx={{
              flexBasis: { xs: "100%", md: 360 },
              backdropFilter: "blur(16px)",
              background: "rgba(15,23,42,0.9)",
              borderRadius: 3,
              border: "1px solid rgba(148,163,184,0.4)",
              p: 3,
            }}
          >
            <Typography variant="h6"
  fontWeight={600}
  sx={{ mb: 2, color: "white" }}>
              Sign in
            </Typography>

            <form onSubmit={onSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  type="email"
                  size="small"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  InputLabelProps={{
                    shrink: true,
                    sx: { color: "rgba(255,255,255,0.7)" },
                  }}
                  InputProps={{
                    sx: {
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.3)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.5)",
                      },
                    },
                  }}
                />

                <TextField
                  label="Password"
                  type="password"
                  size="small"
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  InputLabelProps={{
                    shrink: true,
                    sx: { color: "rgba(255,255,255,0.7)" },
                  }}
                  InputProps={{
                    sx: {
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.3)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255,255,255,0.5)",
                      },
                    },
                  }}
                />

                {error && (
                  <Typography variant="body2" color="error">
                    {error}
                  </Typography>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  fullWidth
                  disabled={loading}
                  sx={{ mt: 1, fontWeight: 600 }}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
