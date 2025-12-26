import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App.jsx";
import { useDispatch } from "react-redux";
import { setCourseData } from "../redux/courseSlice.js";

const useGetCourseData = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const getAllPublishedCourse = async () => {
      try {
        const result = await axios.get(
          serverUrl + "/api/course/getpublishedcourses",
          { withCredentials: true }
        );
        dispatch(setCourseData(result.data));
      } catch (error) {
        console.log(error);
      }
    };

    getAllPublishedCourse();
  }, [dispatch]);
};

export default useGetCourseData;
