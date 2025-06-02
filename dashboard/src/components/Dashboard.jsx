import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";
import { FiCalendar, FiUser, FiUsers, FiClock } from "react-icons/fi";
import { FaStethoscope, FaUserMd } from "react-icons/fa";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    registeredDoctors: 0,
    pendingAppointments: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axios.get(
          "http://localhost:5000/api/v1/appointment/getall",
          { withCredentials: true }
        );
        setAppointments(data.appointments);
        
        // Calculate statistics
        setStats({
          totalAppointments: data.appointments.length,
          registeredDoctors: new Set(data.appointments.map(a => a.doctor._id)).size,
          pendingAppointments: data.appointments.filter(a => a.status === "Pending").length
        });
      } catch (error) {
        setAppointments([]);
        toast.error("Failed to fetch appointments");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/v1/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true }
      );
      setAppointments(prev =>
        prev.map(appointment =>
          appointment._id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const { isAuthenticated, admin } = useContext(Context);
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <section className="dashboard-page">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 mb-8 text-white shadow-lg">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center">
              <img 
                src="/doc.png" 
                alt="Doctor" 
                className="h-40 w-40 object-contain rounded-full border-4 border-white"
              />
            </div>
            <div className="md:w-2/3 md:pl-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome back,{" "}
                <span className="text-yellow-300">
                  {admin && `${admin.firstName} ${admin.lastName}`}
                </span>
              </h1>
              <p className="text-blue-100 mb-4">
                Here's what's happening with your clinic today.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="stat-card bg-white bg-opacity-20 backdrop-blur-sm">
                  <FiUsers className="text-2xl" />
                  <div>
                    <p className="text-sm">Total Appointments</p>
                    <h3 className="text-xl font-bold">{stats.totalAppointments}</h3>
                  </div>
                </div>
                <div className="stat-card bg-white bg-opacity-20 backdrop-blur-sm">
                  <FaUserMd className="text-2xl" />
                  <div>
                    <p className="text-sm">Registered Doctors</p>
                    <h3 className="text-xl font-bold">{stats.registeredDoctors}</h3>
                  </div>
                </div>
                <div className="stat-card bg-white bg-opacity-20 backdrop-blur-sm">
                  <FiClock className="text-2xl" />
                  <div>
                    <p className="text-sm">Pending</p>
                    <h3 className="text-xl font-bold">{stats.pendingAppointments}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center">
              <FiCalendar className="mr-2" />
              Recent Appointments
            </h2>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading appointments...</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visited
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FiUser className="text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {`${appointment.firstName} ${appointment.lastName}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(appointment.appointment_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FaStethoscope className="text-green-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {`${appointment.doctor.firstName} ${appointment.doctor.lastName}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.doctor.specialization}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {appointment.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          className={`px-2 py-1 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            appointment.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800 focus:ring-yellow-500"
                              : appointment.status === "Accepted"
                              ? "bg-green-100 text-green-800 focus:ring-green-500"
                              : "bg-red-100 text-red-800 focus:ring-red-500"
                          }`}
                          value={appointment.status}
                          onChange={(e) =>
                            handleUpdateStatus(appointment._id, e.target.value)
                          }
                        >
                          <option value="Pending" className="text-yellow-800">
                            Pending
                          </option>
                          <option value="Accepted" className="text-green-800">
                            Accepted
                          </option>
                          <option value="Rejected" className="text-red-800">
                            Rejected
                          </option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.hasVisited ? (
                          <GoCheckCircleFill className="text-green-500 text-xl" />
                        ) : (
                          <AiFillCloseCircle className="text-red-500 text-xl" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="bg-gray-100 rounded-full p-4 inline-block">
                <FiCalendar className="text-gray-400 text-3xl mx-auto" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No appointments found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                There are currently no appointments scheduled.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
