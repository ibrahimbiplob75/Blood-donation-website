# 🩸 Blood Entry - Quick Reference

## What's New?

### Blood Entry Form Now Has:
1. **Blood Bag Number Field** (Required) - Unique identifier for each blood unit
2. **User Status Tracking** - Registered or Unregistered donor
3. **Automatic Donation History Creation** - Linked to user if registered

---

## Admin Workflow

### Step-by-Step
```
1. Go to: Inventory → Blood Stock → "Add Blood to Stock" tab

2. Fill the form:
   - Blood Group: Select (A+, B+, etc.)
   - Units: Enter number (1, 2, 3, etc.)
   - Donor Name: Enter name
   - Donor Phone: Enter phone
   - Blood Bag Number: Enter unique ID (e.g., BAG-2024-001) ← NEW
   - Address: (Optional)
   - Notes: (Optional)

3. Click: "Add Blood Entry"

4. Confirm in dialog

5. Result:
   ✓ Blood added to stock
   ✓ Transaction recorded
   ✓ Donation history created
   ✓ User automatically linked if phone matches registered user
   ✓ Unregistered status tracked if phone not found
```

---

## Blood Bag Number Format Examples

```
Suggested formats:
- BAG-2024-001
- BLOOD-20240204-001
- DHK-20240204-A+-001
- BG-A+-001-2024
- STOCK-BAG-0001

Key: Must be UNIQUE for each blood unit
```

---

## What Happens Behind Scenes?

```
Frontend:
┌─────────────────────────────┐
│ Admin fills form + bag #    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Check: Donor phone exists?  │
│ /admin/check-user-by-phone  │
└──────────────┬──────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
    ▼                     ▼
FOUND USER          NOT FOUND
Set userId          Set userId
isReg = true        = null
                    isReg = false
    │                     │
    └──────────┬──────────┘
               │
               ▼
┌─────────────────────────────┐
│ Add blood to stock          │
│ /admin/blood-entry          │
│ (with bag number)           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Create donation history     │
│ /admin/donation-history     │
│ (linked to user if found)   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Success! Blood registered   │
│ Status: Reg/Unreg User      │
└─────────────────────────────┘
```

---

## Database Records Created

### Blood Stock (Updated)
```
Collection: blood_stock
{
  bloodGroup: "A+",
  units: 101  ← Incremented by 1
}
```

### Blood Transaction (New Entry)
```
Collection: blood_transactions
{
  type: "entry",
  bloodGroup: "A+",
  units: 1,
  donorName: "Ahmed Ali",
  donorPhone: "01712345678",
  bloodBagNumber: "BAG-2024-001",  ← STORED
  status: "completed"
}
```

### Donation History (New Record)
```
Collection: donation_history
{
  donorName: "Ahmed Ali",
  donorPhone: "01712345678",
  bloodGroup: "A+",
  units: 1,
  bloodBagNumber: "BAG-2024-001",
  userId: "507f1f77bcf86cd799439011",  ← If registered
  isRegisteredUser: true,               ← Status flag
  donationDate: 2026-02-04T...
}
```

---

## Success Message Example

```
✓ Blood Entry Successful

1 unit(s) of A+ added
Bag #: BAG-2024-001
New Stock: 101 units
📋 Donation History: Registered User
```

OR (if unregistered):

```
✓ Blood Entry Successful

1 unit(s) of A+ added
Bag #: BAG-2024-001
New Stock: 101 units
📋 Donation History: Unregistered User
```

---

## Error Messages

```
Error: Blood Bag Number Required
→ Action: Fill in the Blood Bag Number field

Error: Blood bag number already exists
→ Action: Use a different bag number (must be unique)

Error: Failed to connect to server
→ Action: Check internet connection, try again

Error: Failed to add blood to stock
→ Action: Try again, contact admin if persists
```

---

## Key Features

✅ **Unique Blood Identification** - Each unit has unique bag number
✅ **Automatic User Linking** - Recognizes registered donors by phone
✅ **Unregistered Tracking** - Still records unregistered donors
✅ **Duplicate Prevention** - Can't use same bag number twice
✅ **Complete Record** - All donor info, blood type, date stored
✅ **Easy Audit Trail** - Track all blood movements by bag number

---

## Tips

💡 Use consistent bag numbering system
💡 Keep bag numbers in logical sequence
💡 Consider using format: BAG-YYYY-MMDD-###
💡 Train admins on unique ID requirements
💡 Regularly audit donation history
💡 Cross-reference bag numbers with inventory

---

## Related Screens

- **Blood Stock Overview** - See total inventory
- **Donation History** - View all donor records
- **Transaction History** - See blood movements
- **Stock History Tab** - Filter by date, type, blood group
