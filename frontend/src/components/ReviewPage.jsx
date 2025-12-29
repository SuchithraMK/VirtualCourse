import React, { useEffect, useState } from 'react'
import ReviewCard from './ReviewCard'
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar } from 'react-icons/fa';


function ReviewPage() {
  const [showAll, setShowAll] = useState(false);
  const {allReview} = useSelector(state=>state.review)
  const navigate = useNavigate()

  const displayedReviews = showAll ? allReview : allReview.slice(0, 5);

  return (
    <div className='flex items-center justify-center flex-col bg-gradient-to-br from-gray-50 to-white py-16'>
      <h1 className='md:text-[45px] text-[30px] font-bold text-center mt-[30px] px-[20px] text-gray-800'>Real Reviews from Real Learners</h1>
      <span className='lg:w-[60%] md:w-[80%] text-[16px] text-center mt-[20px] mb-[60px] px-[20px] text-gray-600 leading-relaxed font-medium'>Discover how our Virtual Courses is transforming learning experiences through authentic feedback from students and professionals worldwide.</span>

      <div className='w-full max-w-7xl mb-[80px] px-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 justify-items-center'>
          {displayedReviews.map((item, index) => (
            <div key={index} className='bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-4 border border-gray-100 w-full max-w-xs'>
              {/* ⭐ Rating Stars */}
              <div className='flex items-center justify-center mb-3 text-yellow-400 text-base'>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i} className='mx-0.5'>
                      {i < item.rating ? <FaStar className='fill-current w-4 h-4' /> : <FaRegStar className='w-4 h-4 text-gray-300' />}
                    </span>
                  ))}
              </div>

              {/* 💬 Review Text */}
              <p className="text-gray-700 text-sm mb-3 leading-relaxed text-center italic">"{item.comment}"</p>

              {/* 📚 Course Name */}
              <div className='text-center mb-3'>
                <span className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  📚 {item.course.title}
                </span>
              </div>

              {/* 👤 Reviewer Info */}
              <div className="flex items-center justify-center gap-2 pt-3 border-t border-gray-100">
                {item.user.photoUrl ? (
                  <img src={item.user.photoUrl} alt={item.user.name} className='w-8 h-8 rounded-full object-cover' />
                ) : (
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs'>
                    {item.user.name?.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className='text-center'>
                  <h4 className="font-semibold text-gray-800 text-xs">{item.user.name}</h4>
                  <p className="text-xs text-gray-500 capitalize">{item.user.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {allReview.length > 5 && (
          <div className='text-center mt-8'>
            <button
              className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm'
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : 'View More Reviews'}
            </button>
          </div>
        )}
      </div>

      {allReview.length === 0 && (
        <div className='text-center py-20 px-8'>
          <div className='text-7xl mb-6'>⭐</div>
          <h3 className='text-2xl font-bold text-gray-800 mb-3'>No Reviews Yet</h3>
          <p className='text-gray-600 text-lg mb-6 max-w-md mx-auto'>Be the first to share your learning experience! Your feedback helps others discover amazing courses and supports our community of learners.</p>
          <button
            className='bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl'
            onClick={() => navigate('/allcourses')}
          >
            Start Learning Today
          </button>
        </div>
      )}
    </div>
  )
}


export default ReviewPage
