import { createTheme } from "@mui/material/styles";

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
  shape: { borderRadius: 14 },
});

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
      primary: "#C4A588",
      secondary: "rgba(196,165,136,0.8)",
    },
    divider: "#82543A",
  },
  shape: { borderRadius: 14 },
});
