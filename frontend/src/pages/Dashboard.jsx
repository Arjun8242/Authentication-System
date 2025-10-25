import React, { useState, useEffect } from "react";
import { AppData } from "../context/AppContext";
import { toast } from "react-toastify";
import api from "../apiInterceptor.js";

const Dashboard = () => {
  const { user, logoutUser } = AppData();
  const [content, setContent] = useState("");
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  async function fetchAdminData() {
    try {
      const { data } = await api.get(`/api/v1/admin`, {
        withCredentials: true,
      });
      setContent(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch admin data");
    }
  }

  async function fetchSessions() {
    setSessionsLoading(true);
    try {
      const { data } = await api.get(`/api/auth/v1/user/sessions`);
      setSessions(data.sessions || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch sessions");
    } finally {
      setSessionsLoading(false);
    }
  }

  async function handleLogoutSession(sessionIndex) {
    try {
      const { data } = await api.delete(`/api/auth/v1/user/session/${sessionIndex}`);
      toast.success(data.message);

      // If this was the current session, redirect to login
      if (data.wasCurrentSession) {
        logoutUser(navigate);
      } else {
        // Refresh sessions list
        await fetchSessions();
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to logout session");
    }
  }

  useEffect(() => {
    fetchAdminData();
    fetchSessions();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        {content && (
          <div className="mb-4 text-lg font-semibold text-green-600 text-center">
            {content}
          </div>
        )}

        <h1 className="text-3xl font-bold mb-6 text-center">Welcome, {user?.name}</h1>

        {/* Sessions Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Your Active Sessions</h2>
          {sessionsLoading ? (
            <p className="text-gray-500">Loading sessions...</p>
          ) : sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><strong>Device:</strong> {session.device}</div>
                    <div><strong>Browser:</strong> {session.browser}</div>
                    <div><strong>OS:</strong> {session.os}</div>
                    <div><strong>IP:</strong> {session.ip}</div>
                    <div><strong>Location:</strong> {session.location}</div>
                    <div><strong>Logged At:</strong> {new Date(session.loggedAt).toLocaleString()}</div>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() => handleLogoutSession(index)}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
                    >
                      Logout This Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No active sessions found.</p>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={logoutUser}
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
