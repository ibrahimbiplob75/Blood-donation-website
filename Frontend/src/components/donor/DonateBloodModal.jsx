import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { AuthProvider } from "../../context/ContextProvider.jsx";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../../Hooks/useAxios.js";

const DonateBloodModal = ({ isOpen, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { user } = useContext(AuthProvider);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  const districts = [
    "Dhaka",
    "Faridpur",
    "Gazipur",
    "Gopalganj",
    "Kishoreganj",
    "Madaripur",
    "Manikganj",
    "Munshiganj",
    "Narayanganj",
    "Narsingdi",
    "Rajbari",
    "Shariatpur",
    "Tangail",
    "Bogra",
    "Joypurhat",
    "Naogaon",
    "Natore",
    "Chapainawabganj",
    "Pabna",
    "Rajshahi",
    "Sirajganj",
    "Dinajpur",
    "Gaibandha",
    "Kurigram",
    "Lalmonirhat",
    "Nilphamari",
    "Panchagarh",
    "Rangpur",
    "Thakurgaon",
    "Barguna",
    "Barisal",
    "Bhola",
    "Jhalokathi",
    "Patuakhali",
    "Pirojpur",
    "Bandarban",
    "Brahmanbaria",
    "Chandpur",
    "Chattogram",
    "Cumilla",
    "Cox's Bazar",
    "Feni",
    "Khagrachhari",
    "Lakshmipur",
    "Noakhali",
    "Rangamati",
    "Habiganj",
    "Moulvibazar",
    "Sunamganj",
    "Sylhet",
    "Bagerhat",
    "Chuadanga",
    "Jashore",
    "Jhenaidah",
    "Khulna",
    "Kushtia",
    "Magura",
    "Meherpur",
    "Narail",
    "Satkhira",
    "Mymensingh",
    "Jamalpur",
    "Netrokona",
    "Sherpur",
  ];

  const onSubmit = async (data) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to register as a donor",
        showCancelButton: true,
        confirmButtonText: "Go to Login",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
      return;
    }

    // Confirmation dialog before submission
    const result = await Swal.fire({
      title: "Confirm Donor Donation",
      html: `
        <div class="text-left">
          <p><strong>Name:</strong> ${user.displayName || data.donorName}</p>
          <p><strong>Blood Group:</strong> ${data.bloodGroup}</p>
          <p><strong>Phone:</strong> ${data.phoneNumber}</p>
          <p><strong>District:</strong> ${data.district}</p>
          <p><strong>Weight:</strong> ${data.weight} kg</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirm Donation",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const response = await fetch(`${baseURL}/donation-requests`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodGroup: data.bloodGroup,
          units: 1,
          donorName: user.displayName || data.donorName,
          donorPhone: data.phoneNumber,
          donorAddress: data.address,
          donorEmail: user.email,
          dateOfBirth: data.dateOfBirth,
          weight: parseInt(data.weight),
          district: data.district,
          lastDonationDate: data.lastDonationDate || null,
          medicalConditions: data.medicalConditions || "None",
          availability: data.availability || "Available",
          notes: data.medicalConditions
            ? `Medical: ${data.medicalConditions}`
            : "Healthy donor",
        }),
      });

      const responseData = await response.json();

      if (response.ok) {
        reset();
        onClose();
        Swal.fire({
          icon: "success",
          title: "Donation Request Submitted!",
          html: `
            <p>Thank you for your willingness to donate blood!</p>
            <p><strong>Blood Group:</strong> ${data.bloodGroup}</p>
            <p>Your donation request is pending admin approval.</p>
            <p class="text-sm text-gray-600 mt-2">You will be notified once approved.</p>
          `,
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Submission Failed",
          text: responseData.message || "Failed to submit donation request",
        });
      }
    } catch (error) {
      console.error("Donation request error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to connect to server. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Become a Blood Donor</h2>
              <p className="text-sm mt-1 text-red-100">
                Save lives by donating blood
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 text-3xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Donor Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Full Name <span className="text-red-600">*</span>
                </span>
              </label>
              <input
                type="text"
                {...register("donorName", { required: true })}
                defaultValue={user?.displayName || ""}
                placeholder="Your full name"
                className="input input-bordered w-full"
              />
              {errors.donorName && (
                <span className="text-red-600 text-sm mt-1">
                  Name is required
                </span>
              )}
            </div>

            {/* Blood Group */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Blood Group <span className="text-red-600">*</span>
                </span>
              </label>
              <select
                {...register("bloodGroup", { required: true })}
                className="select select-bordered w-full"
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              {errors.bloodGroup && (
                <span className="text-red-600 text-sm mt-1">
                  Blood group is required
                </span>
              )}
            </div>

            {/* Phone Number */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Phone Number <span className="text-red-600">*</span>
                </span>
              </label>
              <input
                type="tel"
                {...register("phoneNumber", {
                  required: true,
                  pattern: /^01[0-9]{9}$/,
                })}
                placeholder="01XXXXXXXXX"
                className="input input-bordered w-full"
              />
              {errors.phoneNumber && (
                <span className="text-red-600 text-sm mt-1">
                  Valid phone number is required (01XXXXXXXXX)
                </span>
              )}
            </div>

            {/* Date of Birth */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Date of Birth <span className="text-red-600">*</span>
                </span>
              </label>
              <input
                type="date"
                {...register("dateOfBirth", { required: true })}
                max={new Date().toISOString().split("T")[0]}
                className="input input-bordered w-full"
              />
              {errors.dateOfBirth && (
                <span className="text-red-600 text-sm mt-1">
                  Date of birth is required
                </span>
              )}
            </div>

            {/* Weight */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Weight (kg) <span className="text-red-600">*</span>
                </span>
              </label>
              <input
                type="number"
                {...register("weight", { required: true, min: 50 })}
                placeholder="Minimum 50 kg"
                min="50"
                className="input input-bordered w-full"
              />
              {errors.weight && (
                <span className="text-red-600 text-sm mt-1">
                  Weight must be at least 50 kg
                </span>
              )}
            </div>

            {/* District */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  District <span className="text-red-600">*</span>
                </span>
              </label>
              <select
                {...register("district", { required: true })}
                className="select select-bordered w-full"
              >
                <option value="">Select District</option>
                {districts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
              {errors.district && (
                <span className="text-red-600 text-sm mt-1">
                  District is required
                </span>
              )}
            </div>

            {/* Address */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Full Address <span className="text-red-600">*</span>
                </span>
              </label>
              <textarea
                {...register("address", { required: true, minLength: 10 })}
                placeholder="Your complete address"
                className="textarea textarea-bordered w-full h-20"
              />
              {errors.address && (
                <span className="text-red-600 text-sm mt-1">
                  {errors.address.type === "minLength"
                    ? "Address must be at least 10 characters"
                    : "Address is required"}
                </span>
              )}
            </div>

            {/* Last Donation Date (Optional) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Last Donation Date (Optional)
                </span>
              </label>
              <input
                type="date"
                {...register("lastDonationDate")}
                max={new Date().toISOString().split("T")[0]}
                className="input input-bordered w-full"
              />
            </div>

            {/* Availability */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Availability</span>
              </label>
              <select
                {...register("availability")}
                className="select select-bordered w-full"
                defaultValue="Available"
              >
                <option value="Available">Available</option>
                <option value="Not Available">Not Available</option>
                <option value="Available Soon">Available Soon</option>
              </select>
            </div>

            {/* Medical Conditions (Optional) */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Medical Conditions (Optional)
                </span>
              </label>
              <textarea
                {...register("medicalConditions")}
                placeholder="Any medical conditions or medications (e.g., diabetes, blood pressure)"
                className="textarea textarea-bordered w-full h-20"
              />
              <span className="text-xs text-gray-500 mt-1">
                Please mention if you have any conditions that may affect
                donation
              </span>
            </div>
          </div>

          {/* Eligibility Criteria Info */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">
              Donor Eligibility Criteria:
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Age: 18-65 years</li>
              <li>✓ Weight: Minimum 50 kg</li>
              <li>✓ Good health condition</li>
              <li>✓ No blood donation in last 3 months</li>
              <li>✓ No major illness or surgery recently</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`btn flex-1 text-white ${
                loading ? "btn-disabled" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Register as Donor"
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-outline flex-1"
            >
              Cancel
            </button>
          </div>

          {/* Privacy Note */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Privacy Note:</span> Your
              information will be kept confidential and used only for blood
              donation coordination purposes.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonateBloodModal;
