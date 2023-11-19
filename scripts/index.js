"use strict";

let habbits = [];
const HABBIT_KEY = "HABBIT_KEY";
let globalActiveHabbitId;

/*page */

const page = {
  menu: document.querySelector(".menu__list"),
  header: {
    h1: document.querySelector(".h1"),
    progressPersent: document.querySelector(".progress__percent"),
    progressCoverBar: document.querySelector(".progress__cover-bar"),
  },
  hab: document.getElementById("days"),
  nextDay: document.querySelector(".habbit__day"),
  popup: {
    cover: document.querySelector(".cover"),
    iconField: document.querySelector('.popup__form input[name="icon"]'),
  },
};

/* utils */

function loadData() {
  const habbitString = localStorage.getItem(HABBIT_KEY);
  const habbitArray = JSON.parse(habbitString);
  if (Array.isArray(habbitArray)) {
    habbits = habbitArray;
  }
}

function togglePopup() {
  if (page.popup.cover.classList.contains("cover__hidden")) {
    page.popup.cover.classList.remove("cover__hidden");
  } else {
    page.popup.cover.classList.add("cover__hidden");
  }
}

function saveData() {
  localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function reserForm(form, fields) {
  for (const field of fields) {
    form[field].value = "";
  }
}

function validateAndGetFormData(form, fields) {
  const formData = new FormData(form);
  let res = {};
  let isValid = true;
  for (const field of fields) {
    const fieldValue = formData.get(field);
    form[field].classList.remove("error");
    if (!fieldValue) {
      form[field].classList.add("error");
    }
    res[field] = fieldValue;
  }
  for (const field of fields) {
    if (!res[field]) {
      isValid = false;
    }
  }

  if (!isValid) {
    return;
  }

  return res;
}

/* render*/
function rerenderMenu(activeHabbit) {
  if (!activeHabbit) {
    return;
  }
  for (const habbit of habbits) {
    const existed = document.querySelector(`[menu-habbit-id = "${habbit.id}"]`);
    if (!existed) {
      //создание
      const element = document.createElement("button");
      element.setAttribute("menu-habbit-id", habbit.id);
      element.classList.add("menu__item");
      element.addEventListener("click", () => rerender(habbit.id));
      element.innerHTML = `<img src="/images/${habbit.icon}.svg" alt="${habbit.name}" />`;
      if (activeHabbit.id === habbit.id) {
        element.classList.add("menu__item_active");
      }
      page.menu.appendChild(element);
      continue;
    }
    if (activeHabbit.id === habbit.id) {
      existed.classList.add("menu__item_active");
    } else {
      existed.classList.remove("menu__item_active");
    }
  }
}

function rerenderHead(activeHabbit) {
  if (!activeHabbit) {
    return;
  }
  page.header.h1.innerText = activeHabbit.name;
  const progress =
    activeHabbit.days.length / activeHabbit.target > 1
      ? 100
      : (activeHabbit.days.length / activeHabbit.target) * 100;
  page.header.progressPersent.innerText = progress.toFixed(0) + "%";
  page.header.progressCoverBar.setAttribute("style", `width: ${progress}%`);
}

function rerenderComments(activeHabbit) {
  const days = activeHabbit.days;

  page.hab.innerHTML = "";

  for (let i = 0; i < days.length; i++) {
    const comment = document.createElement("div");
    comment.classList.add("habbit");
    comment.innerHTML = `
    <div class="habbit__day">День ${i + 1} </div>
    <div class="habbit__comment">${days[i].comment}</div>
      <button class="habbit__delete" value = ${i} onclick = "deleteDays(event)">
        <img src="./images/delete.svg" alt="" />
      </button>
    `;
    page.hab.appendChild(comment);
  }

  page.nextDay.innerHTML = `День ${days.length + 1}`;
}

function rerender(activeHabbitId) {
  globalActiveHabbitId = activeHabbitId;
  const activeHabbit = habbits.find((habbit) => habbit.id === activeHabbitId);
  if (!activeHabbit) {
    return;
  }
  rerenderMenu(activeHabbit);
  rerenderHead(activeHabbit);
  rerenderComments(activeHabbit);
}

/*work with days */

function addDays(event) {
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ["comment"]);
  if (!data) {
    return;
  }
  habbits = habbits.map((e) => {
    if (e.id === globalActiveHabbitId) {
      return {
        ...e,
        days: e.days.concat([{ comment: data.comment }]),
      };
    }
    return e;
  });
  reserForm(event.target, ["comment"]);
  rerender(globalActiveHabbitId);
  saveData();
}

function deleteDays(event) {
  habbits = habbits.map((e) => {
    if (e.id === globalActiveHabbitId) {
      return {
        ...e,
        days: e.days.filter((elem, index) => index != event.target.value),
      };
    }
    return e;
  });
  rerender(globalActiveHabbitId);
  saveData();
}

function setIcon(context, icon) {
  page.popup.iconField.value = icon;
  const activeIcon = document.querySelector(".icon.icon_active");
  activeIcon.classList.remove("icon_active");
  context.classList.add("icon_active");
}

function addHabbit(event) {
  const maxId = habbits.reduce((acc, habbit) => (acc > habbit.id ? acc : habbit.id), 0);
  event.preventDefault();
  const data = validateAndGetFormData(event.target, ["name", "icon", "target"]);
  if (!data) {
    return;
  }
  habbits.push({
    id: maxId + 1,
    name: data.name,
    target: data.target,
    icon: data.icon,
    days: [],
  });
  reserForm(event.target, ["name", "target"]);
  togglePopup();
  saveData();
  rerender(maxId + 1);
}

/*init*/
(() => {
  loadData();
  rerender(habbits[0].id);
})();
