import { useTheme } from "@mui/material/styles";

type GoogleAuthButtonVariant = "sign_in" | "sign_up";

interface GoogleAuthButtonProps {
  onClick: () => void;
  variant: GoogleAuthButtonVariant;
  disabled?: boolean;
}

export default function GoogleAuthButton({
  onClick,
  variant,
  disabled = false,
}: GoogleAuthButtonProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const label =
    variant === "sign_up" ? "Sign up with Google" : "Sign in with Google";

  const src =
    variant === "sign_up"
      ? isDark
        ? "/auth/signupdark.svg"
        : "/auth/signuplight.svg"
      : isDark
        ? "/auth/signindark.svg"
        : "/auth/signinlight.svg";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        margin: "8px auto 0",
        cursor: disabled ? "default" : "pointer",
        display: "block",
        width: "100%",
        maxWidth: 250,
      }}
    >
      <img
        src={src}
        alt={label}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
        }}
      />
    </button>
  );
}
