import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { baseURL } from '../../Hooks/useAxios';

const DonorDonationForm = () => {
  const [formData, setFormData] = useState({
    donorName: '',
    donorEmail: '',
    donorPhone: '',
    donorAddress: '',
    bloodGroup: '',
    dateOfBirth: '',
    weight: '',
    district: '',
    lastDonationDate: '',
    medicalConditions: 'None',
    availability: 'Available',
    notes: '',
    units: 1
  });

  const [eligibilityResult, setEligibilityResult] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  // Check eligibility whenever relevant fields change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        formData.bloodGroup ||
        formData.dateOfBirth ||
        formData.weight ||
        formData.lastDonationDate ||
        formData.medicalConditions
      ) {
        checkEligibility();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [
    formData.bloodGroup,
    formData.dateOfBirth,
    formData.weight,
    formData.lastDonationDate,
    formData.medicalConditions
  ]);

  const checkEligibility = async () => {
    try {
      setCheckingEligibility(true);
      const response = await fetch(`${baseURL}/donation-requests/check-eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bloodGroup: formData.bloodGroup,
          dateOfBirth: formData.dateOfBirth,
          weight: formData.weight ? parseInt(formData.weight) : null,
          lastDonationDate: formData.lastDonationDate,
          medicalConditions: formData.medicalConditions
        }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setEligibilityResult(data);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final eligibility check before submission
    if (!eligibilityResult?.eligible) {
      Swal.fire({
        icon: 'error',
        title: 'Not Eligible to Donate',
        html: `
          <div style="text-align: left;">
            <p style="margin-bottom: 10px;">You don't meet the eligibility requirements:</p>
            <ul style="color: #d32f2f; margin: 10px 0;">
              ${eligibilityResult?.ineligibilityReasons
                ?.map(reason => `<li>• ${reason}</li>`)
                .join('') || '<li>Please provide complete information</li>'}
            </ul>
          </div>
        `,
        confirmButtonText: 'Understand',
        width: '500px'
      });
      return;
    }

    // Validate required fields
    if (
      !formData.donorName ||
      !formData.donorPhone ||
      !formData.bloodGroup ||
      !formData.dateOfBirth ||
      !formData.weight
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please fill in all required fields'
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${baseURL}/donation-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Donation Request Submitted!',
          html: `
            <div style="text-align: left;">
              <p>Your donation request has been submitted successfully.</p>
              <p style="margin-top: 10px; font-size: 14px; color: #666;">
                Reference ID: <strong>${data.request._id}</strong>
              </p>
              <p style="margin-top: 10px; font-size: 14px; color: #666;">
                The admin will review and approve your donation. You will be contacted soon.
              </p>
            </div>
          `,
          timer: 3000
        });

        // Reset form
        setFormData({
          donorName: '',
          donorEmail: '',
          donorPhone: '',
          donorAddress: '',
          bloodGroup: '',
          dateOfBirth: '',
          weight: '',
          district: '',
          lastDonationDate: '',
          medicalConditions: 'None',
          availability: 'Available',
          notes: '',
          units: 1
        });
        setTouched({});
        setEligibilityResult(null);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          html: `
            <div style="text-align: left;">
              <p>${data.message}</p>
              ${
                data.ineligibilityReasons
                  ? `
                    <p style="margin-top: 10px; font-weight: bold;">Reasons:</p>
                    <ul style="color: #d32f2f; margin: 10px 0;">
                      ${data.ineligibilityReasons
                        .map(reason => `<li>• ${reason}</li>`)
                        .join('')}
                    </ul>
                  `
                  : ''
              }
            </div>
          `,
          width: '500px'
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit donation request. Please try again.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Donate Blood</h1>
          <p className="text-gray-600">
            Help save lives by donating blood. Please ensure you meet all eligibility requirements.
          </p>
        </div>

        {/* Eligibility Status Alert */}
        {eligibilityResult && (
          <div
            className={`mb-6 p-4 rounded-lg border-2 ${
              eligibilityResult.eligible
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {eligibilityResult.eligible ? (
                <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
              ) : (
                <XCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              )}
              <div>
                <h3
                  className={`font-bold mb-2 ${
                    eligibilityResult.eligible
                      ? 'text-green-800'
                      : 'text-red-800'
                  }`}
                >
                  {eligibilityResult.eligible
                    ? 'You are eligible to donate'
                    : 'You are not eligible to donate'}
                </h3>
                {eligibilityResult.ineligibilityReasons?.length > 0 && (
                  <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                    {eligibilityResult.ineligibilityReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                )}
                {eligibilityResult.warningMessages?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-yellow-300">
                    <p className="font-semibold text-yellow-700 mb-2">Warnings:</p>
                    <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                      {eligibilityResult.warningMessages.map((msg, idx) => (
                        <li key={idx}>{msg}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm">
                1
              </span>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="donorName"
                  value={formData.donorName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="donorEmail"
                  value={formData.donorEmail}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="donorPhone"
                  value={formData.donorPhone}
                  onChange={handleChange}
                  placeholder="Your phone number"
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Your district"
                  className="input input-bordered w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Address
                </label>
                <textarea
                  name="donorAddress"
                  value={formData.donorAddress}
                  onChange={handleChange}
                  placeholder="Your full address"
                  className="textarea textarea-bordered w-full"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm">
                2
              </span>
              Medical Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Blood Group *
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date of Birth * (Age: 18-65)
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Weight (kg) * (Minimum: 50kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="Weight in kg"
                  className="input input-bordered w-full"
                  min="50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Donation Date (Minimum 56 days)
                </label>
                <input
                  type="date"
                  name="lastDonationDate"
                  value={formData.lastDonationDate}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medical Conditions
                </label>
                <textarea
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  placeholder="Any medical conditions? (e.g., HIV, Hepatitis, Diabetes, Heart Disease, etc.)"
                  className="textarea textarea-bordered w-full"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Donation Details */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm">
                3
              </span>
              Donation Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Units to Donate
                </label>
                <input
                  type="number"
                  name="units"
                  value={formData.units}
                  onChange={handleChange}
                  placeholder="1"
                  className="input input-bordered w-full"
                  min="1"
                  max="5"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Availability
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="select select-bordered w-full"
                >
                  <option value="Available">Available Now</option>
                  <option value="Available_Soon">Available Soon</option>
                  <option value="Emergency">For Emergency</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any additional information..."
                  className="textarea textarea-bordered w-full"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Eligibility Notice */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 mb-6 flex gap-3">
            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Eligibility Requirements:</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Age between 18-65 years</li>
                <li>Weight at least 50 kg</li>
                <li>No blood donation within 56 days</li>
                <li>No restricted medical conditions</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={
                submitting ||
                !eligibilityResult?.eligible ||
                !formData.donorName ||
                !formData.donorPhone ||
                !formData.bloodGroup
              }
              className={`flex-1 btn ${
                !eligibilityResult?.eligible
                  ? 'btn-disabled'
                  : 'btn-error text-white hover:btn-error'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Donation Request'}
            </button>
            <button type="button" className="btn btn-outline">
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonorDonationForm;
