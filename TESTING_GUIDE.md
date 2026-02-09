# Testing Guide - Blood Donation Features

## Pre-Testing Setup

### Requirements
- Node.js and npm installed
- MongoDB running
- Backend server running on configured port
- Frontend development server running
- Admin user with proper credentials

### Start Services
```bash
# Backend
cd Backend
npm start

# Frontend (in new terminal)
cd Frontend
npm run dev
```

---

## Feature 1: Blood Bag Modal Display

### Test Case 1.1: Modal Opens on Approve Click
**Steps:**
1. Log in as admin user
2. Navigate to "Admin Dashboard" → "Pending Approvals" → "Pending Blood Requests" tab
3. Find a pending blood request
4. Click "Approve & Publish" button

**Expected Result:**
- Modal dialog appears
- Modal title: "Enter Blood Bag Number"
- Input field is focused
- Cancel and Approve buttons present

**Test Result:** ✅ / ❌

---

### Test Case 1.2: Modal Displays Correctly
**Steps:**
1. With modal open, check all UI elements

**Expected Result:**
- Modal is centered on screen
- Dark overlay behind modal
- Input placeholder shows "e.g., BAG-001-2024"
- Instructions text is clear
- Buttons are properly styled

**Test Result:** ✅ / ❌

---

## Feature 2: Blood Bag Validation

### Test Case 2.1: Submit Button Disabled When Empty
**Steps:**
1. Open blood bag number modal
2. Leave input field empty
3. Look at "Approve & Record" button

**Expected Result:**
- Button is disabled (grayed out)
- Cannot click button
- Cannot submit empty form

**Test Result:** ✅ / ❌

---

### Test Case 2.2: Submit Button Enabled When Input Present
**Steps:**
1. Open blood bag number modal
2. Type a blood bag number (e.g., "BAG-001-2024")
3. Look at "Approve & Record" button

**Expected Result:**
- Button becomes enabled (blue)
- Button is clickable

**Test Result:** ✅ / ❌

---

### Test Case 2.3: Enter Key Submits Form
**Steps:**
1. Open blood bag number modal
2. Type blood bag number in input
3. Press Enter key

**Expected Result:**
- Form submits
- Loading state shows "Processing..."
- Modal closes on success

**Test Result:** ✅ / ❌

---

## Feature 3: Approval Submission

### Test Case 3.1: Successful Approval
**Steps:**
1. Open blood bag number modal
2. Enter blood bag number: "TEST-BAG-001"
3. Click "Approve & Record"
4. Wait for response

**Expected Result:**
- Button shows "Processing..." text
- After 1-2 seconds, success message appears
- Message says: "Blood request has been approved with blood bag #TEST-BAG-001 and donation history created"
- Modal closes automatically
- Pending list refreshes
- Request disappears from pending list

**Test Result:** ✅ / ❌

---

### Test Case 3.2: Error Handling - Network Error
**Steps:**
1. Open network tab in browser dev tools
2. Open blood bag number modal
3. Enter blood bag number
4. Before modal closes, block network request in dev tools
5. Click "Approve & Record"

**Expected Result:**
- Error message appears
- Says "Failed to approve blood request"
- Modal stays open
- Can retry or cancel

**Test Result:** ✅ / ❌

---

## Feature 4: Database Updates

### Test Case 4.1: BloodRequest Updated with Blood Bag Number
**Steps:**
1. Approve a blood request with blood bag number "DB-TEST-001"
2. Open MongoDB client or API response
3. Query the BloodRequest document

**Expected Result:**
- BloodRequest document has field: `bloodBagNumber: "DB-TEST-001"`
- Field `approvalStatus: "approved"`
- Field `approvedAt: <timestamp>`

**Verification:**
```bash
# In MongoDB
db.bloodRequests.findOne({ _id: ObjectId("...") })
# Should show:
# {
#   bloodBagNumber: "DB-TEST-001",
#   approvalStatus: "approved",
#   ...
# }
```

**Test Result:** ✅ / ❌

---

### Test Case 4.2: User's lastDonateDate Updated
**Steps:**
1. Find the user who made the blood request
2. Check their document before approval (note their lastDonateDate)
3. Approve a blood request from this user
4. Check the user document again

**Expected Result:**
- User's `lastDonateDate` changed to the approval date
- Field shows current date/time in ISO format
- Field `updatedAt` also updated

**Verification:**
```bash
# In MongoDB
db.users.findOne({ _id: ObjectId("...") })
# Should show updated lastDonateDate
```

**Test Result:** ✅ / ❌

---

### Test Case 4.3: DonationHistory Record Created
**Steps:**
1. Approve a blood request
2. Check MongoDB for donation history record
3. Verify all fields are populated

**Expected Result:**
- New record in `donationHistory` collection
- Contains:
  - userId: reference to requesting user
  - bloodRequestId: reference to the request
  - bloodBagNumber: the entered number
  - bloodGroup: from the request
  - unitsGiven: from the request
  - donationDate: approval date
  - approvalDate: approval date
  - approvedBy: admin email
  - patientName: from request
  - hospitalName: from request
  - status: "completed"

**Verification:**
```bash
# In MongoDB
db.donationHistory.findOne({ bloodBagNumber: "TEST-BAG-001" })
```

**Test Result:** ✅ / ❌

---

## Feature 5: User Interface Interactions

### Test Case 5.1: Cancel Button Works
**Steps:**
1. Open blood bag number modal
2. Enter blood bag number
3. Click "Cancel" button

**Expected Result:**
- Modal closes
- Input field is cleared
- No approval is made
- Request still appears in pending list

