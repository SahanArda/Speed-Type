import { useState, useEffect, useRef } from "react";
import axios from "axios";
import auth from "../../services/auth";
import Logout from "../../components/Logout/Logout";

const Home = () => {
  const [paragraph, setParagraph] = useState("");
  const [typedText, setTypedText] = useState("");
  const [timeLeft, setTimeLeft] = useState(30); // Timer starts at 30 seconds
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [started, setStarted] = useState(false);
  const [errors, setErrors] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isTestOver, setIsTestOver] = useState(false); // New state to prevent typing after test
  const [isTyping, setIsTyping] = useState(false); // Track typing activity
  const inputRef = useRef(null);
  const cursorRef = useRef(null);
  let typingTimeout = useRef(null); // Timeout for blinking behavior

  // Fetch paragraph on component mount
  useEffect(() => {
    const fetchParagraph = async () => {
      const token = auth.getToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      try {
        const response = await axios.get(
          "http://127.0.0.1:5000/generated_paragraph",
          config
        );
        setParagraph(response.data.paragraph);
      } catch (error) {
        console.error("Error fetching paragraph:", error);
      }
    };

    fetchParagraph();
  }, []);

  // Timer logic
  useEffect(() => {
    let timer = null;
    if (started && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      calculateResults();
      setIsTestOver(true); // Mark the test as over
    }

    return () => clearTimeout(timer);
  }, [started, timeLeft]);

  const handleKeyPress = (e) => {
    if (!started) {
      setStarted(true);
    }

    // Do not allow typing after the test is over
    if (isTestOver) return;

    // Handle typing activity
    setIsTyping(true);
    clearTimeout(typingTimeout.current); // Clear the timeout if the user is typing

    typingTimeout.current = setTimeout(() => {
      setIsTyping(false); // Set the cursor to blink if the user stops typing
    }, 1000); // 1 second delay before blinking resumes

    let newTypedText = typedText;

    if (e.key === "Backspace") {
      newTypedText = newTypedText.slice(0, -1); // Remove last character
    } else if (e.key.length === 1 || e.key === " ") {
      newTypedText += e.key; // Add the typed character or space
    }

    setTypedText(newTypedText);
    updateStats(newTypedText);
  };

  // Focus the hidden input on component mount to capture typing automatically
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const updateStats = (typed) => {
    let errorCount = 0;

    // Count errors
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== paragraph[i]) {
        errorCount++;
      }
    }

    setErrors(errorCount);

    // Calculate WPM (words per minute) based on the number of correct words typed
    const correctTypedWords = typed
      .split(" ")
      .filter((word, index) => word === paragraph.split(" ")[index]).length;
    setWpm(((correctTypedWords / (30 - timeLeft)) * 60).toFixed(2));

    // Calculate accuracy as a percentage of correct characters
    setAccuracy(
      (((typed.length - errorCount) / typed.length) * 100).toFixed(2)
    );
  };

  const calculateResults = () => {
    // Show the results modal
    setShowResults(true);
  };

  const handleCloseResults = () => {
    // Reset all scores and text when the test restarts
    setShowResults(false);
    setTypedText("");
    setTimeLeft(30);
    setWpm(0);
    setAccuracy(0);
    setErrors(0);
    setStarted(false); // Restart the test
    setIsTestOver(false); // Allow typing again
  };

  // Render the paragraph with correct/incorrect highlights and cursor
  const renderParagraph = () => {
    return (
      <span className="relative">
        {/* Blinking cursor before the first character */}
        {typedText.length === 0 && (
          <span
            ref={cursorRef}
            className={`absolute border-r-2 border-green ${isTyping ? "" : "animate-blink"}`}
            style={{ left: "-0.2rem", top: "0", height: "1.5em" }}
          ></span>
        )}
        {paragraph.split("").map((char, index) => {
          const typedChar = typedText[index];

          // Default colour if not typed yet
          let color = "text-slate";

          // Correctly typed character
          if (typedChar === char) {
            color = "text-green";
          }

          // Incorrectly typed character
          if (typedChar !== undefined && typedChar !== char) {
            color = "text-red-500";
          }

          // Cursor that blinks only after typing stops
          const isCursor = index === typedText.length;

          return (
            <span key={index} className={color} style={{ position: "relative" }}>
              {char}
              {isCursor && (
                <span
                  ref={cursorRef}
                  className={`absolute border-r-2 border-green ${isTyping ? "" : "animate-blink"}`}
                  style={{ left: "-1px", top: "0", height: "1.5em" }}
                ></span>
              )}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div
      className="min-h-screen bg-navy text-lightest-slate p-8"
      tabIndex="0"
      onKeyDown={handleKeyPress}
    >
      <nav className="flex justify-between items-center py-4">
        <h1 className="text-3xl font-bold text-green">Speed Type</h1>
        <div>
          <Logout />
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="p-8 w-full max-w-5xl">
          {/* Render the paragraph with correct/incorrect highlights */}
          <p className="text-4xl leading-relaxed text-light-slate mb-4">
            {renderParagraph()}
          </p>

          {/* Hidden input to capture typing */}
          <input
            ref={inputRef}
            type="text"
            value={typedText}
            className="opacity-0 absolute"
            onChange={() => {}} // No need to update value as handles with handleKeyPress
          />

          {/* Typing stats */}
          <div className="mt-4 text-center flex justify-center items-center space-x-5">
            <p className="text-lg text-lightest-slate">
              Time Left: {timeLeft}s
            </p>
            <p className="text-lg text-lightest-slate">WPM: {wpm}</p>
            <p className="text-lg text-lightest-slate">Accuracy: {accuracy}%</p>
            <p className="text-lg text-red-500">Errors: {errors}</p>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showResults && (
        <div className="fixed inset-0 flex items-center justify-center bg-lightest-navy bg-opacity-75">
          <div className="bg-light-navy p-8 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold text-center text-white">
              Test Completed
            </h3>
            <p className="text-lg text-center mt-4 text-green">WPM: {wpm}</p>
            <p className="text-lg text-center text-lightest-slate">
              Accuracy: {accuracy}%
            </p>
            <p className="text-lg text-center text-red-500">Errors: {errors}</p>

            <button
              onClick={handleCloseResults}
              className="mt-6 w-full px-4 py-2 font-bold text-white bg-lightest-navy rounded-md hover:bg-opacity-90"
            >
              Start New Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
