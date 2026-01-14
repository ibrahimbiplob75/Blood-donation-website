import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaHeartbeat, FaTint, FaMapMarkerAlt, FaUsers, FaHandHoldingHeart } from 'react-icons/fa';

const Donors = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    totalDonors: 0,
    eligibleDonors: 0,
    bloodGroupStats: {},
    districtStats: {},
    bloodStockStats: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/donor/public-stats');
      const data = response.data.data;
      
      console.log('Blood Stock Stats from API:', data.bloodStockStats);
      
      setStatistics({
        totalDonors: data.totalDonors,
        eligibleDonors: data.eligibleDonors,
        bloodGroupStats: data.bloodGroupStats,
        districtStats: data.districtStats,
        bloodStockStats: data.bloodStockStats || {},
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setLoading(false);
    }
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const motivationalQuotes = [
    {
      text: "A single donation can save up to three lives",
      icon: <FaHeartbeat className="text-4xl text-red-500" />
    },
    {
      text: "Every two seconds, someone needs blood",
      icon: <FaTint className="text-4xl text-red-600" />
    },
    {
      text: "Be a hero, donate blood",
      icon: <FaHandHoldingHeart className="text-4xl text-pink-500" />
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Become a <span className="text-red-600">Life Saver</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join our community of heroes who save lives through blood donation
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transform transition hover:scale-105"
          >
            Register as a Donor
          </button>
        </div>

        {/* Motivational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {motivationalQuotes.map((quote, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-6 text-center transform transition hover:scale-105"
            >
              <div className="flex justify-center mb-4">{quote.icon}</div>
              <p className="text-lg font-semibold text-gray-800">{quote.text}</p>
            </div>
          ))}
        </div>

        {/* Overall Statistics */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Donors Registered</p>
                <p className="text-4xl font-bold text-red-600">{statistics.totalDonors}</p>
              </div>
              <FaUsers className="text-5xl text-red-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Eligible for Donation</p>
                <p className="text-4xl font-bold text-green-600">{statistics.eligibleDonors}</p>
              </div>
              <FaHeartbeat className="text-5xl text-green-200" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Blood Types Available</p>
                <p className="text-4xl font-bold text-blue-600">
                  {Object.values(statistics.bloodGroupStats).filter(count => count > 0).length}
                </p>
              </div>
              <FaTint className="text-5xl text-blue-200" />
            </div>
          </div>
        </div> */}

        {/* Blood Group Statistics */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <FaTint className="mr-3 text-red-600" />
            Blood Stock Availability
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {bloodGroups.map(group => {
              const isAvailable = (statistics.bloodStockStats[group] || 0) > 0;
              return (
                <div
                  key={group}
                  className={`rounded-lg p-6 text-center border-2 transition ${
                    isAvailable 
                      ? 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 hover:border-green-500'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <p className="text-2xl font-bold text-red-600 mb-4">{group}</p>
                  
                  {/* Availability Status */}
                  <div>
                    <p className={`text-xl font-bold ${
                      isAvailable ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {isAvailable ? 'Available' : 'Not Available'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* District Statistics */}
        {/* <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <FaMapMarkerAlt className="mr-3 text-blue-600" />
            Donors by District
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(statistics.districtStats)
              .sort((a, b) => b[1] - a[1])
              .map(([district, count]) => (
                <div
                  key={district}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 flex justify-between items-center border border-blue-200"
                >
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-blue-500 mr-3" />
                    <span className="font-semibold text-gray-800">{district}</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{count}</span>
                </div>
              ))}
          </div>
        </div> */}

        {/* Why Donate Section */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-lg shadow-xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">Why Should You Donate Blood?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🩸 Save Lives</h3>
              <p className="text-white text-opacity-90">
                Your donation can help accident victims, surgical patients, cancer patients, and those with blood disorders.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">❤️ Health Benefits</h3>
              <p className="text-white text-opacity-90">
                Regular blood donation can reduce the risk of heart disease and help maintain healthy iron levels.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🎯 Free Health Check</h3>
              <p className="text-white text-opacity-90">
                Each donation includes a mini health screening, checking your blood pressure, hemoglobin, and more.
              </p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🤝 Community Impact</h3>
              <p className="text-white text-opacity-90">
                Join a network of heroes making a real difference in your community and beyond.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Make a Difference?</h3>
          <p className="text-gray-600 mb-6">
            Register today and become part of our life-saving community
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg transform transition hover:scale-105"
          >
            Join Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Donors;
