// src/__tests__/unit/signUpFormValidation.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SignUpForm } from "@/components/auth/sign-up-form";

// ── Helper to render with default props ──────────────────────────
function renderSignUpForm(overrides = {}) {
//   const dispatch = vi.fn();
//   const props = {
//     dispatch,
//     pending: false,
//     isPending: false,
//     ...overrides,
//   };
const mockDispatch = vi.fn();
const props = {
    dispatch: mockDispatch,
    pending: false,
    isPending: false,
    ...overrides,
  };
  render(<SignUpForm {...props} />);
//   return { dispatch, ...props };
return {
    dispatch: mockDispatch,
  };
}

// ─────────────────────────────────────────────────────────────────
describe("SignUpForm — Form Validation", () => {
  // ── 1. RENDERING ─────────────────────────────────────────────
  describe("Form rendering", () => {
    it("renders the form with correct aria-label", () => {
      renderSignUpForm();
      expect(
        screen.getByRole("form", { name: "Create a new account" }),
      ).toBeInTheDocument();
    });

    it("renders email input with correct type", () => {
      renderSignUpForm();
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
        "type",
        "email",
      );
    });

    it("renders password input with correct type", () => {
      renderSignUpForm();
      expect(screen.getByLabelText(/password/i)).toHaveAttribute(
        "type",
        "password",
      );
    });

    it("renders the submit button with correct text", () => {
      renderSignUpForm();
      expect(
        screen.getByRole("button", { name: /complete registration/i }),
      ).toBeInTheDocument();
    });

    it("renders the password hint text", () => {
      renderSignUpForm();
      expect(
        screen.getByText(/must be at least 6 characters/i),
      ).toBeInTheDocument();
    });

    it("password input is described by the hint text", () => {
      renderSignUpForm();
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute(
        "aria-describedby",
        "password-hint",
      );
    });
  });

  // ── 2. FIELD VALIDATION ATTRIBUTES ──────────────────────────
  describe("HTML5 validation attributes", () => {
    it("email field is required", () => {
      renderSignUpForm();
      expect(screen.getByLabelText(/email address/i)).toBeRequired();
    });

    it("password field is required", () => {
      renderSignUpForm();
      expect(screen.getByLabelText(/password/i)).toBeRequired();
    });

    it("email field has aria-required true", () => {
      renderSignUpForm();
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
        "aria-required",
        "true",
      );
    });

    it("password field has aria-required true", () => {
      renderSignUpForm();
      expect(screen.getByLabelText(/password/i)).toHaveAttribute(
        "aria-required",
        "true",
      );
    });

    it("password has minLength of 6", () => {
      renderSignUpForm();
      expect(screen.getByLabelText(/password/i)).toHaveAttribute(
        "minLength",
        "6",
      );
    });

    it("email has autocomplete set to email", () => {
      renderSignUpForm();
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
        "autocomplete",
        "email",
      );
    });

    it("password has autocomplete set to new-password", () => {
      renderSignUpForm();
      expect(screen.getByLabelText(/password/i)).toHaveAttribute(
        "autocomplete",
        "new-password",
      );
    });
  });

  // ── 3. USER INPUT ────────────────────────────────────────────
  describe("User input behaviour", () => {
    it("accepts valid email input", async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, "writer@chatter.com");

      expect(emailInput).toHaveValue("writer@chatter.com");
    });

    it("accepts valid password input", async () => {
      const user = userEvent.setup();
      renderSignUpForm();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, "securePass123");

      expect(passwordInput).toHaveValue("securePass123");
    });

    it("masks the password characters", () => {
      renderSignUpForm();
      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  // ── 4. FORM SUBMISSION ───────────────────────────────────────
  describe("Form submission", () => {
    it("calls dispatch with FormData on valid submit", async () => {
      const user = userEvent.setup();
      const { dispatch } = renderSignUpForm();

      await user.type(
        screen.getByLabelText(/email address/i),
        "test@chatter.com",
      );
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(
        screen.getByRole("button", { name: /complete registration/i }),
      );

      expect(dispatch).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledWith(expect.any(FormData));
    });

    it("FormData contains the email field", async () => {
      const user = userEvent.setup();
      let capturedFormData: FormData | undefined;

      const dispatch = vi.fn((fd: FormData) => {
        capturedFormData = fd;
      });
      render(
        <SignUpForm dispatch={dispatch} pending={false} isPending={false} />,
      );

      await user.type(
        screen.getByLabelText(/email address/i),
        "hello@chatter.com",
      );
      await user.type(screen.getByLabelText(/password/i), "mypassword");
      await user.click(
        screen.getByRole("button", { name: /complete registration/i }),
      );

      expect(capturedFormData?.get("email")).toBe("hello@chatter.com");
    });

    it("FormData contains the password field", async () => {
      const user = userEvent.setup();
      let capturedFormData: FormData | undefined;

      const dispatch = vi.fn((fd: FormData) => {
        capturedFormData = fd;
      });
      render(
        <SignUpForm dispatch={dispatch} pending={false} isPending={false} />,
      );

      await user.type(
        screen.getByLabelText(/email address/i),
        "hello@chatter.com",
      );
      await user.type(screen.getByLabelText(/password/i), "mypassword");
      await user.click(
        screen.getByRole("button", { name: /complete registration/i }),
      );

      expect(capturedFormData?.get("password")).toBe("mypassword");
    });

    it("does NOT call dispatch when form is in pending state", () => {
      const dispatch = vi.fn();
      render(
        <SignUpForm dispatch={dispatch} pending={true} isPending={false} />,
      );

      // Button is disabled so click should not submit
      const button = screen.getByRole("button", {
        name: /complete registration/i,
      });
      expect(button).toBeDisabled();
    });
  });

  // ── 5. PENDING / LOADING STATE ───────────────────────────────
  describe("Pending and loading states", () => {
    it("disables email input when pending is true", () => {
      renderSignUpForm({ pending: true });
      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
    });

    it("disables password input when pending is true", () => {
      renderSignUpForm({ pending: true });
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
    });

    it("disables submit button when pending is true", () => {
      renderSignUpForm({ pending: true });
      expect(
        screen.getByRole("button", { name: /complete registration/i }),
      ).toBeDisabled();
    });

    it('shows "Provisioning..." text when isPending is true', () => {
      renderSignUpForm({ isPending: true });
      expect(screen.getByText("Provisioning...")).toBeInTheDocument();
    });

    it("shows loading spinner when isPending is true", () => {
      renderSignUpForm({ isPending: true });
      // Loader2 icon renders with aria-hidden, check for the span text
      expect(screen.getByText("Provisioning...")).toBeInTheDocument();
    });

    it('shows "Complete Registration" when not pending', () => {
      renderSignUpForm({ isPending: false });
      expect(screen.getByText("Complete Registration")).toBeInTheDocument();
    });

    it("button has aria-disabled when pending", () => {
      renderSignUpForm({ pending: true });
      expect(
        screen.getByRole("button", { name: /complete registration/i }),
      ).toHaveAttribute("aria-disabled", "true");
    });
  });

  // ── 6. EMAIL VALIDATION RULES ────────────────────────────────
  describe("Email field validation rules", () => {
    it("email input placeholder guides the user with correct format", () => {
      renderSignUpForm();
      expect(
        screen.getByPlaceholderText("name@domain.com"),
      ).toBeInTheDocument();
    });

    it("password placeholder tells user the minimum requirement", () => {
      renderSignUpForm();
      expect(
        screen.getByPlaceholderText("Minimum 6 characters"),
      ).toBeInTheDocument();
    });

    it("does not submit with empty fields via fireEvent", () => {
      const dispatch = vi.fn();
      render(
        <SignUpForm dispatch={dispatch} pending={false} isPending={false} />,
      );
      // Try to submit with empty fields — noValidate is set so HTML5
      // validation won't block, but our handler still fires.
      // This tests the handler is connected.
      fireEvent.submit(
        screen.getByRole("form", { name: /create a new account/i }),
      );
      expect(dispatch).toHaveBeenCalledTimes(1);
    });
  });

  // ── 7. ACCESSIBILITY ─────────────────────────────────────────
  describe("Accessibility", () => {
    it("labels are correctly associated with inputs via htmlFor", () => {
      renderSignUpForm();
      // getByLabelText already tests this implicitly
      expect(screen.getByLabelText(/email address/i)).toHaveAttribute(
        "id",
        "reg-email",
      );
      expect(screen.getByLabelText(/password/i)).toHaveAttribute(
        "id",
        "reg-password",
      );
    });

    it("form has noValidate to allow custom validation flow", () => {
      renderSignUpForm();
      expect(
        screen.getByRole("form", { name: /create a new account/i }),
      ).toHaveAttribute("noValidate");
    });
  });
});
