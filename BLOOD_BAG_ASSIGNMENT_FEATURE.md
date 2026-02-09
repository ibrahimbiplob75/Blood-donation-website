# Blood Bag Assignment During Donation - Feature Implementation

## Overview
Implemented blood bag assignment feature for the "Donate Blood" operation in the Blood Stock management page. When an admin assigns blood from the blood bank, they can now:
1. Select a blood group
2. View available blood bags matching that blood type
3. Select a specific blood bag to assign
4. Upon assignment, the bag is automatically marked as "used" in the overview

## Changes Made

### 1. Frontend Changes - `Frontend/src/components/inventory/BloodStock.jsx`

#### New State Variables (Lines 25-70)
```javascript
const [availableBloodBags, setAvailableBloodBags] = useState([]);
const [loadingBags, setLoadingBags] = useState(false);
```
- `availableBloodBags`: Stores the list of available blood bags for selected blood group
- `loadingBags`: Loading state while fetching bags from server

#### Updated Form Data
```javascript
selectedBloodBag: "" // Added to formData
```
- Stores the selected blood bag ID

#### New Function - `fetchAvailableBloodBags(bloodGroup)`
Fetches available blood bags for a specific blood group:
```javascript
const fetchAvailableBloodBags = async (bloodGroup) => {
  setLoadingBags(true);
  const response = await fetch(
    `${baseURL}/admin/available-blood-bags?bloodGroup=${bloodGroup}`,
    { credentials: "include", ... }
  );
  if (response.ok) {
    const data = await response.json();
    setAvailableBloodBags(data.bags || []);
  }
  setLoadingBags(false);
};
```

#### Updated `handleInputChange(e)` Function
Now detects blood group changes in the Donate Blood tab and fetches available bags:
```javascript
if (name === "bloodGroup" && activeTab === "donate") {
  fetchAvailableBloodBags(value);
  setFormData(prev => ({ ...prev, selectedBloodBag: "" }));
}
```

#### Updated `handleDonateBlood(e)` Function
Enhanced to:
1. Validate that a blood bag is selected
2. Include selected blood bag in the donation payload
3. Display bag information in confirmation dialog
4. Call `/admin/donation-status/:id` to mark the bag as "used" after successful donation
5. Refresh donation history to show updated status

```javascript
// Validation for selected bag
if (formData.selectedBloodBag === "") {
  Swal.fire({ icon: "error", title: "Blood Bag Required", ... });
  return;
}

// Include in POST request
body: JSON.stringify({
  ...
  bloodBagId: formData.selectedBloodBag,
  bloodBagNumber: selectedBag?.bloodBagNumber,
  ...
})

// Mark bag as used after donation
await fetch(`${baseURL}/admin/donation-status/${formData.selectedBloodBag}`, {
  method: "PUT",
  body: JSON.stringify({
    status: "used",
    usedDate: new Date().toISOString().split('T')[0],
    usedBy: "Admin",
    patientName: formData.receiverName,
    hospital: formData.hospitalName,
    ...
  })
});
```

#### New UI - Blood Bag Selector Dropdown
Added after blood group selector in Donate Blood form:
```jsx
{/* Blood Bag Selector */}
<div className="form-control">
  <label className="label">
    <span className="label-text font-semibold">
      Select Blood Bag *
    </span>
  </label>
  {loadingBags ? (
    <div className="select select-bordered w-full flex items-center justify-center">
      <span className="loading loading-spinner loading-sm"></span>
      Loading bags...
    </div>
  ) : availableBloodBags.length > 0 ? (
    <select
      name="selectedBloodBag"
      value={formData.selectedBloodBag}
      onChange={handleInputChange}
      className="select select-bordered w-full"
      required
    >
      <option value="">-- Select a blood bag --</option>
      {availableBloodBags.map((bag) => (
        <option key={bag._id} value={bag._id}>
          {bag.bloodBagNumber} - {bag.donorName} ({bag.units} units)
        </option>
      ))}
    </select>
  ) : formData.bloodGroup ? (
    <div className="alert alert-warning">
      <span>No available blood bags for {formData.bloodGroup}</span>
    </div>
  ) : (
    <div className="select select-bordered w-full text-gray-500">
      Select blood group first
    </div>
  )}
</div>
```

#### Updated `resetForm()` Function
Now also resets available blood bags:
```javascript
selectedBloodBag: "",
```
and clears the list:
```javascript
setAvailableBloodBags([]);
```

### 2. Backend Changes

#### New Controller Function - `Backend/controllers/bloodStockController.js`

