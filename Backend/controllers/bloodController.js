const { getCollections } = require('../config/database');
const { getUploadByInfo, processExcelDate, validateExcelColumns } = require('../utils/helpers');
const { parseExcelFile } = require('../services/fileService');
const xlsx = require('xlsx'); 

const getDonnarBasicInfo = async (req, res) => {
  try {
    const donnar = req.donnar;
    res.status(200).json({
      Name: donnar.Name,
      phone: donnar.phone,
      bloodGroup: donnar.bloodGroup,
      Email: donnar.Email,
      Date_of_Birth: donnar.Date_of_Birth,
      District: donnar.District,
      Subdistrict: donnar.Subdistrict,
      Last_Donation_Date: donnar.Last_Donation_Date,
      Available: donnar.Available
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving data" });
  }
};
const getDonnarData = async (req, res) => {
  try {
    const { resultsCollection, OMRCollection } = getCollections();
    const results = await resultsCollection.find({ 
      Roll: req.student.Roll,
      published: true
    }).toArray();

    const sortedResults = results.sort((a, b) => {
      const parseDate = (dateStr) => {
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day); 
      };
      
      const dateA = parseDate(a.Date);
      const dateB = parseDate(b.Date);
      if (dateB.getTime() !== dateA.getTime()) {
        return dateB.getTime() - dateA.getTime();
      }
      return a.Subject.localeCompare(b.Subject);
    });

    // Fetch OMR data for each result
    const resultsWithOMR = await Promise.all(
      sortedResults.map(async (result) => {
        try {
          const [day, month, year] = result.Date.split('/'); 
          const omrDateFormat = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
          
          const omrRecord = await OMRCollection.findOne({
            Roll: result.Roll,
            subject: result.Subject,
            // date: omrDateFormat
          });
          
          return {
            ...result,
            omrImageUrl: omrRecord?.imageUrl || null,
            hasOMR: !!omrRecord
          };
        } catch (omrError) {
          console.error(`Error fetching OMR for Roll ${result.Roll}, Subject ${result.Subject}:`, omrError);
          return {
            ...result,
            omrImageUrl: null,
            hasOMR: false
          };
        }
      })
    );
    
    res.json(resultsWithOMR);
  } catch (error) {
    console.error('Error retrieving student results:', error);
    res.status(500).send("Failed to retrieve results");
  }
};
const getDonnarByNumber = async (req, res) => {
  const { Roll } = req.query;
  if (!Roll) {
    return res.status(400).json({ message: "Roll is required" });
  }
  
  try {
    const { studentsCollection } = getCollections();
    const query = { 
      $or: [
        { Roll: Roll },               
        { Roll: parseInt(Roll) }     
      ]
    };
    
    const studentData = await studentsCollection.findOne(query, {
      projection: { 
        _id: 0, 
        Name: 1, 
        Roll: 1, 
        Batch: 1, 
        College: 1, 
        Mobile: 1, 
        Mobile2: 1,
        SSC: 1,
        HSC: 1,
        Attempt:1,
        Date: 1
      }
    });
    
    if (!studentData) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.status(200).json({ 
      success: true,
      data: studentData 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error",
      error: error.message 
    });
  }
};
const createDonnar = async (req, res) => {
  try {
    const studentData = req.body;
    const { studentsCollection } = getCollections();
    const uploadBy = getUploadByInfo(req);
    
    const existingStudent = await studentsCollection.findOne({ Roll: studentData.Roll });
    if (existingStudent) {
      return res.status(400).json({ 
        success: false,
        message: 'Student with this Roll number already exists',
        existingStudent: {
          Roll: existingStudent.Roll,
          Name: existingStudent.Name,
          College: existingStudent.College,
          Batch: existingStudent.Batch
        }
      });
    }
    
    const newStudent = {
      ...studentData,
      createdAt: new Date(),
      updatedAt: new Date(),
      uploadBy: uploadBy
    };
    
    const result = await studentsCollection.insertOne(newStudent);
    const createdStudent = await studentsCollection.findOne({ _id: result.insertedId });
    
    res.status(201).json({ 
      success: true,
      message: 'Student created successfully',
      student: createdStudent
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to create student',
      error: error.message 
    });
  }
};
const updateDonnar = async (req, res) => {
  try {
    const { studentsCollection, resultsCollection } = getCollections();
    const { Roll: newRoll, ...updateData } = req.body;
    const originalRoll = req.body.originalRoll || newRoll;
    
    if (originalRoll !== newRoll) {
      const existingStudent = await studentsCollection.findOne({ Roll: Number(newRoll) });
      if (existingStudent) {
        return res.status(400).json({ 
          success: false,
          message: "Roll number already exists"
        });
      }
    }
    
    const updateResult = await studentsCollection.updateOne(
      { Roll: Number(originalRoll) },
      { $set: { 
        ...updateData,
        Roll: Number(newRoll),
        updatedAt: new Date()
      }}
    );
    
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ 
        success: false,
        message: "No student found with the original Roll number"
      });
    }
    
    let resultsUpdated = 0;
    if (originalRoll !== newRoll) {
      const resultsUpdateResult = await resultsCollection.updateMany(
        { Roll: Number(originalRoll) },
        { 
          $set: { 
            Roll: Number(newRoll),
            updatedAt: new Date()
          }
        }
      );
      resultsUpdated = resultsUpdateResult.modifiedCount;
    }
    
    res.status(200).json({ 
      success: true,
      message: `Updated student record successfully${resultsUpdated > 0 ? ` and ${resultsUpdated} associated results` : ''}`,
      data: {
        ...updateData,
        Roll: Number(newRoll)
      },
      resultsUpdated: resultsUpdated
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Failed to update student information",
      error: error.message
    });
  }
};
const uploadBloodDonors = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded." });
    
  try {
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

    const expectedColumns = [
      'Name', 'Phone', 'Email', 'Blood_Group', 'District', 
      'Date_of_Birth', 'Last_Donation_Date', 'Available'
    ];

    const validation = validateExcelColumns(jsonData, expectedColumns);
    if (!validation.isValid) {
      return res.status(400).json(validation);
    }

    const rowsWithoutPhone = jsonData.filter((row, index) => 
      !row.Phone || row.Phone === '' || row.Phone === null || row.Phone === undefined
    );

    if (rowsWithoutPhone.length > 0) {
      return res.status(400).json({
        message: "Some rows are missing phone numbers. Phone number is mandatory for identification.",
        error: "MISSING_PHONE_NUMBERS",
        rowsWithoutPhone: rowsWithoutPhone.length,
        suggestion: "Please ensure all rows have phone numbers."
      });
    }

    const validationErrors = [];
    const validBloodGroups = ['A+', 'A-', 'Aâˆ’', 'B+', 'B-', 'Bâˆ’', 'O+', 'O-', 'Oâˆ’', 'AB+', 'AB-', 'ABâˆ’'];
    
    const processedData = jsonData.map((row, index) => {
      const processedRow = { ...row };
      const rowNumber = index + 2; 
      
      try {
        // Process Name
        if (processedRow.Name !== undefined && processedRow.Name !== null && processedRow.Name !== '') {
          processedRow.Name = String(processedRow.Name).trim();
          if (processedRow.Name.length === 0) {
            validationErrors.push(`Row ${rowNumber}: Name cannot be empty.`);
          }
        } else {
          validationErrors.push(`Row ${rowNumber}: Name is required.`);
        }

        // Process Phone
        if (processedRow.Phone !== undefined && processedRow.Phone !== null && processedRow.Phone !== '') {
          processedRow.Phone = String(processedRow.Phone).replace(/\D/g, '');
          if (!/^01\d{9}$/.test(processedRow.Phone)) {
            validationErrors.push(`Row ${rowNumber}: Invalid phone number "${row.Phone}". Must be 11 digits starting with 01.`);
          }
        } else {
          validationErrors.push(`Row ${rowNumber}: Phone number is required.`);
        }

        // Process Email
        if (processedRow.Email !== undefined && processedRow.Email !== null && processedRow.Email !== '') {
          processedRow.Email = String(processedRow.Email).trim().toLowerCase();
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(processedRow.Email)) {
            validationErrors.push(`Row ${rowNumber}: Invalid email format "${row.Email}".`);
          }
        }

        // Process Blood Group
        if (processedRow.Blood_Group !== undefined && processedRow.Blood_Group !== null && processedRow.Blood_Group !== '') {
          processedRow.Blood_Group = String(processedRow.Blood_Group).trim();
          if (!validBloodGroups.includes(processedRow.Blood_Group)) {
            validationErrors.push(`Row ${rowNumber}: Invalid blood group "${row.Blood_Group}". Must be one of: ${validBloodGroups.join(', ')}`);
          }
        } else {
          validationErrors.push(`Row ${rowNumber}: Blood group is required.`);
        }

        // Process District
        if (processedRow.District !== undefined && processedRow.District !== null && processedRow.District !== '') {
          processedRow.District = String(processedRow.District).trim();
        } else {
          validationErrors.push(`Row ${rowNumber}: District is required.`);
        }

        // Process Date of Birth
        if (processedRow.Date_of_Birth) {
          processedRow.Date_of_Birth = processExcelDate(processedRow.Date_of_Birth);
          const birthDate = new Date(processedRow.Date_of_Birth);
          if (isNaN(birthDate.getTime())) {
            validationErrors.push(`Row ${rowNumber}: Invalid date of birth "${row.Date_of_Birth}".`);
          }
        }

        // Process Last Donation Date
        if (processedRow.Last_Donation_Date) {
          processedRow.Last_Donation_Date = processExcelDate(processedRow.Last_Donation_Date);
          const donationDate = new Date(processedRow.Last_Donation_Date);
          if (isNaN(donationDate.getTime())) {
            validationErrors.push(`Row ${rowNumber}: Invalid last donation date "${row.Last_Donation_Date}".`);
          }
        }

        // Process Available
        if (processedRow.Available !== undefined && processedRow.Available !== null && processedRow.Available !== '') {
          const availableValue = String(processedRow.Available).trim().toLowerCase();
          if (!['yes', 'no'].includes(availableValue)) {
            validationErrors.push(`Row ${rowNumber}: Available must be "Yes" or "No", got "${row.Available}".`);
          }
          processedRow.Available = availableValue === 'yes';
        } else {
          processedRow.Available = true; // Default to available
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
    let skippedCount = 0;
    const updateResults = [];

    for (const row of processedData) {
      const existingUser = await usersCollection.findOne({ 
        phone: row.Phone 
      });
      
      if (existingUser) {
        // Update existing donor if they are a regular user
        if (existingUser.role === 'user') {
          const updateData = {
            Name: row.Name,
            bloodGroup: row.Blood_Group,
            district: row.District,
            dateOfBirth: row.Date_of_Birth || existingUser.dateOfBirth,
            lastDonationDate: row.Last_Donation_Date || existingUser.lastDonationDate,
            available: row.Available,
            updatedAt: new Date()
          };

          if (row.Email) {
            updateData.email = row.Email;
          }
          
          await usersCollection.updateOne(
            { phone: row.Phone },
            { $set: updateData }
          );
          updatedCount++;
          updateResults.push({
            phone: row.Phone,
            name: row.Name,
            action: 'updated'
          });
        } else {
          // Skip admin/executive users
          skippedCount++;
          updateResults.push({
            phone: row.Phone,
            name: row.Name,
            action: 'skipped',
            reason: 'User is admin/executive'
          });
        }
      } else {
        // Insert new donor (unregistered user)
        const newDonor = {
          Name: row.Name,
          phone: row.Phone,
          email: row.Email || '',
          bloodGroup: row.Blood_Group,
          district: row.District,
          dateOfBirth: row.Date_of_Birth || null,
          lastDonationDate: row.Last_Donation_Date || null,
          available: row.Available,
          role: 'user',
          subrole: '',
          password: '', // No password for bulk uploaded donors
          createdAt: new Date(),
          updatedAt: new Date(),
          isVerified: false,
          uploadedViaExcel: true
        };
        
        await usersCollection.insertOne(newDonor);
        insertedCount++;
        updateResults.push({
          phone: row.Phone,
          name: row.Name,
          action: 'inserted'
        });
      }
    }

    res.json({
      message: `Blood donor upload completed. ${insertedCount} new donors added, ${updatedCount} donors updated${skippedCount > 0 ? `, ${skippedCount} skipped` : ''}.`,
      recordsInserted: insertedCount,
      recordsUpdated: updatedCount,
      recordsSkipped: skippedCount,
      totalProcessed: processedData.length,
      updateResults: updateResults,
      status: "SUCCESS"
    });
    
  } catch (error) {
    console.error("Upload blood donors error:", error);
    res.status(500).json({
      message: error.message || "Failed to process blood donor file",
      error: "SERVER_ERROR",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};


module.exports = {
  getDonnarBasicInfo,
  getDonnarData,
  getDonnarByNumber,
  createDonnar,
  updateDonnar,
  uploadBloodDonors,
  uploadDonnars
};