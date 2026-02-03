import { useState } from "react";

export default function Faqs() {
  const faqs = [
    {
      question: "How does study tracking work?",
      answer:
        "You track your study by submitting a raw study video or a YouTube study video from your channel. The platform automatically calculates your study time based on the video duration — no manual timers or fake entries.",
    },
    {
      question: "Do I need to record myself every time?",
      answer:
        "Yes. Study time is verified through video to keep tracking honest and fair for everyone. You can upload a raw video or use an existing YouTube study video.",
    },
    {
      question: "What kind of videos can I upload?",
      answer:
        "You can upload raw study videos or share a YouTube link from your own channel. The video should clearly represent your study session.",
    },
    {
      question: "Is live studying with others required?",
      answer:
        "No. Studying live with others is optional. You can study on your own or join focused learners when you want extra accountability.",
    },
    {
      question: "How do rewards and streaks work?",
      answer:
        "Rewards are based on verified study consistency and long-term streaks, not on short sessions or competition. The goal is to support healthy study habits, not pressure.",
    },
    {
      question: "Is competition mandatory?",
      answer:
        "No. Leaderboards and rankings are optional. If you prefer focusing on your own progress, you can study without competing.",
    },
    {
      question: "Is my data safe?",
      answer:
        "Yes. Your videos and study data are securely stored and only used for study verification and analytics. We do not sell personal data.",
    },
    {
      question: "Is the platform free to use?",
      answer:
        "You can start for free with basic study tracking. Some advanced features and reward eligibility are part of paid plans.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faqs"
      className="relative py-24 bg-white dark:bg-black overflow-hidden"
    >
      {/* background glow */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-900 dark:via-black dark:to-purple-900/20" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        {/* header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Everything you need to know before getting started
          </p>
        </div>

        {/* faq list */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all"
            >
              {/* question */}
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-lg font-medium text-gray-900 dark:text-white">
                  {faq.question}
                </span>

                <span
                  className={`ml-4 transform transition-transform duration-200 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  <svg
                    className="w-5 h-5 text-blue-600 dark:text-blue-400"
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
                </span>
              </button>

              {/* answer */}
              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* decorative blobs */}
      <div className="absolute top-24 left-10 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20" />
      <div className="absolute bottom-24 right-10 w-32 h-32 bg-purple-500 rounded-full blur-2xl opacity-20" />
    </section>
  );
}
