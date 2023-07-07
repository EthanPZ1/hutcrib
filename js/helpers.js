import { API_KEY } from "./config.js";
import Interface from "./view.js";

export const API_URL = async (url) => {
  Interface.showSpinner(document.querySelector(".recipe__container"));
  const api = await fetch(
    `https://themealdb.com/api/json/v2/${API_KEY}/${url}`
  );
  Interface.hideSpinner();

  if (!api.ok) throw new Error("Something went wrong.. Please try again.");

  return api;
};

export const throwErr = (err) => Interface.showErrorMsg(err);
export const showInfo = (info) => Interface.showInfoMsg(info);
