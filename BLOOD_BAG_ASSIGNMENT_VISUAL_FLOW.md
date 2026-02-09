# Blood Bag Assignment - Visual Flow Diagram

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     BLOOD STOCK MANAGEMENT                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │            FRONTEND (React - BloodStock.jsx)           │     │
│  ├────────────────────────────────────────────────────────┤     │
│  │                                                         │     │
│  │  📋 Donate Blood Tab                                   │     │
│  │  ├─ Blood Group Selector                              │     │
│  │  │  └─ onChange: fetchAvailableBloodBags()            │     │
│  │  │                                                     │     │
│  │  ├─ Blood Bag Selector (NEW)                          │     │
│  │  │  ├─ State: availableBloodBags[]                    │     │
│  │  │  ├─ State: loadingBags (boolean)                   │     │
│  │  │  ├─ State: selectedBloodBag (in formData)          │     │
│  │  │  └─ Shows: BAG-XXXX - Donor Name (Units)           │     │
│  │  │                                                     │     │
│  │  ├─ Other Fields (Receiver, Hospital, etc.)           │     │
│  │  │                                                     │     │
│  │  └─ Submit Button: handleDonateBlood()                │     │
│  │     ├─ Validate bag selected                          │     │
│  │     ├─ Show confirmation dialog                       │     │
│  │     ├─ POST /admin/blood-donate                       │     │
│  │     ├─ PUT /admin/donation-status/:id                 │     │
│  │     ├─ Refresh overview                               │     │
│  │     └─ Reset form                                     │     │
│  │                                                         │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  📊 Overview Tab (Auto-updated)                        │     │
│  │  ├─ Donation History Table                            │     │
│  │  │  ├─ Donor Name                                     │     │
│  │  │  ├─ Blood Group                                    │     │
│  │  │  ├─ Bag Number                                     │     │
│  │  │  ├─ Status: [○ Available | ✓ Used]                │     │
│  │  │  ├─ Used Date (if used)                            │     │
│  │  │  ├─ Hospital (if used)                             │     │
│  │  │  └─ Action: Update Button                          │     │
│  │  └─ Refreshes automatically after donation            │     │
│  │                                                         │     │
│  └────────────────────────────────────────────────────────┘     │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                        HTTP Requests
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND (Express - Node.js)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Routes (bloodStockRoutes.js)                                    │
│  ├─ GET /admin/available-blood-bags (NEW)                       │
│  │  └─ verifyAdmin middleware                                   │
│  │     └─ → getAvailableBloodBags()                             │
│  │                                                              │
│  └─ PUT /admin/donation-status/:id (existing)                   │
│     └─ verifyAdmin middleware                                   │
│        └─ → updateDonationStatus()                              │
│                                                                   │
│  Controller (bloodStockController.js)                           │
│  ├─ getAvailableBloodBags(req, res) [NEW]                       │
│  │  ├─ Query: req.query.bloodGroup                             │
│  │  ├─ Find: donationHistoryCollection.find({                  │
│  │  │         bloodGroup: X,                                   │
│  │  │         status: "available"                              │
│  │  │       })                                                 │
│  │  ├─ Sort: by donationDate desc                              │
│  │  └─ Return: Array of bags with metadata                     │
│  │                                                              │
│  └─ updateDonationStatus(req, res) [existing]                   │
│     ├─ Param: id (bag MongoDB ObjectId)                         │
│     ├─ Body: status, usedDate, usedBy, patientName, etc.       │
│     └─ Update: donationHistoryCollection.findOneAndUpdate()    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              ↕
                      Database Queries
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│              MONGODB DATABASE (donationHistoryCollection)         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Document Schema:                                                │
│  {                                                               │
│    _id: ObjectId,                                               │
│    bloodBagNumber: "BAG-2024-001",                              │
│    donorName: "Ahmed Hassan",                                   │
│    donorPhone: "0300123456",                                    │
│    bloodGroup: "A+",                                            │
│    units: 1,                                                    │
│    status: "available" | "used",                                │
│    donationDate: 2024-01-15,                                    │
│                                                                   │
│    ← Updated when bag is assigned →                             │
│    usedDate: 2024-01-20,                                        │
│    usedBy: "Admin",                                             │
│    patientName: "Patient Name",                                 │
│    hospital: "City Hospital",                                   │
│    notes: "Donated via blood bank..."                           │
│  }                                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## User Interaction Flow

