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
  type InventoryItem,
  isLowStock,
} from "../../types/inventory";
import InlineCategorySelect from "./InlineCategorySelect";

interface ItemTableProps {
  pagedItems: InventoryItem[];
  totalItemsCount: number;
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  sortField: "name" | "stock" | "price" | "low_stock_threshold" | "status";
  sortDirection: "asc" | "desc";
  handleSort: (
    field: "name" | "stock" | "price" | "low_stock_threshold" | "status",
  ) => void;
  handleOpenStockLog: (id: number | string) => void;
  categories: Category[];
  updatingItemId: string | number | null;
  handleInlineCategoryChange: (
    item: InventoryItem,
    nextCategoryIds: string[],
  ) => void;
  renderCategoryNames: (ids?: string[]) => string;
  openEditDetails: (item: InventoryItem) => void;
}

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
}: ItemTableProps) {
  return (
    <>
      <TableContainer component={Box} sx={{ overflowX: "auto" }}>
        <Table size="medium" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: "46%" }}>
                <TableSortLabel
                  active={sortField === "name"}
                  hideSortIcon={false}
                  direction={sortField === "name" ? sortDirection : "asc"}
                  onClick={() => handleSort("name")}
                  sx={{ "& .MuiTableSortLabel-icon": { opacity: 1 } }}
                >
                  Product name
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: "12%" }}>
                Category
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={sortField === "stock"}
                  hideSortIcon={false}
                  direction={sortField === "stock" ? sortDirection : "asc"}
                  onClick={() => handleSort("stock")}
                  sx={{ "& .MuiTableSortLabel-icon": { opacity: 1 } }}
                >
                  Stock
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={sortField === "price"}
                  hideSortIcon={false}
                  direction={sortField === "price" ? sortDirection : "asc"}
                  onClick={() => handleSort("price")}
                  sx={{ "& .MuiTableSortLabel-icon": { opacity: 1 } }}
                >
                  Price
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={sortField === "status"}
                  hideSortIcon={false}
                  direction={sortField === "status" ? sortDirection : "asc"}
                  onClick={() => handleSort("status")}
                  sx={{ "& .MuiTableSortLabel-icon": { opacity: 1 } }}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                <TableSortLabel
                  active={sortField === "low_stock_threshold"}
                  hideSortIcon={false}
                  direction={
                    sortField === "low_stock_threshold" ? sortDirection : "asc"
                  }
                  onClick={() => handleSort("low_stock_threshold")}
                  sx={{ "& .MuiTableSortLabel-icon": { opacity: 1 } }}
                >
                  Low Stock Threshold
                </TableSortLabel>
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {pagedItems.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell
                  onClick={() => handleOpenStockLog(item.id)}
                  sx={{
                    whiteSpace: "normal",
                    cursor: "pointer",
                    color: "primary.main",
                  }}
                >
                  {item.name}
                </TableCell>
                <TableCell>
                  {/* eslint-disable-next-line no-constant-condition */}
                  {false ? (
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
                  )}
                </TableCell>
                <TableCell align="right">{item.stock}</TableCell>
                <TableCell align="right">
                  {new Intl.NumberFormat("nb-NO", {
                    style: "currency",
                    currency: "NOK",
                  }).format(Number(item.price))}
                </TableCell>
                <TableCell align="right">
                  {isLowStock(item) ? (
                    <Chip label="Low stock" color="warning" size="small" />
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell align="right">
                  {item.low_stock_threshold ?? "—"}
                </TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => openEditDetails(item)}
                  >
                    Edit
                  </Button>
                </TableCell>
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
