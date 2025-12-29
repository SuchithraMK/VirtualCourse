import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { serverUrl } from '../App';
import { FaArrowLeftLong } from "react-icons/fa6";
import img from "../assets/empty.jpg"
import Card from "../components/Card.jsx"
import { setSelectedCourseData } from '../redux/courseSlice';
import { setUserData } from '../redux/userSlice';
import { FaLock, FaPlayCircle } from "react-icons/fa";
import { toast } from 'react-toastify';
import { FaStar } from "react-icons/fa6";


function ViewCourse() {

  const { courseId } = useParams();
  const navigate = useNavigate()
  const {courseData} = useSelector(state=>state.course)
  const {userData} = useSelector(state=>state.user)
  const [creatorData , setCreatorData] = useState(null)
  const dispatch = useDispatch()
  const [selectedLecture, setSelectedLecture] = useState(null);
  const {selectedCourseData} = useSelector(state=>state.course)
  const [selectedCreatorCourse,setSelectedCreatorCourse] = useState([])
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [currentReviewPage, setCurrentReviewPage] = useState(0);
  const reviewsPerPage = 5;
  
  const totalReviewPages = Math.ceil((selectedCourseData?.reviews?.length || 0) / reviewsPerPage);
  const startIndex = currentReviewPage * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = (selectedCourseData?.reviews || []).slice(startIndex, endIndex);
  const hasMoreReviews = endIndex < (selectedCourseData?.reviews?.length || 0);
   
   
  const handleReview = async () => {
    try {
      const result = await axios.post(serverUrl + "/api/review/givereview" , {rating , comment , courseId} , {withCredentials:true})
      toast.success("Review Added")
      console.log(result.data)
      setRating(0)
      setComment("")
      // Refresh course data to show new review
      fetchCourseData()
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || "Failed to add review")
    }
  }
  

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const avgRating = calculateAverageRating(selectedCourseData?.reviews);

  const fetchCourseData = async () => {
    let found = false;
    courseData.forEach((item) => {
      if (item._id === courseId) {
        dispatch(setSelectedCourseData(item))
        found = true;
      }
    })
    if (!found) {
      try {
        const result = await axios.get(serverUrl + `/api/course/getcourse/${courseId}`, { withCredentials: true });
        dispatch(setSelectedCourseData(result.data));
      } catch (error) {
        console.log(error);
      }
    }
  }

  const checkEnrollment = () => {
    const verify = userData?.enrolledCourses?.some(c => {
      const enrolledId = typeof c === 'string' ? c : c._id;
      return enrolledId?.toString() === courseId?.toString();
    });

    console.log("Enrollment verified:", verify);
    if (verify) {
      setIsEnrolled(true);
    }
  };

  useEffect(() => {
    fetchCourseData()
    checkEnrollment()
  }, [courseId])

  // Fetch creator info once course data is available
  useEffect(() => {
    const getCreator = async () => {
      if (selectedCourseData?.creator) {
        try {
          const result = await axios.post(
            `${serverUrl}/api/course/getcreator`,
            { userId: selectedCourseData.creator },
            { withCredentials: true }
          );
          setCreatorData(result.data);
          console.log(result.data)
        } catch (error) {
          console.error("Error fetching creator:", error);
        }
      }
    };

    getCreator();
  }, [selectedCourseData]);

  useEffect(() => {
    if (creatorData?._id && courseData.length > 0) {
      const creatorCourses = courseData.filter(
        (course) =>
          course.creator === creatorData._id && course._id !== courseId
      );
      setSelectedCreatorCourse(creatorCourses);
    }
  }, [creatorData, courseData, courseId]);

 
  const handleEnroll = async (courseId, userId) => {
    // Check if already enrolled before proceeding
    if (isEnrolled) {
      toast.info("You are already enrolled in this course!");
      navigate(`/viewlecture/${courseId}`);
      return;
    }

    // Double check enrollment status
    const alreadyEnrolled = userData?.enrolledCourses?.some(c => {
      const enrolledId = typeof c === 'string' ? c : c._id;
      return enrolledId?.toString() === courseId?.toString();
    });

    if (alreadyEnrolled) {
      toast.info("You are already enrolled in this course!");
      setIsEnrolled(true);
      navigate(`/viewlecture/${courseId}`);
      return;
    }

    try {
      // 1. Create Order
      const orderData = await axios.post(serverUrl + "/api/payment/create-order", {
        courseId,
        userId
      }, {withCredentials:true});
      console.log(orderData)

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.data.amount,
        currency: "INR",
        name: "Virtual Courses",
        description: "Course Enrollment Payment",
        order_id: orderData.data.id,
        handler: async function (response) {
          console.log("Razorpay Response:", response);
          try {
            const verifyRes = await axios.post(serverUrl + "/api/payment/verify-payment",{
              ...response,       
              courseId,
              userId
            }, { withCredentials: true });
            
            // Update enrollment status
            setIsEnrolled(true);
            
            // Refresh user data to get updated enrolled courses
            try {
              const userRes = await axios.get(serverUrl + "/api/user/currentuser", { withCredentials: true });
              dispatch(setUserData(userRes.data));
            } catch (userError) {
              console.log("Error refreshing user data:", userError);
            }
            
            toast.success(verifyRes.data.message);
          } catch (verifyError) {
            toast.error("Payment verification failed.");
            console.error("Verification Error:", verifyError);
          }
        },
      };
      
      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (err) {
      toast.error("Something went wrong while enrolling.");
      console.error("Enroll Error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-6 relative">

        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-6 ">
             
          {/* Thumbnail */}
          <div className="w-full md:w-1/2">
            <FaArrowLeftLong className='text-[black] w-[22px] h-[22px] cursor-pointer' onClick={()=>navigate("/")}/>
            {selectedCourseData?.thumbnail ? <img
              src={selectedCourseData?.thumbnail}
              alt="Course Thumbnail"
              className="rounded-xl w-full object-cover"
            /> :  <img
              src={img}
              alt="Course Thumbnail"
              className="rounded-xl w-full object-cover"
            /> }
          </div>

          {/* Course Info */}
          <div className="flex-1 space-y-2 mt-[20px]">
            <h1 className="text-2xl font-bold">{selectedCourseData?.title}</h1>
            <p className="text-gray-600">{selectedCourseData?.subTitle}</p>

            {/* Rating & Price */}
            <div className="flex items-start flex-col justify-between">
              <div className="text-yellow-500 font-medium">
                ⭐ {avgRating} <span className="text-gray-500">({selectedCourseData?.reviews?.length || 0} reviews)</span>
              </div>
              <div>
                <span className="text-lg font-semibold text-black">{selectedCourseData?.price}</span>{" "}
                <span className="line-through text-sm text-gray-400">₹599</span>
              </div>
            </div>

            {/* Highlights */}
            <ul className="text-sm text-gray-700 space-y-1 pt-2">
              <li>✅ 10+ hours of video content</li>
              <li>✅ Lifetime access to course materials</li>
            </ul>

            {/* Enroll Button */}
            {!isEnrolled ? <button className="bg-[black] text-white px-6 py-2 rounded hover:bg-gray-700 mt-3" onClick={()=>handleEnroll(courseId, userData._id)}>
              Enroll Now
            </button> :
            <button className="bg-green-200 text-green-600 px-6 py-2 rounded hover:bg-gray-100 hover:border mt-3" onClick={()=>navigate(`/viewlecture/${courseId}`)}>
              Watch Now
            </button>
            }
          </div>
        </div>

        {/* What You'll Learn */}
        <div>
          <h2 className="text-xl font-semibold mb-2">What You'll Learn</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-1">
            <li>Learn {selectedCourseData?.category} from Beginning</li>
          </ul>
        </div>

        {/* Requirements */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Requirements</h2>
          <p className="text-gray-700">Basic programming knowledge is helpful but not required.</p>
        </div>

        {/* Who This Course Is For */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Who This Course is For</h2>
          <p className="text-gray-700">
            Beginners, aspiring developers, and professionals looking to upgrade skills.
          </p>
        </div>

        {/* course lecture */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Side - Curriculum */}
          <div className="bg-white w-full md:w-2/5 p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-1 text-gray-800">Course Curriculum</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedCourseData?.lectures?.length || 0} Lectures</p>

            <div className="flex flex-col gap-3">
              {selectedCourseData?.lectures?.map((lecture, index) => (
                <button
                  key={index}
                  disabled={!lecture.isPreviewFree}
                  onClick={() => {
                    if (lecture.isPreviewFree) {
                      setSelectedLecture(lecture);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
                    lecture.isPreviewFree
                      ? "hover:bg-gray-100 cursor-pointer border-gray-300"
                      : "cursor-not-allowed opacity-60 border-gray-200"
                  } ${
                    selectedLecture?.lectureTitle === lecture.lectureTitle
                      ? "bg-gray-100 border-gray-400"
                      : ""
                  }`}
                >
                  <span className="text-lg text-gray-700">
                    {lecture.isPreviewFree ? <FaPlayCircle /> : <FaLock />}
                  </span>
                  <span className="text-sm font-medium text-gray-800">
                    {lecture.lectureTitle}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Video + Info */}
          <div className="bg-white w-full md:w-3/5 p-6 rounded-2xl shadow-lg border border-gray-200">
            <div className="aspect-video w-full rounded-lg overflow-hidden mb-4 bg-black flex items-center justify-center">
              {selectedLecture?.videoUrl ? (
                <video
                  src={selectedLecture.videoUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm">Select a preview lecture to watch</span>
              )}
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {selectedLecture?.lectureTitle || "Lecture Title"}
            </h3>
            <p className="text-gray-600 text-sm">
              {selectedCourseData?.title}
            </p>
          </div>
        </div>

        {/* Write a Review */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold mb-2">Write a Review</h2>
          <div className="mb-4">
            <div className="flex gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar 
                  key={star}
                  onClick={() => setRating(star)} 
                  className={`cursor-pointer ${star <= rating ? "fill-yellow-500" : "fill-gray-300"}`} 
                />
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              className="w-full border border-gray-300 rounded-lg p-2"
              rows="3"
            />
            <button
              className="bg-black text-white mt-3 px-4 py-2 rounded hover:bg-gray-800" 
              onClick={handleReview}
            >
              Submit Review
            </button>
          </div>

          {/* Display Existing Reviews */}
          {selectedCourseData?.reviews && selectedCourseData.reviews.length > 0 && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">All Reviews</h2>
              
              {/* Reviews Grid with Pagination */}
              <div className="relative flex items-center gap-4">
                {/* Previous Button - Left Side */}
                <button
                  onClick={() => setCurrentReviewPage(prev => prev - 1)}
                  disabled={currentReviewPage === 0}
                  className={`p-3 rounded-full transition-all flex-shrink-0 ${
                    currentReviewPage === 0 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                  aria-label="Previous reviews"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 flex-1">
                  {currentReviews.map((review, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      {/* Star Rating */}
                      <div className="flex text-yellow-400 mb-2">
                        {Array(5).fill(0).map((_, i) => (
                          <FaStar key={i} className={`text-lg ${i < review.rating ? "fill-current" : "text-gray-300"}`} />
                        ))}
                      </div>
                      
                      {/* Comment */}
                      <p className="text-sm text-gray-700 mb-3 italic line-clamp-3">"{review.comment || "No comment"}"</p>
                      
                      {/* User Info */}
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        {review.user?.photoUrl ? (
                          <img
                            src={review.user.photoUrl}
                            alt={review.user.name}
                            className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm text-white font-semibold">
                            {review.user?.name?.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-800 truncate">{review.user?.name}</span>
                          <span className="text-xs text-gray-500">{review.user?.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Next Button - Right Side */}
                <button
                  onClick={() => setCurrentReviewPage(prev => prev + 1)}
                  disabled={!hasMoreReviews}
                  className={`p-3 rounded-full transition-all flex-shrink-0 ${
                    !hasMoreReviews 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-black hover:bg-gray-800 text-white'
                  }`}
                  aria-label="Next reviews"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructor Info */}
        <div className="flex items-center gap-4 pt-4 border-t ">
          {creatorData?.photoUrl ? <img
            src={creatorData?.photoUrl}
            alt="Instructor"
            className="w-16 h-16 rounded-full object-cover"
          /> : <img
            src={img}
            alt="Instructor"
            className="w-16 h-16 rounded-full object-cover"
          />
          }
          <div>
            <h3 className="text-lg font-semibold">{creatorData?.name}</h3>
            <p className="md:text-sm text-gray-600 text-[10px] ">{creatorData?.description}</p>
            <p className="md:text-sm text-gray-600 text-[10px] ">{creatorData?.email}</p>
          </div>
        </div>

        {/* Other Published Courses */}
        <div>
          <p className='text-xl font-semibold mb-2'>Other Published Courses by the Educator -</p>
          <div className='w-full transition-all duration-300 py-[20px] flex items-start justify-center lg:justify-start flex-wrap gap-6 lg:px-[80px] '>
            {selectedCreatorCourse?.map((item, index) => (
              <Card 
                key={index} 
                thumbnail={item.thumbnail} 
                title={item.title} 
                id={item._id} 
                price={item.price} 
                category={item.category} 
                reviews={item.reviews}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewCourse