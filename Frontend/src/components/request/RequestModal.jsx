import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import AxiosPublic from "../../context/AxiosPublic.jsx";
import { AuthProvider } from "../../context/ContextProvider.jsx";

const RequestModal = ({ isOpen, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { user } = useContext(AuthProvider);
  const [publicAxios] = AxiosPublic();
  const [loading, setLoading] = useState(false);

  const bloodGroups = ["A+", "A−", "B+", "B-", "O+", "O-", "AB+", "AB−"];

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
        text: "Please login to submit a blood request",
      });
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        bloodGroup: data.bloodGroup,
        hospitalName: data.hospitalName,
        hospitalLocation: data.hospitalLocation,
        district: data.district,
        contactNumber: data.contactNumber,
        reason: data.reason,
        urgency: data.urgency,
        requesterName: user.displayName || data.requesterName,
        requesterEmail: user.email,
        status: "pending",
        createdAt: new Date(),
      };

      const response = await publicAxios.post("/blood-requests", requestData);

      if (response.data?.request) {
        reset();
        onClose();
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Blood request submitted successfully!",
          text: "We will notify nearby donors",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      console.error("Blood request error:", error);
      Swal.fire({
        icon: "error",
        title: "Request failed",
        text: error?.response?.data?.message || "Server error",
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-[#780A0A] text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Request Blood</h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 text-3xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm mt-2 text-gray-200">
            Fill in the details to submit your blood request
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Urgency */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Urgency Level <span className="text-red-600">*</span>
                </span>
              </label>
              <select
                {...register("urgency", { required: true })}
                className="select select-bordered w-full"
              >
                <option value="">Select Urgency</option>
                <option value="emergency">Emergency (Within 24 hours)</option>
                <option value="urgent">Urgent (Within 3 days)</option>
                <option value="normal">Normal (Within a week)</option>
              </select>
              {errors.urgency && (
                <span className="text-red-600 text-sm mt-1">
                  Urgency level is required
                </span>
              )}
            </div>

            {/* Hospital Name */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Hospital Name <span className="text-red-600">*</span>
                </span>
              </label>
              <input
                type="text"
                {...register("hospitalName", { required: true })}
                placeholder="e.g., Dhaka Medical College Hospital"
                className="input input-bordered w-full"
              />
              {errors.hospitalName && (
                <span className="text-red-600 text-sm mt-1">
                  Hospital name is required
                </span>
              )}
            </div>

            {/* Hospital Location */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Hospital Location <span className="text-red-600">*</span>
                </span>
              </label>
              <input
                type="text"
                {...register("hospitalLocation", { required: true })}
                placeholder="e.g., Secretariat Road, Dhaka"
                className="input input-bordered w-full"
              />
              {errors.hospitalLocation && (
                <span className="text-red-600 text-sm mt-1">
                  Hospital location is required
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

            {/* Contact Number */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">
                  Contact Number <span className="text-red-600">*</span>
                </span>
              </label>
              <input
                type="tel"
                {...register("contactNumber", {
                  required: true,
                  pattern: /^01[0-9]{9}$/,
                })}
                placeholder="01XXXXXXXXX"
                className="input input-bordered w-full"
              />
              {errors.contactNumber && (
                <span className="text-red-600 text-sm mt-1">
                  Valid phone number is required
                </span>
              )}
            </div>

            {/* Requester Name (if not logged in) */}
            {!user && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    Your Name <span className="text-red-600">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  {...register("requesterName", { required: !user })}
                  placeholder="Your full name"
                  className="input input-bordered w-full"
                />
                {errors.requesterName && (
                  <span className="text-red-600 text-sm mt-1">
                    Name is required
                  </span>
                )}
              </div>
            )}

            {/* Reason */}
            <div className="form-control md:col-span-2">
              <label className="label">
                <span className="label-text font-semibold">
                  Reason for Blood <span className="text-red-600">*</span>
                </span>
              </label>
              <textarea
                {...register("reason", { required: true, minLength: 10 })}
                placeholder="Briefly describe why you need blood (e.g., surgery, accident, treatment)"
                className="textarea textarea-bordered w-full h-24"
              />
              {errors.reason && (
                <span className="text-red-600 text-sm mt-1">
                  {errors.reason.type === "minLength"
                    ? "Please provide at least 10 characters"
                    : "Reason is required"}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`btn flex-1 text-white ${
                loading ? "btn-disabled" : "bg-[#780A0A] hover:bg-[#a00b0b]"
              }`}
            >
              {loading ? (
                <span className="loading loading-spinner"></span>
              ) : (
                "Submit Request"
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

          {/* Note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Note:</span> After submitting,
              nearby donors will be notified. Please ensure your contact number
              is correct.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;
