const { getCollections } = require('../config/database');

const getUploadByInfo = (req) => {
  const decoded = req.admin;
  return {
    userName: `${decoded.firstName} ${decoded.lastName}`,
    email: decoded.email,
    branch: decoded.branch
  };
};

const processExcelDate = (dateValue) => {
  if (typeof dateValue === 'number') {
    const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
    const day = excelDate.getDate().toString().padStart(2, '0');
    const month = (excelDate.getMonth() + 1).toString().padStart(2, '0');
    const year = excelDate.getFullYear();
    return `${day}/${month}/${year}`;
  } 
  else if (typeof dateValue === 'string') {
    const dateStr = dateValue.trim();
    const dateParts = dateStr.split('/');
    if (dateParts.length === 3) {
      const month = dateParts[0].padStart(2, '0');
      const day = dateParts[1].padStart(2, '0');
      const year = dateParts[2];
      return `${day}/${month}/${year}`;
    }
  }
  return dateValue;
};

const validateExcelColumns = (jsonData, expectedColumns) => {
  if (!jsonData || jsonData.length === 0) {
    return {
      isValid: false,
      error: "EMPTY_FILE",
      message: "File is empty or contains no valid data."
    };
  }

  const fileColumns = Object.keys(jsonData[0]);
  const missingColumns = expectedColumns.filter(col => !fileColumns.includes(col));

  if (missingColumns.length > 0) {
    return {
      isValid: false,
      error: "MISSING_COLUMNS",
      message: "Column header mismatch detected.",
      missingColumns,
      expectedColumns,
      foundColumns: fileColumns
    };
  }

  return { isValid: true };
};

const checkAndUpdateActiveDonar = async () => {
  try {
    const { ExamCollection } = getCollections();
    const now = new Date();

    const expiredExams = await ExamCollection.find({
      status: 'Active',
      date: { $exists: true, $ne: null },
      time: { $exists: true, $ne: null }
    }).toArray();
    
    const examsToDeactivate = expiredExams.filter(exam => {
      if (!exam.date || !exam.time) return false;
      const examDateTime = new Date(`${exam.date}T${exam.time}:00`);
      return examDateTime < now;
    });
    
    if (examsToDeactivate.length > 0) {
      const examIds = examsToDeactivate.map(exam => exam._id);
      
      await ExamCollection.updateMany(
        { _id: { $in: examIds } },
        { 
          $set: { 
            status: 'Inactive',
            expiredAt: now,
            autoExpired: true
          }
        }
      );
      
      console.log(`Auto-expired ${examsToDeactivate.length} exams:`, 
        examsToDeactivate.map(e => e.name));
    }
    
    return examsToDeactivate.length;
  } catch (error) {
    console.error('Error checking expired exams:', error);
    return 0;
  }
};

module.exports = {
  getUploadByInfo,
  processExcelDate,
  validateExcelColumns,
  checkAndUpdateActiveDonar
};