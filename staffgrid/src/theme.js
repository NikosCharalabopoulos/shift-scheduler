import { createTheme } from "@mui/material/styles";
import { grey } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0ea5e9" },
    success: { main: "#22c55e" },
    error:   { main: "#ef4444" },
    warning: { main: "#f59e0b" },
    // ✅ απαλό φόντο για όλο το app
    background: {
      default: grey[50],
      paper: "#ffffff",
    },
    divider: "#e2e8f0",
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily:
      '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    h5: { fontWeight: 700 },
    button: { textTransform: "none" },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0, variant: "outlined" },
      styleOverrides: {
        root: {
          borderColor: "#e2e8f0",
          // ελαφριά “αιώρηση” στο hover για κάρτες
          transition: "box-shadow .2s ease, transform .2s ease",
          "&:hover": {
            boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: { borderRadius: 10, fontWeight: 600 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999 },
      },
    },
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
      styleOverrides: {
        root: { borderRadius: 8, border: "1px solid #e2e8f0" },
      },
    },
  },
});

export default theme;
