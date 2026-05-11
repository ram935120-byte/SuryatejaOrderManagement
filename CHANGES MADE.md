# Changes Made

## Database / Supabase

- Migrated project direction from browser-only localStorage prototype to Supabase-backed setup.
- Added Supabase database support for:
  - mediators
  - orders
  - bill_copies
  - product_rates
  - notifications
- Added required structured order columns:
  - party_name
  - quantity
  - variety
  - comment
  - loading_type
  - loading_date
- Added mediator rate visibility control column:
  - can_view_rates
- Added Supabase Storage bucket workflow for bill copies.
- Added a separate `SUPABASE_POLICIES.sql` file for RLS and storage policies.

## Mediator Registration

- Mediator registration now saves into Supabase instead of localStorage.
- Added mobile uniqueness check.
- Added password confirmation validation.
- Added registration notification for staff.
- Kept manual phone-call approval flow.

## Mediator Login

- Mediator login checks Supabase `mediators` table.
- Login allowed only when status is `Approved`.
- Added remembered mobile number support.
- Added Forgot Password guidance message.
- Kept mediator login simple for current launch.

## Staff Login

- Staff login uses Supabase Auth.
- Removed dependency on hardcoded staff login for production use.
- Staff user must be created manually in Supabase Authentication.

## Staff Dashboard

- Staff dashboard reads data from Supabase.
- Staff can approve/reject mediators.
- Staff can save call verification status and notes.
- Staff can reset mediator password after phone verification.
- Staff can enable or disable Current Quintal Rates per mediator.
- Staff can update current product rates.
- Staff order status options simplified to:
  - Accepted
  - Rejected
  - Completed
- Staff can upload bill copies to Supabase Storage.
- Staff can search uploaded bills.

## Mediator Dashboard

- Current Quintal Rates can now be hidden per mediator.
- If staff disables rate access, mediator cannot see the rate menu or rate section.
- Bulk free-text order box replaced with structured order entry:
  - Party Name
  - Quantity
  - Variety
  - Loading
- Loading field changed to dropdown:
  - Ready Loading
  - Future Loading
- If Future Loading is selected, calendar date input appears.
- Structured order saves into separate database columns.
- `order_text` is still saved as a backup summary.
- Mediator order history shows structured values.
- Bill download, print, and WhatsApp share remain supported.

## Home Screen

- HomeScreen reads current product rates from Supabase.
- Uses Supabase product rate keys.
- Keeps product cards and public rate display structure.

## Security Improvements

- Supabase RLS enabled.
- Input sanitization and output escaping retained in key dashboard rendering.
- File upload type validation retained.
- File name sanitization retained.
- Secret key warning added.
- Production security notes updated.

## Preserved

- Existing page names.
- Existing HTML-based frontend structure.
- Existing Surya Teja branding.
- Existing mediator approval workflow.
- Existing bill upload/download/print/WhatsApp workflow.
- Existing product rate keys:
  - hmt
  - oldJoker
  - joker
  - knm
  - rnr
  - jsrBoiled

## Not Fully Solved Yet

- Mediator passwords are still plain text in the `mediators` table.
- Mediator Auth should later be upgraded to Supabase Auth or a backend hashing flow.
- Current RLS policies are permissive for the free/simple launch version.
- For stronger production security, move sensitive operations to backend or Supabase Edge Functions.
