// /Users/homefolder/Desktop/Projects/project/frontend/src/context/StudyTimeContext.jsx

import { createContext, useContext, useState } from "react";

const StudyTimeContext = createContext();

export function StudyTimeProvider({ children }) {
  const [productiveSeconds, setProductiveSeconds] = useState(0);

  const addProductiveSeconds = (seconds) => {
    setProductiveSeconds((prev) => prev + seconds);
  };

  return (
    <StudyTimeContext.Provider
      value={{ productiveSeconds, addProductiveSeconds }}
    >
      {children}
    </StudyTimeContext.Provider>
  );
}

export function useStudyTime() {
  return useContext(StudyTimeContext);
}
