import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

// MUI theme
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import  theme  from "./theme";
import GlobalStyles from "@mui/material/GlobalStyles";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
  styles={{
    body: {
      // ✅ διακριτικό dot-grid pattern
      backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
      backgroundSize: "12px 12px",
      backgroundPosition: "0 0",
    },
  }}
/>

      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
