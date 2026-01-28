import { useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hero from "./components/Body/Hero";
import Layout from "./Layout";
import NavSidebar from "./components/Nav/NavSide";
import Login from "./components/Login/login";

function App() {
  const [color, setColor] = useState("yellow");

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="" element={<Hero />}></Route>
            <Route path="/about" element={<NavSidebar />}></Route>
            <Route path="/login" element={<Login />}></Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
