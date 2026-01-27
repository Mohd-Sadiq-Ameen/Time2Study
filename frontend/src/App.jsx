import { useState } from "react";
import "./App.css";
import axios from "axios";
import { useEffect } from "react";

function App() {
  const [joke, setJoke] = useState([]);

  useEffect(() => {
    axios
      .get("/api")
      .then((response) => setJoke(response.data))
      .catch((err) => console.log("My Error : ", err))
      .finally(function () {
        console.log("working useEffect");
      });
  }, []);

  return (
    <>
      <h1>React Frontend</h1>
      <p>Joke : {joke.length}</p>

      {joke.map((post) => (
        <div className="post-card" key={post.id}>
          <span className="post-id">Post #{post.id}</span>
          <h3 className="post-title">{post.title}</h3>
          <p className="post-body">{post.body}</p>
        </div>
      ))}
    </>
  );
}

export default App;
