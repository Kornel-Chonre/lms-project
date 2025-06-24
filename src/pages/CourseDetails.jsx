import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CourseDetails = () => {
  const { id } = useParams();
  const { token } = useAuth();

  const [course, setCourse] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch course details
  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://lms-backend-xpwc.onrender.com/api/courses/${id}/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch course");
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, token]);

  // Check if user is enrolled
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!token) return;
      try {
        const res = await fetch("https://lms-backend-xpwc.onrender.com/api/enrollments/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to check enrollment");
        const enrolledCourses = await res.json();
        setIsEnrolled(enrolledCourses.some((c) => c.id === parseInt(id)));
      } catch {
        setIsEnrolled(false);
      }
    };

    checkEnrollment();
  }, [id, token]);

  // Fetch completed lessons
  useEffect(() => {
    const fetchCompletedLessons = async () => {
      if (!token) return;
      try {
        const res = await fetch(
          `https://lms-backend-xpwc.onrender.com/api/courses/${id}/completed-lessons/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) return;
        const completed = await res.json();
        setCompletedLessons(new Set(completed));
      } catch {
        setCompletedLessons(new Set());
      }
    };

    if (isEnrolled) {
      fetchCompletedLessons();
    }
  }, [id, token, isEnrolled]);

  const handleEnroll = async () => {
    if (!token) return alert("Please login to enroll.");
    setEnrollLoading(true);
    try {
      const res = await fetch("https://lms-backend-xpwc.onrender.com/api/enroll/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ course_id: parseInt(id) }),
      });

      if (!res.ok) throw new Error("Enrollment failed");
      setIsEnrolled(true);
      alert("Enrolled successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setEnrollLoading(false);
    }
  };

  const toggleLesson = async (lessonId) => {
    if (!token) return alert("Login required");

    const completed = completedLessons.has(lessonId);
    const method = completed ? "DELETE" : "POST";

    try {
      const res = await fetch(
        `https://lms-backend-xpwc.onrender.com/api/lessons/${lessonId}/complete/`,
        {
          method,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Could not update lesson status");

      setCompletedLessons((prev) => {
        const updated = new Set(prev);
        completed ? updated.delete(lessonId) : updated.add(lessonId);
        return updated;
      });
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!course) return <p>No course data.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
      <p className="mb-4 text-gray-700">{course.description}</p>
      <p className="mb-6 text-gray-600">
        <strong>Instructor:</strong> {course.instructor || "N/A"}
      </p>

      {/* Enroll Button */}
      {!isEnrolled ? (
        <button
          onClick={handleEnroll}
          disabled={enrollLoading}
          className="mb-6 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          {enrollLoading ? "Enrolling..." : "Enroll in this course"}
        </button>
      ) : (
        <p className="mb-6 text-green-700 font-semibold">You are enrolled in this course.</p>
      )}

      {/* Modules */}
      <h2 className="text-2xl font-semibold mb-2">Lessons / Modules</h2>
      {course.modules && course.modules.length > 0 ? (
        <ul className="space-y-3">
          {course.modules.map((lesson) => (
            <li
              key={lesson.id}
              className="flex items-center justify-between p-3 border rounded"
            >
              <span>{lesson.title}</span>
              {isEnrolled && (
                <button
                  onClick={() => toggleLesson(lesson.id)}
                  className={`px-3 py-1 rounded text-white ${
                    completedLessons.has(lesson.id)
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {completedLessons.has(lesson.id) ? "Completed" : "Mark Complete"}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No lessons available.</p>
      )}
    </div>
  );
};

export default CourseDetails;
