import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { token } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch("https://lms-backend-xpwc.onrender.com/api/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setUserInfo(data);
        setFormData({ full_name: data.full_name || "", email: data.email || "" });
      } catch (err) {
        console.error(err.message);
      }
    };

    const fetchEnrollments = async () => {
      try {
        const res = await fetch("https://lms-backend-xpwc.onrender.com/api/enrollments/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch enrolled courses");
        const data = await res.json();
        setEnrolledCourses(data);
      } catch (err) {
        console.error(err.message);
      }
    };

    setLoading(true);
    Promise.all([fetchProfile(), fetchEnrollments()]).finally(() => setLoading(false));
  }, [token]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      const res = await fetch("https://lms-backend-xpwc.onrender.com/api/profile/", {
        method: "PUT", // or PATCH depending on your API
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const data = await res.json();
      setUserInfo(data);
      setEditMode(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Error updating profile.");
      console.error(err.message);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
      {message && (
        <div className="mb-4 p-2 bg-green-200 text-green-800 rounded">{message}</div>
      )}
      <div className="mb-6 border p-4 rounded shadow bg-white">
        {editMode ? (
          <>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Full Name</label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block font-semibold mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                disabled
              />
            </div>
            <button
              onClick={handleSave}
              className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 mr-2"
            >
              Save
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <p>
              <strong>Full Name:</strong> {userInfo?.full_name || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {userInfo?.email || "N/A"}
            </p>
            <button
              onClick={() => setEditMode(true)}
              className="mt-4 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-3">Enrolled Courses</h2>
      {enrolledCourses.length === 0 ? (
        <p>You have not enrolled in any courses yet.</p>
      ) : (
        <ul className="space-y-3">
          {enrolledCourses.map((course) => (
            <li key={course.id} className="border p-3 rounded shadow bg-white">
              <p className="font-semibold">{course.title}</p>
              <p className="text-sm text-gray-600">{course.description?.slice(0, 100)}...</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Profile;
