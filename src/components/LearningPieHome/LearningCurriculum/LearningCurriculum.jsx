import React, { useState } from "react";
import icon1 from '../../../assets/Group38012.png';
import icon2 from '../../../assets/Group38013.png';
import icon3 from '../../../assets/Group38014.png';

const LearningCurriculum = () => {
  const [selectedAge, setSelectedAge] = useState("3.5-4.5");

  const scrollToDemoForm = () => {
    const demoFormElement = document.getElementById('bookdemo');
    if (demoFormElement) {
      demoFormElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const ageGroups = [
    { id: "1.5-2.5", label: "1.5-2.5 years" },
    { id: "2.5-3.5", label: "2.5-3.5 years" },
    { id: "3.5-4.5", label: "3.5-4.5 years" },
    { id: "4.5-6", label: "4.5-6 years" }
  ];

  const curriculumData = {
    "1.5-2.5": [
      {
        title: "Develop Logical Thinking",
        image: "https://i.imgur.com/placeholder1.png",
        points: [
          "Recognize letters A-Z",
          "Finger tracing based learning",
          "Develop phonic understanding",
          "Develop lingual understanding (English & Hindi)",
          "Strengthen fine motor, gripping, and pincer skills for pre-writing ability"
        ]
      },
      {
        title: "Encourage Exploration Into New Subjects",
        image: "https://i.imgur.com/placeholder2.png",
        points: [
          "Identify, recognize, and quantify numbers 1-10",
          "Sort and sequence using shape, size, colours etc.",
          "Ascending and Descending order learning",
          "Early counting games in activity box",
          "Pre-math concepts such as big/small, one/many, etc"
        ]
      },
      {
        title: "Discover A Wide Array Of Themes And Resources",
        image: "https://i.imgur.com/placeholder3.png",
        points: [
          "Development of mental skills",
          "Engage in pretend and imaginative play",
          "Ability to match shapes and sort colors",
          "Identify body parts and functions",
          "Identify familiar people and everyday objects"
        ]
      }
    ],
    "2.5-3.5": [
      {
        title: "Develop Logical Thinking",
        image: "https://i.imgur.com/placeholder1.png",
        points: [
          "Write & speak English language and letters",
          "Learn Enhanced Eye-Hand coordination for emergent writing",
          "Learn letters’ sound and pronunciation",
          "Ability to answer questions after reading books",
          "Development of comprehension skills"
        ]
      },
      {
        title: "Encourage Exploration Into New Subjects",
        image: "https://i.imgur.com/placeholder2.png",
        points: [
          "Identify, recognize, and quantify numbers",
          "Sorting and sequencing activities",
          "Early math concepts – one/many, more/less, heavy/light, big/small etc",
          "Replicate & draw basic geometrical shapes (circles, squares, rectangles etc.)",
          "Maths centric games in activity box"
        ]
      },
      {
        title: "Discover A Wide Array Of Themes And Resources",
        image: "https://i.imgur.com/placeholder3.png",
       

        points: [
          "Learns to play with toys having buttons, levers, and moving parts",
          "Play with make-believe symbolic play with dolls, animals, and people",
          "Learn to build towers of more than 6 blocks",
          "Ability to screw and unscrew jar lids, develops gross & fine motor skills",
          "Able to solve puzzles with 3 or 4 pieces"
        ]
      }
    ],
    "3.5-4.5": [
      {
        title: "Develop Logical Thinking",
        image: "https://i.imgur.com/placeholder1.png",
        points: [
          "Recognise cursive and capital letters",
          "Learn to trace & write - big & small letters",
          "Learn about word family - such as am, as, at, an, er, et etc, oo, ug etc",
          "Able to identify, read and write CVC words",
          "Learn to blend letter sounds (phonics) to pronounce words"
        ]
      },
      {
        title: "Encourage Exploration Into New Subjects",
        image: "https://i.imgur.com/placeholder2.png",
        points: [
          "Learn to count & write upto 100",
          "Early math concepts – greater than/smaller than, more/less, right/left, big/small, heavy/light concepts",
          "Early numeracy concepts",
          "Learn and write number names",
          "Maths centric games in activity box"
        ]
      },
      {
        title: "Discover A Wide Array Of Themes And Resources",
        image: "https://i.imgur.com/placeholder3.png",
         points: [
          "Child begins to understand the idea of 'same' and 'different'",
          "Begins understanding concepts of time and duration",
          "Remembers parts of a story and can narrate them",
          "Refine fine motor skills and ability to use scissors",
          "Develops the ability to plan and prioritise"
        ]
      }
    ],
    "4.5-6": [
      {
        title: "Develop Logical Thinking",
        image: "https://i.imgur.com/placeholder1.png",
        points: [
          "Child learns to spell & write all CVCs 3 letter words",
          "SIntroduction to 4 letter words and consonant",
          "Learn to demonstrate adjectives – ‘this’, ‘that’, ‘and’",
          "Introduction to prepositions – in , on, under etc.",
          "Introduction to singular and plural forms"
        ]
      },
      {
        title: "Encourage Exploration Into New Subjects",
        image: "https://i.imgur.com/placeholder2.png",
        points: [
          "Learn to write number names till 100",
          "Ascending/Descending order concepts like small to big, big to small, smallest number etc.",
          "Skip counting 2s, 3s, 5s",
          "Counting before, after, and in between",
          "Maths centric games in activity box"
        ]
      },
      {
        title: "Discover A Wide Array Of Themes And Resources",
        image: "https://i.imgur.com/placeholder3.png",
        points: [
          "Thematic activity box based learning of my home, family, healthy food, trees, plants and flowers etc",
          "Hands on learning on animals, birds, gardens, living and non-living things etc",
          "Can draw a person with at least 6 body parts",
          "Refine fine motor skills and ability to use scissors",
          "Learns to draw shapes like triangle, rectangle & other geometric shapes"
        ]
      }
    ]
  };

  return (
<section id="what-will-learn" className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] py-16 bg-[#DCECA0] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            What Will Your Child Learn?
          </h2>
          <p className="text-gray-700 text-lg mb-6">Select Age Group</p>
          
          {/* Age Group Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {ageGroups.map((age) => (
              <button
                key={age.id}
                onClick={() => setSelectedAge(age.id)}
                className={`px-6 py-3 rounded-full font-semibold text-base transition-all ${
                  selectedAge === age.id
                    ? "bg-orange-500 text-white shadow-lg"
                    : "bg-white text-orange-500 border-2 border-orange-500 hover:bg-orange-50"
                }`}
              >
                {age.label}
              </button>
            ))}
          </div>
        </div>

        {/* Curriculum Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {curriculumData[selectedAge].map((card, index) => {
            const icons = [icon1, icon2, icon3];
            return (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-lg flex flex-col items-center"
            >
              {/* Illustration */}
              <div className="w-32 h-32 mb-6 flex items-center justify-center">
                <img 
                  src={icons[index]} 
                  alt={card.title} 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 text-center mb-6">
                {card.title}
              </h3>

              {/* Points List */}
              <ul className="w-full space-y-3">
                {card.points.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-gray-700 text-sm leading-relaxed">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button 
            onClick={scrollToDemoForm}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg transition-all hover:shadow-xl"
          >
            Book a Seat for your child
          </button>
        </div>

      </div>
    </section>
  );
};

export default LearningCurriculum;