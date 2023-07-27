import Model from "./model.js";
import * as control from "./controller.js";

class InterfaceControl {
  #recipeContainer = document.querySelector(".recipe__container");
  #recipePage = document.querySelector(".wrap__recipe-page");
  id;
  #isImgOpen = false;
  #hideMsg;
  #allTimeouts = [this.#hideMsg]; // TODO -> will use later

  constructor() {
    this._expandImg();
  }

  // !General functions

  clearHTML(el) {
    el.innerHTML = "";
    return this;
  }

  makeHidden(el) {
    document.querySelector(el).style.display = "none";
    return this;
  }

  removeEl(el) {
    document.querySelector(el).remove();
    return this;
  }

  checkIfHidden(el) {
    return el.style.display === "none" || el.style.visibility === "hidden";
  }

  hideMainPage() {
    this.#recipeContainer.style.display = "none";
    return this;
  }

  changeTitle(title) {
    document.head.children[2].innerHTML = title;
  }

  _clearAllTimeouts(timeouts) {
    timeouts.forEach((t) => clearTimeout(t));
  }

  showErrorMsg(errMsg) {
    const errorMsgEl = document.querySelector(".error__msg");
    errorMsgEl.children[1].innerHTML = errMsg;
    errorMsgEl.show();
  }

  // Check if main page is visible and acts accordingly
  checkMainPageVisibility(el, display1, display2) {
    !this.checkIfHidden(document.querySelector(".recipe__container"))
      ? (document.querySelector(el).style.display = display1)
      : (document.querySelector(el).style.display = display2);

    return this;
  }

  showInfoMsg(infoMsg) {
    const infoMsgEl = document.querySelector(".info_msg");
    infoMsgEl.firstElementChild.textContent = infoMsg;
    infoMsgEl.style.transform = "translateY(0)";

    this.#hideMsg = setTimeout(
      () => (infoMsgEl.style.transform = "translateY(100px)"),
      3000
    );
  }

  showSpinner() {
    document.querySelector(".loading").removeAttribute("hidden");
    return this;
  }

  hideSpinner() {
    document.querySelector(".loading").setAttribute("hidden", "true");
    return this;
  }

  //////////////////////////////////////////////////////////////// END

  // !rendering something to the page <- related functions ////

  #markup(img, title, desc, id) {
    return `
        <div class="recipe" data-id="${id}">
          <img src="${img}" alt="${title}" />
          <div>
            <h3>${title}</h3>
            <p>
              ${desc} Meal
            </p>
          </div>
        </div>
      `;
  }

  render(img, title, desc, id) {
    document
      .querySelector(".recipes__wrapper")
      .insertAdjacentHTML("beforeend", this.#markup(img, title, desc, id));

    return this;
  }

  renderMeals(meals) {
    meals?.forEach((meal) => {
      this.render(meal.strMealThumb, meal.strMeal, meal.strArea, meal.idMeal);
    });
  }

  insertIng(ing) {
    const ingredientUl = document.querySelector(".ingredients");
    ingredientUl.insertAdjacentHTML(
      "beforeend",
      `<li><span>${ing}</span></li>`
    );
  }

  renderEntireRecipe(data) {
    if (data) {
      this.openRecipePage(
        data?.strMealThumb,
        data?.strMeal,
        data?.strInstructions
      );

      // Looping over the recipe keys and values and uses it to render out all the data
      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith("strIngredient")) {
          value && this.insertIng(value);
        }
      }

      document.title = `HutCrib: ${data?.strMeal}`;
      document.querySelector(
        "#description__meta"
      ).content = `Let's make some delicious ${data?.strMeal} today!`;
    }
  }

  // ?Bookmarks <- related functions //////////////////

  // Showing all bookmarks functionality
  showBookmarks() {
    location.hash = "#bookmarks";

    this.hideMainPage().makeHidden(".wrap__recipe-page");
    document.querySelector(".all__bookmarks").style.display = "block";

    return this;
  }

  renderBookmark(img, title, desc, id) {
    const markup = `
      <div class="bookmark recipe" data-id="${id}">
        <img src="${img}" />
        <div>
          <h3>${title}</h3>
          <p>
            ${desc}
          </p>
        </div>
      </div>
    `;

    document
      .querySelector(".bookmark__list")
      .insertAdjacentHTML("afterbegin", markup);
  }

  /////////////////////////////////////////////////////////// END

  // !Recipe page <- related functions /////////////////////////////

  closeRecipePage() {
    this.#recipePage.style.display = "none";
    return this;
  }

  openRecipePage(img, title, instruction) {
    const ingredientUl = document.querySelector(".ingredients");
    this.clearHTML(ingredientUl);

    const recipeImg = document.querySelector(".recipe__img");
    const recipeTitle = document.querySelector(".recipe__title");
    const recipeInsTxt = document.querySelector(".recipe__instructions-text");

    recipeImg.style.backgroundImage = `url('${img}')`;
    recipeTitle.textContent = title;
    recipeInsTxt.textContent = instruction;

    this.hideMainPage().makeHidden(".all__bookmarks");
    this.#recipePage.style.display = "flex";

    control.bookmarkPageHandler();
    scrollTo(0, 0);

    document.head.children[2].innerHTML = `HutCrib: ${title}`;
  }

  _expandImg() {
    const expandedImg = document.querySelector(".expanded__img");
    const correctThis = this;

    this.#recipePage.addEventListener("click", function (e) {
      const clickedEl = e.target;

      if (!clickedEl.classList.contains("recipe__img")) return;

      expandedImg.firstElementChild.src = getComputedStyle(clickedEl)
        .getPropertyValue("background-image")
        .slice(5)
        .slice(0, -2);

      correctThis.#isImgOpen = !correctThis.#isImgOpen;

      !correctThis.#isImgOpen
        ? (expandedImg.style.scale = 0)
        : (expandedImg.style.scale = 1);
    });
  }

  /////////////////////////////////////////////////////////////////// END

  // !searching <- related functions

  takeSearchInput() {
    const correctThis = this;
    const searchInput = document.querySelector("#input_recipe");

    const markup =
      '<p style="color: darkgray; text-align: center;">Nothing here...</p>';

    searchInput.addEventListener("input", async function () {
      const data = await Model.searchForRecipe(this.value);

      correctThis
        .clearHTML(document.querySelector(".recipes__wrapper"))
        .makeHidden(".load__more");

      // Checking if data is valid
      data.meals
        ? correctThis.renderMeals(data.meals)
        : document
            .querySelector(".recipes__wrapper")
            .insertAdjacentHTML("afterbegin", markup);
    });
  }

  ///////////////////////////////////////////////////////////////// END
}

export default new InterfaceControl();
