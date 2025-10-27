// src/theme.js
import { createTheme } from "@mui/material/styles";

// ΑΛΛΑΞΕ αυτό:
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0ea5e9" },
    success: { main: "#22c55e" },
    error:   { main: "#ef4444" },
    warning: { main: "#f59e0b" },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    h5: { fontWeight: 700 },
    button: { textTransform: "none" },
  },
  components: {
    MuiButton: { defaultProps: { size: "small" } },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          padding: "6px 12px",
          borderRadius: 8,
          "&.Mui-selected": {
            color: "#fff",
            backgroundColor: "#0ea5e9",
            "&:hover": { backgroundColor: "#0b94d0" },
          },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: { root: { borderRadius: 8, border: "1px solid #e2e8f0" } },
    },
    MuiPaper: {
      defaultProps: { elevation: 0, variant: "outlined" },
      styleOverrides: { root: { borderColor: "#e2e8f0" } },
    },
    MuiTableCell: { styleOverrides: { head: { fontWeight: 700 } } },
  },
});
