import { createTheme } from "@mui/material/styles";

// Extend the MUI theme to support custom variables
declare module "@mui/material/styles" {
  interface Theme {
    gradients: {
      text: string;
      button: string;
    };
  }

  interface ThemeOptions {
    gradients?: {
      text?: string;
      button?: string;
    };
  }
}

// Shared design tokens
const shape = {
  borderRadius: 14,
};

// LIGHT THEME
export const LightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#895B40" },
    secondary: { main: "#C4A588" },
    background: {
      default: "#f6f3ef",
      paper: "#ffffff",
    },
    text: {
      primary: "#5a3e2b",
      secondary: "rgba(90,62,43,0.8)",
    },
    divider: "rgba(137,91,64,0.3)",
  },

  gradients: {
    text: "linear-gradient(90deg,#895B40,#C4A588,#895B40)",
    button: "linear-gradient(90deg,#C4A588,#895B40)",
  },

  shape,
});

// DARK THEME
export const DarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#C4A588" },
    secondary: { main: "#895B40" },
    background: {
      default: "#0f0f0f",
      paper: "#191919",
    },
    text: {
      primary: "#E0CFC2",
      secondary: "rgba(196,165,136,0.8)",
    },
    divider: "#82543A",
  },

  gradients: {
    text: "linear-gradient(90deg,#C4A588,#895B40,#C4A588)",
    button: "linear-gradient(90deg,#895B40,#C4A588)",
  },

  shape,
});
