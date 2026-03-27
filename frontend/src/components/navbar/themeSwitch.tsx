import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";

export const ThemeSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,

  "& .MuiSwitch-switchBase": {
    margin: 2,
    padding: 0,
    transform: "translateX(6px)",

    "&.Mui-checked": {
      transform: "translateX(26px)",
    },
  },

  "& .MuiSwitch-thumb": {
    backgroundColor: theme.palette.primary.main,
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  "& .MuiSwitch-track": {
    borderRadius: 20,
    opacity: 1,
    backgroundColor: theme.palette.divider,
  },
}));
