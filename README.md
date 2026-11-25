# RDC Starlink

## Files

- `index.html` - main website page
- `style.css` - RDC Starlink / Airtel-style red and white design
- `script.js` - package selection, validation, navigation, OTP countdown and demo admin responses

## GitHub + Render

For a static deployment, upload all three files to the root of a GitHub repository.

On Render, create a **Static Site** connected to that repository.

Build command: leave blank.

Publish directory: `.`

The site entry file is `index.html`.

## Important

The admin section in `script.js` is only a local demonstration of the agreed page flow. It does not connect to Telegram and it does not transmit real PINs or OTPs.

For production, Telegram should be connected through a secure server/backend. Do not put a Telegram bot token in `index.html` or `script.js`, and do not send real customer PINs or OTPs to Telegram.

## Agreed customer flow

Package selection -> phone number + 4-digit PIN -> admin decision -> OTP -> 60-second countdown -> OTP verification -> admin decision -> final welcome page.

If the customer is returned to a previous step, the required field is highlighted red.

After 60 seconds, the OTP expires and **Request Another OTP** becomes available. The production backend can notify Telegram when a new OTP is requested.