```
START
  │
  ├─→ Admin opens Blood Stock page
  │    └─→ Goes to "Donate Blood" tab
  │
  ├─→ Selects Blood Group (e.g., "A+")
  │    └─→ onChange handler triggers fetchAvailableBloodBags()
  │
  ├─→ Loading Spinner Shows
  │    └─→ Request: GET /admin/available-blood-bags?bloodGroup=A+
  │        └─→ Response: Array of available A+ bags
  │
  ├─→ Dropdown Populates
  │    ├─→ BAG-2024-001 - Ahmed Hassan (1 units)
  │    ├─→ BAG-2024-002 - Fatima Khan (1 units)
  │    └─→ BAG-2024-003 - Ali Ahmed (1 units)
  │
  ├─→ Selects Blood Bag
  │    └─→ selectedBloodBag = "507f1f77bcf86cd799439011"
  │
  ├─→ Fills Receiver Details
  │    ├─→ Receiver Name: "Patient Name"
  │    ├─→ Hospital: "City Hospital"
  │    ├─→ Patient ID: "12345"
  │    └─→ etc.
  │
  ├─→ Clicks "Donate Blood" Button
  │    └─→ handleDonateBlood() called
  │
  ├─→ Validation Checks
  │    ├─→ ✓ Stock available?
  │    ├─→ ✓ Bag selected?
  │    └─→ Get selected bag details
  │
  ├─→ Shows Confirmation Dialog
  │    ├─→ Blood Group: A+
  │    ├─→ Units: 1
  │    ├─→ Bag Number: [BAG-2024-001]  ← Highlighted
  │    ├─→ Receiver: Patient Name
  │    ├─→ Hospital: City Hospital
  │    └─→ [Confirm] [Cancel]
  │
  ├─→ Admin Clicks "Confirm Donation"
  │    │
  │    ├─→ POST /admin/blood-donate
  │    │    ├─→ Payload: bloodGroup, units, receiverName, hospital,
  │    │    │           bloodBagId, bloodBagNumber, etc.
  │    │    └─→ Response: Success/Error
  │    │
  │    └─→ If successful:
  │         │
  │         ├─→ PUT /admin/donation-status/:id
  │         │   ├─→ ID: bloodBagId
  │         │   ├─→ Body: status="used", usedDate, usedBy, patientName, etc.
  │         │   └─→ Response: Updated donation record
  │         │
  │         ├─→ fetchDonationHistory()
  │         │   └─→ Refreshes overview list
  │         │
  │         ├─→ Shows Success Message
  │         │   ├─→ "1 unit(s) of A+ donated"
  │         │   ├─→ "Bag: BAG-2024-001"
  │         │   └─→ "Remaining Stock: X units"
  │         │
  │         ├─→ resetForm()
  │         │   └─→ Clears all fields & available bags
  │         │
  │         └─→ Admin can perform next donation
  │
  ├─→ Overview Tab Auto-Updates
  │    ├─→ New row appears in donation history
  │    ├─→ Bag Number: BAG-2024-001
  │    ├─→ Status: ✓ Used
  │    ├─→ Used Date: 2024-01-20
  │    └─→ Hospital: City Hospital
  │
  └─→ END
```

## State Management Flow

```
BloodStock Component State:

Initial State:
{
  formData: {
    bloodGroup: "A+",
    units: 1,
    ...
    selectedBloodBag: "",     ← NEW
  },
  availableBloodBags: [],     ← NEW
  loadingBags: false,         ← NEW
}

When Blood Group Changes:
formData: { ...formData, bloodGroup: "B+" }
→ handleInputChange() detects change
→ Calls fetchAvailableBloodBags("B+")
→ Sets loadingBags: true
→ Fetches from API
→ Sets availableBloodBags: [bags...]
→ Sets loadingBags: false
→ Resets selectedBloodBag: ""

When Bag Selected:
formData: { ...formData, selectedBloodBag: "507f..." }
→ React re-renders dropdown with selected value

On Submit:
→ Validates selectedBloodBag !== ""
→ Finds selected bag from availableBloodBags
→ Sends to API with bloodBagId and bloodBagNumber
→ On success: resetForm()
→ Clears: selectedBloodBag, availableBloodBags
```

