import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const response = {
  async getResponse(endpoint) {
    const res = await axios.get(`${BASE_URL}/${endpoint}`);
    return res.data;
  },
};

export default response;
