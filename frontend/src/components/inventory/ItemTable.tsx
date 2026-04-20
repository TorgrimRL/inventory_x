import {
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@mui/material";

import {
  type Category,
  type InventoryCustomField,
  type InventoryItem,
  isLowStock,
} from "../../types/itemPageTypes";
import InlineCategorySelect from "./InlineCategorySelect";

interface ItemTableProps {
  pagedItems: InventoryItem[];
  totalItemsCount: number;
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  sortField: string;
  sortDirection: "asc" | "desc";
  handleSort: (field: string) => void;
  handleOpenStockLog: (id: number | string) => void;
  categories: Category[];
  updatingItemId: string | number | null;
  handleInlineCategoryChange: (
    item: InventoryItem,
    nextCategoryIds: string[],
  ) => void;
  renderCategoryNames: (ids?: string[]) => string;
  openEditDetails: (item: InventoryItem) => void;
  customFields: InventoryCustomField[];
}

function getCustomFieldValue(item: InventoryItem, fieldId: string) {
  if (!item.custom_fields) return "—";
  try {
    const fields =
      typeof item.custom_fields === "string"
        ? JSON.parse(item.custom_fields)
        : item.custom_fields;
    return fields[fieldId] ?? "—";
  } catch {
    return "—";
  }
}

type ColumnDef = {
  id: string;
  label: string;
  align?: "left" | "right" | "center";
  width?: string;
  sortField?: string;
  render: (item: InventoryItem) => React.ReactNode;
};

export default function ItemTable({
  pagedItems,
  totalItemsCount,
  page,
  setPage,
  rowsPerPage,
  sortField,
  sortDirection,
  handleSort,
  handleOpenStockLog,
  categories,
  updatingItemId,
  handleInlineCategoryChange,
  renderCategoryNames,
  openEditDetails,
  customFields = [],
}: ItemTableProps) {
  const columns: ColumnDef[] = [
    {
      id: "name",
      label: "Product name",
      width: "46%",
      sortField: "name",
      render: (item) => (
        <Box
          component="span"
          onClick={() => handleOpenStockLog(item.id)}
          sx={{ cursor: "pointer", color: "primary.main" }}
        >
          {item.name}
        </Box>
      ),
    },
    {
      id: "category",
      label: "Category",
      width: "12%",
      render: (item) =>
        // eslint-disable-next-line no-constant-condition
        false ? (
          <Stack spacing={1} sx={{ minWidth: 160, maxWidth: 190 }}>
            <InlineCategorySelect
              item={item}
              categories={categories}
              updating={updatingItemId === item.id}
              onSave={handleInlineCategoryChange}
              renderCategoryNames={renderCategoryNames}
            />
          </Stack>
        ) : (
          renderCategoryNames((item.category_ids || []).map(String))
        ),
    },
    {
      id: "stock",
      label: "Stock",
      align: "right",
      sortField: "stock",
      render: (item) => item.stock,
    },
    {
      id: "price",
      label: "Price",
      align: "right",
      sortField: "price",
      render: (item) =>
        new Intl.NumberFormat("nb-NO", {
          style: "currency",
          currency: "NOK",
        }).format(Number(item.price)),
    },
    {
      id: "status",
      label: "Status",
      align: "right",
      sortField: "status",
      render: (item) =>
        isLowStock(item) ? (
          <Chip label="Low stock" color="warning" size="small" />
        ) : (
          "—"
        ),
    },
    {
      id: "low_stock_threshold",
      label: "Low Stock Threshold",
      align: "center",
      sortField: "low_stock_threshold",
      render: (item) => item.low_stock_threshold ?? "—",
    },
    ...customFields.map((field) => ({
      id: field.id,
      label: field.name,
      align: "center" as const,
      sortField: field.id,
      render: (item: InventoryItem) => getCustomFieldValue(item, field.id),
    })),
    {
      id: "actions",
      label: "Actions",
      align: "right",
      render: (item) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => openEditDetails(item)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <>
      <TableContainer component={Box} sx={{ overflowX: "auto" }}>
        <Table size="medium" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || "left"}
                  sx={{ fontWeight: 600, width: col.width }}
                >
                  {col.sortField ? (
                    <TableSortLabel
                      active={sortField === col.sortField}
                      hideSortIcon={false}
                      direction={
                        sortField === col.sortField ? sortDirection : "asc"
                      }
                      onClick={() => handleSort(col.sortField!)}
                      sx={{ "& .MuiTableSortLabel-icon": { opacity: 1 } }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {pagedItems.map((item) => (
              <TableRow key={item.id} hover>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align || "left"}
                    sx={
                      col.id === "name" ? { whiteSpace: "normal" } : undefined
                    }
                  >
                    {col.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalItemsCount}
        page={page}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[30]}
      />
    </>
  );
}
