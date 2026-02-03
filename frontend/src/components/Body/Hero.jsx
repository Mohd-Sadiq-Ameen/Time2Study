// Video-code is there, but its Commented-out

import NavSidebar from "../Dashboard/Dashboard";
import { NavLink } from "react-router-dom";
import Faqs from "./Faqs";
import MiddleSection from "./MiddleSection";

export default function Hero() {
  return (
    <>
      <div className="flex">
        <section className="relative w-full pt-8 pb-14 bg-white dark:bg-black overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-purple-50 dark:from-zinc-900 dark:via-black dark:to-purple-900/20"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-0 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-8">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Track Your Real Study Time
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Stay
                <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}
                  Consistent &
                </span>
                <br />
                Stay Accountable
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                Record your study using a video or YouTube link. We
                automatically track your study time, help you stay consistent,
                and let you learn alongside other focused students.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-2">
                <NavLink to="/login">
                  <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    Get Started
                  </button>
                </NavLink>
                <button className="px-8 py-4 border-2 border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-zinc-600 font-semibold rounded-lg transition-colors duration-200">
                  Watch How It Works
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* <div>
        <video className="h- w-full rounded-lg" controls>
          <source
            src="https://docs.material-tailwind.com/demo.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div> */}

      <MiddleSection />

      <Faqs />
    </>
  );
}
