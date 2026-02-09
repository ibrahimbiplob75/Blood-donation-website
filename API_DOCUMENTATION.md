# Blood Donation System - API Documentation for New Features

## 1. Approve Blood Request with Blood Bag Number

### Endpoint
```
PUT /blood-requests/{requestId}/approve
```

### Authentication
Required - Admin role

### Request Parameters
- `requestId` (URL parameter) - The MongoDB ObjectId of the blood request

### Request Body
```json
{
  "adminId": "admin-user-id",
  "adminEmail": "admin@example.com",
  "bloodBagNumber": "BAG-001-2024"
}
```

### Request Body Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| adminId | String | No | Admin user ID (can be used instead of adminEmail) |
| adminEmail | String | Yes | Email of the admin approving the request |
| bloodBagNumber | String | **Yes** | Unique blood bag identifier (NEW - REQUIRED) |

### Success Response (200 OK)
```json
{
  "message": "Blood request approved successfully with donation history recorded",
  "request": {
    "_id": "507f1f77bcf86cd799439011",
    "requestedBy": "507f1f77bcf86cd799439012",
    "patientName": "John Doe",
    "bloodGroup": "O+",
    "unitsRequired": 1,
    "urgency": "urgent",
    "hospital": {
      "name": "City Hospital",
      "address": "123 Main St",
      "contactNumber": "555-1234"
    },
    "requiredDate": "2024-02-10T00:00:00.000Z",
    "status": "approved",
    "contactNumber": "555-5678",
    "additionalInfo": "Patient needs urgent transfusion",
    "bloodBagNumber": "BAG-001-2024",
    "approvalStatus": "approved",
    "approvedBy": "admin@example.com",
    "approvedAt": "2024-02-04T10:30:00.000Z",
    "createdAt": "2024-02-03T09:00:00.000Z",
    "updatedAt": "2024-02-04T10:30:00.000Z"
  }
}
```

### Error Responses

**400 Bad Request - Invalid Request ID**
```json
{
  "message": "Invalid request ID"
}
```

**400 Bad Request - Missing Blood Bag Number**
```json
{
  "message": "Blood bag number is required"
}
```

**404 Not Found**
```json
{
  "message": "Blood request not found"
}
```

**500 Internal Server Error**
```json
{
  "message": "Failed to approve blood request",
  "error": "Error details..."
}
```

---

## 2. Get Donation History by User

### Endpoint (Recommended to add)
```
GET /donation-history/user/{userId}
```

### Authentication
Required - User viewing own history or Admin

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | String | Yes | MongoDB ObjectId of the user |

### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | Number | 10 | Number of records to return |
| skip | Number | 0 | Number of records to skip (for pagination) |
| sort | String | -approvalDate | Sort field (prefix with - for descending) |

### Success Response (200 OK)
```json
{
  "success": true,
  "total": 5,
  "records": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "userId": "507f1f77bcf86cd799439012",
      "bloodRequestId": "507f1f77bcf86cd799439011",
      "bloodBagNumber": "BAG-001-2024",
      "bloodGroup": "O+",
      "unitsGiven": 1,
      "donationDate": "2024-02-04T10:30:00.000Z",
      "approvalDate": "2024-02-04T10:30:00.000Z",
      "approvedBy": "admin@example.com",
      "patientName": "John Doe",
      "hospitalName": "City Hospital",
      "notes": "Emergency transfusion",
      "status": "completed",
      "createdAt": "2024-02-04T10:30:00.000Z",
      "updatedAt": "2024-02-04T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439012",
      "bloodRequestId": "507f1f77bcf86cd799439015",
      "bloodBagNumber": "BAG-002-2024",
      "bloodGroup": "O+",
      "unitsGiven": 1,
      "donationDate": "2024-01-15T14:00:00.000Z",
      "approvalDate": "2024-01-15T14:00:00.000Z",
      "approvedBy": "admin@example.com",
      "patientName": "Jane Smith",
      "hospitalName": "Central Hospital",
      "notes": "",
      "status": "completed",
      "createdAt": "2024-01-15T14:00:00.000Z",
      "updatedAt": "2024-01-15T14:00:00.000Z"
    }
  ]
}
```

---

## 3. Get Donation History by Blood Bag Number

### Endpoint (Recommended to add)
```
GET /donation-history/bag/{bloodBagNumber}
```

### Authentication
Required - Admin

### URL Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| bloodBagNumber | String | Yes | Blood bag number to look up |

