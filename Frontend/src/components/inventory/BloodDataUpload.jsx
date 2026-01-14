import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { read, utils, writeFile } from "xlsx";
import {
  FaFileExcel,
  FaUpload,
  FaCheckCircle,
  FaTimesCircle,
  FaDownload,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";
import AxiosPublic from "../../context/AxiosPublic.jsx";

const BloodDataUpload = () => {
  const [publicAxios] = AxiosPublic();
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [excelData, setExcelData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const demoData = [
    [
      "Name",
      "phone",
      "email",
      "bloodGroup",
      "lastDonateDate",
      "district",
      "role",
      "bloodGiven",
      "bloodTaken",
    ],
    [
      "Md Ibrahim",
      "01571286724",
      "ibrahimbiplob75@gmail.com",
      "B+",
      "2026-01-15",
      "Dhaka",
      "donor",
      "2",
      "0",
    ],
    [
      "Text",
      "Text (01XXXXXXXXX)",
      "Text (email@example.com)",
      "Text (A+, A-, B+, etc.)",
      "Date (YYYY-MM-DD)",
      "Text (District)",
      "Text (admin/donor/user)",
      "Number (e.g., 0, 1, 2)",
      "Number (e.g., 0, 1, 2)",
    ],
  ];

  useEffect(() => {
    setExcelData(demoData);
    setHeaders(demoData[0]);
  }, []);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadStatus(
        "Invalid file type. Please upload Excel files only (.xlsx or .xls)"
      );
      setUploadError({
        error: "INVALID_FILE_TYPE",
        message: "Only Excel files (.xlsx, .xls) are allowed",
      });
      return;
    }

    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

      setExcelData(jsonData);
      setHeaders(jsonData[0]);
      setFile(selectedFile);
      setUploadStatus(null);
      setUploadError(null);
    } catch (error) {
      console.error("Error reading file:", error);
      setUploadStatus(
        "Error reading Excel file. Please check the file format."
      );
      setUploadError({
        error: "FILE_READ_ERROR",
        message:
          "Unable to read the Excel file. File may be corrupted or in an unsupported format.",
      });
    }
  };

  const handleDownloadTemplate = () => {
    const ws = utils.aoa_to_sheet(demoData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Blood Donors");
    writeFile(wb, "Blood_Donors_Template.xlsx");
  };

  const renderErrorDetails = (error) => {
    if (!error) return null;

    const errorComponents = {
      INVALID_FILE_TYPE: {
        icon: <FaTimesCircle className="text-red-500 text-xl" />,
        title: "Invalid File Type",
        description:
          error.message || "Only Excel files (.xlsx, .xls) are supported.",
        solution:
          "Please convert your file to Excel format or download our template.",
      },
      FILE_READ_ERROR: {
        icon: <FaExclamationTriangle className="text-yellow-500 text-xl" />,
        title: "File Reading Error",
        description:
          error.message ||
          "Unable to read the Excel file. The file may be corrupted.",
        solution:
          "Please try with a different Excel file or re-save your current file.",
      },
      EMPTY_FILE: {
        icon: <FaExclamationTriangle className="text-yellow-500 text-xl" />,
        title: "Empty File Detected",
        description:
          error.message ||
          "The uploaded file contains no data or is completely empty.",
        solution:
          "Please upload a file with actual data rows, not just headers.",
      },
      MISSING_COLUMNS: {
        icon: <FaTimesCircle className="text-red-500 text-xl" />,
        title: "Column Header Mismatch",
        description:
          error.message ||
          "Some required column headers are missing from your file.",
        solution:
          "Please ensure your file has all required columns. Download the template for reference.",
      },
      VALIDATION_FAILED: {
        icon: <FaTimesCircle className="text-red-500 text-xl" />,
        title: "Data Validation Failed",
        description:
          error.message ||
          "Some data in your file doesn't meet the required format.",
        solution:
          "Please fix the validation errors listed below and upload again.",
      },
      COMPLETED_WITH_DUPLICATES: {
        icon: <FaExclamationTriangle className="text-yellow-500 text-xl" />,
        title: "Upload Completed with Duplicates",
        description:
          error.message ||
          "Some records were skipped because phone numbers or emails already exist.",
        solution:
          "Check the duplicate list below. Update or remove duplicates and upload again if needed.",
      },
      SERVER_ERROR: {
        icon: <FaTimesCircle className="text-red-500 text-xl" />,
        title: "Upload Error",
        description:
          error.message ||
          "An unexpected error occurred on the server while processing your file.",
        solution: error.details
          ? "Check the error details below."
          : "Please try again later or contact support if the problem persists.",
      },
    };

    const errorInfo = errorComponents[error.error] || {
      icon: <FaTimesCircle className="text-red-500 text-xl" />,
      title: "Upload Error",
      description: error.message || "An error occurred during upload.",
      solution: "Please check your file format and try again.",
    };

    return (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5 mb-6 shadow-sm">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">{errorInfo.icon}</div>
          <div className="flex-1">
            <h4 className="text-base font-bold text-red-900 mb-2">
              {errorInfo?.title}
            </h4>
            <p className="text-sm text-red-700 mb-3">
              {errorInfo?.description}
            </p>
            <div className="bg-red-100 rounded-lg p-3 mb-3">
              <p className="text-sm text-red-800 font-semibold flex items-center">
                <FaInfoCircle className="mr-2" />
                Solution: {errorInfo?.solution}
              </p>
            </div>

            {error.missingColumns && (
              <div className="mt-3 p-4 bg-white rounded-lg border border-red-200">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  Missing Columns:
                </p>
                <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                  {error.missingColumns.map((col, index) => (
                    <li key={index}>{col}</li>
                  ))}
                </ul>
              </div>
            )}

            {error.validationErrors && error.validationErrors.length > 0 && (
              <div className="mt-3 p-4 bg-white rounded-lg border border-red-200">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  Validation Errors (
                  {error.totalErrors || error.validationErrors.length}):
                </p>
                <div className="max-h-48 overflow-y-auto">
                  <ul className="text-sm text-red-700 space-y-2">
                    {error.validationErrors
                      .slice(0, 10)
                      .map((validationError, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-red-500 mr-2 font-bold">
                            •
                          </span>
                          <span>{validationError}</span>
                        </li>
                      ))}
                    {error.validationErrors.length > 10 && (
                      <li className="text-red-800 font-semibold mt-2">
                        ... and {error.validationErrors.length - 10} more errors
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {error.duplicates && error.duplicates.length > 0 && (
              <div className="mt-3 p-4 bg-white rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  Duplicate Records ({error.duplicates.length}):
                </p>
                <div className="max-h-48 overflow-y-auto">
                  <ul className="text-sm text-yellow-700 space-y-3">
                    {error.duplicates.slice(0, 10).map((duplicate, index) => (
                      <li key={index} className="bg-yellow-50 p-2 rounded border border-yellow-200">
                        <div className="font-semibold text-yellow-900">{duplicate.name}</div>
                        <div className="text-xs mt-1">Phone: {duplicate.phone}</div>
                        <div className="text-xs">Email: {duplicate.email}</div>
                        <div className="text-xs font-semibold text-yellow-800 mt-1">
                          Reason: {duplicate.reason}
                        </div>
                        {duplicate.existingUser && (
                          <div className="mt-2 p-2 bg-white rounded border-l-2 border-yellow-400">
                            <div className="text-xs font-semibold">Existing Record:</div>
                            <div className="text-xs">Name: {duplicate.existingUser.Name}</div>
                            <div className="text-xs">Phone: {duplicate.existingUser.phone}</div>
                            <div className="text-xs">Email: {duplicate.existingUser.email}</div>
                          </div>
                        )}
                      </li>
                    ))}
                    {error.duplicates.length > 10 && (
                      <li className="text-yellow-800 font-semibold mt-2">
                        ... and {error.duplicates.length - 10} more duplicates
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const handleUpload = async () => {
    if (!file) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select an Excel file to upload",
      });
      return;
    }

    setLoading(true);
    setIsUploading(true);
    setUploadStatus("Uploading... Please wait");
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await publicAxios.post(
        "/bulk-upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      setUploadStatus("Upload successful!");
      setUploadError(null);

      Swal.fire({
        title: "Success!",
        text: `File uploaded successfully. ${response.data.message || ""}`,
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        setFile(null);
        setExcelData(demoData);
        setHeaders(demoData[0]);
        setUploadStatus(null);
      });
    } catch (error) {
      console.error("Upload error:", error);
      const errorData = error.response?.data;

      let errorMessage = "Failed to upload file.";
      if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.details) {
        errorMessage = errorData.details;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setUploadError({
        error: errorData?.error || "SERVER_ERROR",
        message: errorMessage,
        ...errorData,
      });

      setUploadStatus(`Upload failed: ${errorMessage}`);

      Swal.fire({
        title: "Upload Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#780A0A] mb-2 flex items-center justify-center gap-3">
            <FaFileExcel className="text-green-600" />
            Bulk User Upload
          </h1>
          <p className="text-gray-600">
            Upload Excel file with user/donor information
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          {/* File Selection Area */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaUpload className="text-blue-600" />
              Select File
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <label className="btn bg-[#780A0A] hover:bg-[#a00b0b] text-white flex-1 sm:flex-none cursor-pointer h-auto py-4">
                <FaFileExcel className="mr-2" />
                {file ? "Change File" : "Choose Excel File"}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {file && (
                <div className="flex-1 bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <FaCheckCircle className="text-green-600 text-2xl flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-green-800">
                      Selected File:
                    </p>
                    <p className="text-sm text-green-700 truncate">
                      {file.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Display */}
          {uploadError && renderErrorDetails(uploadError)}

          {/* File Preview */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-blue-600" />
                File Preview - Check Format
              </h3>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-r border-gray-200 last:border-r-0"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {excelData.slice(1, 6).map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {row.map((cell, cellIndex) => (
                            <td
                              key={cellIndex}
                              className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200 last:border-r-0"
                            >
                              {cell || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-600 flex justify-between items-center">
                  <span>
                    Showing {Math.min(5, Math.max(0, excelData.length - 1))} of{" "}
                    {Math.max(0, excelData.length - 1)} rows
                  </span>
                  {excelData.length > 6 && (
                    <span className="text-blue-600 font-semibold">
                      +{excelData.length - 6} more rows
                    </span>
                  )}
                </div>
              </div>

              {/* Download Template */}
              <div className="mt-6 bg-white rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FaDownload className="text-blue-600" />
                  Need the Template?
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Download our Excel template to ensure your data format matches
                  the required structure.
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="btn btn-outline btn-sm border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  <FaDownload className="mr-2" />
                  Download Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload Button */}
          <div className="space-y-4">
            {loading && (
              <div className="flex justify-center items-center py-4">
                <span className="loading loading-spinner loading-lg text-[#780A0A]"></span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || isUploading || loading}
              className={`w-full py-4 text-white font-bold rounded-xl text-lg transition-all ${
                !file || isUploading || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#780A0A] hover:bg-[#a00b0b] shadow-lg hover:shadow-xl"
              }`}
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading loading-spinner"></span>
                  Uploading...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FaUpload />
                  Upload User Data
                </span>
              )}
            </button>

            {uploadStatus && !uploadError && (
              <div
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  uploadStatus.includes("success")
                    ? "bg-green-100 border border-green-200 text-green-800"
                    : "bg-blue-100 border border-blue-200 text-blue-800"
                }`}
              >
                {uploadStatus.includes("success") ? (
                  <FaCheckCircle className="text-xl flex-shrink-0" />
                ) : (
                  <FaInfoCircle className="text-xl flex-shrink-0" />
                )}
                <span className="font-semibold">{uploadStatus}</span>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
              <FaExclamationTriangle />
              Important Instructions
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1 ml-6 list-disc">
              <li>Only Excel files (.xlsx or .xls) are accepted</li>
              <li>Required columns: Name, phone, email, bloodGroup, district</li>
              <li>Optional columns: lastDonateDate (YYYY-MM-DD), role (admin/donor/user), bloodGiven, bloodTaken</li>
              <li>Phone numbers must be 10+ digits</li>
              <li>Email must be valid (example@domain.com)</li>
              <li>Blood groups: A+, A-, B+, B-, O+, O-, AB+, AB-</li>
              <li>Role options: admin, donor, user (defaults to donor)</li>
              <li>bloodGiven and bloodTaken must be numbers (defaults to 0)</li>
              <li>Duplicate phone or email will be rejected</li>
              <li>Default password for new users will be their phone number</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodDataUpload;
