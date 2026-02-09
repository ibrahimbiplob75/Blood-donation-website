# 🩸 Blood Entry Form with Bag Number & User History Tracking

## Overview
Enhanced the Blood Entry form in the inventory management system to:
1. Add blood bag number input field (required)
2. Check if donor phone matches a registered user
3. Create donation history for both registered and unregistered donors
4. Track donor status in the system

---

## What Changed

### Frontend Changes

#### File: `Frontend/src/components/inventory/BloodStock.jsx`

**1. Updated Form Data State**
```javascript
// Added new field
const [formData, setFormData] = useState({
  // ... existing fields
  bloodBagNumber: "",  // ← NEW
  // ... rest
});
```

**2. Added Blood Bag Number Input Field**
```jsx
<div className="form-control">
  <label className="label">
    <span className="label-text font-semibold">
      Blood Bag Number *
    </span>
  </label>
  <input
    type="text"
    name="bloodBagNumber"
    value={formData.bloodBagNumber}
    onChange={handleInputChange}
    placeholder="e.g., BAG-2024-001"
    className="input input-bordered w-full"
    required
  />
</div>
```

**3. Enhanced handleEntryBlood Function**
- Validates blood bag number (required)
- Shows blood bag number in confirmation dialog
- Calls new endpoint to check if donor phone matches registered user
- Creates donation history with user status (registered/unregistered)
- Shows success message with bag number and user status

```javascript
// NEW LOGIC
1. Check if bloodBagNumber is provided ✓
2. Call /admin/check-user-by-phone with donor phone ✓
3. If user found:
   - Store userId
   - Set isRegisteredUser = true
4. Add blood to stock via /admin/blood-entry ✓
5. Create donation history via /admin/donation-history ✓
   - With userId if registered
   - Without userId if unregistered
6. Show confirmation with donor status
```

---

### Backend Changes

#### File: `Backend/controllers/bloodStockController.js`

**1. Updated bloodEntry Function**
- Now accepts `bloodBagNumber` parameter
- Stores blood bag number in transaction record
- Returns bag number in success response

```javascript
// Destructured from req.body:
const { bloodBagNumber } = req.body;

// Stored in transaction:
bloodBagNumber: bloodBagNumber || ''
```

**2. Added checkUserByPhone Function** (NEW)
```javascript
POST /admin/check-user-by-phone
Request: { phone: "01712345678" }
Response: 
{
  success: true,
  user: {
    _id: "user_id",
    name: "User Name",
    phone: "01712345678",
    email: "user@email.com",
    bloodGroup: "O+"
  }
}
// OR null if user not found
```

Logic:
- Validates phone number provided
- Searches userCollection by phone
- Returns user details if found
- Returns null if not found

**3. Added createDonationHistory Function** (NEW)
```javascript
POST /admin/donation-history
Request: {
  donorName: "Ahmed Ali",
  donorPhone: "01712345678",
  donorAddress: "Dhaka, BD",
  bloodGroup: "A+",
  units: 1,
  bloodBagNumber: "BAG-2024-001",
  userId: "user_id_or_null",
  isRegisteredUser: true_or_false,
  notes: "Any notes"
}
Response:
{
  success: true,
  message: "Donation history created for registered user",
  historyId: "history_id"
}
```

Logic:
- Validates blood bag number (required)
- Checks if blood bag number already exists (prevents duplicates)
- Creates donation history record with:
  - Donor information
  - Blood details
  - User reference (if registered)
  - Donor status flag
  - Timestamp
- Stores in `donationHistoryCollection`

---

#### File: `Backend/routes/bloodStockRoutes.js`

**Added New Routes:**
```javascript
// Check if user exists by phone (admin only)
router.post('/admin/check-user-by-phone', verifyAdmin, checkUserByPhone);

// Create donation history (admin only)
router.post('/admin/donation-history', verifyAdmin, createDonationHistory);
```

**Exported New Functions:**
```javascript
module.exports = {
  // ... existing exports
  checkUserByPhone,      // ← NEW
  createDonationHistory  // ← NEW
};
```

---

## How It Works

### User Flow

