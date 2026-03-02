import axios from "axios";

const API = "http://localhost:5000/api/interview";

export const startInterview = async () => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API}/start`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const saveAnswer = async (data) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    `${API}/answer`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};