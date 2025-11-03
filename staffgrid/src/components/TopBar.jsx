// staffgrid/src/components/TopBar.jsx
import React from "react";
import { AppBar, Toolbar, Button, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

export default function TopBar() {
  const location = useLocation();

  // Κρύψε τελείως το TopBar στη σελίδα login
  if (location.pathname === "/login") return null;

  // Έλεγξε αν είμαστε ήδη στο dashboard
  const isDashboard = location.pathname === "/" || location.pathname === "/dashboard";

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: "1px solid #e2e8f0", mb: 2 }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* Αριστερά: brand/title */}
        <Box sx={{ fontWeight: 700, fontSize: 18 }}>StaffGrid</Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Δεξιά: κουμπί Dashboard μόνο αν ΔΕΝ είμαστε στο dashboard */}
        {!isDashboard && (
          <Button
            variant="outlined"
            size="small"
            component={Link}
            to="/"
            sx={{ textTransform: "none" }}
          >
            Home
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
