import Attendance from "../../pages/Attendance";
import ApiConfig from "../ApiConfig";
const StudentService = {
    getStudentById: async (id) => {
      try {
        const response = await ApiConfig.get(`/student/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    patchMatkAttendance: async (id, payload) => {
      console.log(payload)
      try {
        const response = await ApiConfig.patch(`/student/mark/attendance/${id}`, payload);
        return response.data;
      } catch (error) {
        throw error;
      }
    },
  };
  
  export default StudentService;