```javascript
const getAvailableBloodBags = async (req, res) => {
  try {
    const { bloodGroup } = req.query;

    if (!bloodGroup) {
      return res.status(400).json({
        success: false,
        message: 'Blood group is required'
      });
    }

    const { donationHistoryCollection } = getCollections();

    // Find all available (not used) blood bags for the specified blood group
    const availableBags = await donationHistoryCollection
      .find({
        bloodGroup: bloodGroup,
        status: 'available'
      })
      .sort({ donationDate: -1 })
      .toArray();

    // Return only necessary fields
    const bags = availableBags.map(bag => ({
      _id: bag._id,
      bloodBagNumber: bag.bloodBagNumber,
      donorName: bag.donorName,
      donorPhone: bag.donorPhone,
      units: bag.units,
      bloodGroup: bag.bloodGroup,
      donationDate: bag.donationDate,
      status: bag.status
    }));

    res.json({
      success: true,
      bags: bags
    });
  } catch (error) {
    console.error('Get available blood bags error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available blood bags',
      error: error.message
    });
  }
};
```

#### Updated Routes - `Backend/routes/bloodStockRoutes.js`

Added new route:
```javascript
router.get('/admin/available-blood-bags', verifyAdmin, getAvailableBloodBags);
```

Also imported the new controller function in the destructuring statement.

### 3. Data Flow

**When user selects a blood group:**
1. `handleInputChange` detects blood group change in donate tab
2. Calls `fetchAvailableBloodBags(bloodGroup)`
3. Fetches available bags from `GET /admin/available-blood-bags?bloodGroup=A+`
4. Updates `availableBloodBags` state
5. Displays dropdown showing available bags

**When user selects a bag and submits:**
1. Validates that a bag is selected
2. Finds selected bag details from `availableBloodBags`
3. Shows confirmation dialog with bag information
4. On confirmation, POSTs to `/admin/blood-donate` with:
   - `bloodBagId`: The selected bag's MongoDB ID
   - `bloodBagNumber`: The selected bag's number
   - Other donation details (receiver name, hospital, etc.)
5. After successful donation, calls `PUT /admin/donation-status/:id` with:
   - `status: "used"`
   - `usedDate`: Today's date
   - `usedBy`: "Admin"
   - `patientName`: Receiver name
   - `hospital`: Hospital name
   - `notes`: Donation context
6. Refreshes donation history to show updated status
7. Resets form and clears available bags list

## API Endpoints

### GET /admin/available-blood-bags
**Purpose:** Fetch available (not used) blood bags for a specific blood group

**Query Parameters:**
- `bloodGroup`: Blood group (required) - e.g., "A+", "B-", "O+"

**Response (Success):**
```json
{
  "success": true,
  "bags": [
    {
      "_id": "ObjectId",
      "bloodBagNumber": "BAG-2024-001",
      "donorName": "Ahmed Hassan",
      "donorPhone": "0300123456",
      "units": 1,
      "bloodGroup": "A+",
      "donationDate": "2024-01-15T10:30:00Z",
      "status": "available"
    },
    ...
  ]
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Blood group is required"
}
```

## UI/UX Features

1. **Loading State**: Shows spinner while fetching available bags
2. **Empty State**: Shows warning if no bags available for selected blood type
3. **Placeholder State**: Shows disabled message if blood group not selected yet
4. **Dropdown Display**: Shows bag number, donor name, and units for easy identification
5. **Confirmation Dialog**: Shows all selected information before confirming donation
6. **Auto-refresh**: Overview automatically refreshes after donation
7. **Status Badge**: Shows "✓ Used" status for assigned bags in overview

## Testing Checklist

- [ ] Select blood group in Donate Blood tab
- [ ] Verify available blood bags dropdown appears with bags of that type
- [ ] Select a blood bag from dropdown
- [ ] Verify confirmation dialog shows bag details
- [ ] Confirm donation
- [ ] Verify donation succeeds and shows success message with bag number
- [ ] Check overview tab - verify bag now shows as "✓ Used"
- [ ] Try donating without selecting bag - verify error message
- [ ] Try with blood group that has no available bags - verify warning
- [ ] Reset form - verify available bags list clears

## Benefits

1. **Traceability**: Know exactly which blood bag was used for each donation
2. **Prevents Double Assignment**: Each bag can only be assigned once
3. **Easy Selection**: Dropdown shows donor info for quick identification
4. **Automatic Status**: Bag automatically marked as used after assignment
5. **Error Prevention**: Cannot complete donation without selecting a bag
6. **Real-time Updates**: Overview immediately reflects new status

## Future Enhancements

- Add search/filter in blood bag dropdown
- Show expiry date for each blood bag
- Add notes/comments to blood bag history
- Implement blood bag barcode scanning
- Add batch operations for multiple donations
- Create blood bag assignment reports
