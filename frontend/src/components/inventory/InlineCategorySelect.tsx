import { Checkbox, ListItemText, MenuItem, TextField } from "@mui/material";
import { useState } from "react";

type Category = {
  id: string;
  name: string;
};

type InventoryItem = {
  id: number | string;
  category_ids?: string[];
};

type InlineCategorySelectProps = {
  item: InventoryItem;
  categories: Category[];
  updating: boolean;
  onSave: (item: any, nextCategoryIds: string[]) => void;
  renderCategoryNames: (ids: string[]) => string;
};

export default function InlineCategorySelect({
  item,
  categories,
  updating,
  onSave,
  renderCategoryNames,
}: InlineCategorySelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    (item.category_ids || []).map(String),
  );
  const [originalIds, setOriginalIds] = useState<string[]>([]);

  const propIdsStr = (item.category_ids || []).map(String).sort().join(",");
  const [prevPropIdsStr, setPrevPropIdsStr] = useState(propIdsStr);

  if (propIdsStr !== prevPropIdsStr) {
    setPrevPropIdsStr(propIdsStr);
    if (!open) {
      setSelectedIds((item.category_ids || []).map(String));
    }
  }

  return (
    <TextField
      select
      size="small"
      value={selectedIds}
      disabled={updating}
      onChange={(e) => {
        const value = e.target.value;
        setSelectedIds(
          Array.isArray(value) ? value.map(String) : String(value).split(","),
        );
      }}
      SelectProps={{
        multiple: true,
        displayEmpty: true,
        open: open,
        onOpen: () => {
          setOpen(true);
          const currentIds = (item.category_ids || []).map(String);
          setSelectedIds(currentIds);
          setOriginalIds(currentIds);
        },
        onClose: () => {
          setOpen(false);
          // Compare before and after to see if we actually need to save
          const before = [...originalIds].sort().join(",");
          const after = [...selectedIds].sort().join(",");

          if (before !== after) {
            onSave(item, selectedIds);
          }
        },
        MenuProps: {
          disableAutoFocusItem: true,
          keepMounted: true,
        },
        renderValue: (selected) => {
          const ids = selected as string[];
          if (ids.length === 0) return "No category added";
          return renderCategoryNames(ids);
        },
      }}
      sx={{ minWidth: 160, maxWidth: 190 }}
    >
      {categories.map((category) => (
        <MenuItem key={category.id} value={category.id}>
          <Checkbox
            checked={selectedIds.includes(String(category.id))}
            size="small"
          />
          <ListItemText primary={category.name} />
        </MenuItem>
      ))}
    </TextField>
  );
}
