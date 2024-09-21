import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import auth from "../../Services/Auth";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const [paragraph, setParagraph] = useState("");
  const [typedText, setTypedText] = useState("");
  const [timer, setTimer] = useState(30); // Default time limit is 30 seconds
  const [isTyping, setIsTyping] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isTestOver, setIsTestOver] = useState(false);
  const [correctChars, setCorrectChars] = useState(0); // Track correct characters

  const currentCharIndex = useRef(0); // Tracks the current index in the paragraph
  const typingAreaRef = useRef(null);

  useEffect(() => {
    // Fetch the paragraph from the backend
    const fetchParagraph = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/generated_paragraph",
          {
            headers: {
              Authorization: `Bearer ${auth.getToken()}`,
            },
          }
        );
        setParagraph(response.data.paragraph);
      } catch (error) {
        console.error("Error fetching paragraph", error);
      }
    };

    fetchParagraph();
  }, []);

  useEffect(() => {
    let interval;
    if (isTyping && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTestOver(true);
      setIsTyping(false);
    }

    return () => clearInterval(interval);
  }, [isTyping, timer]);

  useEffect(() => {
    // Focus the typing area when the component mounts
    typingAreaRef.current.focus();
  }, []);

  const handleKeyDown = (e) => {
    if (isTestOver || timer === 0) return;

    if (!isTyping) setIsTyping(true);

    const key = e.key;
    const currentChar = paragraph[currentCharIndex.current];

    if (key === "Backspace") {
      // Handle backspace
      if (typedText.length > 0) {
        setTypedText((prev) => prev.slice(0, -1));
        currentCharIndex.current = Math.max(currentCharIndex.current - 1, 0);

        // Update correctChars
        if (typedText.slice(-1) === paragraph[currentCharIndex.current]) {
          setCorrectChars((prev) => prev - 1);
        }

        // Recalculate accuracy
        const updatedCorrectChars = correctChars - (typedText.slice(-1) === paragraph[currentCharIndex.current] ? 1 : 0);
        const updatedTypedLength = typedText.length - 1;
        const accuracyPercentage = ((updatedCorrectChars / updatedTypedLength) * 100).toFixed(2);
        setAccuracy(isNaN(accuracyPercentage) ? 100 : accuracyPercentage);
      }
    } else if (key.length === 1) {
      // Only handle printable characters
      setTypedText((prev) => prev + key);

      if (key === currentChar) {
        setCorrectChars((prev) => prev + 1);
      }

      currentCharIndex.current += 1; // Move to the next character

      // If the user finishes typing the paragraph, stop the test
      if (currentCharIndex.current >= paragraph.length) {
        setIsTestOver(true);
        setIsTyping(false);
      }

      // Calculate Accuracy
      const accuracyPercentage = (
        (correctChars / typedText.length) *
        100
      ).toFixed(2);
      setAccuracy(isNaN(accuracyPercentage) ? 100 : accuracyPercentage);

      // Calculate Words Per Minute
      const wordsTyped = typedText.trim().split(" ").filter((word) => word !== "").length;
      const timeSpent = (30 - timer) / 60; // in minutes
      setWpm(((wordsTyped / timeSpent)).toFixed(2));
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate("/");
  };

  const renderHighlightedText = () => {
    return paragraph.split("").map((char, idx) => {
      let colorClass = "";

      if (idx < typedText.length) {
        colorClass = typedText[idx] === char ? "text-green-600" : "text-red-600";
      } else if (idx === typedText.length) {
        colorClass = "text-blue-600 underline"; // Current character to type
      }

      return (
        <span key={idx} className={colorClass}>
          {char}
        </span>
      );
    });
  };

  return (
    <div
      className="min-h-screen bg-purple-50"
      ref={typingAreaRef}
      tabIndex="0"
      onKeyDown={handleKeyDown}
    >
      <nav className="flex justify-between items-center bg-purple-700 p-4 text-white">
        <h1 className="text-xl font-bold">Speed Type</h1>
        <div>
          <button onClick={() => navigate("/scoreboard")} className="mr-4">
            Scoreboard
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center mt-12">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Typing Test</h2>

          {isTestOver ? (
            <div className="text-center">
              <h3 className="text-lg font-bold">Test Over</h3>
              <p>WPM: {wpm}</p>
              <p>Accuracy: {accuracy}%</p>
            </div>
          ) : (
            <>
              <div className="text-gray-700 mb-6 text-lg leading-relaxed">
                {renderHighlightedText()}
              </div>

              <div className="flex justify-between mt-4 text-xl">
                <p>Time Left: {timer}s</p>
                <p>WPM: {wpm}</p>
                <p>Accuracy: {accuracy}%</p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Home;
