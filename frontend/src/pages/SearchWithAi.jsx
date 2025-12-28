import React, { useState } from 'react'
import ai from "../assets/ai.png"
import ai1 from "../assets/SearchAi.png"
import { RiMicAiFill } from "react-icons/ri";
import axios from 'axios';
import { serverUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import start from "../assets/start.mp3"
import { FaArrowLeftLong } from "react-icons/fa6";
import Card from "../components/Card.jsx";

function SearchWithAi() {
  const [input, setInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [suggestedCourses, setSuggestedCourses] = useState([]);
  const [notFoundMessage, setNotFoundMessage] = useState('');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const startSound = new Audio(start)
  
  function speak(message) {
    let utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (!recognition) {
    console.log("Speech recognition not supported");
  }

  const handleSearch = async () => {
    if (!recognition) return;
    setListening(true)
    startSound.play()
    recognition.start();
    recognition.onresult = async (e) => {
      const transcript = e.results[0][0].transcript.trim();
      setInput(transcript);
      await handleRecommendation(transcript);
    };
    
    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setListening(false);
      setError("Speech recognition failed. Please try typing instead.");
    };
    
    recognition.onend = () => {
      setListening(false);
    };
  };

  const handleRecommendation = async (query) => {
    if (!query || query.trim() === '') {
      setError("Please enter a search query");
      return;
    }
    
    setLoading(true);
    setError('');
    setRecommendations([]);
    setSuggestedCourses([]);
    setNotFoundMessage('');
    
    try {
      const result = await axios.post(`${serverUrl}/api/ai/search`, { input: query }, { withCredentials: true });
      
      // Handle response structure
      if (result.data.found === false) {
        // No courses found - show message and suggested courses
        setRecommendations([]);
        setSuggestedCourses(result.data.suggestedCourses || []);
        setNotFoundMessage(result.data.message || `No courses found for "${query}"`);
        speak("No courses found. Here are some suggestions for you");
      } else {
        // Courses found
        setRecommendations(result.data.courses || result.data || []);
        setSuggestedCourses([]);
        setNotFoundMessage('');
        if((result.data.courses || result.data || []).length > 0){
          speak("These are the top courses I found for you")
        }
      }
      setListening(false);
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || "Failed to search courses. Please try again.");
      speak("Sorry, I encountered an error while searching");
      setListening(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      handleRecommendation(input);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white flex flex-col items-center px-4 py-16">
      
      {/* Search Container */}
      <div className="bg-white shadow-xl rounded-3xl p-6 sm:p-8 w-full max-w-2xl text-center relative">
        <FaArrowLeftLong  className='text-[black] w-[22px] h-[22px] cursor-pointer absolute' onClick={()=>navigate("/")}/>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-6 flex items-center justify-center gap-2">
          <img src={ai} className='w-8 h-8 sm:w-[30px] sm:h-[30px]' alt="AI" />
          Search with <span className='text-[#CB99C7]'>AI</span>
        </h1>

        <div className="flex items-center bg-gray-700 rounded-full overflow-hidden shadow-lg relative w-full ">
          
          <input
            type="text"
            className="flex-grow px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none text-sm sm:text-base"
            placeholder="What do you want to learn? (e.g. AI, MERN, Cloud...)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          
          
          {input && !loading && (
            <button
              onClick={() => handleRecommendation(input)}
              className="absolute right-14 sm:right-16 bg-white rounded-full hover:bg-gray-100 transition"
              disabled={loading}
            >
              <img src={ai} className='w-10 h-10 p-2 rounded-full' alt="Search" />
            </button>
          )}

          <button
            className="absolute right-2 bg-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-100 transition disabled:opacity-50"
            onClick={handleSearch}
            disabled={loading || listening}
          >
            <RiMicAiFill className="w-5 h-5 text-[#cb87c5]" />
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {loading ? (
        <div className="mt-12 text-center">
          <h1 className='text-center text-xl sm:text-2xl text-gray-400'>Searching for courses...</h1>
          <div className="mt-4 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CB99C7]"></div>
          </div>
        </div>
      ) : recommendations.length > 0 ? (
        <div className="w-full max-w-6xl mt-12 px-2 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-white text-center flex items-center justify-center gap-3">
            <img src={ai1} className="w-10 h-10 sm:w-[60px] sm:h-[60px] p-2 rounded-full" alt="AI Results" />
            AI Search Results 
          </h2>
       
          <div className="flex items-start justify-center flex-wrap gap-6">
            {recommendations.map((course, index) => (
              <Card 
                key={course._id || index}
                thumbnail={course.thumbnail}
                title={course.title}
                price={course.price}
                category={course.category}
                id={course._id}
                reviews={course.reviews}
              />
            ))}
          </div>
        </div>
      ) : suggestedCourses.length > 0 ? (
        <div className="w-full max-w-6xl mt-12 px-2 sm:px-4">
          <div className="mb-6 text-center">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              {notFoundMessage || 'No Courses Found'}
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Here are some courses you might be interested in:
            </p>
          </div>
          
          <div className="flex items-start justify-center flex-wrap gap-6">
            {suggestedCourses.map((course, index) => (
              <Card 
                key={course._id || index}
                thumbnail={course.thumbnail}
                title={course.title}
                price={course.price}
                category={course.category}
                id={course._id}
                reviews={course.reviews}
              />
            ))}
          </div>
        </div>
      ) : (
        listening ? (
          <h1 className='text-center text-xl sm:text-2xl mt-10 text-gray-400'>Listening...</h1>
        ) : (
          <h1 className='text-center text-xl sm:text-2xl mt-10 text-gray-400'>
            {input ? 'No Courses Found' : 'Search for courses to get started'}
          </h1>
        )
      )}
    </div>
  );
}

export default SearchWithAi;
