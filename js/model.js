import { API_URL, throwErr, showInfo } from "./helpers.js";

class Model {
  #bookmarks = [];
  startNum = 0;
  endNum = 20;

  // Utility function for handling API calls
  async _fetchData(url) {
    try {
      const res = await API_URL(url);
      const data = await res.json();
      return data;
    } catch (err) {
      throwErr(err);
    }
  }

  // !Initial call from API (Kind of like a template to reuse)
  async loadRecipes() {
    try {
      const data = await this._fetchData("search.php?s=");

      data.meals && showInfo("Loaded recipes!");

      data.meals && showInfo("Loaded recipes!");

      if (this.endNum >= data.meals.length) showInfo("Reached The End!");

      return data.meals.slice(this.startNum, this.endNum);
    } catch (err) {
      throwErr(err.message);
    }
  }

  // Clicking on recipe and fetching data functionality
  async clickRecipe(id) {
    try {
      const data = await this._fetchData(`lookup.php?i=${id ? id : ""}`);
      return data.meals && data.meals[0];
    } catch (err) {
      throwErr(err);
    }
  }

  // Searching functionality
  async searchForRecipe(input) {
    try {
      const data = await this._fetchData(`search.php?s=${input}`);
      if (!data.meals) showInfo("No meals found!");
      return data;
    } catch (err) {
      throwErr(err);
    }
  }

  // Utility function for bookmarking
  _bookmarkMeal(meal) {
    const checkForId = this.#bookmarks.some(
      (bookmark) => meal.idMeal === bookmark.id
    );

    if (!checkForId) {
      this.#bookmarks.push({
        name: meal.strMeal,
        image: meal.strMealThumb,
        area: meal.strArea,
        id: meal.idMeal,
      });
    }

    this._saveToLocalStorage();
    return checkForId;
  }

  // Bookmarking functionality
  async bookmarkRecipe(id) {
    try {
      const data = await this._fetchData(`lookup.php?i=${id}`);
      if (!data.meals) {
        throw new Error("Something went unsuccessfully, please try again!");
      }

      const meal = data.meals[0];
      const checkForId = this._bookmarkMeal(meal);

      return [data, checkForId];
    } catch (err) {
      throwErr(err);
    }
  }

  // Saves all bookmarks to local storage
  _saveToLocalStorage() {
    localStorage.setItem("bookmarks", JSON.stringify(this.#bookmarks));
  }

  // checks for existing bookmarks on start
  checkExistingBookmarks() {
    const data = localStorage.getItem("bookmarks")
      ? JSON.parse(localStorage.getItem("bookmarks"))
      : "";

    if (!data) return;

    data.forEach((meal) => {
      this.#bookmarks.push({
        name: meal.name,
        image: meal.image,
        area: meal.area,
        id: meal.id,
      });
    });

    return data;
  }
}

export default new Model();
