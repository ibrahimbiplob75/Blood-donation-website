import React from "react";

const blogCategories = [
  "Blood Donation",
  "Blood Groups",
  "Donor Guidelines",
  "Health Tips",
  "Emergency Care",
  "Patient Stories",
  "Medical Awareness",
];

const blogs = [
  {
    id: 1,
    title: "Who Can Donate Blood? Complete Eligibility Guide",
    excerpt:
      "Learn who is eligible to donate blood, age limits, weight requirements, and health conditions you should know before donating.",
    author: "Blood Care Team",
    date: "Jan 10, 2026",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "Why Regular Blood Donation Saves Lives",
    excerpt:
      "Regular blood donation plays a crucial role in saving accident victims, cancer patients, and people with chronic diseases.",
    author: "Dr. Rahman",
    date: "Jan 08, 2026",
    readTime: "4 min read",
  },
  {
    id: 3,
    title: "Blood Group Compatibility Explained Simply",
    excerpt:
      "Confused about blood groups? This article explains compatibility in a simple and practical way.",
    author: "Medical Editor",
    date: "Jan 05, 2026",
    readTime: "6 min read",
  },
];

const Blogs = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-red-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blood Donation Blogs
          </h1>
          <p className="max-w-2xl mx-auto text-lg opacity-90">
            Learn, share, and spread awareness about blood donation, donor
            health, and saving lives through knowledge.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-3">
          {blogCategories.map((cat, index) => (
            <button
              key={index}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Blog List */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col"
            >
              <span className="text-sm text-red-600 font-medium mb-2">
                {blog.readTime}
              </span>

              <h3 className="text-xl font-bold mb-3">
                {blog.title}
              </h3>

              <p className="text-gray-600 flex-grow">
                {blog.excerpt}
              </p>

              <div className="mt-4 border-t pt-4 text-sm text-gray-500 flex justify-between">
                <span>{blog.author}</span>
                <span>{blog.date}</span>
              </div>

              <button className="mt-4 text-red-600 font-semibold hover:underline">
                Read More →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-white border-t py-14">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Share Your Knowledge, Save Lives
          </h2>
          <p className="text-gray-600 mb-6">
            Are you a doctor, volunteer, or blood donor? Write blogs to educate
            others and help build a stronger blood donation community.
          </p>
          <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition">
            Write a Blog
          </button>
        </div>
      </section>
    </div>
  );
};

export default Blogs;
