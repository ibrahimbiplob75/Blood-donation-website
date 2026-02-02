const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { getCollections } = require('../config/database');


const getUsers = async (req, res) => {
  try {
    const { usersCollection } = getCollections();
    const { email, approvedOnly } = req.query;

    let query = {};
    if (email) {
      query.email = email.trim().toLowerCase();
    }
    
    // Only show approved donors to public
    if (approvedOnly === 'true') {
      query.$or = [
        { donorApprovalStatus: 'approved' },
        { donorApprovalStatus: { $exists: false } }, // Legacy users without approval status
        { role: { $ne: 'donor' } } // Non-donor users
      ];
    }

    const users = await usersCollection
      .find(query, { projection: { password: 0 } })
      .sort({ _id: -1 })
      .toArray();

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};


const createUser = async (req, res) => {
  try {
    const { name, phone, lastDonateDate, email, bloodGroup, district, password, role, batchNo, course } = req.body;
    
    const { usersCollection } = getCollections();
    const existingUser = await usersCollection.findOne({
      email: email.trim().toLowerCase()
    });
    
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    let hashedPassword = '';
    if (password && typeof password === 'string' && password.trim() !== '') {
      const saltRounds = 12;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const newUser = {
      Name: name ? name.trim() : '',
      phone: phone || '',
      lastDonateDate: lastDonateDate || '',
      email: email ? email.trim().toLowerCase() : '',
      role: role ? String(role).trim().toLowerCase() : 'user',
      bloodTaken: 0,
      bloodGiven: 0,
      bloodGroup: bloodGroup || '',
      district: district || '',
      batchNo: batchNo ? parseInt(batchNo) : null,
      course: course || null,
      password: hashedPassword,
      donorApprovalStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);
    
    const createdUser = await usersCollection.findOne(
      { _id: result.insertedId },
      { projection: { password: 0 } }
    );
    
    res.status(201).json({ 
      message: 'User created successfully',
      user: createdUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      message: 'Failed to create user',
      error: error.message 
    });
  }
};


const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating user with ID:', id);
    const { name, phone, lastDonateDate, email, role, bloodGroup, district, bloodGiven, bloodTaken, password, batchNo, course } = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const { usersCollection } = getCollections();
    
    const existingUser = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
  
    const duplicateUser = await usersCollection.findOne({ 
      email: email.trim().toLowerCase(), 
      _id: { $ne: new ObjectId(id) } 
    });
    if (duplicateUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }
    
    const updateData = {
      Name: name ? name.trim() : existingUser.Name,
      phone: phone || existingUser.phone,
      lastDonateDate: lastDonateDate || existingUser.lastDonateDate,
      email: email ? email.trim().toLowerCase() : existingUser.email,
      bloodGroup: bloodGroup || existingUser.bloodGroup,
      district: district || existingUser.district,
      batchNo: batchNo ? parseInt(batchNo) : existingUser.batchNo,
      course: course || existingUser.course,
      bloodGiven: bloodGiven !== undefined ? parseInt(bloodGiven) || 0 : existingUser.bloodGiven || 0,
      bloodTaken: bloodTaken !== undefined ? parseInt(bloodTaken) || 0 : existingUser.bloodTaken || 0,
      updatedAt: new Date()
    };
    if (role) {
      updateData.role = role;
    }
    if (password && password.trim()) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    const updatedUser = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );
    
    res.status(200).json({ 
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      message: 'Failed to update user',
      error: error.message 
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const { usersCollection } = getCollections();
    const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ 
      message: 'User deleted successfully',
      id: id 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Failed to delete user',
      error: error.message 
    });
  }
};



