import { useState, useContext, useEffect } from "react";
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
  const [userData, setUserData] = useState(null);
  const [canDonate, setCanDonate] = useState(false);
  const navigate = useNavigate();
  
  // Helper function to check if 4 months have passed since last donation
  const checkDonationEligibility = (lastDonationDate) => {
    if (!lastDonationDate) return true; // First time donor is eligible
    
    const last = new Date(lastDonationDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - last.getFullYear()) * 12 + (now.getMonth() - last.getMonth());
    
    return monthsDiff >= 4; // Eligible if 4+ months have passed
  };
  
  // Fetch complete user data from database using email
  const fetchUserData = async (email) => {
    try {
      const response = await fetch(`${baseURL}/profile?email=${encodeURIComponent(email)}`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched User Data:", data);
        setUserData(data.profile || data.user || data);
        
        // Check eligibility based on fetched data
        const eligible = checkDonationEligibility(data.profile?.lastDonateDate || data.user?.lastDonateDate || data.lastDonateDate);
        setCanDonate(eligible);
      } else {
        console.error("Failed to fetch user data", response.status);
        // Fallback to user context data if fetch fails
        setUserData(user);
        const eligible = checkDonationEligibility(user?.lastDonateDate);
        setCanDonate(eligible);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Fallback to user context data if fetch fails
      setUserData(user);
      const eligible = checkDonationEligibility(user?.lastDonateDate);
      setCanDonate(eligible);
    }
  };
  
  // Fetch user data when modal opens or user changes
  useEffect(() => {
    if (isOpen && user?.email) {
      console.log("Fetching user data for email:", user.email);
      fetchUserData(user.email);
    }
  }, [user?.email, isOpen]);

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

    // Check if user has blood group set
    if (!userData?.bloodGroup) {
      Swal.fire({
        icon: "error",
        title: "Blood Group Not Set",
        text: "Your blood group is not set. Please contact admin to update your profile.",
      });
      return;
    }

    // Check donation eligibility (4 months requirement)
    if (!canDonate) {
      Swal.fire({
        icon: "error",
        title: "Donation Not Eligible",
        html: `<p>You must wait at least <strong>4 months</strong> between donations.</p>
              <p class="text-sm text-gray-600 mt-2">Last donation: ${userData?.lastDonateDate ? new Date(userData.lastDonateDate).toLocaleDateString() : "No previous donations"}</p>`,
      });
      return;
    }

    console.log("Donor Registration Data:", data);

    // Confirmation dialog before submission
    const result = await Swal.fire({
      title: "Confirm Donor Donation",
      html: `
        <div class="text-left">
          <p><strong>Name:</strong> ${userData.name || data.donorName}</p>
          <p><strong>Blood Group:</strong> ${userData.bloodGroup}</p>
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
          bloodGroup: userData.bloodGroup,
          units: 1,
          donorName: userData.name || data.donorName,
          donorPhone: data.phoneNumber,
          donorAddress: data.address,
          donorEmail: userData.email,
          weight: parseInt(data.weight),
          district: data.district,
          lastDonationDate: userData?.lastDonateDate || null,
          medicalConditions: data.medicalConditions || "None",
          notes: data.medicalConditions
            ? `Medical: ${data.medicalConditions}`
            : "Healthy donor",
        }),
      });

      console.log("Donation Request Response:", response);

      const responseData = await response.json();

      if (response.ok) {
        reset();
        onClose();
        Swal.fire({
          icon: "success",
          title: "Donation Request Submitted!",
          html: `
            <p>Thank you for your willingness to donate blood!</p>
            <p><strong>Blood Group:</strong> ${userData.bloodGroup}</p>
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
  console.log("bloodGroups in DonateBloodModal:", user);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Donate your Valuable Blood</h2>
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
              <input
                type="text"
                value={userData?.bloodGroup || "Loading..."}
                disabled
                className={`input input-bordered w-full bg-gray-100 cursor-not-allowed ${
                  !userData?.bloodGroup ? "border-red-300" : "border-green-300"
                }`}
              />
              <span className={`text-xs mt-1 ${
                userData?.bloodGroup ? "text-green-600" : "text-red-600"
              }`}>
                {userData?.bloodGroup
                  ? `✓ Your blood group: ${userData.bloodGroup}`
                  : "⚠ Blood group not set - Contact admin to update your profile"}
              </span>
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
                defaultValue={userData?.phone || ""}
                placeholder="01XXXXXXXXX"
                className="input input-bordered w-full"
              />
              {errors.phoneNumber && (
                <span className="text-red-600 text-sm mt-1">
                  Valid phone number is required (01XXXXXXXXX)
                </span>
              )}
            </div>

            {/* Last Donation Date - Read Only */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Last Donation Date
                </span>
              </label>
              <input
                type="date"
                value={
                  userData?.lastDonateDate
                    ? new Date(userData.lastDonateDate).toISOString().split("T")[0]
                    : "No previous donations"
                }
                disabled
                className="input input-bordered w-full bg-gray-100 cursor-not-allowed"
              />
              <span className={`text-xs mt-1 font-semibold ${
                canDonate ? "text-green-600" : "text-red-600"
              }`}>
                {canDonate
                  ? "✓ You are eligible to donate"
                  : "✗ You must wait at least 4 months between donations"}
              </span>
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
                value={userData?.district || ""}
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
              <li>✓ <strong>Minimum 4 months since last donation</strong></li>
              <li>✓ No major illness or surgery recently</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading || !canDonate}
              className={`btn flex-1 text-white ${
                loading || !canDonate ? "btn-disabled" : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Submit Donation"
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
