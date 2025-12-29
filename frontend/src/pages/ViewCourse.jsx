import axios from 'axios';
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { serverUrl } from '../App';
// FIXED: Split imports into fa6 and fa sets to avoid Module Export errors
import { FaArrowLeftLong, FaStar } from "react-icons/fa6";
import { FaLock, FaPlayCircle } from "react-icons/fa"; 
import img from "../assets/empty.jpg";
import Card from "../components/Card.jsx";
import { setSelectedCourseData } from '../redux/courseSlice';
import { setUserData } from '../redux/userSlice';
import { toast } from 'react-toastify';

function ViewCourse() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux State
    const { courseData, selectedCourseData } = useSelector(state => state.course);
    const { userData } = useSelector(state => state.user);

    // Local State
    const [creatorData, setCreatorData] = useState(null);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [selectedCreatorCourse, setSelectedCreatorCourse] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [currentReviewPage, setCurrentReviewPage] = useState(0);
    const [loading, setLoading] = useState(true);

    const reviewsPerPage = 5;

    // Logic: Calculate Average Rating
    const avgRating = useMemo(() => {
        const reviews = selectedCourseData?.reviews || [];
        if (reviews.length === 0) return "0.0";
        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        return (total / reviews.length).toFixed(1);
    }, [selectedCourseData]);

    // Logic: Pagination for Reviews
    const currentReviews = useMemo(() => {
        const reviews = selectedCourseData?.reviews || [];
        const start = currentReviewPage * reviewsPerPage;
        return reviews.slice(start, start + reviewsPerPage);
    }, [selectedCourseData, currentReviewPage]);

    const totalReviewPages = Math.ceil((selectedCourseData?.reviews?.length || 0) / reviewsPerPage);
    const hasMoreReviews = (currentReviewPage + 1) < totalReviewPages;

    // 1. Primary Effect: Load Course & Check Enrollment
    useEffect(() => {
        const initPage = async () => {
            setLoading(true);
            try {
                // Find in existing Redux array or fetch from API
                const existingCourse = courseData?.find(item => item._id === courseId);
                if (existingCourse) {
                    dispatch(setSelectedCourseData(existingCourse));
                } else {
                    const result = await axios.get(`${serverUrl}/api/course/getcourse/${courseId}`, { withCredentials: true });
                    dispatch(setSelectedCourseData(result.data));
                }

                // Check Enrollment status from User Object
                if (userData?.enrolledCourses) {
                    const verify = userData.enrolledCourses.some(c => {
                        const id = typeof c === 'string' ? c : c._id;
                        return id?.toString() === courseId?.toString();
                    });
                    setIsEnrolled(!!verify);
                }
            } catch (error) {
                console.error("Fetch Error:", error);
                toast.error("Course not found.");
            } finally {
                setLoading(false);
            }
        };

        initPage();
    }, [courseId, userData, dispatch]);

    // 2. Fetch Creator Info
    useEffect(() => {
        const getCreator = async () => {
            if (selectedCourseData?.creator) {
                try {
                    const result = await axios.post(`${serverUrl}/api/course/getcreator`, { userId: selectedCourseData.creator }, { withCredentials: true });
                    setCreatorData(result.data);
                } catch (error) {
                    console.error("Error fetching creator:", error);
                }
            }
        };
        getCreator();
    }, [selectedCourseData?.creator]);

    // 3. Filter other courses by this educator
    useEffect(() => {
        if (creatorData?._id && courseData?.length > 0) {
            const others = courseData.filter(c => c.creator === creatorData._id && c._id !== courseId);
            setSelectedCreatorCourse(others);
        }
    }, [creatorData, courseData, courseId]);

    const handleReview = async () => {
        if (rating === 0) return toast.warning("Please select a rating.");
        try {
            await axios.post(`${serverUrl}/api/review/givereview`, { rating, comment, courseId }, { withCredentials: true });
            toast.success("Review Added");
            setRating(0);
            setComment("");
            // Refresh to show new review
            const result = await axios.get(`${serverUrl}/api/course/getcourse/${courseId}`, { withCredentials: true });
            dispatch(setSelectedCourseData(result.data));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add review");
        }
    };

    const handleEnroll = async (courseId, userId) => {
        if (!userData) return toast.error("Please login to enroll.");
        try {
            const { data } = await axios.post(`${serverUrl}/api/payment/create-order`, { courseId, userId }, { withCredentials: true });
            
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: "INR",
                name: "Virtual Courses",
                order_id: data.id,
                handler: async function (response) {
                    try {
                        await axios.post(`${serverUrl}/api/payment/verify-payment`, { ...response, courseId, userId }, { withCredentials: true });
                        setIsEnrolled(true);
                        // Refresh user data in context/redux
                        const userRes = await axios.get(`${serverUrl}/api/user/currentuser`, { withCredentials: true });
                        dispatch(setUserData(userRes.data));
                        toast.success("Enrolled successfully!");
                    } catch (e) { toast.error("Payment verification failed."); }
                }
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) { toast.error("Payment setup failed."); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl">Loading Course...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-10">
            <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-10">
                
                {/* Top Section: Breadcrumbs and Hero */}
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/2">
                        <button onClick={() => navigate("/")} className="mb-4 flex items-center gap-2 text-black hover:text-gray-600 transition-all">
                            <FaArrowLeftLong /> Back to Browse
                        </button>
                        <img 
                            src={selectedCourseData?.thumbnail || img} 
                            alt="Course" 
                            className="rounded-2xl w-full h-72 object-cover shadow-sm border" 
                        />
                    </div>

                    <div className="flex-1 space-y-4 pt-4">
                        <h1 className="text-3xl font-extrabold text-gray-900">{selectedCourseData?.title}</h1>
                        <p className="text-gray-600 text-lg leading-relaxed">{selectedCourseData?.subTitle}</p>
                        
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-yellow-500 font-bold text-xl">
                                <FaStar /> {avgRating}
                                <span className="text-gray-400 text-sm font-normal">({selectedCourseData?.reviews?.length || 0} reviews)</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold text-black">₹{selectedCourseData?.price}</span>
                                <span className="line-through text-gray-400">₹599</span>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm font-medium text-gray-700">
                            <p>✅ 10+ hours of video content</p>
                            <p>✅ Lifetime access to course materials</p>
                        </div>

                        {!isEnrolled ? (
                            <button 
                                className="w-full md:w-max bg-black text-white px-10 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                                onClick={() => handleEnroll(courseId, userData?._id)}
                            >
                                Enroll Now
                            </button>
                        ) : (
                            <button 
                                className="w-full md:w-max bg-green-600 text-white px-10 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                onClick={() => navigate(`/viewlecture/${courseId}`)}
                            >
                                Watch Now
                            </button>
                        )}
                    </div>
                </div>

                {/* Course Curriculum & Video Preview */}
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-2/5 space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800">Course Curriculum</h2>
                        <div className="max-h-96 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {selectedCourseData?.lectures?.map((lecture, index) => (
                                <button
                                    key={index}
                                    disabled={!lecture.isPreviewFree}
                                    onClick={() => setSelectedLecture(lecture)}
                                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                                        lecture.isPreviewFree ? "border-gray-300 hover:bg-gray-50 cursor-pointer" : "opacity-50 cursor-not-allowed bg-gray-100 border-transparent"
                                    } ${selectedLecture?.lectureTitle === lecture.lectureTitle ? "ring-2 ring-black bg-gray-50" : ""}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {lecture.isPreviewFree ? <FaPlayCircle className="text-blue-600" /> : <FaLock className="text-gray-400" />}
                                        <span className="font-medium text-left">{lecture.lectureTitle}</span>
                                    </div>
                                    {lecture.isPreviewFree && <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded">Preview</span>}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-3/5 bg-gray-100 rounded-3xl p-4 md:p-6 flex flex-col justify-center border shadow-inner">
                        {selectedLecture?.videoUrl ? (
                            <div className="space-y-4">
                                <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                                    <video key={selectedLecture.videoUrl} src={selectedLecture.videoUrl} controls className="w-full h-full" />
                                </div>
                                <h3 className="text-xl font-bold">{selectedLecture.lectureTitle}</h3>
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <FaPlayCircle className="mx-auto text-5xl text-gray-300 mb-4" />
                                <p className="text-gray-500">Select a free preview lecture to start watching</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Review Section */}
                <div className="border-t pt-10">
                    <h2 className="text-2xl font-bold mb-6">Course Reviews</h2>
                    <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed mb-10">
                        <p className="font-semibold mb-3">Rate your experience</p>
                        <div className="flex gap-2 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar 
                                    key={star} 
                                    onClick={() => setRating(star)} 
                                    className={`text-2xl cursor-pointer transition-colors ${star <= rating ? "text-yellow-400" : "text-gray-300"}`} 
                                />
                            ))}
                        </div>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Leave a comment..."
                            className="w-full border-2 p-4 rounded-xl outline-none focus:border-black transition-colors"
                            rows="4"
                        />
                        <button onClick={handleReview} className="mt-4 bg-black text-white px-8 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                            Submit Review
                        </button>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentReviews.map((review, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex text-yellow-400 mb-3">
                                        {Array.from({ length: 5 }).map((_, i) => <FaStar key={i} className={i < review.rating ? "fill-current" : "text-gray-200"} />)}
                                    </div>
                                    <p className="text-gray-700 italic text-sm mb-4">"{review.comment}"</p>
                                </div>
                                <div className="flex items-center gap-3 pt-4 border-t">
                                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                        {review.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-sm truncate">{review.user?.name}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{review.user?.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {totalReviewPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button disabled={currentReviewPage === 0} onClick={() => setCurrentReviewPage(p => p - 1)} className="p-2 border rounded-full disabled:opacity-30">
                                <FaArrowLeftLong />
                            </button>
                            <span className="text-sm font-bold">Page {currentReviewPage + 1} of {totalReviewPages}</span>
                            <button disabled={!hasMoreReviews} onClick={() => setCurrentReviewPage(p => p + 1)} className="p-2 border rounded-full rotate-180 disabled:opacity-30">
                                <FaArrowLeftLong />
                            </button>
                        </div>
                    )}
                </div>

                {/* Instructor Profile */}
                <div className="bg-black text-white p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8 shadow-xl">
                    <img src={creatorData?.photoUrl || img} alt="Instructor" className="w-24 h-24 rounded-full border-4 border-white/20 object-cover shadow-2xl" />
                    <div className="text-center md:text-left space-y-1">
                        <h3 className="text-2xl font-bold">{creatorData?.name || "Instructor Name"}</h3>
                        <p className="text-gray-400 text-sm max-w-xl">{creatorData?.description || "Expert Educator"}</p>
                        <p className="text-gray-500 text-xs">{creatorData?.email}</p>
                    </div>
                </div>

                {/* Other Published Courses */}
                {selectedCreatorCourse.length > 0 && (
                    <div className="pt-10">
                        <h2 className="text-2xl font-bold mb-6">More courses by this Instructor</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {selectedCreatorCourse.map((item, index) => (
                                <Card key={index} thumbnail={item.thumbnail} title={item.title} id={item._id} price={item.price} category={item.category} reviews={item.reviews} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewCourse;