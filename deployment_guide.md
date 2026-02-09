# Deployment & Automation Guide

This guide explains how to deploy your **PayPal to Google Sheets** project and set up **Automatic Daily Sync**.

## 1. Prerequisites
- The project is uploaded to **ONE GitHub Repository** containing both `client` and `server` folders ✅.
- You will create **TWO separate deployments** from this **SAME repository**.

---

## 2. Deploy Backend (Render or Vercel)
This deployment will handle the API and Webhooks.

1.  **New Web Service** / **New Project**.
2.  Connect the **SAME** GitHub repository (`paypal-sheets-integration`).
3.  **Use the content of the `server` folder**:
    - **Render**: Set `Root Directory` to `server`.
    - **Vercel**: Edit `Root Directory` and select `server`.
4.  **Environment Variables**:
    *   **Backend Project** (Server):
        - Add all variables from your local `.env` file:
            - `PAYPAL_CLIENT_ID`
            - `PAYPAL_CLIENT_SECRET`
            - `PAYPAL_MODE`
            - `GOOGLE_SCRIPT_URL`
    *   **Frontend Project** (Client):
        - Add one variable:
            - `VITE_API_BASE_URL`: `https://YOUR-BACKEND-URL.vercel.app/api` (Replace with your actual backend URL).
5.  **Result**: This gives you the **BACKEND URL** (e.g., `https://paypal-backend.vercel.app`).
    - Webhook URL: `https://paypal-backend.vercel.app/api/webhook`

---

## 3. Deploy Frontend (Vercel)
This deployment is for the Dashboard you see in the browser.

1.  **New Project** in Vercel.
2.  Connect the **SAME** GitHub repository again.
3.  **Use the content of the `client` folder**:
    - Edit `Root Directory` and select `client`.
4.  **Result**: This gives you the **FRONTEND URL** (e.g., `https://paypal-dashboard.vercel.app`).


---

## 4. OPTIONAL: Vercel Deployment for Backend (Webhooks Only)
If you prefer to host the backend on Vercel (best for Webhooks, **not** for full Sync):

1.  Run `npm install` in `server` folder (to ensure `vercel.json` is ready).
2.  Deploy the `server` folder to Vercel (similar to Frontend).
3.  **Warning**: The `/api/sync` function might timeout on Vercel if you have many transactions. Use Render for reliable daily syncs.
4.  **Webhooks**: Vercel is perfect for the `/api/webhook` endpoint.
    *   **Important**: You will get a NEW URL for this project (e.g., `paypal-sheets-server.vercel.app`).
    *   Unlike the frontend URL (Dashboard), use this BACKEND URL for Webhooks: `https://YOUR-BACKEND-URL.vercel.app/api/webhook`.

---

## 5. Automate Sync (Cron Job)
Now that your Backend is live on Render, you can schedule it to run automatically.

1.  Go to [Cron-Job.org](https://cron-job.org) (Free).
2.  Sign up/Login.
3.  Click **Create Cronjob**.
4.  **Title**: PayPal Sync.
5.  **URL**: `https://your-backend-app.onrender.com/api/sync` (Replace with your actual Render URL).
6.  **Schedule**: Select "Every day" at a specific time (e.g., 00:00).
7.  Click **Create**.

**Done!** 🚀
Now, every day at midnight, Cron-Job.org will visit your link, triggering the backend to fetch new transactions from PayPal and save them to Google Sheets automatically.

---

## 6. Enable Real-Time Webhooks (Optional)
If you want transactions to appear **instantly** (Real-Time):

1.  Go to **PayPal Developer Dashboard** -> **Apps & Credentials**.
2.  Select your Live App.
3.  Scroll down to **Webhooks**.
4.  Click **Add Webhook**.
5.  **Webhook URL**: `https://paypal-sheets-backend.onrender.com/api/webhook` (Replace with your actual Render URL).
6.  **Event Types**: Select `Payment capture completed`, `Payment sale completed`, and `Checkout order approved`.
7.  Click **Save**.

Now, whenever a payment happens, PayPal will instantly notify your server!
