import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api"
});

instance.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = token;
  return req;
});

export default instance;