// Get user profile with statistics
const getUserProfile = async (req, res) => {
  try {
    const { usersCollection, bloodTransactionsCollection, bloodRequestsCollection } = getCollections();
    const { email } = req.query;
    
    if (!email) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Get user details
    const user = await usersCollection.findOne(
      { email: email.trim().toLowerCase() },
      { projection: { password: 0 } }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    const donationHistory = await bloodTransactionsCollection
      .find({
        type: 'entry',
        $or: [
          { donorEmail: email.trim().toLowerCase() },
          { donorPhone: user.phone }
        ]
      })
      .sort({ donatedAt: -1 })
      .toArray();

    // Get blood request history (requests created by user)
    const requestHistory = await bloodRequestsCollection
      .find({ requesterEmail: email.trim().toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate statistics
    const totalDonations = donationHistory.length;
    const totalUnitsGiven = donationHistory.reduce((sum, d) => sum + (d.units || 0), 0);
    const lastDonation = donationHistory[0];
    const lastDonationDate = lastDonation ? lastDonation.donatedAt : user.lastDonateDate;

    const totalRequests = requestHistory.length;
    const pendingRequests = requestHistory.filter(r => r.status === 'pending').length;
    const fulfilledRequests = requestHistory.filter(r => r.status === 'fulfilled').length;
    const cancelledRequests = requestHistory.filter(r => r.status === 'cancelled').length;

    // Check eligibility for next donation (3 months gap)
    let nextEligibleDate = null;
    let canDonateNow = true;
    
    if (lastDonationDate) {
      const lastDate = new Date(lastDonationDate);
      nextEligibleDate = new Date(lastDate);
      nextEligibleDate.setMonth(nextEligibleDate.getMonth() + 3);
      canDonateNow = new Date() >= nextEligibleDate;
    }

    res.json({
      success: true,
      profile: {
        _id: user._id,
        name: user.Name,
        email: user.email,
        phone: user.phone,
        bloodGroup: user.bloodGroup,
        district: user.district,
        role: user.role,
        createdAt: user.createdAt,
        lastDonateDate: lastDonationDate,
        bloodGiven: user.bloodGiven || 0,
        bloodTaken: user.bloodTaken || 0
      },
      statistics: {
        donations: {
          total: totalDonations,
          totalUnits: totalUnitsGiven,
          lastDate: lastDonationDate,
          nextEligibleDate,
          canDonateNow
        },
        requests: {
          total: totalRequests,
          pending: pendingRequests,
          fulfilled: fulfilledRequests,
          cancelled: cancelledRequests
        }
      },
      donationHistory: donationHistory.map(d => ({
        id: d._id,
        bloodGroup: d.bloodGroup,
        units: d.units,
        date: d.donatedAt,
        collectedBy: d.collectedBy,
        notes: d.notes
      })),
      requestHistory: requestHistory.map(r => ({
        id: r._id,
        bloodGroup: r.bloodGroup,
        units: r.unitsNeeded || 1,
        status: r.status,
        hospitalName: r.hospitalName,
        district: r.district,
        urgency: r.urgency,
        createdAt: r.createdAt,
        fulfilledAt: r.fulfilledAt
      }))
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};

// Update user profile (no auth required; id or email must be provided)
const updateUserProfile = async (req, res) => {
  try {
    const { usersCollection } = getCollections();
    
    // Accept identifier via id (preferred) or email via query/body
    const idRaw = req.query?.id || req.body?.id || '';
    const userId = String(idRaw).trim();
    const userEmailRaw = req.query?.email || req.body?.email || '';
    const userEmail = String(userEmailRaw).trim().toLowerCase();
    
    console.log('Update profile request - ID:', userId, 'Email:', userEmail);
    
    if (!userId && !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'User identifier required (id or email)'
      });
    }

    const { name, phone, district, bloodGroup, lastDonateDate } = req.body;
    
    console.log('Update data received:', { name, phone, district, bloodGroup, lastDonateDate });
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name) updateData.Name = name;
    if (phone) updateData.phone = phone;
    if (district) updateData.district = district;
    if (bloodGroup) updateData.bloodGroup = bloodGroup;
    if (lastDonateDate !== undefined) updateData.lastDonateDate = lastDonateDate;

    // Build filter: prefer _id when valid, else email
    let filter = null;
    if (userId && ObjectId.isValid(userId)) {
      filter = { _id: new ObjectId(userId) };
      console.log('Using ID filter:', filter);
    } else if (userEmail) {
      filter = { email: userEmail };
      console.log('Using email filter:', filter);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Valid user identifier required'
      });
    }

    // First check if user exists
    const existingUser = await usersCollection.findOne(filter);
    console.log('Existing user found:', existingUser ? 'Yes' : 'No');
    
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Now update the user
    const result = await usersCollection.findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: 'after', projection: { password: 0 } }
    );

    console.log('Update result:', result ? 'Success' : 'Failed');

    // Handle both old and new MongoDB driver versions
    const updatedUser = result.value || result;

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Failed to update user'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Get donation history only
const getDonationHistory = async (req, res) => {
  try {
    const { bloodTransactionsCollection, usersCollection } = getCollections();
    const { email } = req.query;
    const userEmail = email.trim().toLowerCase();
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await usersCollection.findOne({ email: userEmail });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const donations = await bloodTransactionsCollection
      .find({
        type: 'entry',
        $or: [
          { donorEmail: userEmail },
          { donorPhone: user.phone }
        ]
      })
      .sort({ donatedAt: -1 })
      .toArray();

    res.json({
      success: true,
      donations: donations.map(d => ({
        id: d._id,
        bloodGroup: d.bloodGroup,
        units: d.units,
        date: d.donatedAt,
        collectedBy: d.collectedBy,
        notes: d.notes,
        donorAddress: d.donorAddress
      }))
    });

  } catch (error) {
    console.error('Get donation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch donation history',
      error: error.message
    });
  }
};

