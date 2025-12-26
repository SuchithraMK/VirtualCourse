import { useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setCreatorCourseData } from "../redux/courseSlice";
import { toast } from "react-toastify";

const useGetCreatorCourseData = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const getCreatorData = async () => {
      try {
        const result = await axios.get(
          serverUrl + "/api/course/getcreatorcourses",
          { withCredentials: true }
        );
        dispatch(setCreatorCourseData(result.data));
      } catch (error) {
        console.log(error);
        toast.error(
          error.response?.data?.message || "Failed to load creator courses"
        );
      }
    };

    if (userData) {
      getCreatorData();
    }
  }, [userData, dispatch]);
};

export default useGetCreatorCourseData;