**Test Result:** ✅ / ❌

---

### Test Case 5.2: Modal State Resets Between Approvals
**Steps:**
1. Open blood bag modal for first request
2. Enter blood bag number
3. Cancel without approving
4. Click "Approve" on second request
5. Check if input field is empty

**Expected Result:**
- Input field is empty
- No residual data from previous attempt

**Test Result:** ✅ / ❌

---

### Test Case 5.3: Multiple Approvals Work Correctly
**Steps:**
1. Approve first request with "BAG-001"
2. Wait for success
3. Approve second request with "BAG-002"
4. Verify both created history records

**Expected Result:**
- First approval succeeds
- Second approval succeeds
- Both records exist in DonationHistory
- Each has unique bloodBagNumber

**Test Result:** ✅ / ❌

---

## Feature 6: Edge Cases

### Test Case 6.1: Special Characters in Blood Bag Number
**Steps:**
1. Open blood bag modal
2. Enter: "BAG-@#$%-2024"
3. Click "Approve & Record"

**Expected Result:**
- Submission succeeds (no format validation yet)
- Record created with special characters

**Test Result:** ✅ / ❌

---

### Test Case 6.2: Very Long Blood Bag Number
**Steps:**
1. Open blood bag modal
2. Enter very long string (100+ characters)
3. Click "Approve & Record"

**Expected Result:**
- Submission succeeds
- Record created with full text

**Test Result:** ✅ / ❌

---

### Test Case 6.3: Whitespace Handling
**Steps:**
1. Open blood bag modal
2. Enter: "  BAG-001  " (with spaces)
3. Click "Approve & Record"

**Expected Result:**
- Spaces are trimmed
- Record created with: "BAG-001"

**Test Result:** ✅ / ❌

---

## Performance Tests

### Test Case 7.1: Modal Opens Quickly
**Steps:**
1. Click "Approve" button multiple times in succession
2. Time how long modal appears

**Expected Result:**
- Modal appears within 100ms
- No lag or delay

**Test Result:** ✅ / ❌

---

### Test Case 7.2: Submission Completes Reasonably
**Steps:**
1. Submit approval with blood bag number
2. Time how long until success message appears

**Expected Result:**
- Success message within 2-3 seconds
- User sees loading state during processing

**Test Result:** ✅ / ❌

---

## Integration Tests

### Test Case 8.1: Full Approval Workflow
**Steps:**
1. Navigate to pending approvals
2. Find a pending blood request
3. Click "Approve & Publish"
4. Enter blood bag number
5. Press Enter or click approve
6. Verify success message
7. Check database for all updates
8. Check user's profile for lastDonateDate update

**Expected Result:**
- All steps succeed
- Database reflects all changes
- Request removed from pending list
- User profile updated

**Test Result:** ✅ / ❌

---

### Test Case 8.2: Admin Dashboard Reflects Changes
**Steps:**
1. After approval, check admin dashboard
2. Verify pending count decreased
3. Check blood request now appears in different view

**Expected Result:**
- Pending count accurate
- Request no longer in pending list
- Request may appear in approved list (if applicable)

**Test Result:** ✅ / ❌

---

## Regression Tests

### Test Case 9.1: Other Admin Functions Still Work
**Steps:**
1. Test rejecting a blood request (should still work)
2. Test approving donation requests (should still work)
3. Test other admin features

**Expected Result:**
- Other features unaffected
- No broken functionality

**Test Result:** ✅ / ❌

---

## Security Tests

### Test Case 10.1: Only Admins Can Approve
**Steps:**
1. Log out
2. Try accessing approval endpoint directly
3. Use non-admin user account

**Expected Result:**
- Cannot access as non-admin
- Error message shown
- Endpoint protected

**Test Result:** ✅ / ❌

---

## Test Summary Sheet

| Test Case | Description | Result | Notes |
|-----------|-------------|--------|-------|
| 1.1 | Modal Opens | ✅/❌ | |
| 1.2 | Modal Display | ✅/❌ | |
| 2.1 | Button Disabled Empty | ✅/❌ | |
| 2.2 | Button Enabled Full | ✅/❌ | |
| 2.3 | Enter Key Submit | ✅/❌ | |
| 3.1 | Success Approval | ✅/❌ | |
| 3.2 | Error Handling | ✅/❌ | |
| 4.1 | BloodRequest Update | ✅/❌ | |
| 4.2 | User LastDonateDate | ✅/❌ | |
| 4.3 | DonationHistory Created | ✅/❌ | |
| 5.1 | Cancel Button | ✅/❌ | |
| 5.2 | Modal Reset | ✅/❌ | |
| 5.3 | Multiple Approvals | ✅/❌ | |
| 6.1 | Special Characters | ✅/❌ | |
| 6.2 | Long String | ✅/❌ | |
| 6.3 | Whitespace | ✅/❌ | |
| 7.1 | Modal Speed | ✅/❌ | |
| 7.2 | Submit Speed | ✅/❌ | |
| 8.1 | Full Workflow | ✅/❌ | |
| 8.2 | Dashboard Sync | ✅/❌ | |
| 9.1 | Regression | ✅/❌ | |
| 10.1 | Security | ✅/❌ | |

---

## Browser Compatibility

Test in:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

---

## Mobile Testing

Test on:
- [ ] iPhone/Safari
- [ ] Android/Chrome
- [ ] Tablet (iPad/Chrome)

---

## Notes
- Keep this sheet handy during testing
- Fill in test results as you go
- Note any issues found in "Notes" column
- All tests should pass before deployment

---

**Testing Status: Ready**
**All test cases prepared and ready to execute**
