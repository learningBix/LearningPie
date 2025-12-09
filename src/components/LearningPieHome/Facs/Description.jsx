import React, { useState } from 'react';

const faqs = [
  {
    question: "What is LearningPie@HOME?",
    answer: `LearningPie@Home is an online tech enabled experiential learning program designed by experts across the globe. 
    It is a combined effort of educators, child psychologists, parenting experts and innovators to bring your child an all-round learning experience which aims at making conceptual learning, a child's play and part of their lifelong learning process. 
    The program is a combination of online instructor led classes combined with Do-It-Yourself Activity box. 
    You will receive an all-inclusive learning kit, packed with activities, rhyme books, storybooks, worksheets and much more, providing holistic learning at the comfort of your own home.`
  },
  {
    question: "Why LearningPie is doing this?",
    answer: `Pre-schooling or early education in India is a highly fragmented category. Non adherence to a standard education curriculum, or lack of training to the teachers, or lack of the right tools and techniques, or the absence of the right environment, makes early learning a highly inefficient process today.
    LearningPie is conceptualized with a solitary objective of helping young children develop a sense of 'how to learn' through a very carefully designed curriculum, which borrows the best capabilities of some of the world's most popular curricula- viz. Montessori, Play Way, Bank Street, Waldorf, STEAM etc.
    We want to democratize quality education for children across India by providing them well designed; scientifically curated curriculum and state of the art experience to the remotest part of India.`
  },
  {
    question: "Who has designed the Curriculum?",
    answer: `We continuously engage with leading educators from across the globe to continuously evolve the curriculum and the pedagogy so that our children always stay ahead of the curve. 
    LearningPie@HOME is designed by pedagogy experts, child development professionals, early learning experts, psychologists and game designers at our R&D Centre. 
    We assure that all the materials you receive are tested, child-friendly, age-specific, safe and best-in-class quality!`
  },
  {
    question: "What all will include in my subscription plan?",
    answer: `In your subscription plan, you will get access to 36 Live Classes, 24 Bonus sessions and an all inclusive activity box having playful & sensory kits, craft material, worksheets etc delivered at your doorstep on quarterly basis. Your child will also attend special classes on Mindfulness & Gratitude, Augmented Reality/360 Excursions and you will get access to counseling sessions from our Early Education & Parenting Experts.`
  },
  {
    question: "What do I get in a kit?",
    answer: `You will receive an all-inclusive learning kit, packed with activities, rhyme books, storybooks, worksheets, craft material, STEM activities, playful & sensory kits, stationary and much more, providing holistic learning at the comfort of your own home. The kits are meticulously planned, in sync with the class curriculum, to develop finer skills and the achievement of tasks completion independently/in a guided manner.`
  },
  {
    question: "Screen time?",
    answer: `While increasing screen time in children has always been a cause of concern, the pandemic has certainly added to the woes and multiplied the time kids spend in front of the screens. Screens have become a way of life for kids. If the screen can't be avoided, why not turn it into a playful and learning time?
    With a lot of role plays, and child centric activities, the two way communication and engagement ensures that the child uses his/her time with the device in, an otherwise, productive manner.
    We have kept our daily sessions for less than an hour, and here the device (Laptop/pads) acts like a Television for kids kept at a distance with more focus on audio rather than visuals.`
  },
  {
    question: "Is parental involvement required??",
    answer: `Yes and No. We encourage DIY for most of the activities with an arm distance supervision. However, there are certain activities, which may include an additional support for the children. But we would love and advice for an active participation by either parent, as research suggests that a kindergartner learns more when he/she receives directions from parent, this also helps increase parent – child bonding.`
  },
  {
    question: "What age should we start formal learning for our child and if we start education at age 2.5, should we choose starting age 1.5-2.5 course or 2.5-3.5 course?",
    answer: `Children are a source of almost unlimited energy. If all of it is channelized into a direction, it results in massive learning and simulation for the child. Starting early gives an edge to your child as NASA study identified that kid’s peak in creativity at age 6, followed by a gradual decline as they grow up. So, you should start playful yet simulating learning for your child as early as possible.
We have developed the age and mental capabilities wise curriculum - 1.5-2.5 years, 2.5-3.5 years, 3.5 years-4.5 years and 4.5-6 years. Each age group requires unique ways of imparting the same skills. So, you should select the curricula as per current age of your child, irrespective of starting age of formal education for your child.`
  },
  {
    question: "What all do you cover in your curriculum?",
    answer: `We believe in holistic development of a child and has stressed equally on developing Language, Numeracy, Cognitive and Socio-Emotional skills. Writing, Speaking, Cognitive and all other skills are broken down piecemally through engaging curriculum. All concepts are covered in an activity-based format along with animations, rhymes, stories, interactive quizzes, etc. The immersion of technology at the right time also facilitates course correction and customization, if any, needed for any child.`
  },
  {
    question: "What are the add-ons that you are providing?",
    answer: `Apart from the thrice a week, online classroom learning, we have included 2 Bonus sessions per week, wherein you can give task or engage your little munchkin in various DIY activities. Completing a task gives immense sense of satisfaction, all the while building and honing upon skills like reasoning, cognition, familiarity etc.
In addition to Rhymes, Stories, etc, we have included monthly thematic Excursions to virtual Zoos, Fairs, Farms, etc to increase awareness in the child. Parents will also get access to live parenting/counseling sessions.`
  },
  {
    question: "How many demos will you provide?",
    answer: `On registration, you will get access to our demo portal, where in you can access the sample recorded classroom sessions, animated rhymes & stories, DIY activities videos, virtual zoo animation, a description about our Activity kit, and a small video explaining about our teaching pedagogy etc. Our early child educator will get in touch with you and help you with questions you may have.`
  },
  {
    question: "If my child miss any session, will you provide extra class?",
    answer: `We have created an experiential learning program and also recorded them using high quality audio and video devices. If your child miss attending any session, the child can attend the recorded session of the same. Now you can travel guilt free!`
  },
  {
    question: "Why should we trust you for our child's education?",
    answer: `We have over 6 years of experience in teaching all these courses in schools to children. With over 1000 schools spread across India, and having physically channeled interventions for about a million kids, we bring the best of the acquired knowledge to carefully designed curriculum.`
  },
  {
    question: "Does my child get admission into schools after completing your programs?",
    answer: `Our Early learning program is an absolute equivalent of the traditional Nursery and Kindergarten concept in India. Similar to graduating from Pre-Schools, our courses are recognized across India and a student will find it easy to get into a school of their choice.`
  },
 {
    question: "What is your refund policy?",
    answer: `Though unsatisfied student is an absolute rarity with us, in the unlikely situation of your child/you not being satisfied with our program, we do facilitate a refund. Once cancelled, the refund amount for the unshipped terms will be credited to your account -- to the same mode of payment chosen during enrollment, in 5-7 business days.`
  },
   {
    question: "I already have a preschool, do you have an offering that I can use?",
    answer: `We have created an omnichannel mode of training module for the thousands of entrepreneurs who have reached out to us during the last year. Your physical infrastructure can be blended with our curriculum, where you focus on the student’s learning, while we take care of everything else.
The teachers are also trained on how to effectively manage the curriculum and students at their respective physical pre-schools and education centres.
We offer a curated curriculum with DIY kits. You get access to the same engaging content available on our website.
During this COVID period, with preschools being shut for physical classes, our offering enables you to run classes and enable parents to effectively manage their child’s learning with regular counseling sessions and assessments.
For more details, Contact us at contact@learningbix.com`
  },

];

const FAQAccordion = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">
          Frequently asked questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full text-left px-8 py-6 flex justify-between items-center focus:outline-none group"
              >
                <span className="font-semibold text-gray-900 text-lg pr-4">
                  {faq.question}
                </span>
                <svg
                  className={`w-6 h-6 text-gray-600 transition-transform duration-300 flex-shrink-0 ${activeIndex === index ? 'transform rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${activeIndex === index
                    ? 'max-h-[1000px] opacity-100'
                    : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="px-8 pb-6 text-gray-700 leading-relaxed whitespace-pre-line">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQAccordion;