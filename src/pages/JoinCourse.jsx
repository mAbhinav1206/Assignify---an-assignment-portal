import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoginNavbar from "../components/LoginNavbar";
import { apiRequest, saveSession } from "../api";
import "../css/Profile.css";
import "../css/dashboard.css";

const JoinCourse = () => {
  const navigate = useNavigate();
  const { courseName } = useParams();
  const decodedCourse = decodeURIComponent(courseName || "");
  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      setError("");
      setIsLoading(true);

      try {
        const data = await apiRequest(`/courses/${encodeURIComponent(decodedCourse)}/details`);
        setCourse(data.course);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCourse();
  }, [decodedCourse]);

  const handleJoinCourse = async () => {
    setError("");
    setIsJoining(true);

    try {
      const data = await apiRequest("/courses/join", {
        method: "POST",
        body: JSON.stringify({ course: decodedCourse }),
      });

      saveSession(data);
      setCourse((currentCourse) =>
        currentCourse ? { ...currentCourse, isEnrolled: true } : currentCourse
      );
      navigate("/dashboard");
    } catch (joinError) {
      setError(joinError.message);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="profileWrapper">
      <LoginNavbar />

      <div className="profilePage">
        <div className="profileCard courseJoinCard">
          <div className="courseJoinMedia">
            {course?.thumbnail ? <img src={course.thumbnail} alt="" /> : null}
          </div>

          <h2>Join Course</h2>
          <p className="subtitle">
            {isLoading
              ? "Loading course details..."
              : `You are about to join ${course?.name || decodedCourse}.`}
          </p>

          {course && (
            <div className="courseJoinDetails">
              <div className="teacherAssignmentMeta">
                <span>{course.assignmentCount} assignments</span>
                <span>{course.isEnrolled ? "Already enrolled" : "Open to join"}</span>
              </div>
              <p className="courseJoinDescription">{course.description}</p>
            </div>
          )}

          {error && <p className="formError">{error}</p>}

          <button
            className="saveBtn"
            type="button"
            onClick={handleJoinCourse}
            disabled={isJoining || isLoading || course?.isEnrolled}
          >
            {course?.isEnrolled ? "Enrolled" : isJoining ? "Joining..." : "Join Course"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCourse;
