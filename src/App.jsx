import React, { useState, useEffect } from "react";
import { URL } from "./Components/Const";
import Answers from "./Components/Answers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark, faTrash } from "@fortawesome/free-solid-svg-icons";

const App = () => {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
    }
  }, [recentSearches]);

  const getData = async (customQuestion = null) => {
    const inputQuestion = customQuestion || question;

    const existingSearch = result.find(
      (item) => item.question === inputQuestion
    );
    if (existingSearch) {
      setResult((prevResult) => [
        ...prevResult.filter((item) => item.question !== inputQuestion),
        existingSearch,
      ]);
      setQuestion("");
      return;
    }

    const response = await fetch(URL, {
      method: "POST",
      body: JSON.stringify({
        contents: [{ parts: [{ text: inputQuestion }] }],
      }),
    });

    const data = await response.json();
    let dataString = data.candidates[0].content.parts[0].text;

    const myName = "Priyank vaghani";
    dataString = dataString.replace(/Google/g, myName);

    setResult((prev) => [
      ...prev,
      { question: inputQuestion, answer: dataString },
    ]);
    setQuestion("");

    setRecentSearches((prev) => {
      const updated = [
        inputQuestion,
        ...prev.filter((q) => q !== inputQuestion),
      ];
      return updated.slice(0, 10);
    });
  };

  const isEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      getData();
    }
  };

  const handleClearSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleRecentSearchClick = async (question) => {
    await getData(question);
  };

  return (
    <div className="h-screen grid grid-cols-1 md:grid-cols-5 font-poppins">
      {/* Sidebar */}

      {/* Hamburger menu for mobile */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <FontAwesomeIcon
          icon={faBars}
          className="text-white text-2xl cursor-pointer"
          onClick={() => setIsSidebarOpen(true)}
        />
      </div>

      <div
        className={`
  fixed top-0 left-0 h-full max-w-78 bg-zinc-800 text-white text-center p-5 overflow-y-auto z-50 transition-transform transform 
  ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
  md:static md:translate-x-0 md:col-span-1
`}
      >
        <div className="flex justify-between items-center mb-4 md:hidden">
          <h1 className="text-2xl font-medium">Recent Search</h1>
          <FontAwesomeIcon
            icon={faXmark}
            className="ml-2 text-white text-2xl cursor-pointer"
            onClick={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Hide heading for mobile (already shown above) */}
        <h1 className="text-2xl font-medium mb-4 hidden md:block">
          Recent Search
        </h1>

        {recentSearches.length === 0 ? (
          <p className="text-gray-400">No recent searches</p>
        ) : (
          <ul className="space-y-2 text-left">
            {recentSearches.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  handleRecentSearchClick(item);
                  setIsSidebarOpen(false); // auto-close on mobile
                }}
                className="cursor-pointer hover:text-blue-300 transition"
              >
                • {item}
              </li>
            ))}
          </ul>
        )}
        {recentSearches.length > 0 && (
          <button
            className="mt-4 bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm"
            onClick={handleClearSearches}
          >
            <span>Clear </span>&nbsp;
            <FontAwesomeIcon icon={faTrash} />
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="col-span-1 md:col-span-4 bg-zinc-700 text-white relative overflow-hidden flex flex-col justify-between">
        {/* Answer Area */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 mt-10 md:mt-5">
          {result.map((item, index) => (
            <div key={index} className="flex flex-col space-y-2">
              <div className="flex justify-end">
                <div className="bg-zinc-300 text-black p-4 rounded-l-2xl shadow-md w-full max-w-sm">
                  <p className="font-medium">{item.question}</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-zinc-600 text-white p-4 rounded-lg shadow-md w-full max-w-full">
                  <Answers
                    data={item.answer}
                    idx={index}
                    totalResult={result.length}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Section */}
        <div className="w-full px-4 mb-15 md:mb-6 bg-zinc-700">
          <div className="text-xl md:text-3xl text-center font-medium mb-3">
            What can I help with?
          </div>

          <div className="flex justify-center">
            <div className="bg-zinc-600 rounded-2xl p-4 flex items-center w-full max-w-3xl space-x-3">
              <input
                type="text"
                value={question}
                onKeyDown={isEnter}
                onChange={(e) => setQuestion(e.target.value)}
                className="bg-zinc-400 text-black font-medium w-full h-14 md:h-20 p-3 rounded-2xl resize-none outline-none"
                placeholder="Ask a question..."
              />
              <button
                type="submit"
                className="bg-white text-black font-semibold px-5 py-2 rounded-xl hover:bg-gray-200 transition-colors"
                onClick={() => getData()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
