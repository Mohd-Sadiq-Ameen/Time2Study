import { useState } from "react";

export default function Faqs() {
  const faqs = [
    {
      question: "How does study tracking work?",
      answer:
        "We automatically track your focused study sessions using timers and activity signals. You get accurate insights without manual effort.",
    },
    {
      question: "Can I study with friends live?",
      answer:
        "Yes. You can join live study rooms, see who’s studying, and stay accountable together in real time.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Absolutely. We use end-to-end encryption, secure authentication, and follow industry-standard security practices.",
    },
    {
      question: "Is this platform free to use?",
      answer:
        "You can start for free with core features. Advanced analytics and premium tools are available in paid plans.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faqs" className="relative py-24 bg-white dark:bg-black overflow-hidden">
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
