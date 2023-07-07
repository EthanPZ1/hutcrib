import { API_URL, throwErr, showInfo } from "./helpers.js";
import "core-js/stable";

class Model {
  #bookmarks = [];
  startNum = 0;
  endNum = 20;

  // Initial call from API (Kind of like a template to reuse)
  async loadRecipes() {
    try {
      const res = await API_URL("search.php?s=");
      const data = await res.json();

      if (this.endNum >= data.meals.length) showInfo("Reached The End!");

      return data.meals.slice(this.startNum, this.endNum);
      // return data.meals;
    } catch (err) {
      throwErr(err.message);
    }
  }

  // Clicking on recipe and fetching data functionality
  async clickRecipe(id) {
    try {
      const res = await API_URL(`lookup.php?i=${id ? id : ""}`);
      const data = await res.json();

      return data.meals && data.meals[0];
    } catch (err) {
      throwErr(err);
    }
  }

  // Searching functionality
  async searchForRecipe(input) {
    try {
      const res = await API_URL(`search.php?s=${input}`);
      const data = await res.json();

      // If meals return a falsy value
      if (!data.meals) showInfo("No meals found!");

      return data;
    } catch (err) {
      throwErr(err);
    }
  }

  // Bookmarking functionality
  async bookmarkRecipe(id) {
    try {
      const res = await API_URL(`lookup.php?i=${id}`);
      const data = await res.json();

      if (!data.meals)
        throw new Error("Something went unsuccessfully, please try again!");

      let checkForId;

      data.meals.forEach((meal) => {
        checkForId = this.#bookmarks.some(
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
      });

      this._saveToLocalStorage();
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
