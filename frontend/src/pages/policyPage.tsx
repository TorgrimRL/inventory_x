import React from "react";
import { Box, Container, Paper, Typography } from "@mui/material";

export default function PrivacyPolicy() {
  return (
    <Box
      sx={{
        bgcolor: "#f9f9f9",
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 2,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              color: "#2c3e50",
              borderBottom: "2px solid #eee",
              pb: 1.5,
              mb: 3,
              fontWeight: 600,
            }}
          >
            Privacy Policy
          </Typography>

          <Typography variant="body1" paragraph sx={{ color: "#555" }}>
            <strong>Last Updated:</strong>{" "}
            <Box
              component="span"
              sx={{
                bgcolor: "#e2e3e5",
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                fontFamily: "monospace",
                color: "#383d41",
              }}
            >
              2026-04-21
            </Box>
          </Typography>

          <Typography variant="body1" paragraph sx={{ color: "#555" }}>
            Welcome to{" "}
            <Box
              component="span"
              sx={{
                bgcolor: "#e2e3e5",
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                fontFamily: "monospace",
                color: "#383d41",
              }}
            >
              Inventory X
            </Box>
            . We respect your privacy and are committed to protecting your personal
            data. This Privacy Policy explains what information we collect, how we
            use it, and your rights when you use our inventory management platform.
          </Typography>

          <Typography
            variant="h6"
            component="h3"
            sx={{ color: "#34495e", mt: 4, mb: 2, fontWeight: 600 }}
          >
            1. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: "#555" }}>
            We collect information that you provide to us directly when you register
            for an account, create an organization, or use our services. Based on
            our system architecture, this includes:
          </Typography>
          <Box
            component="ul"
            sx={{ pl: 3, m: 0, color: "#555", display: "flex", flexDirection: "column", gap: 1 }}
          >
            <li>
              <strong>Account Information:</strong> Your email address, display
              name, and a securely hashed password.
            </li>
            <li>
              <strong>Organization Information:</strong> Your Organization Name and
              9-digit Organization Number.
            </li>
            <li>
              <strong>Inventory Data:</strong> Data you input into the system,
              including item names, stock levels, pricing, custom categories, images
              and any custom text or number fields you define.
            </li>
            <li>
              <strong>Activity & Audit Logs:</strong> To provide accountability for
              organizations, we maintain a strict audit log. If you adjust inventory
              levels, we record the action, the amount, the timestamp, and link it
              directly to your user account.
            </li>
          </Box>

          <Typography
            variant="h6"
            component="h3"
            sx={{ color: "#34495e", mt: 4, mb: 2, fontWeight: 600 }}
          >
            2. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: "#555" }}>
            We use the collected data strictly to provide and improve our services
            to you:
          </Typography>
          <Box
            component="ul"
            sx={{ pl: 3, m: 0, color: "#555", display: "flex", flexDirection: "column", gap: 1 }}
          >
            <li>
              <strong>Authentication & Security:</strong> Your email and password
              are used to securely log you into the platform.
            </li>
            <li>
              <strong>Service Delivery:</strong> To store and display your inventory
              data and custom fields.
            </li>
            <li>
              <strong>Role Management:</strong> To facilitate "Owner" and "Employee"
              permissions within an organization.
            </li>
            <li>
              <strong>Notifications:</strong> To send you automated alerts, such as
              "Low Stock Notifications," when your inventory drops below your
              defined thresholds.
            </li>
            <li>
              <strong>Accountability:</strong> To provide organization owners with
              accurate audit logs of who adjusted stock and when.
            </li>
          </Box>

          <Typography
            variant="h6"
            component="h3"
            sx={{ color: "#34495e", mt: 4, mb: 2, fontWeight: 600 }}
          >
            3. Cookies and Tracking Technologies
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: "#555" }}>
            Our frontend application uses essential technologies (like local storage
            or session cookies) to keep you logged in securely.
          </Typography>

          <Typography
            variant="h6"
            component="h3"
            sx={{ color: "#34495e", mt: 4, mb: 2, fontWeight: 600 }}
          >
            4. How We Share Your Information
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: "#555" }}>
            We do not sell your personal or inventory data. We only share
            information in the following limited circumstances:
          </Typography>
          <Box
            component="ul"
            sx={{ pl: 3, m: 0, color: "#555", display: "flex", flexDirection: "column", gap: 1 }}
          >
            <li>
              <strong>Within Your Organization:</strong> If you are an "Employee,"
              your display name and stock adjustment activity will be visible to the
              "Owner" and other members of your organization via the Stock Audit
              Logs.
            </li>
          </Box>

          <Typography
            variant="h6"
            component="h3"
            sx={{ color: "#34495e", mt: 4, mb: 2, fontWeight: 600 }}
          >
            5. Data Retention and Deletion
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: "#555" }}>
            We retain your personal and inventory data for as long as your
            organization's account or inventory is active. Because audit logs are
            critical for business inventory integrity, records of stock adjustments
            linked to your display name may be retained by the organization owner
            even if your specific user account is removed from the organization.
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: "#555" }}>
            If you wish to permanently delete your account, please contact us at{" "}
            <Box
              component="span"
              sx={{
                bgcolor: "#e2e3e5",
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                fontFamily: "monospace",
                color: "#383d41",
              }}
            >
              inventoryx176@gmail.com
            </Box>
            .
          </Typography>

          <Typography
            variant="h6"
            component="h3"
            sx={{ color: "#34495e", mt: 4, mb: 2, fontWeight: 600 }}
          >
            6. Contact Us
          </Typography>
          <Typography variant="body1" paragraph sx={{ color: "#555" }}>
            If you have any questions about this Privacy Policy or the data we hold,
            please contact us at:
          </Typography>
          <Box
            component="ul"
            sx={{ pl: 3, m: 0, color: "#555", display: "flex", flexDirection: "column", gap: 1 }}
          >
            <li>
              <strong>Email:</strong>{" "}
              <Box
                component="span"
                sx={{
                  bgcolor: "#e2e3e5",
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  fontFamily: "monospace",
                  color: "#383d41",
                }}
              >
                inventoryx176@gmail.com
              </Box>
            </li>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
