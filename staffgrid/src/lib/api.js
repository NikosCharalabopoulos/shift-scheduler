import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true // στέλνει/λαμβάνει το HttpOnly cookie sg_token
});

// helper for errors 
export function getErrorMessage(err) {
  return err?.response?.data?.message || err.message || "Request failed";
}
