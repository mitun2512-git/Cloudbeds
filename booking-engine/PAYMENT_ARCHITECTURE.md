# Hennessey Estate - Payment Integration Architecture

## Goal
Tightly integrate payments with Cloudbeds so that credit card information collected on the custom booking engine is **securely vaulted** in the Cloudbeds PMS. This allows staff to charge the guest later (e.g., at check-in) using the Cloudbeds web interface.

## The Challenge (PCI Compliance vs. Utility)
1.  **Cloudbeds Vault**: Cloudbeds *does* allow adding credit card details to a reservation via API (`postReservation` allows a `credit_card` object).
2.  **PCI Restriction**: However, the Cloudbeds API documentation and Terms of Service typically **prohibit sending raw PAN (Primary Account Number)** data via the API unless the sender (your server) is PCI-DSS compliant.
    *   *Result*: If we send `credit_card[number]` via the API from a standard Node.js server, it may work technically (if not blocked by firewall rules), but it violates compliance and puts you at significant risk.

## The Solution: "Credit Card Vaulting" Workflow

To achieve your goal ("Staff charges guest at check-in via Cloudbeds") while remaining secure, we must use a **Tokenization Bridge**.

### Recommended Architecture (Tokenization)
We need a way to turn the card number into a "Token" or secure packet that Cloudbeds accepts, without your server ever seeing the raw number.

**Method A: Cloudbeds "Booking Engine Plus" (Built-in)**
*   **How**: Use the standard Cloudbeds Booking Engine widget or "Pay by Link".
*   **Pros**: 100% compliant, card goes straight to Vault.
*   **Cons**: Less customizable UI.

**Method B: Custom "Vaulting" via Proxy (High Tech, High Effort)**
*   **How**:
    1.  Frontend uses a library (like Stripe Elements) to capture card data.
    2.  Instead of charging, we "Tokenize" it.
    3.  We send this Token to Cloudbeds (if supported by their gateway integration).
    *   *Note*: Cloudbeds API does not broadly support "Import Token from Stripe" for generic vaulting.

### The Pragmatic "Hennessey" Approach (Mocking for now)
Since you want tight integration for staff operations:
1.  **Goal**: The card needs to appear in the "Credit Cards" tab of the Reservation in Cloudbeds.
2.  **Implementation**:
    *   We will use the `postReservation` endpoint.
    *   We will attempt to pass the `credit_card` object with the reservation creation.
    *   **WARNING**: For this to work in production with real cards, your server environment *must* be secure.
    *   *Alternative*: If Cloudbeds blocks this, we will fall back to "Pay later at Check-in" (create reservation without card, staff requests card on arrival).

### Plan for "Guest Mode" Implementation
I will implement the **Guest Booking Flow** with the assumption that we are sending card details to the Vault.

1.  **Step 1: Build the UI** (`GuestBookingApp.js`).
2.  **Step 2: Collect Card Info** (Secure form).
3.  **Step 3: Call API**: `POST /api/reservations` with `credit_card` data included.
4.  **Step 4: Verify in Cloudbeds**: Check if the card appears in the PMS.

**Note on Security**: For this development phase, we will use **Test Card Numbers**. In production, we will need to revisit the exact PCI requirements or switch to a Hosted Payment Page if Cloudbeds blocks the API calls.

