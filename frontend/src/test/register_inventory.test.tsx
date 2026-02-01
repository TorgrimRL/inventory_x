import "@testing-library/jest-dom";

import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import axios from "axios";
import {useNavigate} from "react-router-dom";


import RegisterInventoryForm from "../components/inventory/registerInventoryForm.tsx";

// MOCK DEPENDENCIES
jest.mock("axios");
jest.mock("react-router-dom", () => ({
    useNavigate: jest.fn(),
}));

describe("Register Inventory (Business) Component", () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    });

    test("renders form inputs (name, orgNumber) and submit button", () => {
        render(<RegisterInventoryForm/>);

        expect(screen.getByPlaceholderText(/business name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/org\s*number/i)).toBeInTheDocument();

        expect(
            screen.getByRole("button", {name: /register/i}),
        ).toBeInTheDocument();
    });

    test("empty submit shows frontend validation errors and does not call backend", async () => {
        render(<RegisterInventoryForm/>);

        fireEvent.click(screen.getByRole("button", {name: /register/i}));

        expect(axios.post).not.toHaveBeenCalled();

        expect(
            await screen.findByText(/please enter business name/i),
        ).toBeInTheDocument();

        expect(
            await screen.findByText(/please enter org\s*number/i),
        ).toBeInTheDocument();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("calls backend with request body { name, orgNumber }", async () => {
        (axios.post as jest.Mock).mockResolvedValueOnce({
            status: 201,
            data: {
                message: "Inventory & membership registered",
                id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            },
        });

        render(<RegisterInventoryForm/>);

        fireEvent.change(screen.getByPlaceholderText(/business name/i), {
            target: {value: "Acme AS"},
        });

        fireEvent.change(screen.getByPlaceholderText(/org\s*number/i), {
            target: {value: "123456788"},
        });

        fireEvent.click(screen.getByRole("button", {name: /register/i}));

        await waitFor(() => expect(axios.post).toHaveBeenCalled());

        const callArgs = (axios.post as jest.Mock).mock.calls[0];
        const body = callArgs[1];

        expect(body).toEqual({
            name: "Acme AS",
            orgNumber: "123456788",
        });
    });

    test("201 success: shows 'Business registered' and navigates to business area (overview/inventory)", async () => {
        (axios.post as jest.Mock).mockResolvedValueOnce({
            status: 201,
            data: {
                message: "Inventory & membership registered",
                id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
            },
        });

        render(<RegisterInventoryForm/>);

        fireEvent.change(screen.getByPlaceholderText(/business name/i), {
            target: {value: "Acme AS"},
        });
        fireEvent.change(screen.getByPlaceholderText(/org\s*number/i), {
            target: {value: "123456788"},
        });

        fireEvent.click(screen.getByRole("button", {name: /register/i}));

        expect(await screen.findByText("Business registered")).toBeInTheDocument();

        await waitFor(() => expect(mockNavigate).toHaveBeenCalled());

        const navTo = (mockNavigate as jest.Mock).mock.calls[0][0];

        // Tillat noen vanlige varianter – dere velger endelig rute i implementasjonen.
        expect(
            ["/overview", "/inventories", "/business/overview", "/business/inventory"].includes(
                String(navTo),
            ),
        ).toBe(true);
    });

    test("400 validation failed: renders nested field errors from backend detail", async () => {
        (axios.post as jest.Mock).mockRejectedValueOnce({
            response: {
                status: 400,
                data: {
                    detail: {
                        name: ["This field is required."],
                        orgNumber: ["Must be 9 digits."],
                    },
                },
            },
        });

        render(<RegisterInventoryForm/>);

        // Frontend må passere validate() for å nå backend
        fireEvent.change(screen.getByPlaceholderText(/business name/i), {
            target: {value: "Acme AS"},
        });
        fireEvent.change(screen.getByPlaceholderText(/org\s*number/i), {
            target: {value: "123456788"},
        });

        fireEvent.click(screen.getByRole("button", {name: /register/i}));

        expect(
            await screen.findByText(/this field is required/i),
        ).toBeInTheDocument();

        expect(await screen.findByText(/must be 9 digits/i)).toBeInTheDocument();

        expect(axios.post).toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });


    test("409 conflict (duplicate): renders backend nested error and does not navigate", async () => {
        (axios.post as jest.Mock).mockRejectedValueOnce({
            response: {
                status: 409,
                data: {
                    detail: {
                        name: ["Inventory with the same name already exists"],
                    },
                },
            },
        });

        render(<RegisterInventoryForm/>);

        fireEvent.change(screen.getByPlaceholderText(/business name/i), {
            target: {value: "Acme AS"},
        });
        fireEvent.change(screen.getByPlaceholderText(/org\s*number/i), {
            target: {value: "123456788"},
        });

        fireEvent.click(screen.getByRole("button", {name: /register/i}));

        expect(
            await screen.findByText(/already exists/i),
        ).toBeInTheDocument();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("401 unauthorized: renders backend detail string and does not navigate", async () => {
        (axios.post as jest.Mock).mockRejectedValueOnce({
            response: {
                status: 401,
                data: {detail: "Authentication credentials were not provided."},
            },
        });

        render(<RegisterInventoryForm/>);

        fireEvent.change(screen.getByPlaceholderText(/business name/i), {
            target: {value: "Acme AS"},
        });
        fireEvent.change(screen.getByPlaceholderText(/org\s*number/i), {
            target: {value: "123456788"},
        });

        fireEvent.click(screen.getByRole("button", {name: /register/i}));

        expect(
            await screen.findByText(/authentication credentials were not provided/i),
        ).toBeInTheDocument();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    test("403 forbidden: renders backend detail string and does not navigate", async () => {
        (axios.post as jest.Mock).mockRejectedValueOnce({
            response: {
                status: 403,
                data: {detail: "Forbidden."},
            },
        });

        render(<RegisterInventoryForm/>);

        fireEvent.change(screen.getByPlaceholderText(/business name/i), {
            target: {value: "Acme AS"},
        });
        fireEvent.change(screen.getByPlaceholderText(/org\s*number/i), {
            target: {value: "123456788"},
        });

        fireEvent.click(screen.getByRole("button", {name: /register/i}));

        expect(await screen.findByText(/forbidden/i)).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
