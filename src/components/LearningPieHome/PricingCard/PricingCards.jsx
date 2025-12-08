import React from 'react';

// ================== PRICING DATA (Now in same file) ==================
const pricingData = {
  playgroup: [
    {
      title: 'Play Group - Term 1',
      duration: '(3 months)',
      curriculum: '36 Live Classes + 24 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (1 Activity Kit)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 10000,
      originalPrice: 18000,
      monthlyPrice: 3333,
      originalMonthlyPrice: 6000,
      savings: 44
    },
    {
      title: 'Play Group - Term 1 & 2',
      duration: '(6 months)',
      curriculum: '72 Live Classes + 48 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (2 Activity Kits)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 18000,
      originalPrice: 36000,
      monthlyPrice: 3000,
      originalMonthlyPrice: 6000,
      savings: 50
    },
    {
      title: 'Play Group - Term 1, 2 & 3',
      duration: '(9 months)',
      curriculum: '108 Live Classes + 72 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (3 Activity Kits)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 24000,
      originalPrice: 54000,
      monthlyPrice: 2667,
      originalMonthlyPrice: 6000,
      savings: 56
    }
  ],

  nursery: [
    {
      title: 'Nursery - Term 1',
      duration: '(3 months)',
      curriculum: '36 Live Classes + 24 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (1 Activity Kit)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 10000,
      originalPrice: 18000,
      monthlyPrice: 3333,
      originalMonthlyPrice: 6000,
      savings: 44
    },
    {
      title: 'Nursery - Term 1 Hindi',
      duration: '(3 months)',
      curriculum: '36 Live Classes + 24 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (1 Activity Kit)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 10000,
      originalPrice: 18000,
      monthlyPrice: 3333,
      originalMonthlyPrice: 6000,
      savings: 44
    },
    {
      title: 'Nursery - Term 1 & 2',
      duration: '(6 months)',
      curriculum: '72 Live Classes + 48 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (2 Activity Kits)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 18000,
      originalPrice: 36000,
      monthlyPrice: 3000,
      originalMonthlyPrice: 6000,
      savings: 50
    },
    {
      title: 'Nursery - Term 1, 2 & 3',
      duration: '(9 months)',
      curriculum: '108 Live Classes + 72 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (3 Activity Kits)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 24000,
      originalPrice: 54000,
      monthlyPrice: 2667,
      originalMonthlyPrice: 6000,
      savings: 56
    }
  ],

  juniorKG: [
    {
      title: 'Junior KG - Term 1',
      duration: '(3 months)',
      curriculum: '36 Live Classes + 24 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (1 Activity Kit)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 10000,
      originalPrice: 18000,
      monthlyPrice: 3333,
      originalMonthlyPrice: 6000,
      savings: 44
    },
    {
      title: 'Junior KG - Term 1 & 2',
      duration: '(6 months)',
      curriculum: '72 Live Classes + 48 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (2 Activity Kits)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 18000,
      originalPrice: 36000,
      monthlyPrice: 3000,
      originalMonthlyPrice: 6000,
      savings: 50
    },
    {
      title: 'Junior KG - Term 1, 2 & 3',
      duration: '(9 months)',
      curriculum: '108 Live Classes + 72 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (3 Activity Kits)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 24000,
      originalPrice: 54000,
      monthlyPrice: 2667,
      originalMonthlyPrice: 6000,
      savings: 56
    }
  ],

  seniorKG: [
    {
      title: 'Senior KG - Term 1',
      duration: '(3 months)',
      curriculum: '36 Live Classes + 24 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (1 Activity Kit)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 10000,
      originalPrice: 18000,
      monthlyPrice: 3333,
      originalMonthlyPrice: 6000,
      savings: 44
    },
    {
      title: 'Senior KG - Term 1 Hindi',
      duration: '(3 months)',
      curriculum: '36 Live Classes + 24 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (1 Activity Kit)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 10000,
      originalPrice: 18000,
      monthlyPrice: 3333,
      originalMonthlyPrice: 6000,
      savings: 44
    },
    {
      title: 'Senior KG - Term 1 & 2',
      duration: '(6 months)',
      curriculum: '72 Live Classes + 48 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (2 Activity Kits)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 18000,
      originalPrice: 36000,
      monthlyPrice: 3000,
      originalMonthlyPrice: 6000,
      savings: 50
    },
    {
      title: 'Senior KG - Term 1, 2 & 3',
      duration: '(9 months)',
      curriculum: '108 Live Classes + 72 Bonus Activities + Story Telling Sessions + Rhyme Time',
      activityKit: 'includes (3 Activity Kits)',
      kitDetails: 'Playful & Sensory Kit + Craft Material + STEM Activities + Worksheets + Stationery',
      more: 'Mindfulness & Gratitude Classes | Counselling Sessions | AR/360 Excursions',
      price: 24000,
      originalPrice: 54000,
      monthlyPrice: 2667,
      originalMonthlyPrice: 6000,
      savings: 56
    }
  ]
};

// ================= PRICING CARDS COMPONENT =================
const PricingCards = ({ selectedAgeGroup }) => {
  const cards = pricingData[selectedAgeGroup] || pricingData.seniorKG;

  return (
    <section className="w-full bg-gray-100 py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-lg h-full flex flex-col">
              <h3 className="text-xl font-bold text-black mb-1">{card.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{card.duration}</p>

              <p className="text-sm text-gray-700 mb-4 leading-relaxed">{card.curriculum}</p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">{card.activityKit}</p>
                <p className="text-xs text-gray-600">{card.kitDetails}</p>
              </div>

              <p className="text-xs text-gray-600 mb-6 leading-relaxed flex-grow">{card.more}</p>

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

              <button className="w-full bg-[#ff6b35] text-white py-3 rounded-lg font-bold text-base hover:bg-[#e55a2b] transition-colors mt-auto">
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
