import Model from "./model.js";
import Interface from "./view.js";
import { throwErr, showInfo } from "./helpers.js";

// !On-Start functions //////

(function init() {
  // load and render data from API
  window.addEventListener("load", async () => {
    const data = await Model.loadRecipes();
    Interface.renderMeals(data);
  });

  getRecipeId(".recipe__container");
  getRecipeId(".bookmark__list");
  Interface.takeSearchInput();
  bookmarksBtnHandler();
})();

// Checks for existing bookmarks on start
(function renderExistingBookmarks() {
  const data = Model.checkExistingBookmarks();

  if (data)
    data.forEach((meal) => {
      Interface.renderBookmark(
        meal.image,
        meal.name,
        `${meal.area} Meal`,
        meal.id
      );
    });
})();

// Checks for existing hash on start
(async function checkForHash() {
  try {
    switch (location.hash) {
      case "#bookmarks":
        Interface.showBookmarks();
        break;

      default:
        const data = await Model.clickRecipe(location.hash.slice(1));
        Interface.renderEntireRecipe(data);

        Interface.checkMainPageVisibility(
          "#back-btn",
          "none",
          "block"
        ).checkMainPageVisibility("#input_recipe", "block", "none");
        break;
    }
  } catch (err) {
    throwErr(err);
  }
})();

// Load more recipes functionality
(function loadMoreRecipes() {
  document
    .querySelector(".load__more")
    .addEventListener("click", async function () {
      Model.startNum += 20;
      Model.endNum += 20;

      const data = await Model.loadRecipes();
      Interface.renderMeals(data);
    });
})();

// Going back functionality
export function goBack(el) {
  document.querySelector(el).addEventListener("click", function () {
    location.hash = "";

    Interface.makeHidden(".all__bookmarks").closeRecipePage();
    document.querySelector(".recipe__container").style.display = "grid";
    Interface.checkMainPageVisibility(
      el,
      "none",
      "block"
    ).checkMainPageVisibility("#input_recipe", "block", "none");
  });
}

goBack("#back-btn");

////////////////////////////////////////////////////////

// Getting recipe id whenever called
function getRecipeId(mainEl) {
  document.querySelector(mainEl).addEventListener("click", async (e) => {
    const el = e?.target.closest(".recipe");

    if (el) {
      Interface.id = el?.dataset?.id;

      const data = await Model.clickRecipe(Interface.id);
      Interface.renderEntireRecipe(data);

      Interface.checkMainPageVisibility(
        "#back-btn",
        "none",
        "block"
      ).checkMainPageVisibility("#input_recipe", "block", "none");
      location.hash = Interface.id;
    }
  });
}

// Go to bookmark page - handler
export function bookmarksBtnHandler() {
  document.querySelector(".bookmarks").addEventListener("click", function () {
    Interface.showBookmarks()
      .checkMainPageVisibility("#back-btn", "none", "block")
      .checkMainPageVisibility("#input_recipe", "block", "none");
  });
}

// Bookmarking functionality - handler
export function bookmarkPageHandler() {
  document
    .querySelector(".wrap__recipe-page")
    .addEventListener("click", async function (e) {
      try {
        const btn = e.target.closest(".bookmark__button");
        if (!btn) return;

        const data = await Model.bookmarkRecipe(location.hash.slice(1));

        if (data[1]) {
          showInfo("Recipe already exists!");
          return;
        }

        data[0].meals.forEach((meal) => {
          Interface.renderBookmark(
            meal.strMealThumb,
            meal.strMeal,
            `${meal.strArea} Meal`,
            meal.idMeal
          );
        });

        showInfo("Saved to bookmarks!");
      } catch (err) {
        console.error(err);
      }
    });
}
