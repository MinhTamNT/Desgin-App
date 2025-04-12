import axios from "axios";

const BaseURL = import.meta.env.VITE_LIVE_AI_API;

export const endPoints = {
  SearchImage: `/search`,
  Tags: `/tags`,
};

export const API = axios.create({
  baseURL: BaseURL,
});