## API Call Sequence

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Fetch Available Bags (when blood group changes)     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Frontend:                                                    │
│ GET /admin/available-blood-bags?bloodGroup=A+               │
│ Headers: {                                                   │
│   "Content-Type": "application/json",                        │
│   "Authorization": "Bearer <token>"                          │
│ }                                                            │
│                                                              │
│ Backend:                                                     │
│ 1. Check authorization (verifyAdmin)                         │
│ 2. Get bloodGroup from query params                          │
│ 3. Query MongoDB: donationHistoryCollection.find({           │
│      bloodGroup: "A+",                                       │
│      status: "available"                                     │
│    })                                                        │
│ 4. Sort by donationDate descending                           │
│ 5. Map results to response format                            │
│ 6. Return array of available bags                            │
│                                                              │
│ Response:                                                    │
│ {                                                            │
│   "success": true,                                           │
│   "bags": [                                                  │
│     {                                                        │
│       "_id": "507f1f77bcf86cd799439011",                    │
│       "bloodBagNumber": "BAG-2024-001",                      │
│       "donorName": "Ahmed Hassan",                           │
│       ...                                                    │
│     },                                                       │
│     ...                                                      │
│   ]                                                          │
│ }                                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Donate Blood (when form submitted)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Frontend:                                                    │
│ POST /admin/blood-donate                                     │
│ Body: {                                                      │
│   "bloodGroup": "A+",                                        │
│   "units": 1,                                                │
│   "receiverName": "Patient Name",                            │
│   "hospitalName": "City Hospital",                           │
│   "bloodBagId": "507f1f77bcf86cd799439011",    ← NEW        │
│   "bloodBagNumber": "BAG-2024-001",            ← NEW        │
│   ...                                                        │
│ }                                                            │
│                                                              │
│ Backend:                                                     │
│ 1. Extract bloodBagId and bloodBagNumber from body           │
│ 2. Reduce blood stock                                        │
│ 3. Create transaction record                                 │
│ 4. Return remainingStock                                     │
│                                                              │
│ Response:                                                    │
│ {                                                            │
│   "success": true,                                           │
│   "message": "Blood donated successfully",                   │
│   "remainingStock": 45                                       │
│ }                                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Mark Bag as Used (auto-called after donation)       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Frontend:                                                    │
│ PUT /admin/donation-status/507f1f77bcf86cd799439011          │
│ Body: {                                                      │
│   "status": "used",                                          │
│   "usedDate": "2024-01-20",                                  │
│   "usedBy": "Admin",                                         │
│   "patientName": "Patient Name",                             │
│   "hospital": "City Hospital",                               │
│   "notes": "Donated via blood bank. Patient ID: 12345"       │
│ }                                                            │
│                                                              │
│ Backend:                                                     │
│ 1. Check authorization                                       │
│ 2. Find donation by ID                                       │
│ 3. Update status to "used"                                   │
│ 4. Store used metadata                                       │
│ 5. Return updated document                                   │
│                                                              │
│ Response:                                                    │
│ {                                                            │
│   "success": true,                                           │
│   "message": "Blood status updated to used",                 │
│   "donation": {                                              │
│     "_id": "507f1f77bcf86cd799439011",                      │
│     "status": "used",                                        │
│     "usedDate": "2024-01-20",                                │
│     ...                                                      │
│   }                                                          │
│ }                                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Refresh Overview (auto-called after step 3)         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Frontend:                                                    │
│ GET /admin/donation-history-list                            │
│                                                              │
│ Backend:                                                     │
│ Returns updated donation history with new "used" entry       │
│                                                              │
│ Frontend:                                                    │
│ Updates donationHistory state                                │
│ Re-renders overview table                                    │
│ Shows new bag with "✓ Used" status                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
Scenario 1: No blood group selected
├─ User clicks Donate Blood
├─ Form validation catches empty bloodGroup
└─ Error: Cannot proceed

Scenario 2: No blood bag selected
├─ User clicks Donate Blood
├─ Validation check: selectedBloodBag === ""
├─ Shows: "Blood Bag Required - Please select a blood bag to donate"
└─ Form not submitted

Scenario 3: Blood type has no available bags
├─ User selects blood group "A+"
├─ API returns empty bags array
├─ Shows warning: "No available blood bags for A+"
├─ Dropdown disabled
└─ Cannot proceed without selecting different blood type

Scenario 4: Insufficient stock
├─ Backend stock check fails
├─ Shows: "Insufficient Stock - Only X units available"
├─ Error prevents donation
└─ User must adjust units

Scenario 5: API error fetching bags
├─ Network error or server error
├─ Dropdown reverts to empty state
├─ Console logs error
└─ User can retry blood group selection

Scenario 6: API error during donation
├─ POST /admin/blood-donate fails
├─ Shows error message
├─ Bag is NOT marked as used
├─ User can retry
└─ Form data preserved
```

## Database Updates Timeline

```
Timeline of Database State Changes:

T=0: Initial State
  donationHistoryCollection:
  {
    _id: "507f...",
    bloodBagNumber: "BAG-2024-001",
    status: "available",
    donationDate: 2024-01-15,
    ...
  }

T=1: User selects bag and confirms donation
  POST /admin/blood-donate
  → Blood stock updated: A+ stock reduced by 1

T=2: Auto-called after successful donation
  PUT /admin/donation-status/:id
  → donationHistoryCollection updated:
  {
    _id: "507f...",
    bloodBagNumber: "BAG-2024-001",
    status: "used",           ← CHANGED
    donationDate: 2024-01-15,
    usedDate: 2024-01-20,      ← NEW
    usedBy: "Admin",           ← NEW
    patientName: "Patient",    ← NEW
    hospital: "City Hospital", ← NEW
    notes: "Donated via...",   ← NEW
    ...
  }

T=3: Frontend fetches updated history
  GET /admin/donation-history-list
  → Returns all donations with updated status
  → Frontend re-renders overview
  → Shows "✓ Used" badge for this bag
```

## Conclusion

This visual flow diagram shows:
1. How components interact with each other
2. How data flows from UI to database
3. The sequence of operations
4. Error handling at each step
5. State management throughout the process
6. How the database is updated in real-time

All these components work together seamlessly to provide a complete blood bag assignment experience.
