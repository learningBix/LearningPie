import React from 'react';
import { pricingData } from './pricingData';

const PricingCards = ({ selectedAgeGroup }) => {
  const cards = pricingData[selectedAgeGroup] || pricingData.seniorKG;

  return (
    <section className="w-full bg-gray-100 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-lg">
              {/* Title */}
              <h3 className="text-xl font-bold text-black mb-1">{card.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{card.duration}</p>

              {/* Curriculum */}
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">{card.curriculum}</p>

              {/* Activity Box */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">{card.activityKit}</p>
                <p className="text-xs text-gray-600">{card.kitDetails}</p>
              </div>

              {/* More from LearningPie */}
              <p className="text-xs text-gray-600 mb-6 leading-relaxed">{card.more}</p>

              {/* Pricing */}
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-black">You Pay Rs. {card.price.toLocaleString('en-IN')}/-</span>
                  <span className="text-lg text-gray-400 line-through">Rs.{card.originalPrice.toLocaleString('en-IN')}/-</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-semibold text-gray-700">Per Month Rs. {card.monthlyPrice.toLocaleString('en-IN')}/-</span>
                  <span className="text-sm text-gray-400 line-through">Rs.{card.originalMonthlyPrice.toLocaleString('en-IN')}/-</span>
                </div>
                <div className="mt-2">
                  <span className="text-sm font-bold text-green-600">Save {card.savings}%</span>
                </div>
              </div>

              {/* Enroll Now Button */}
              <button className="w-full bg-[#ff6b35] text-white py-3 rounded-lg font-bold text-base hover:bg-[#e55a2b] transition-colors">
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingCards;