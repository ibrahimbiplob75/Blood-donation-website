import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import bloodLogo from "/assets/images/1142143.png";
import AxiosPublic from "../context/AxiosPublic.jsx";

const Register = () => {
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [publicAxios] = AxiosPublic();
  const [loading, setLoading] = useState(false);
  const [isRmc, setIsRmc] = useState(true);

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
  const courses = ["MBBS", "BDS"];
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
    setLoading(true);

    try {
      const userInfo = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        bloodGroup: data.bloodGroup,
        district: data.district,
        lastDonateDate: data.lastDonateDate,
        batchNo: isRmc ? data.batchNo : null,
        designation: !isRmc ? data.designation : null,
        course: data.course,
        role: "user",
        password: data.password,
      };

      const response = await publicAxios.post("/users", userInfo);

      if (response.data?.user) {
        reset();
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Account created successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("Registration error:", error);
      Swal.fire({
        icon: "error",
        title: "Registration failed",
        text: error?.response?.data?.message || error.message || "Server error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Blood Donation | Register</title>
      </Helmet>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-white via-[#ffecec] to-[#f6bcbc] p-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center mb-8"
        >
          <img src={bloodLogo} alt="Blood Logo" className="w-20 h-20 mb-2" />
          <h1 className="text-3xl font-extrabold text-[#780A0A] tracking-wide">
            ROTARACT
          </h1>
          <p className="text-gray-700 font-semibold text-sm mt-1">
            রক্তদাতা হিশেবে যোগ দিন ❤️
          </p>
        </motion.div>

        <div className="card flex-shrink-0 w-full max-w-2xl shadow-2xl bg-base-100 p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="card-body">
            {/* Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                {...register("name", { required: true })}
                placeholder="Your full name"
                className="input input-bordered"
              />
              {errors.name && (
                <span className="text-red-600">Name is required</span>
              )}
            </div>

            {/* Phone */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Phone Number</span>
              </label>
              <input
                type="tel"
                {...register("phone", { required: true })}
                placeholder="01XXXXXXXXX"
                className="input input-bordered"
                required
              />
              {errors.phone && (
                <span className="text-red-600">Phone number is required</span>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Last Donate Date</span>
              </label>
              <input
                type="date"
                {...register("lastDonateDate", { required: true })}
                placeholder="YYYY-MM-DD"
                className="input input-bordered"
              />
              {errors.lastDonateDate && (
                <span className="text-red-600">
                  Last donate date is required
                </span>
              )}
            </div>

            {/* Blood Group */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Blood Group</span>
              </label>
              <select
                {...register("bloodGroup", { required: true })}
                className="select select-bordered"
              >
                <option value="">Select Blood Group</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
              {errors.bloodGroup && (
                <span className="text-red-600">Blood group is required</span>
              )}
            </div>

            {/* District */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">District</span>
              </label>
              <select
                {...register("district", { required: true })}
                className="select select-bordered"
              >
                <option value="">Select District</option>
                {districts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
              {errors.district && (
                <span className="text-red-600">District is required</span>
              )}
            </div>

            {/* RMC Status */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Are you from RMC running?</span>
              </label>
              <div className="flex gap-4">
                <label className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="rmc"
                    value="yes"
                    className="radio"
                    checked={isRmc}
                    onChange={() => setIsRmc(true)}
                  />
                  <span className="label-text">Yes (RMC Running)</span>
                </label>
                <label className="label cursor-pointer gap-2">
                  <input
                    type="radio"
                    name="rmc"
                    value="no"
                    className="radio"
                    checked={!isRmc}
                    onChange={() => setIsRmc(false)}
                  />
                  <span className="label-text">No (Other)</span>
                </label>
              </div>
            </div>

            {/* Batch No / Present Designation */}
            {isRmc ? (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Batch No</span>
                </label>
                <input
                  type="number"
                  {...register("batchNo", {
                    required: isRmc ? "Batch No is required" : false,
                    min: { value: 10, message: "Batch No must be at least 10" },
                    max: { value: 99, message: "Batch No must be at most 99" },
                  })}
                  placeholder="Enter 2-digit batch number (10-99)"
                  className="input input-bordered"
                />
                {errors.batchNo && (
                  <span className="text-red-600">{errors.batchNo.message}</span>
                )}
              </div>
            ) : (
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Present Designation</span>
                </label>
                <input
                  type="text"
                  {...register("designation", {
                    required: !isRmc ? "Present Designation is required" : false,
                  })}
                  placeholder="Enter your present designation"
                  className="input input-bordered"
                />
                {errors.designation && (
                  <span className="text-red-600">
                    {errors.designation.message}
                  </span>
                )}
              </div>
            )}

            {/* Course / Company */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">
                  {isRmc ? "Course" : "Institute"}
                </span>
              </label>
              {isRmc ? (
                <select
                  {...register("course", { required: true })}
                  className="select select-bordered"
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  {...register("course", { required: true })}
                  placeholder="Enter your company name"
                  className="input input-bordered"
                />
              )}
              {errors.course && (
                <span className="text-red-600">
                  {isRmc ? "Course" : "Company"} is required
                </span>
              )}
            </div>

            {/* Email */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                {...register("email", { required: true })}
                placeholder="Your email"
                className="input input-bordered"
              />
              {errors.email && (
                <span className="text-red-600">Email is required</span>
              )}
            </div>

            {/* Password */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                {...register("password", {
                  required: true,
                  minLength: 8,
                  pattern: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                })}
                placeholder="Create password"
                className="input input-bordered"
              />
              {errors.password && (
                <p className="text-red-600 text-sm">
                  Password must be at least 8 characters with letters and numbers
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="form-control mt-6">
              <button
                className="btn bg-red-600 hover:bg-red-700 border-none text-white"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "প্রসেস হচ্ছে..."
                  : "রেজিস্টার"}
              </button>
            </div>
          </form>

          {/* Login Redirect */}
          <p className="text-center text-gray-700 mt-6">
            আপনার অ্যাকাউন্ট আছে?{" "}
            <Link
              to="/login"
              className="text-[#780A0A] font-semibold hover:underline"
            >
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Register;
