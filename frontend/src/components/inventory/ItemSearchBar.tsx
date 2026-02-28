import { Button, Stack, TextField } from "@mui/material";

/**
 * Props for the ItemSearchBar.
 * The parent component (ItemPage) owns the actual search state and data.
 */
type ItemSearchBarProps = {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
};

export default function ItemSearchBar({
  value,
  disabled = false,
  onChange,
  onSearch,
  onClear,
}: ItemSearchBarProps) {
  const canClear = value.trim().length > 0;

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch();
    }
  }

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      alignItems={{ xs: "stretch", sm: "center" }}
      sx={{ mb: 2 }}
    >
      <TextField
        label="Search by name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        fullWidth
      />

      <Stack direction="row" spacing={1.5} justifyContent="flex-end">
        <Button variant="contained" onClick={onSearch} disabled={disabled}>
          Search
        </Button>

        <Button
          variant="outlined"
          onClick={onClear}
          disabled={disabled || !canClear}
        >
          Clear
        </Button>
      </Stack>
    </Stack>
  );
}
