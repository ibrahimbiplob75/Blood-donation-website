import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Droplets,
  HeartPulse,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

const stats = [
  { label: 'Active Donors', value: '18,200+' },
  { label: 'Lives Touched', value: '42,000+' },
  { label: 'District Coverage', value: '64' },
];

const focusAreas = [
  {
    icon: <HeartPulse className="w-6 h-6 text-[#780A0A]" />,
    title: 'Trusted Matching',
    copy: 'Smart matching between donors, hospitals, and families so the right blood arrives on time.',
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-[#780A0A]" />,
    title: 'Verified Eligibility',
    copy: 'Eligibility tracking keeps donors informed and recipients safe.',
  },
  {
    icon: <Droplets className="w-6 h-6 text-[#780A0A]" />,
    title: 'Transparent Stock',
    copy: 'Real-time visibility of blood stock to reduce shortages and waste.',
  },
];

const steps = [
  { label: 'Register', detail: 'Create your donor profile and preferred locations.' },
  { label: 'Get Matched', detail: 'We notify you when your blood type is needed nearby.' },
  { label: 'Donate & Track', detail: 'Confirm donation, receive updates, and see impact.' },
  { label: 'Stay Connected', detail: 'Join campaigns, volunteer, and share with your community.' },
];

const values = [
  { title: 'Community First', desc: 'Built with and for donors, patients, and frontline staff.', icon: <Users className="w-5 h-5" /> },
  { title: 'Speed with Care', desc: 'Rapid coordination without compromising safety.', icon: <Activity className="w-5 h-5" /> },
  { title: 'Human Touch', desc: 'Support in Bangla and English for every family.', icon: <Sparkles className="w-5 h-5" /> },
];

const About = () => {
  return (
    <div className="bg-gradient-to-b from-[#fff7f7] via-white to-[#f3f1ff] text-gray-900">
      <div className="max-w-6xl mx-auto px-4 lg:px-8 py-14 lg:py-20 space-y-14">
        <section className="relative overflow-hidden rounded-3xl bg-white/80 shadow-xl ring-1 ring-gray-100 px-6 py-10 lg:px-12 lg:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,10,10,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,146,146,0.12),transparent_40%)]" />
          <div className="relative flex flex-col lg:flex-row gap-10 lg:items-center">
            <div className="flex-1 space-y-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#780A0A]/10 text-[#780A0A] text-sm font-semibold">
                রক্তের বন্ধন • Since 2026
              </span>
              <div className="space-y-4">
                <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight text-gray-900">
                  Connecting donors, hospitals, and families so no one loses hope for blood.
                </h1>
                <p className="text-lg text-gray-700">
                  We make blood donation effortless and transparent—matching donors faster, tracking stock in real time,
                  and keeping every request visible until it is fulfilled.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#780A0A] text-white font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition"
                >
                  Become a donor <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/blood-requests"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-[#780A0A] font-semibold ring-1 ring-[#780A0A]/30 hover:ring-[#780A0A] transition"
                >
                  Request blood
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                {stats.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 px-4 py-3 text-center">
                    <p className="text-2xl font-extrabold text-[#780A0A]">{item.value}</p>
                    <p className="text-sm text-gray-600">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 relative">
              <div className="relative rounded-3xl bg-gradient-to-br from-[#fff4f4] via-white to-[#f6f1ff] p-8 shadow-lg ring-1 ring-gray-100">
                <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-[#780A0A]/10 blur-3xl" />
                <div className="absolute -bottom-8 -right-6 w-24 h-24 rounded-full bg-[#a23c3c]/10 blur-3xl" />
                <div className="relative space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow ring-1 ring-gray-100 text-sm font-semibold text-[#780A0A]">
                    <ShieldCheck className="w-4 h-4" /> Safe, vetted donations
                  </div>
                  <ul className="space-y-3">
                    {['Eligibility reminders', 'Geo-matched requests', 'Hospital-first coordination', 'Live request tracker'].map(
                      (point) => (
                        <li key={point} className="flex items-center gap-3 text-sm lg:text-base text-gray-700">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#780A0A]/10 text-[#780A0A] font-semibold">
                            •
                          </span>
                          <span>{point}</span>
                        </li>
                      )
                    )}
                  </ul>
                  <div className="rounded-2xl bg-white/80 ring-1 ring-gray-200 px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Need urgent help?</p>
                      <p className="text-lg font-bold text-gray-900">24/7 hotline</p>
                    </div>
                    <a
                      href="tel:01712345678"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#780A0A] text-white font-semibold shadow hover:-translate-y-0.5 transition"
                    >
                      <PhoneCall className="w-4 h-4" /> 01712-345678
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center justify-between gap-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#780A0A] uppercase tracking-wide">What we do</p>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">Built for rapid, reliable blood delivery.</h2>
              <p className="text-gray-700 max-w-3xl">
                From donor onboarding to hospital coordination, every part of the platform is designed to shorten the
                time between request and transfusion.
              </p>
            </div>
            <Link
              to="/blood-bank"
              className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-[#780A0A] hover:underline"
            >
              Explore blood bank <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {focusAreas.map((item) => (
              <div
                key={item.title}
                className="group rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-5 hover:-translate-y-1 hover:shadow-lg transition"
              >
                <div className="h-12 w-12 rounded-xl bg-[#780A0A]/10 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{item.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-[#780A0A] uppercase tracking-wide">How it works</p>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">A clear path from signup to donation.</h2>
            <p className="text-gray-700">
              Donors stay informed, recipients stay reassured, and hospitals stay connected through one streamlined flow.
            </p>
          </div>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className="flex gap-4 items-start rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 p-4 hover:ring-[#780A0A]/40 transition"
              >
                <div className="h-10 w-10 rounded-full bg-[#780A0A] text-white flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{step.label}</p>
                  <p className="text-sm text-gray-700">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white shadow-xl ring-1 ring-gray-100 px-6 py-10 lg:px-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <p className="text-sm font-semibold text-[#780A0A] uppercase tracking-wide">Our promise</p>
              <h3 className="text-2xl font-bold text-gray-900">Built on empathy, speed, and safety.</h3>
              <p className="text-gray-700">
                Every decision balances urgency with care—protecting donors, empowering hospitals, and giving families
                clarity when they need it most.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#780A0A] text-white font-semibold shadow-md hover:-translate-y-0.5 transition"
            >
              Talk to us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {values.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-[#780A0A]/5 border border-[#780A0A]/15 p-5 flex items-start gap-3"
              >
                <div className="h-10 w-10 rounded-full bg-white text-[#780A0A] shadow flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-700">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;