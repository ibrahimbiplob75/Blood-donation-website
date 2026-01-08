"use client";
import { IoLogoYoutube } from "react-icons/io";
import footerBg from "../../public/assets/images/footerBg.webp";
import logo from "../../public/assets/images/1142143.png";
import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <footer
      className="w-full  sm:px-24 px-0 py-16 bg-cover bg-center bg-no-repeat mx-auto flex flex-col items-center gap-10 md:gap-12"
      style={{ backgroundImage: `url(${footerBg})` }}
    >
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-6">
        {/* Agency Logo and Mission */}
        <div className="space-y-4">
          <img
            src={logo}
            alt="Blood Agency Logo"
            width={150}
            height={50}
            className="text-white cursor-pointer"
            onClick={() => router.replace("/")}
          />
          <p className="text-[12px] sm:text-sm md:text-lg text-white font-normal leading-relaxed">
            “এক ফোঁটা রক্ত, একটি জীবন।” আমাদের লক্ষ্য—রক্তদাতা ও রোগীদের সংযুক্ত
            করা, যেন কেউ রক্তের অভাবে প্রাণ না হারায়।
          </p>
        </div>

        {/* Organization Menu */}
        <div>
          <h3 className="font-semibold mb-2 text-sm md:text-xl text-white font-normal border-b border-white/30 pb-1">
            আমাদের সংস্থা
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href={"/about"}
                className="text-[12px] sm:text-sm text-white font-normal hover:underline"
              >
                আমাদের সম্পর্কে
              </Link>
            </li>
            <li>
              <Link
                href={"/donors"}
                className="text-[12px] sm:text-sm text-white font-normal hover:underline"
              >
                রক্তদাতা তালিকা
              </Link>
            </li>
            <li>
              <Link
                href={"/campaigns"}
                className="text-[12px] sm:text-sm text-white font-normal hover:underline"
              >
                রক্তদান কর্মসূচি
              </Link>
            </li>
            <li>
              <Link
                href={"/volunteer"}
                className="text-[12px] sm:text-sm text-white font-normal hover:underline"
              >
                স্বেচ্ছাসেবক হন
              </Link>
            </li>
            <li>
              <Link
                href={"/contact"}
                className="text-[12px] sm:text-sm text-white font-normal hover:underline"
              >
                যোগাযোগ
              </Link>
            </li>
          </ul>
        </div>

        {/* Help & Resources */}
        <div>
          <h3 className="font-semibold mb-2 text-sm md:text-xl text-white font-normal border-b border-white/30 pb-1">
            সাহায্য ও তথ্য
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                href={"/donate-blood"}
                className="text-[12px] sm:text-sm text-white font-normal hover:underline"
              >
                রক্ত দিন
              </Link>
            </li>
            <li>
              <Link
                href={"/request-blood"}
                className="text-[12px] sm:text-sm text-white font-normal hover:underline"
              >
                রক্তের অনুরোধ
              </Link>
            </li>
            <li>
              <Link
                href={"/eligibility"}
                className="text-[12px] sm:text-sm text-white font-normal hover:underline"
              >
                রক্তদানের যোগ্যতা
              </Link>
            </li>
            <li>
              <Link
                href={"/faq"}
                className="text-[12px] sm:text-sm text-white font-normal hover:underline"
              >
                সাধারণ প্রশ্নোত্তর
              </Link>
            </li>
            <li>
              <Link
                href={"/privacy-policy"}
                className="text-[12px] sm:text-sm text-white font-normal hover:underline"
              >
                গোপনীয়তা নীতি
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact and Social Media */}
        <div>
          <h3 className="font-semibold mb-2 text-sm md:text-xl text-white font-normal border-b border-white/30 pb-1">
            যোগাযোগ মাধ্যম
          </h3>
          <div className="text-sm space-y-1 text-white">
            <p>
              📞 কল করুন:{" "}
              <a href="tel:01712345678" className="font-semibold text-white">
                01712-345678
              </a>
            </p>
            <p>
              📧 ইমেইল:{" "}
              <a
                href="mailto:help@bloodlink.org"
                className="underline text-white"
              >
                help@bloodlink.org
              </a>
            </p>
            <p>📍 ঠিকানা: ঢাকা, বাংলাদেশ</p>
          </div>
          {/* <div className="flex gap-4 mt-4">
            <Link href={"https://facebook.com"} target="_blank">
              <img
                src="/images/facebook.png"
                alt="Facebook"
                width={45}
                height={45}
                className="w-4 h-4 md:w-6 md:h-6"
              />
            </Link>
            <Link href={"https://instagram.com"} target="_blank">
              <img
                src="/images/insta.png"
                alt="Instagram"
                width={45}
                height={45}
                className="w-4 h-4 md:w-6 md:h-6"
              />
            </Link>
            <Link href={"https://twitter.com"} target="_blank">
              <img
                src="/images/twitter.png"
                alt="Twitter"
                width={45}
                height={45}
                className="w-4 h-4 md:w-6 md:h-6"
              />
            </Link>
            <Link href={"https://www.youtube.com/@BloodLink"} target="_blank">
              <IoLogoYoutube
                width={45}
                height={45}
                className="w-4 h-4 md:w-6 md:h-6 text-white"
              />
            </Link>
          </div> */}
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="text-sm md:text-xl text-white font-normal">
        Copy Right © 2026 . This site is develop and maintained by{" "}
        <span className="font-semibold">
          <Link
            target="_blank"
            to="https://intellisoft-e358d.web.app"
          >
            Intellisoft
          </Link>
        </span>{" "}
        | All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
