/// utils
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const mounted = (fn) => {
  window.addEventListener("DOMContentLoaded", () => {
    fn();
  });
};

// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
const r = (templateString, options = {}) => {
  const tempElement = document.createElement("template");
  tempElement.innerHTML = templateString.trim();

  if (Object.keys(options).some((k) => /^on([A-Z][\w]*)$/.exec(k))) {
    Object.keys(options).forEach((k) => {
      if (/^on([A-Z][\w]*)$/.exec(k)) {
        const eventName = k.replace(/^on([A-Z][\w]*)$/, "$1").toLowerCase();
        tempElement.content.firstChild.addEventListener(eventName, options[k]);
      }
    });
  }

  return tempElement.content.firstChild;
};

/// template
const template = `
<section>
  <ul>
    <li class="addable droppable" id="todo">
      <div class="draggable" id="draggable" draggable="true">
        드래그
      </div>
      <div class="draggable" id="draggable2" draggable="true">
        드랍
      </div>
    </li>
    <li class="addable droppable" id="doing"></li>
    <li class="addable droppable" id="done"></li>
  </ul>
</section>`;

$("#app").innerHTML = template;

// component logics
mounted(() => {
  const draggables = $$("[draggable=true]");

  draggables.forEach((dr) => {
    dr.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("draggable")) {
        e.dataTransfer.setData("text/plain", e.target.id);
        return;
      }
    });
  });

  $$("li.addable").forEach((li) => {
    let isAdding = false;

    const addButton = r(`<i>+</i>`, {
      onClick: () => {
        if (isAdding) return;

        const input = r(`<input class="cell-input" type="text">`);

        // https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib
        addButton.parentNode.insertBefore(input, addButton.nextSibling);
        input.focus()
        isAdding = true
      },
    });
    li.prepend(addButton);
  });

  $$("li.droppable").forEach((li) => {
    li.addEventListener("dragover", (e) => {
      e.preventDefault(); // 왜 이걸 해줘야하는거지
      e.dataTransfer.dropEffect = "move";
    });
    li.addEventListener("drop", (e) => {
      const data = e.dataTransfer.getData("text/plain");
      e.target.appendChild($(`#${data}`));
    });
  });
});

/// styles

const style = `section > ul {
  display: grid;
  align-items: center;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 1rem;
  height: 100vh;
  padding: 0 2rem;
}

section > ul li {
  height: 90vh;
  padding: 0 1rem;
  border: 10px solid rgb(40, 40, 40);
  border-radius: 10px;
  background-color: rgb(167, 173, 199);
  list-style: none;
}

input.cell-input,
li > div {
  border: 8px solid rgb(40, 40, 40);
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  padding: 0.5rem;
}

input.cell-input {
  width: 100%;
  line-height: 1.6;
}


li > input.cell-input,
li > div:not(:last-child) {
  margin-bottom: 1rem;
}

li i {
  display: flex;
  justify-content: flex-end;
  margin: 0.5rem 0;
  font-size: 2rem;
  font-weight: bold;
  font-style: normal;
  line-height: 1;
  cursor: pointer;
}
`;

const styletag = document.createElement('style')
styletag.innerHTML = style
$('head').appendChild(styletag)