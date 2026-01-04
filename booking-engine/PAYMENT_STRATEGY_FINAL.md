# Payment Integration Strategy: The "Stripe Token" Vault

## The Definitive Answer
You asked for an **optimal flow** where Cloudbeds collects (vaults) the card so your staff can charge it later. After deep research, the only compliant and supported way to do this via API is:

**Using a Stripe Token with `postReservation`**

Cloudbeds has a special integration with Stripe where you can send a **Stripe Card Token** (not the raw number) in the `credit_card` field when creating a reservation. Cloudbeds then takes this token, communicates with Stripe, and saves the card to the reservation's "Credit Cards" tab securely.

## The Architecture

1.  **Frontend (Your Booking Engine)**:
    *   Uses **Stripe Elements** (secure UI component).
    *   Guest enters card details.
    *   Stripe returns a token (e.g., `tok_12345`).
2.  **Backend (Your Server)**:
    *   Receives `tok_12345` from Frontend.
    *   Calls Cloudbeds `POST /postReservation`.
    *   Payload includes:
        ```json
        "credit_card": {
            "type": "stripe_token",
            "token": "tok_12345"
        }
        ```
3.  **Cloudbeds PMS**:
    *   Receives the reservation.
    *   Recognizes the Stripe Token.
    *   **Vaults the Card**: It appears in the "Credit Cards" tab for staff.
    *   **Staff Workflow**: When guest arrives, staff clicks "Charge" in Cloudbeds.

## Why this is the Winner
*   ✅ **Secure**: You never touch raw numbers (PCI Compliant).
*   ✅ **Tight Integration**: Card ends up exactly where staff expects it (in the PMS).
*   ✅ **User Experience**: Guest stays on your site. No redirects.

## Implementation Plan (Guest Booking Flow)

I will now build the **Guest Booking App** assuming this flow.

**Phase 1: Mock Implementation (Development)**
Since we don't have your live Stripe keys yet, I will:
1.  Build the **Guest Booking Wizard UI**.
2.  Create a **Mock Payment Form** that generates a "fake" Stripe Token (`tok_mock_123`).
3.  Update the **Server** to accept this token and pass it to Cloudbeds (simulating the real flow).

**Phase 2: Production (Future)**
You simply replace the Mock Form with the real Stripe Elements code (I will leave comments where this goes).

I am proceeding with **Step 5: Scaffold GuestBookingApp.js**.