### Success Response (200 OK)
```json
{
  "success": true,
  "record": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439012",
    "bloodRequestId": "507f1f77bcf86cd799439011",
    "bloodBagNumber": "BAG-001-2024",
    "bloodGroup": "O+",
    "unitsGiven": 1,
    "donationDate": "2024-02-04T10:30:00.000Z",
    "approvalDate": "2024-02-04T10:30:00.000Z",
    "approvedBy": "admin@example.com",
    "patientName": "John Doe",
    "hospitalName": "City Hospital",
    "notes": "Emergency transfusion",
    "status": "completed",
    "createdAt": "2024-02-04T10:30:00.000Z",
    "updatedAt": "2024-02-04T10:30:00.000Z"
  }
}
```

---

## 4. User Model - Updated Last Donation Date

### Field Update
When a blood request is approved by an admin, the requesting user's profile is automatically updated:

```javascript
// User Document
{
  "_id": ObjectId,
  "name": "Donor Name",
  "email": "donor@example.com",
  "bloodGroup": "O+",
  "lastDonateDate": "2024-02-04T10:30:00.000Z", // AUTO-UPDATED on approval
  "bloodGiven": 5,
  "bloodTaken": 0,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2024-02-04T10:30:00.000Z"
}
```

### Eligibility Use Cases
The `lastDonateDate` field can be used for:
- Blood bank eligibility requirements (e.g., 56+ days since last donation)
- Donor timeline calculations
- Risk assessment during donation requests

---

## 5. DonationHistory Collection Structure

### MongoDB Collection: `donationHistory`

```javascript
// Document Schema
{
  "_id": ObjectId,                    // MongoDB auto-generated ID
  "userId": ObjectId,                 // Reference to User
  "bloodRequestId": ObjectId,         // Reference to BloodRequest
  "bloodBagNumber": String,           // Unique identifier (indexed)
  "bloodGroup": String,               // A+, A-, B+, B-, AB+, AB-, O+, O-
  "unitsGiven": Number,               // Decimal units (e.g., 1, 0.5)
  "donationDate": Date,               // Date of donation/approval
  "approvalDate": Date,               // Date of admin approval
  "approvedBy": String,               // Admin email/ID who approved
  "patientName": String,              // Patient receiving blood
  "hospitalName": String,             // Hospital where blood is used
  "notes": String,                    // Additional information
  "status": String,                   // 'completed', 'pending', 'cancelled'
  "createdAt": Date,                  // Record creation timestamp
  "updatedAt": Date                   // Record update timestamp
}
```

### Indexes Recommended
```javascript
// Create these indexes for better query performance
db.donationHistory.createIndex({ userId: 1 })
db.donationHistory.createIndex({ bloodBagNumber: 1 })  // Unique
db.donationHistory.createIndex({ approvalDate: -1 })
db.donationHistory.createIndex({ bloodGroup: 1 })
db.donationHistory.createIndex({ userId: 1, approvalDate: -1 })
```

---

## Data Validation

### Blood Bag Number Validation
- **Required** - Cannot be null, undefined, or empty string
- **Unique** - Each blood bag number must be unique in the donationHistory collection
- **Format** - No specific format enforced (allows flexibility)
- **Recommended Format** - `BAG-NNN-YYYY` (e.g., BAG-001-2024)

### Blood Group Validation
- Must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-

### Units Given Validation
- Minimum: 0.5 units
- Type: Number (decimal supported)

---

## Usage Example - JavaScript/Fetch

```javascript
// Approve blood request with blood bag number
const approveRequest = async (requestId, bloodBagNumber) => {
  try {
    const response = await fetch(
      `/api/blood-requests/${requestId}/approve`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          adminEmail: 'admin@example.com',
          bloodBagNumber: bloodBagNumber,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    const data = await response.json();
    console.log('Approval successful:', data.request);
    return data;
  } catch (error) {
    console.error('Failed to approve:', error);
    throw error;
  }
};

// Usage
approveRequest('507f1f77bcf86cd799439011', 'BAG-001-2024');
```

---

## Migration Notes

For existing blood requests that were approved before this update:
- No migration needed - new approvals automatically create history records
- To create history for existing approvals, a migration script would be needed
- Consider implementing a bulk operation to backfill donation history for previously approved requests

---

## Performance Considerations

- DonationHistory collection will grow with each approval
- Add indexes on frequently queried fields (userId, bloodBagNumber, approvalDate)
- Consider archiving old donation records after a certain period
- Implement pagination for user donation history queries (recommended limit: 10-20 records per page)
