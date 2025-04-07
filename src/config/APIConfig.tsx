import axios from "axios";

const BaseURL = import.meta.env.VITE_LIVE_AI_API;

export const endPoints = {
  SearchImage: `/search`,
};

export const API = axios.create({
  baseURL: BaseURL,
});