// Get request history only
const getRequestHistory = async (req, res) => {
  try {
    const { bloodRequestsCollection } = getCollections();
    const { email } = req.query;
    const userEmail = email.trim().toLowerCase();
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const requests = await bloodRequestsCollection
      .find({ requesterEmail: userEmail })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      requests: requests.map(r => ({
        id: r._id,
        bloodGroup: r.bloodGroup,
        units: r.unitsNeeded || 1,
        status: r.status,
        hospitalName: r.hospitalName,
        district: r.district,
        urgency: r.urgency,
        patientName: r.patientName,
        createdAt: r.createdAt,
        fulfilledAt: r.fulfilledAt,
        cancelledAt: r.cancelledAt
      }))
    });

  } catch (error) {
    console.error('Get request history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch request history',
      error: error.message
    });
  }
};


const getPendingDonors = async (req, res) => {
  try {
    const { usersCollection } = getCollections();

    const pendingDonors = await usersCollection
      .find({ 
        donorApprovalStatus: 'pending',
        role: 'user'
      }, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: pendingDonors.length,
      donors: pendingDonors
    });
  } catch (error) {
    console.error('Get pending donors error:', error);
    res.status(500).json({
      message: 'Failed to fetch pending donors',
      error: error.message
    });
  }
};

/**
 * Approve donor registration (Admin only)
 */
const approveDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminEmail } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid donor ID' });
    }

    const { usersCollection } = getCollections();

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          donorApprovalStatus: 'approved',
          approvedBy: adminId || adminEmail,
          approvedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const updatedDonor = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    res.status(200).json({
      message: 'Donor approved successfully',
      donor: updatedDonor
    });
  } catch (error) {
    console.error('Approve donor error:', error);
    res.status(500).json({
      message: 'Failed to approve donor',
      error: error.message
    });
  }
};

/**
 * Reject donor registration (Admin only)
 */
const rejectDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, adminId, adminEmail } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid donor ID' });
    }

    const { usersCollection } = getCollections();

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          donorApprovalStatus: 'rejected',
          rejectionReason: reason || '',
          rejectedBy: adminId || adminEmail,
          rejectedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const updatedDonor = await usersCollection.findOne(
      { _id: new ObjectId(id) },
      { projection: { password: 0 } }
    );

    res.status(200).json({
      message: 'Donor registration rejected',
      donor: updatedDonor
    });
  } catch (error) {
    console.error('Reject donor error:', error);
    res.status(500).json({
      message: 'Failed to reject donor',
      error: error.message
    });
  }
};

