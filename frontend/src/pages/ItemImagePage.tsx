import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { PATHS } from "../App";
import {
  getActiveInventory,
  removeItemImage,
  uploadItemImage,
} from "../services/inventoryService";

type InventoryItem = {
  id: number | string;
  name: string;
  stock: number;
  price: number;
  low_stock_threshold: number | null;
  image_url?: string | null;
};

export default function ItemImagePage() {
  const { itemId } = useParams();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        await getActiveInventory();
        const res = await axios.get("/api/inventory/");
        const items = (res.data?.data || []) as InventoryItem[];
        const found = items.find(
          (entry) => String(entry.id) === String(itemId),
        );
        if (!found) {
          setError("Item not found");
        } else {
          setItem(found);
          setPreviewUrl(found.image_url ?? null);
        }
      } catch {
        setError("Failed to load item image page.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [itemId]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={2.5}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Item image
              </Typography>
              {item ? (
                <Typography variant="body1" color="text.secondary">
                  {item.name}
                </Typography>
              ) : null}
            </Box>

            <Button component={Link} to={PATHS.ADD_ITEM} color="inherit">
              Back to items
            </Button>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}

          <Paper sx={{ p: 3 }}>
            {loading ? (
              <Typography>Loading...</Typography>
            ) : (
              <Stack spacing={2}>
                {previewUrl ? (
                  <Box
                    component="img"
                    src={previewUrl}
                    alt={`${item?.name || "Item"} image preview`}
                    sx={{
                      width: "100%",
                      maxHeight: 480,
                      objectFit: "contain",
                      borderRadius: 1,
                      border: 1,
                      borderColor: "divider",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      minHeight: 240,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      color: "text.secondary",
                    }}
                  >
                    No image uploaded yet.
                  </Box>
                )}

                <Typography variant="body2" color="text.secondary">
                  Select an image, review it, and save it as the active item
                  image.
                </Typography>

                <Button variant="outlined" component="label">
                  Select image
                  <input
                    hidden
                    aria-label="Select image"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      const file = target.files?.[0] ?? null;
                      setSelectedFile(file);
                      if (file) {
                        setPreviewUrl(URL.createObjectURL(file));
                        setMessage(null);
                        setError(null);
                      }
                    }}
                  />
                </Button>

                {selectedFile ? (
                  <Typography variant="body2" color="text.secondary">
                    Selected: {selectedFile.name}
                  </Typography>
                ) : null}

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="contained"
                    disabled={!item || !selectedFile}
                    onClick={async () => {
                      if (!item || !selectedFile) return;
                      try {
                        const res = await uploadItemImage(
                          item.id,
                          selectedFile,
                        );
                        setItem((prev) =>
                          prev ? { ...prev, image_url: res.image_url } : prev,
                        );
                        setPreviewUrl(res.image_url);
                        setSelectedFile(null);
                        setMessage("Image uploaded");
                        setError(null);
                      } catch (err: any) {
                        setError(
                          err?.response?.data?.detail ||
                            "Failed to upload image.",
                        );
                      }
                    }}
                  >
                    Save
                  </Button>

                  <Button
                    color="inherit"
                    disabled={!item?.image_url}
                    onClick={async () => {
                      if (!item) return;
                      try {
                        await removeItemImage(item.id);
                        setItem((prev) =>
                          prev ? { ...prev, image_url: null } : prev,
                        );
                        setPreviewUrl(null);
                        setSelectedFile(null);
                        setMessage("Image removed");
                        setError(null);
                      } catch (err: any) {
                        setError(
                          err?.response?.data?.detail ||
                            "Failed to remove image.",
                        );
                      }
                    }}
                  >
                    Remove image
                  </Button>
                </Stack>
              </Stack>
            )}
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
