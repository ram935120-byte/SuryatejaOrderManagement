# Surya Teja Order Management System

Production-preparation package for the **Surya Teja Order Management System** using:

- HTML/CSS/JavaScript frontend
- Supabase PostgreSQL database
- Supabase Auth for staff login
- Supabase Storage for bill copies
- Netlify or similar static hosting

## Current Architecture

| Area | Current Setup |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Database | Supabase PostgreSQL |
| Staff Login | Supabase Auth |
| Mediator Login | Mediators table mobile/password check |
| Mediator Approval | Manual staff phone verification and approval |
| Orders | Supabase `orders` table |
| Product Rates | Supabase `product_rates` table |
| Bill Copies | Supabase Storage bucket + `bill_copies` table |
| Notifications | Supabase `notifications` table |

## Important Security Note

This version is a practical free-launch version.

The frontend uses the Supabase publishable key and RLS policies. However, mediator passwords are still stored in the `mediators` table as plain text for the current simple workflow.

Before scaling heavily, upgrade mediator authentication to one of these:

1. Supabase Auth for mediators
2. Backend API with hashed passwords
3. Supabase Edge Functions for protected actions

Never place the Supabase secret key in frontend code.

## Required Files

Keep these files in the project root:

- `HomeScreen.html`
- `StaffLogin.html`
- `StaffDashboard.html`
- `MediatorRegister.html`
- `MediatorLogin.html`
- `MediatorDashboard.html`
- `supabase.js`

Keep images inside:

```text
images/
```

## Required `supabase.js`

Create this file in the same folder as the HTML files:

```javascript
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLISHABLE_KEY";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
```

Use only the **Publishable key**.

Do not use:
- Secret key
- Service role key
- Database password

## Required Supabase Tables

Main tables:

- `mediators`
- `orders`
- `bill_copies`
- `product_rates`
- `notifications`

Recent required columns:

```sql
alter table orders
add column if not exists party_name text,
add column if not exists quantity text,
add column if not exists variety text,
add column if not exists comment text,
add column if not exists loading_type text,
add column if not exists loading_date date;

alter table mediators
add column if not exists can_view_rates boolean default true;
```

## Current Production Features

### Mediator Flow

1. Mediator registers with mobile, company name, and password.
2. Registration is saved in Supabase.
3. Notification is created for staff.
4. Staff calls and verifies mediator manually.
5. Staff approves or rejects mediator.
6. Approved mediator can login.
7. Staff can reset mediator password after phone verification.
8. Staff can enable or disable current quintal rate visibility per mediator.

### Order Flow

Mediator order entry now uses structured fields:

- Party Name
- Quantity
- Variety
- Loading Type
- Future Loading Date, only if Future Loading is selected

Orders save to the `orders` table with separate columns and a backup `order_text`.

### Staff Flow

Staff can:

- Login through Supabase Auth
- View notifications
- Approve/reject mediators
- Save call verification notes
- Reset mediator password
- Enable/disable mediator rate access
- Update current product rates
- View orders company-wise
- Update order status as:
  - Accepted
  - Rejected
  - Completed
- Upload bill copies
- Search uploaded bills

### Bill Copy Flow

Staff uploads bill files to Supabase Storage bucket:

```text
bill-copies
```

Allowed file types:

- PDF
- JPG
- JPEG
- PNG

Mediator can:

- View own company bills
- Download bill copy
- Print bill copy
- Share via WhatsApp

## Supabase Setup Checklist

1. Create Supabase project.
2. Create required tables.
3. Create `bill-copies` storage bucket.
4. Add staff user in Supabase Authentication.
5. Add `supabase.js` to frontend project.
6. Run `SUPABASE_POLICIES.sql`.
7. Test every flow before deployment.

## Deployment Instructions

Recommended free deployment:

| Service | Purpose |
|---|---|
| Netlify | Frontend hosting |
| Supabase | Database, auth, storage |

### Deploy to Netlify

1. Keep all HTML files in the root folder.
2. Keep images in the `images` folder.
3. Confirm `supabase.js` is present.
4. Open Netlify.
5. Choose **Add new site → Deploy manually**.
6. Drag and drop the full project folder.
7. Netlify will generate a live HTTPS URL.

## Browser Testing Checklist

Test on:

- Chrome desktop
- Edge desktop
- Firefox desktop
- Safari desktop
- iPhone Safari
- Android Chrome
- Tablet browser

Test flows:

1. HomeScreen loads correctly.
2. Product images load.
3. Staff login works.
4. Staff dashboard opens after login.
5. Product rates update from staff dashboard.
6. Mediator registration saves to Supabase.
7. Staff sees mediator registration notification.
8. Staff approves mediator.
9. Mediator login works only after approval.
10. Staff can reset mediator password.
11. Staff can enable/disable rates per mediator.
12. Disabled mediator cannot see Current Quintal Rates.
13. Mediator submits structured order.
14. Ready Loading saves correctly.
15. Future Loading shows calendar and saves date.
16. Staff sees structured order.
17. Staff updates order status to Accepted, Rejected, or Completed.
18. Mediator sees updated order status.
19. Staff uploads one bill copy.
20. Staff uploads multiple bill copies.
21. Invalid file type is blocked.
22. Mediator sees own bill copies.
23. Download works.
24. Print works.
25. WhatsApp share works.
26. Tables scroll correctly on mobile.
27. Logout works.

## Manual Configuration Needed

Update manually:

- `supabase.js`
- Supabase project URL
- Supabase publishable key
- Supabase Auth staff users
- Storage bucket settings
- RLS policies from `SUPABASE_POLICIES.sql`

## Production Security Checklist

- Use publishable key only in frontend.
- Never expose secret key.
- Keep RLS enabled on all tables.
- Keep storage policies controlled.
- Use HTTPS only.
- Validate all inputs before inserting.
- Restrict file types and size.
- Escape rendered user data.
- Do not expose internal errors to normal users.
- Back up Supabase data regularly.
- Later upgrade mediator passwords to hashed authentication.

## Recommended Next Upgrades

- Supabase Auth for mediators
- OTP login
- Password hashing
- Staff role table
- Audit log table
- Signed URLs for private bill copies
- Realtime notifications
- PWA mobile app setup
