import React from "react";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Nishant Bansal",
      title: "Investment Banker",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      rating: 5,
      text: "This pandemic presented itself as a challenge for learning. Suryaveer became very cranky at home. LearningPie came as a lifesaver, even home is an everyday adventure for him. Thanks to LearningPie for making this happen.",
      bgColor: "bg-blue-400"
    },
    {
      name: "Pooja Mehta",
      title: "Educator",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      rating: 5,
      text: "LearningPie Preschool Program was an easy choice. They have included everything. A child could want and a parent would need. Their offerings are vast and comprehensive. Truly, a complete preschool program. Avya can't really take his hands-off the kit.",
      bgColor: "bg-orange-500"
    },
    {
      name: "Manish Harodia",
      title: "IIM-K",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      rating: 5,
      text: "During these times, we observed that we need to engage Navya in some or the other way in order to continue her learning process. We came across LearningPie and it has been an upward spiral of fun since then.",
      bgColor: "bg-blue-500"
    }
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            1,25,000+ Parents Trust{" "}
            <span className="text-yellow-500">Learning</span>
            <span className="text-orange-500">Pie</span>
            <span className="inline-block w-3 h-3 bg-orange-500 rounded-full ml-1 mb-2"></span>
          </h2>
          <p className="text-gray-700 text-lg">
            We are extremely grateful to all the parents for trusting us as their child's first learning partner!
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="relative pt-24">
              {/* Profile Image - Positioned to overlap card */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                <div className="w-44 h-44 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Card Content */}
              <div
                className={`${testimonial.bgColor} rounded-3xl pt-28 pb-8 px-8 text-white flex flex-col items-center shadow-lg`}
              >
                {/* Name and Title */}
                <h3 className="text-2xl font-bold mb-1">{testimonial.name}</h3>
                <p className="text-lg mb-4 opacity-90">{testimonial.title}</p>

                {/* Divider with Arrow */}
                <div className="relative w-full flex justify-center mb-6">
                  <div className="w-32 h-0.5 bg-white"></div>
                  <div className="absolute -bottom-2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
                </div>

                {/* Star Rating */}
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-8 h-8 fill-yellow-300"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-center leading-relaxed text-base">
                  {testimonial.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;