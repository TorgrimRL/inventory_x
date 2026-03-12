import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { PATHS } from "../App";
import RequireActiveInventory from "../components/inventory/requireActiveInventory";
import {
  type ActiveInventory,
  getActiveInventory,
  type InventoryMember,
  listInventoryMembers,
  removeInventoryMember,
} from "../services/inventoryService";

function normalizeRole(role?: string) {
  return (role ?? "").toUpperCase();
}

function extractBackendMessage(err: any, fallback: string) {
  const data = err?.response?.data;

  if (!data) return fallback;
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;

  return fallback;
}

export default function InventoryMembersPage() {
  const [active, setActive] = useState<ActiveInventory | null>(null);
  const [members, setMembers] = useState<InventoryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMember, setSelectedMember] = useState<InventoryMember | null>(
    null,
  );
  const [removing, setRemoving] = useState(false);

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState<"success" | "error">(
    "success",
  );

  const isOwner = normalizeRole(active?.role) === "OWNER";

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const [activeInventory, memberList] = await Promise.all([
          getActiveInventory(),
          listInventoryMembers(),
        ]);

        setActive(activeInventory);
        setMembers(memberList);
      } catch (err: any) {
        setError(
          extractBackendMessage(err, "Failed to load inventory members."),
        );
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const roleA = normalizeRole(a.role);
      const roleB = normalizeRole(b.role);

      if (roleA !== roleB) {
        if (roleA === "OWNER") return -1;
        if (roleB === "OWNER") return 1;
      }

      return a.email.localeCompare(b.email);
    });
  }, [members]);

  function canRemove(member: InventoryMember) {
    if (!isOwner) return false;
    if (normalizeRole(member.role) !== "EMPLOYEE") return false;
    return true;
  }

  async function handleConfirmRemove() {
    if (!selectedMember) return;

    setRemoving(true);

    try {
      const res = await removeInventoryMember(selectedMember.id);

      setMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
      setSnackSeverity("success");
      setSnackMessage(res.message || "Employee access removed");
      setSnackOpen(true);
      setSelectedMember(null);
    } catch (err: any) {
      setSnackSeverity("error");
      setSnackMessage(
        extractBackendMessage(err, "Failed to remove employee access."),
      );
      setSnackOpen(true);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <RequireActiveInventory>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight={800}>
                Inventory Members
              </Typography>

              {active && (
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Active inventory: {active.name}
                </Typography>
              )}
            </Box>

            <Stack direction="row" spacing={1.5}>
              {isOwner && (
                <Button
                  variant="outlined"
                  component={Link}
                  to={PATHS.INVITE_EMPLOYEE}
                >
                  + Invite employee
                </Button>
              )}

              <Button variant="outlined" component={Link} to={PATHS.DASHBOARD}>
                Back to dashboard
              </Button>
            </Stack>
          </Stack>

          {loading && <Alert severity="info">Loading members...</Alert>}

          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && (
            <Paper variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedMembers.map((member) => {
                    const removable = canRemove(member);

                    return (
                      <TableRow key={member.id}>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{normalizeRole(member.role)}</TableCell>
                        <TableCell align="right">
                          {removable ? (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => setSelectedMember(member)}
                            >
                              Remove access
                            </Button>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              {normalizeRole(member.role) === "OWNER"
                                ? "Access cannot be removed"
                                : "No access"}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {sortedMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        <Typography color="text.secondary">
                          No members found.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Stack>

        <Dialog
          open={Boolean(selectedMember)}
          onClose={() => !removing && setSelectedMember(null)}
        >
          <DialogTitle>Remove employee access?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {selectedMember?.email} will no longer have access to this
              inventory.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setSelectedMember(null)}
              disabled={removing}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRemove}
              color="error"
              variant="contained"
              disabled={removing}
            >
              {removing ? <CircularProgress size={20} /> : "Remove"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackOpen}
          autoHideDuration={3500}
          onClose={() => setSnackOpen(false)}
        >
          <Alert severity={snackSeverity} onClose={() => setSnackOpen(false)}>
            {snackMessage}
          </Alert>
        </Snackbar>
      </Container>
    </RequireActiveInventory>
  );
}
