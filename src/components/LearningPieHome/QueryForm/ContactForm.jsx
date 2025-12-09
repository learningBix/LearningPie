import React, { useState } from "react";
// Point to a specific image file inside the project's `src/assets` folder
import Webbanner from "../../../assets/webbanner.png";

const ContactForm = () => {
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Phone submitted: ${phone}`);
  };

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">

        {/* Banner Image Section */}
        <div className="flex justify-center mb-[40px] relative z-30">
          <img
            src={Webbanner}
            alt="Contact Banner"
            className="w-full max-w-[600px] object-contain"
          />
        </div>

        {/* Layered Card Container */}
        <div className="relative z-20">
          {/* Bottom Shadow Layer with Tilt */}
          <div className="absolute inset-0 bg-orange-100 rounded-[40px] transform translate-y-4 rotate-[-0.5deg]"></div>

          {/* Main Card */}
          <div className="relative bg-gradient-to-r from-orange-400 to-orange-500 rounded-[40px] px-20 py-20 flex flex-col lg:flex-row items-center justify-between gap-16 shadow-2xl">
            
            {/* Text Section */}
            <div className="flex-1 text-center text-white">
              <h2 className="text-5xl font-bold mb-6">Have Questions?</h2>
              <p className="text-xl leading-relaxed">
                Please enter your contact details, our Early Childhood Educator will
                <br className="hidden lg:block" /> get in touch with you!
              </p>
            </div>

            {/* Form Section */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-5 w-full lg:w-auto lg:min-w-[320px]"
            >
              <input
                type="tel"
                placeholder="Enter Phone No."
                maxLength={10}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, ""))
                }
                className="px-7 py-4 rounded-full w-full text-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-white shadow-md placeholder:text-gray-500"
              />

              <button
                type="submit"
                disabled={phone.length !== 10}
                className={`px-10 py-4 rounded-full font-semibold text-base transition-all shadow-md ${
                  phone.length === 10
                    ? "bg-white text-orange-500 hover:bg-orange-50 hover:shadow-lg"
                    : "bg-orange-200 text-orange-400 cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            </form>

          </div>
        </div>

      </div>
    </section>
  );
};

export default ContactForm;