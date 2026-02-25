# Testing the Post-Signup Compulsory Form (Updated)

## New Feature: 10-Second Delay ⏱️

After clicking "Create Account", the system now performs a simulated account setup.
**You must wait 10 seconds** before the compulsory profile form appears.

## How to Test:

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Navigate to the registration page**

3. **Fill out the registration form:**
   - Username: `testuser`
   - Email: `test@example.com`
   - Phone: `+91 9876543210`
   - Password: `password123`
   - Confirm Password: `password123`

4. **Click "Create Account"**

5. **Observe the Toast Notification:**
   - You should see: "Account created successfully! Redirecting to profile setup in 10 seconds..."

6. **WAIT 10 SECONDS** ⏳
   - Do not close the window.
   - The compulsory form will automatically pop up.

7. **Verify Compulsory Form Appear:**
   - Title: "Complete Your Profile"
   - Cannot be closed without filling.

8. **Fill & Submit Form:**
   - Select Exam Category & Target Exam.
   - **Crucial:** Pick a "Preparation Start Date" (e.g., 10 days ago) to test the dashboard logic.
   - Select State.
   - Click "Complete Registration".

9. **Dashboard Verification:**
   - **Welcome Banner:** Should say "Welcome, testuser".
   - **Target Card:** Should show the exam you selected (e.g., "IBPS PO" or "UPSC").
   - **Total Journey Days:** Should calculate days from your selected start date (e.g., "10" if you picked a date 10 days ago).

## Troubleshooting:

- **Form doesn't appear after 10s:** Check console for errors. Ensure you didn't navigate away.
- **Dashboard shows "Student User":** Local storage might not be saving correctly. Check Application > Local Storage > `userProfile`.
