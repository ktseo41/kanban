/// utils
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const init = (fn) => {
  window.addEventListener("DOMContentLoaded", () => {
    fn();
  });
};

// TODO: id 길이기 다른 것 개선 필요
const randomId = () =>
  Math.random()
    .toString(36)
    .substring(2)
    .split("")
    .filter((v) => !/[\d]/.exec(v))
    .join("");

const makeDefaultProxyHandler = (fn) => ({
  set: (target, key, value) => {
    target[key] = value;
    fn();
  },
});

// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
const r = (renderOptions) => {
  if (!renderOptions) return;

  const {
    template = "",
    events = {},
    attrs = {},
    styles = {},
    children = [],
  } = renderOptions;

  const tempElement = document.createElement("template");
  tempElement.innerHTML = template.trim();

  const currentElement = tempElement.content.firstChild;

  Object.keys(events).forEach((eventName) => {
    currentElement.addEventListener(eventName, events[eventName]);
  });

  Object.keys(attrs).forEach((attrName) => {
    currentElement.setAttribute(attrName, attrs[attrName]);
  });

  children.forEach((child) => {
    if (!child) return;

    const childElement = r(child);

    currentElement.appendChild(childElement);
  });

  return currentElement;
};

// component logics
const model = {
  columns: [
    {
      name: "todo",
      items: [
        {
          text: "아무거나",
        },
        {
          text: "아무거나2",
        },
        {
          text: "랜덤 id",
        },
      ],
    },
    {
      name: "doing",
    },
    {
      name: "done",
    },
  ],
};

function renderFromKanbanModel(model) {
  const { columns } = model;

  const fragment = new DocumentFragment();

  fragment.appendChild(
    r({
      template: `<section></section>`,
      children: [
        {
          template: "<ul></ul>",
          children: columns.map((column) => ({
            template: "<li></li>",
            attrs: {
              class: "droppable",
              id: column.name,
            },
            children: [
              {
                template: "<i>+</i>",
              },
              ...(column.items?.map((item) => ({
                template: "<div></div>",
                attrs: {
                  class: "draggable",
                  id: item.id || randomId(),
                  draggable: true,
                },
                children: [{ template: item.text }],
              })) || []),
            ],
          })),
        },
      ],
    })
  );

  $("#app").appendChild(fragment);
}

function bindDragEvents(dom) {
  const draggables = dom.querySelectorAll("[draggable=true]");
  draggables.forEach((dr) => {
    dr.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("draggable")) {
        e.dataTransfer.setData("text/plain", e.target.id);
        return;
      }
    });
  });

  const droppables = dom.querySelectorAll(".droppable");
  droppables.forEach((dr) => {
    dr.addEventListener("dragover", (e) => {
      e.preventDefault(); // 왜 이걸 해줘야하는거지
      e.dataTransfer.dropEffect = "move";
    });
    dr.addEventListener("drop", (e) => {
      const data = e.dataTransfer.getData("text/plain");
      e.target.appendChild($(`#${data}`));
    });
  });
}

init(() => {
  renderFromKanbanModel(model);
  bindDragEvents($("#app"));

  // $$("li.addable").forEach((li) => {
  //   let isAdding = false;
  //   const addButton = r({
  //     template: "<i>+</i>",
  //     events: {
  //       click: () => {
  //         if (isAdding) return;
  //         const newInputCell = r({
  //           template: `
  //           <div class="new-cell">
  //             <input class="cell-input" type="text">
  //             <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 5px;">
  //               <img class="add" width="25" height="25" src="src/assets/check.svg">
  //               <img class="cancel" width="25" height="25" src="src/assets/times.svg">
  //             </div>
  //           </div>`,
  //           events: {
  //             click: (e) => {
  //               if (e.target.tagName.toLowerCase() === "img") {
  //                 e.preventDefault();
  //                 if (e.target.classList.contains("add")) {
  //                   // TODO: 더 나은 방법 찾기..
  //                   const currentInputValue =
  //                     e.target.parentElement.parentElement.querySelector(
  //                       "input.cell-input"
  //                     ).value;
  //                   if (!currentInputValue) return;
  //                   const newCell = r({
  //                     template: `<div class="draggable" id="${Math.random()
  //                       .toString(36)
  //                       .substring(2)}"
  //                     draggable="true"></div>`,
  //                   });
  //                   newCell.innerText = currentInputValue;
  //                   // .new-cell의 sibling으로 추가
  //                   li.querySelector(".new-cell").parentElement.insertBefore(
  //                     newCell,
  //                     li.querySelector(".new-cell")
  //                   );
  //                   li.querySelector(".new-cell").remove();
  //                 }
  //                 if (e.target.classList.contains("cancel")) {
  //                 }
  //               }
  //             },
  //           },
  //         });
  //         // https://stackoverflow.com/questions/4793604/how-to-insert-an-element-after-another-element-in-javascript-without-using-a-lib
  //         addButton.parentNode.insertBefore(
  //           newInputCell,
  //           addButton.nextSibling
  //         );
  //         newInputCell.focus();
  //         isAdding = true;
  //       },
  //     },
  //   });
  //   li.prepend(addButton);
  // });
  // $$("li.droppable").forEach((li) => {
  //   li.addEventListener("dragover", (e) => {
  //     e.preventDefault(); // 왜 이걸 해줘야하는거지
  //     e.dataTransfer.dropEffect = "move";
  //   });
  //   li.addEventListener("drop", (e) => {
  //     const data = e.dataTransfer.getData("text/plain");
  //     e.target.appendChild($(`#${data}`));
  //   });
  // });
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

.new-cell img {
  cursor: pointer;
}

input.cell-input,
li > div.draggable {
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