const uploadUsers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      message: "No file uploaded.",
      error: "NO_FILE"
    });
  }
  
  try {
    const xlsx = require('xlsx');
    const { usersCollection } = getCollections();

    const workbook = xlsx.read(req.file.buffer, { 
      type: 'buffer',
      cellDates: false,     
      raw: true            
    });
    
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet, {
      raw: true,       
      defval: ""    
    });

    // Expected columns for user upload
    const expectedColumns = [
      'Name', 'phone', 'email', 'bloodGroup', 'district','role','bloodGiven','bloodTaken',
    ];

    // Validate columns
    if (jsonData.length === 0) {
      return res.status(400).json({
        message: "Excel file is empty.",
        error: "EMPTY_FILE"
      });
    }

    const fileColumns = Object.keys(jsonData[0]);
    const missingColumns = expectedColumns.filter(col => !fileColumns.includes(col));
    
    if (missingColumns.length > 0) {
      return res.status(400).json({
        message: `Missing required columns: ${missingColumns.join(', ')}`,
        error: "MISSING_COLUMNS",
        expectedColumns: expectedColumns,
        foundColumns: fileColumns,
        missingColumns: missingColumns
      });
    }

    // Check for rows without phone number (unique identifier)
    const rowsWithoutPhone = jsonData.filter((row, index) => 
      !row.phone || row.phone === '' || row.phone === null || row.phone === undefined
    );

    if (rowsWithoutPhone.length > 0) {
      return res.status(400).json({
        message: "Some rows are missing phone numbers. Phone number is mandatory for user identification.",
        error: "MISSING_PHONE_NUMBERS",
        rowsWithoutPhone: rowsWithoutPhone.length,
        suggestion: "Please ensure all rows have phone numbers."
      });
    }

    const validationErrors = [];
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const processedData = jsonData.map((row, index) => {
      const processedRow = { ...row };
      const rowNumber = index + 2;

      try {
        // Validate and process Name
        if (processedRow.Name !== undefined && processedRow.Name !== null && processedRow.Name !== '') {
          processedRow.Name = String(processedRow.Name).trim();
          if (processedRow.Name.length === 0) {
            validationErrors.push(`Row ${rowNumber}: Name cannot be empty.`);
          }
        } else {
          validationErrors.push(`Row ${rowNumber}: Name is required.`);
        }

        // Validate and process phone
        if (processedRow.phone !== undefined && processedRow.phone !== null && processedRow.phone !== '') {
          processedRow.phone = String(processedRow.phone).trim();
          if (!/^\d{10,}$/.test(processedRow.phone)) {
            validationErrors.push(`Row ${rowNumber}: Invalid phone number "${row.phone}". Phone number must be at least 10 digits.`);
          }
        } else {
          validationErrors.push(`Row ${rowNumber}: Phone number is required.`);
        }

        // Validate and process email
        if (processedRow.email !== undefined && processedRow.email !== null && processedRow.email !== '') {
          processedRow.email = String(processedRow.email).trim().toLowerCase();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(processedRow.email)) {
            validationErrors.push(`Row ${rowNumber}: Invalid email format "${row.email}".`);
          }
        } else {
          validationErrors.push(`Row ${rowNumber}: Email is required.`);
        }

        // Validate blood group
        if (processedRow.bloodGroup !== undefined && processedRow.bloodGroup !== null && processedRow.bloodGroup !== '') {
          processedRow.bloodGroup = String(processedRow.bloodGroup).trim().toUpperCase();
          if (!bloodGroups.includes(processedRow.bloodGroup)) {
            validationErrors.push(`Row ${rowNumber}: Invalid blood group "${row.bloodGroup}". Must be one of: ${bloodGroups.join(', ')}`);
          }
        } else {
          validationErrors.push(`Row ${rowNumber}: Blood group is required.`);
        }

        // Validate district
        if (processedRow.district !== undefined && processedRow.district !== null && processedRow.district !== '') {
          processedRow.district = String(processedRow.district).trim();
          if (processedRow.district.length === 0) {
            validationErrors.push(`Row ${rowNumber}: District cannot be empty.`);
          }
        } else {
          validationErrors.push(`Row ${rowNumber}: District is required.`);
        }

        // Validate and process lastDonateDate (optional)
        if (processedRow.lastDonateDate !== undefined && processedRow.lastDonateDate !== null && processedRow.lastDonateDate !== '') {
          const parsedDate = new Date(processedRow.lastDonateDate);
          if (isNaN(parsedDate.getTime())) {
            validationErrors.push(`Row ${rowNumber}: Invalid lastDonateDate "${row.lastDonateDate}". Use YYYY-MM-DD.`);
          } else {
            processedRow.lastDonateDate = parsedDate;
          }
        } else {
          processedRow.lastDonateDate = null;
        }

        // Validate and process role (optional, defaults to 'donor')
        if (processedRow.role !== undefined && processedRow.role !== null && processedRow.role !== '') {
          processedRow.role = String(processedRow.role).trim().toLowerCase();
          const validRoles = ['admin', 'donor', 'user'];
          if (!validRoles.includes(processedRow.role)) {
            validationErrors.push(`Row ${rowNumber}: Invalid role "${row.role}". Must be one of: ${validRoles.join(', ')}`);
          }
        } else {
          processedRow.role = 'donor'; // Default to donor
        }

        // Validate and process bloodGiven (optional, defaults to 0)
        if (processedRow.bloodGiven !== undefined && processedRow.bloodGiven !== null && processedRow.bloodGiven !== '') {
          processedRow.bloodGiven = parseInt(processedRow.bloodGiven);
          if (isNaN(processedRow.bloodGiven) || processedRow.bloodGiven < 0) {
            validationErrors.push(`Row ${rowNumber}: Invalid bloodGiven value "${row.bloodGiven}". Must be a non-negative number.`);
          }
        } else {
          processedRow.bloodGiven = 0;
        }

        // Validate and process bloodTaken (optional, defaults to 0)
        if (processedRow.bloodTaken !== undefined && processedRow.bloodTaken !== null && processedRow.bloodTaken !== '') {
          processedRow.bloodTaken = parseInt(processedRow.bloodTaken);
          if (isNaN(processedRow.bloodTaken) || processedRow.bloodTaken < 0) {
            validationErrors.push(`Row ${rowNumber}: Invalid bloodTaken value "${row.bloodTaken}". Must be a non-negative number.`);
          }
        } else {
          processedRow.bloodTaken = 0;
        }

        return processedRow;
      } catch (error) {
        validationErrors.push(`Row ${rowNumber}: ${error.message}`);
        return processedRow;
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: `Data validation failed. Found ${validationErrors.length} error(s) in the uploaded file.`,
        error: "VALIDATION_FAILED",
        validationErrors: validationErrors,
        totalErrors: validationErrors.length,
        suggestion: "Please fix the highlighted errors and upload again."
      });
    }

    let updatedCount = 0;
    let insertedCount = 0;
    let duplicateCount = 0;
    const updateResults = [];
    const duplicateRecords = [];

    for (const row of processedData) {
      // Check for existing user by phone OR email
      const existingUser = await usersCollection.findOne({ 
        $or: [
          { phone: row.phone },
          { email: row.email }
        ]
      });
      
      if (existingUser) {
        duplicateRecords.push({
          phone: row.phone,
          name: row.Name,
          email: row.email,
          existingUser: {
            // Name: existingUser.Name,
            phone: existingUser.phone,
            email: existingUser.email
          },
          reason: existingUser.phone === row.phone ? 'Phone number already exists' : 'Email already exists'
        });
        duplicateCount++;
        updateResults.push({
          phone: row.phone,
          name: row.Name,
          action: 'duplicate',
          existingUser: {
            // Name: existingUser.Name,
            email: existingUser.email,
            phone: existingUser.phone
          }
        });
      } else {
        // Hash password for new users
        const defaultPassword = row.phone; // Use phone as default password
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);

        const newUser = {
          Name: row.Name,
          phone: row.phone,
          email: row.email,
          bloodGroup: row.bloodGroup,
          district: row.district,
          lastDonateDate: row.lastDonateDate || null,
          password: hashedPassword,
          role: row.role || 'donor',
          bloodGiven: row.bloodGiven || 0,
          bloodTaken: row.bloodTaken || 0,
          donorApprovalStatus: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await usersCollection.insertOne(newUser);
        insertedCount++;
        updateResults.push({
          phone: row.phone,
          name: row.Name,
          action: 'inserted'
        });
      }
    }

    const response = {
      message: `User upload completed. ${insertedCount} new users inserted, ${duplicateCount} duplicate(s) found.`,
      recordsInserted: insertedCount,
      recordsDuplicate: duplicateCount,
      totalProcessed: processedData.length,
      status: duplicateCount > 0 ? "COMPLETED_WITH_DUPLICATES" : "SUCCESS"
    };

    if (duplicateCount > 0) {
      response.duplicates = duplicateRecords;
      response.suggestion = "Duplicate phone numbers or emails were not inserted. Please check the list above and update or remove duplicates.";
    }

    res.json(response);
    
  } catch (error) {
    console.error("Upload users error:", error);
    res.status(500).json({
      message: error.message || "Failed to process user file",
      error: "SERVER_ERROR",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  getDonationHistory,
  getRequestHistory,
  getPendingDonors,
  approveDonor,
  rejectDonor,
  uploadUsers
};