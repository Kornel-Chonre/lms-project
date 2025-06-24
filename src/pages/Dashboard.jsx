import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { token, user } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const res = await fetch("https://lms-backend-xpwc.onrender.com/api/enrollments/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load enrolled courses");

        const data = await res.json();
        setEnrolledCourses(data);
      } catch (err) {
        console.error(err.message);
      }
    };

    if (token) fetchEnrolledCourses();
  }, [token]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-6">Welcome back, <span className="font-semibold">{user?.full_name || user?.email}</span>!</p>

      <h2 className="text-xl font-semibold mb-2">Your Enrolled Courses</h2>
      {enrolledCourses.length === 0 ? (
        <p>You haven't enrolled in any courses yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enrolledCourses.map((course) => (
            <div key={course.id} className="border p-4 rounded shadow">
              <h3 className="font-bold text-lg">{course.title}</h3>
              <p className="text-sm text-gray-600">{course.description?.slice(0, 80)}...</p>
              <Link
                to={`/courses/${course.id}`}
                className="inline-block mt-2 text-blue-700 hover:underline"
              >
                View Course
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
