import React, {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Alert, Box, Button, Paper, Stack, TextField, Typography,} from "@mui/material";

import axios from "../../services/apiClient";

type BackendDetail =
    | string
    | {
    name?: string[];
    orgNumber?: string[];
};

function extractBackendMessages(detail: BackendDetail | undefined): string[] {
    if (!detail) return [];
    if (typeof detail === "string") return [detail];

    const msgs: string[] = [];
    if (Array.isArray(detail.name)) msgs.push(...detail.name);
    if (Array.isArray(detail.orgNumber)) msgs.push(...detail.orgNumber);
    return msgs;
}

export default function RegisterInventoryForm() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [orgNumber, setOrgNumber] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [success, setSuccess] = useState<string | null>(null);
    const [frontendErrors, setFrontendErrors] = useState<string[]>([]);
    const [backendErrors, setBackendErrors] = useState<string[]>([]);

    const allErrors = useMemo(
        () => [...frontendErrors, ...backendErrors],
        [frontendErrors, backendErrors],
    );

    const validate = (): string[] => {
        const errs: string[] = [];
        if (!name.trim()) errs.push("Please enter business name");
        if (!orgNumber.trim()) errs.push("Please enter org number");
        return errs;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setSuccess(null);
        setBackendErrors([]);

        const errs = validate();
        setFrontendErrors(errs);
        if (errs.length > 0) return;

        setIsSubmitting(true);
        try {
            const payload = {name: name.trim(), orgNumber: orgNumber.trim()};
            const res = await axios.post("/api/inventory/register/", payload);

            if (res.status === 201) {
                setFrontendErrors([]);
                setBackendErrors([]);
                setSuccess("Business registered");
                setTimeout(() => navigate("/inventories"), 0);
            } else {
                setBackendErrors(["Unexpected response from server."]);
            }
        } catch (err: any) {
            const status: number | undefined = err?.response?.status;
            const detail: BackendDetail | undefined = err?.response?.data?.detail;

            const msgs = extractBackendMessages(detail);
            if (msgs.length === 0) {
                if (status === 401) msgs.push("Authentication credentials were not provided.");
                else if (status === 403) msgs.push("Forbidden.");
                else msgs.push("Something went wrong. Please try again.");
            }
            setBackendErrors(msgs);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{minHeight: "100vh", bgcolor: "#fff", display: "flex"}}>
            <Box
                sx={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: {xs: "1fr", md: "520px 1fr"},
                }}
            >
                {/* LEFT */}
                <Box
                    sx={{
                        px: {xs: 3, sm: 6},
                        py: {xs: 6, sm: 8},
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    <Box sx={{width: 14, height: 14, bgcolor: "#7cfff0", borderRadius: 1, mb: 2}}/>

                    <Typography variant="h4" fontWeight={800} sx={{letterSpacing: -0.5}}>
                        Register
                    </Typography>

                    <Typography sx={{mt: 1, color: "text.secondary", maxWidth: 460}}>
                        Manage all your inventory efficiently
                    </Typography>

                    <Paper
                        elevation={0}
                        sx={{
                            mt: 3,
                            p: 0,
                            maxWidth: 460,
                        }}
                    >
                        {allErrors.length > 0 && (
                            <Alert severity="error" sx={{mb: 2}}>
                                <Stack spacing={0.5}>
                                    {allErrors.map((m, i) => (
                                        <div key={`${m}-${i}`}>{m}</div>
                                    ))}
                                </Stack>
                            </Alert>
                        )}

                        {success && (
                            <Alert severity="success" sx={{mb: 2}}>
                                {success}
                            </Alert>
                        )}

                        <Box component="form" onSubmit={onSubmit} noValidate>
                            <Stack spacing={2}>
                                <TextField
                                    label="Business name"
                                    placeholder="Business name" // beholder for testene
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    fullWidth
                                />

                                <TextField
                                    label="Org Number"
                                    placeholder="Org Number" // beholder for testene
                                    value={orgNumber}
                                    onChange={(e) => setOrgNumber(e.target.value)}
                                    fullWidth
                                    inputProps={{inputMode: "numeric"}}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    disabled={isSubmitting}
                                    sx={{
                                        height: 54,
                                        borderRadius: 3,
                                        fontWeight: 800,
                                        textTransform: "none",
                                        boxShadow: "0 14px 30px rgba(11, 20, 55, 0.22)",
                                    }}
                                >
                                    {isSubmitting ? "Registering..." : "Register"}
                                </Button>
                            </Stack>
                        </Box>
                    </Paper>
                </Box>

                {/* RIGHT (illustration) */}
                <Box
                    sx={{
                        display: {xs: "none", md: "flex"},
                        alignItems: "center",
                        justifyContent: "center",
                        p: 3,
                        bgcolor: "#fff",
                    }}
                    aria-hidden="true"
                >
                    <Box
                        component="img"
                        src="/auth-illustration.png"
                        alt=""
                        sx={{
                            width: "min(920px, 92%)",
                            height: "auto",
                            objectFit: "contain",
                            opacity: 0.95,
                            userSelect: "none",
                            pointerEvents: "none",
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
}