```
1. Admin opens "Blood Entry" tab
   ↓
2. Admin fills form:
   - Blood Group: A+
   - Units: 1
   - Donor Name: Ahmed Ali
   - Donor Phone: 01712345678
   - Blood Bag Number: BAG-2024-001  ← NEW
   ↓
3. Admin clicks "Add Blood Entry"
   ↓
4. Frontend validates:
   - Blood bag number required? ✓
   ↓
5. Shows confirmation dialog with all details including bag number
   ↓
6. Admin confirms
   ↓
7. Frontend calls /admin/check-user-by-phone
   - Checks if 01712345678 is registered user
   ↓
8a. IF USER FOUND:
   - Store userId
   - Set isRegisteredUser = true
   ↓
8b. IF USER NOT FOUND:
   - Set userId = null
   - Set isRegisteredUser = false
   ↓
9. Frontend calls /admin/blood-entry
   - Adds blood to stock
   - Records transaction with bag number
   ↓
10. Frontend calls /admin/donation-history
    - Creates donation history record
    - Links to user if registered
    - Marks as unregistered if not found
    ↓
11. Shows success message:
    "Blood Entry Successful"
    "1 unit(s) of A+ added"
    "Bag #: BAG-2024-001"
    "New Stock: X units"
    "📋 Donation History: Registered User" (or Unregistered User)
    ↓
12. Form resets, page refreshes
```

---

## Data Structure

### Donation History Record
```javascript
{
  _id: ObjectId,
  donorName: "Ahmed Ali",
  donorPhone: "01712345678",
  donorAddress: "Dhaka, BD",
  bloodGroup: "A+",
  units: 1,
  bloodBagNumber: "BAG-2024-001",  // ← UNIQUE
  userId: ObjectId or null,         // ← If registered user
  isRegisteredUser: true or false,  // ← Flag for status
  donationDate: 2026-02-04T...,
  status: "completed",
  notes: ""
}
```

### Blood Transaction Record (Updated)
```javascript
{
  type: "entry",
  bloodGroup: "A+",
  units: 1,
  donorName: "Ahmed Ali",
  donorPhone: "01712345678",
  bloodBagNumber: "BAG-2024-001",  // ← NEWLY STORED
  // ... rest of transaction data
}
```

---

## Benefits

✅ **Unique Identification**: Each blood unit is tracked with unique bag number
✅ **User Linking**: Registered donors' blood is linked to their profile
✅ **Unregistered Tracking**: Unregistered donors' blood is still recorded
✅ **Complete Audit Trail**: All blood movements tracked with bag numbers
✅ **Donation History**: Both registered and unregistered donations recorded
✅ **Duplicate Prevention**: Blood bag numbers are unique, prevents duplicates
✅ **Easy Donor Search**: Can find all donations from specific phone number

---

## Testing Guide

### Test Case 1: Registered User
1. Enter donor phone for existing user: `01712345678`
2. Fill other fields normally
3. Submit form
4. Expected: Success message shows "Registered User"
5. Database: Donation history has userId populated

### Test Case 2: Unregistered User
1. Enter donor phone not in system: `01799999999`
2. Fill other fields normally
3. Submit form
4. Expected: Success message shows "Unregistered User"
5. Database: Donation history has userId = null, isRegisteredUser = false

### Test Case 3: Duplicate Bag Number
1. Enter blood bag number that already exists
2. Submit form
3. Expected: Error message "Blood bag number already exists"
4. Database: No new record created

### Test Case 4: Missing Bag Number
1. Leave blood bag number empty
2. Try to submit
3. Expected: Error message "Please enter a blood bag number"
4. Form should not submit

---

## API Endpoints Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/admin/blood-entry` | POST | Admin | Add blood to stock (now includes bag number) |
| `/admin/check-user-by-phone` | POST | Admin | Check if phone number is registered user |
| `/admin/donation-history` | POST | Admin | Create donation history record |

---

## Error Handling

### Frontend Errors
- ❌ Blood bag number required: Shows Swal error
- ❌ Server connection failed: Shows connection error
- ❌ Bag number already exists: Shows error from backend

### Backend Errors
- ❌ Missing required fields: Returns 400 error
- ❌ Database error: Returns 500 error with message
- ❌ Duplicate bag number: Returns 400 error

---

## Files Modified

1. **Frontend/src/components/inventory/BloodStock.jsx**
   - Added bloodBagNumber to state
   - Added blood bag input field
   - Enhanced handleEntryBlood function
   - Updated resetForm to include bloodBagNumber
   - Added user phone checking logic

2. **Backend/controllers/bloodStockController.js**
   - Updated bloodEntry to accept bloodBagNumber
   - Added checkUserByPhone function
   - Added createDonationHistory function
   - Updated exports

3. **Backend/routes/bloodStockRoutes.js**
   - Added new routes for checkUserByPhone
   - Added new route for createDonationHistory
   - Updated imports

---

## Next Steps (Optional Enhancements)

- [ ] Add blood bag barcode generation
- [ ] Add donor history view from admin panel
- [ ] Add blood bag tracking timeline
- [ ] Add donor notification when blood registered
- [ ] Add blood expiry date tracking (if applicable)
- [ ] Add blood compatibility matrix for transfusions

---

## Status
✅ **Implementation Complete**
- All files modified and validated
- No syntax errors
- Ready for deployment and testing
