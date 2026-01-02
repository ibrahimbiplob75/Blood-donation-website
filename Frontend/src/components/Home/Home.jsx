import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../../Hooks/useAxios.js";
import Swal from "sweetalert2";
import CountUp from "react-countup";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import logo from "/assets/images/footerBg.webp";
import icon from "/assets/images/1142143.png";
import BloodRequestModal from "../request/RequestModal.jsx";
import DonateBloodModal from "../donor/DonateBloodModal.jsx";
import { AuthProvider } from "../../context/ContextProvider.jsx";

const Home = () => {
  const [eligible, setEligible] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [stats, setStats] = useState({
    activeDonors: 1250,
    patientsHelped: 890,
    unitsDonated: 1530,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const { user } = useContext(AuthProvider);
  const navigate = useNavigate();
  const axios = useAxios();

  // Fetch statistics on mount
  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await axios.get("/admin/statistics");
      if (response.data.success && response.data.data) {
        setStats({
          activeDonors: response.data.data.activeDonors || 1250,
          patientsHelped: response.data.data.patientsHelped || 890,
          unitsDonated: response.data.data.unitsDonated || 1530,
        });
      }
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
      // Use default values if fetch fails
    } finally {
      setStatsLoading(false);
    }
  };

  const checkEligibility = () => {
    Swal.fire({
      title: "Check Your Eligibility",
      html: `
        <p>Must be 18–65 years old<br>Weight at least 50kg<br>No major illness or medication<br>No donation in last 3 months</p>
      `,
      icon: "info",
      confirmButtonText: "Got It!",
    });
  };

  const handleRequestBlood = () => {
    setIsModalOpen(true);
  };

  const handleDonateBlood = () => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to register as a blood donor",
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
    setIsDonateModalOpen(true);
  };

  const images = [
    "/assets/slide1.jpg",
    "/assets/slide2.jpg",
    "/assets/slide3.jpg",
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
  };

  return (
    <div className="text-center w-full overflow-x-hidden">
      {/* Hero Section - Responsive */}
      <div
        className="h-[50vh] sm:h-[60vh] md:h-[70vh] mx-2 sm:mx-4 md:mx-5 my-3 sm:my-4 md:my-5 shadow-2xl rounded-md relative flex flex-col justify-center items-center bg-cover bg-center"
        style={{ backgroundImage: `url(${logo})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60 rounded-md"></div>

        <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 w-full">
          <img
            src={icon}
            alt="Logo"
            className="w-16 sm:w-20 md:w-24 lg:w-32 mb-3 sm:mb-4 mx-auto"
          />
          <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl w-full sm:w-[90%] md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2 mx-auto font-bold text-slate-300 drop-shadow-lg leading-tight sm:leading-snug md:leading-normal px-2">
            "এক ফোঁটা রক্ত, একটি জীবন।" আমাদের লক্ষ্য—রক্তদাতা ও রোগীদের সংযুক্ত
            করা, যেন কেউ রক্তের অভাবে প্রাণ না হারায়।
          </h1>
          <div className="mt-6 sm:mt-8 md:mt-10 mb-8 sm:mb-12 md:mb-16 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full px-4">
            <button
              onClick={handleDonateBlood}
              className="btn btn-error text-white w-full sm:w-auto min-w-[160px] text-sm sm:text-base"
            >
              Donate Blood
            </button>
            <button
              onClick={handleRequestBlood}
              className="btn btn-active w-full sm:w-auto min-w-[160px] text-sm sm:text-base"
            >
              Request Blood
            </button>
          </div>
        </div>
      </div>

      {/* Blood Request Modal */}
      <BloodRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Donate Blood Modal */}
      <DonateBloodModal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
      />

      {/* Eligibility Check Section - Responsive */}
      <div className="max-w-4xl mx-auto my-8 sm:my-10 md:my-12 px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 text-red-600">
          🩸 Quick Blood Donor Eligibility Check
        </h2>

        <form
          id="donorForm"
          className="bg-white shadow-lg rounded-lg p-6 sm:p-8"
        >
          {/* Basic Requirements */}
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
              Basic Requirements
            </h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  I am 18–60 years old
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  I weigh at least 50 kg (110 lbs)
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  My last donation was at least 3–4 months ago
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  My hemoglobin is at least 12.5 g/dL
                </span>
              </label>
            </div>
          </div>

          {/* Health Status */}
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
              Health Status
            </h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  I feel healthy today (no fever or infection)
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  I have no chronic or serious disease
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  I am not taking antibiotics or strong medicines
                </span>
              </label>
            </div>
          </div>

          {/* Infection & Risk Screening */}
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
              Infection & Risk Screening
            </h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  I have no history of hepatitis, HIV, or syphilis
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  No tattoo, piercing, or dental surgery in last 6 months
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  No high-risk sexual behavior or IV drug use
                </span>
              </label>
            </div>
          </div>

          {/* For Women */}
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
              For Women
            </h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  I am not pregnant or breastfeeding
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  I am not menstruating today
                </span>
              </label>
            </div>
          </div>

          {/* Travel & Vaccination */}
          <div className="mb-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
              Travel & Vaccination
            </h3>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  No recent malaria or dengue infection
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="checkbox checkbox-error mt-1"
                />
                <span className="text-sm sm:text-base">
                  No recent vaccination in last 14 days
                </span>
              </label>
            </div>
          </div>

          {/* Check Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const checkboxes = document.querySelectorAll(
                '#donorForm input[type="checkbox"]'
              );
              const checkedCount = Array.from(checkboxes).filter(
                (c) => c.checked
              ).length;
              const total = checkboxes.length;
              const result = document.getElementById("result");

              if (checkedCount === total) {
                result.textContent =
                  "✅ You are likely eligible to donate blood!";
                result.style.color = "green";
              } else {
                result.textContent =
                  "⚠️ You may not be eligible — please review the unchecked items or consult a blood center.";
                result.style.color = "red";
              }
            }}
            className="btn btn-error text-white w-full text-base sm:text-lg"
          >
            Check Eligibility
          </button>

          {/* Result */}
          <p
            id="result"
            className="font-bold text-center mt-6 text-sm sm:text-base"
            style={{
              fontWeight: "bold",
              textAlign: "center",
              marginTop: "20px",
            }}
          ></p>
        </form>
      </div>

      {/* FAQ Section - Responsive */}
      <div className="max-w-3xl mx-auto my-8 sm:my-10 md:my-12 text-left px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 text-red-600">
          রক্তদানের যোগ্যতা ও সাধারণ প্রশ্নোত্তর
        </h2>

        <div
          tabIndex={0}
          className="collapse collapse-arrow bg-base-100 border border-base-300 mb-3"
        >
          <div className="collapse-title font-semibold text-sm sm:text-base ps-8 sm:ps-12">
            কে রক্ত দিতে পারবেন?
          </div>
          <div className="collapse-content text-xs sm:text-sm">
            যাদের বয়স ১৮ থেকে ৬৫ বছরের মধ্যে, ওজন অন্তত ৫০ কেজি এবং কোনো গুরুতর
            অসুস্থতা নেই, তারা রক্ত দিতে পারেন।
          </div>
        </div>

        <div
          tabIndex={0}
          className="collapse collapse-arrow bg-base-100 border border-base-300 mb-3"
        >
          <div className="collapse-title font-semibold text-sm sm:text-base ps-8 sm:ps-12">
            কত সময় পর আবার রক্ত দেওয়া যায়?
          </div>
          <div className="collapse-content text-xs sm:text-sm">
            পুরুষরা প্রতি ৩ মাসে একবার এবং মহিলারা প্রতি ৪ মাসে একবার রক্ত দিতে
            পারেন।
          </div>
        </div>

        <div
          tabIndex={0}
          className="collapse collapse-arrow bg-base-100 border border-base-300 mb-3"
        >
          <div className="collapse-title font-semibold text-sm sm:text-base ps-8 sm:ps-12">
            রক্ত দেওয়ার আগে কী প্রস্তুতি নিতে হবে?
          </div>
          <div className="collapse-content text-xs sm:text-sm">
            পর্যাপ্ত ঘুম, হালকা খাবার গ্রহণ ও শরীরে পর্যাপ্ত পানি থাকা জরুরি।
          </div>
        </div>

        <div
          tabIndex={0}
          className="collapse collapse-arrow bg-base-100 border border-base-300"
        >
          <div className="collapse-title font-semibold text-sm sm:text-base ps-8 sm:ps-12">
            রক্ত দেওয়ার পর কী করবেন?
          </div>
          <div className="collapse-content text-xs sm:text-sm">
            রক্ত দেওয়ার পর কিছুক্ষণ বিশ্রাম নিন এবং প্রচুর পানি ও খাবার গ্রহণ
            করুন।
          </div>
        </div>
      </div>

      {/* Stats Section - Responsive */}
      <div className="w-full max-w-5xl mx-auto my-8 sm:my-10 md:my-12 px-4">
        <div className="stats stats-vertical sm:stats-horizontal shadow bg-white rounded-2xl w-full">
          {/* Active Donors */}
          <div className="stat">
            <div className="stat-figure text-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 sm:w-8 sm:h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
            </div>
            <div className="stat-title text-xs sm:text-sm">Active Donors</div>
            <div className="stat-value text-error text-2xl sm:text-3xl md:text-4xl">
              {statsLoading ? (
                <span className="text-lg">Loading...</span>
              ) : (
                <CountUp end={stats.activeDonors} duration={5} />
              )}
            </div>
            <div className="stat-desc text-xs">Saving lives every day</div>
          </div>

          {/* Patients Helped */}
          <div className="stat">
            <div className="stat-figure text-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block w-6 h-6 sm:w-8 sm:h-8 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="fill"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
            </div>
            <div className="stat-title text-xs sm:text-sm">Patients Helped</div>
            <div className="stat-value text-secondary text-2xl sm:text-3xl md:text-4xl">
              {statsLoading ? (
                <span className="text-lg">Loading...</span>
              ) : (
                <CountUp end={stats.patientsHelped} duration={5} />
              )}
            </div>
            <div className="stat-desc text-xs">Through voluntary donations</div>
          </div>

          {/* Units Donated */}
          <div className="stat">
            <div className="stat-figure text-primary">
              <div className="avatar">
                <div className="w-12 sm:w-14 md:w-16 rounded-full ring ring-error ring-offset-base-100 ring-offset-2">
                  <img src={icon} alt="Donor" />
                </div>
              </div>
            </div>
            <div className="stat-value text-primary text-2xl sm:text-3xl md:text-4xl">
              {statsLoading ? (
                <span className="text-lg">Loading...</span>
              ) : (
                <CountUp end={stats.unitsDonated} duration={5} />
              )}
            </div>
            <div className="stat-title text-xs sm:text-sm">Units Donated</div>
            <div className="stat-desc text-secondary text-xs">Since launch</div>
          </div>
        </div>
      </div>

      {/* Info Section - Responsive */}
      <div className="max-w-4xl mx-auto text-gray-700 px-4 sm:px-6 mb-8 sm:mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
          Why Donate Blood?
        </h2>
        <p className="text-sm sm:text-base md:text-lg">
          Every drop counts! Donating blood not only saves lives but also
          improves your own health by stimulating new blood cell production.
        </p>
      </div>

      {/* CTA Section - Responsive */}
      <div className="mt-8 sm:mt-10 md:mt-12 mb-12 sm:mb-14 md:mb-16 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
        <button
          onClick={handleDonateBlood}
          className="btn btn-error text-white w-full sm:w-auto min-w-[160px] text-sm sm:text-base"
        >
          Donate Blood
        </button>
        <button
          onClick={handleRequestBlood}
          className="btn btn-outline w-full sm:w-auto min-w-[160px] text-sm sm:text-base"
        >
          Request Blood
        </button>
      </div>
    </div>
  );
};

export default Home;
