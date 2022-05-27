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

const camelToKebab = (str) =>
  str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

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

  if (Object.keys(styles).length && !(currentElement instanceof Text)) {
    const styleClassName = randomId();
    currentElement.classList.add(styleClassName);

    const styleElement = document.createElement("style");

    styleElement.innerHTML = Object.entries(styles).reduce(
      (acc, [styleName, styleValue], idx, arr) => {
        if (arr.length - 1 === idx) {
          return `${acc}\n ${camelToKebab(styleName)}: ${styleValue};\n}`;
        }

        return `${acc}\n ${camelToKebab(styleName)}: ${styleValue};`;
      },
      `.${styleClassName} {`
    );

    document.head.appendChild(styleElement);
  }

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
      isAddingNewCell: false,
    },
    {
      name: "doing",
      isAddingNewCell: false,
    },
    {
      name: "done",
      isAddingNewCell: false,
    },
  ],
};

function deleteRoot() {
  $("section")?.remove();
}

function renderFromKanbanModel() {
  deleteRoot();

  const { columns } = model;

  const fragment = new DocumentFragment();

  fragment.appendChild(
    r({
      template: `<section></section>`,
      children: [
        {
          template: "<ul></ul>",
          styles: {
            display: "grid",
            alignItems: "center",
            gridTemplateColumns: `repeat(${columns.length}, 1fr)`,
            columnGap: "1rem",
            height: "100vh",
            padding: "0 2rem",
          },
          children: columns?.map((column) => ({
            template: "<li></li>",
            attrs: {
              class: "droppable",
              id: column.name,
            },
            styles: {
              height: "90vh",
              padding: "0 1rem",
              border: "10px solid rgb(40, 40, 40)",
              borderRadius: "10px",
              backgroundColor: "rgb(167, 173, 199)",
              listStyle: "none",
            },
            children: [
              {
                template: "<i>+</i>",
                styles: {
                  display: "flex",
                  justifyContent: "flex-end",
                  margin: "0.5rem 0",
                  fontSize: "2rem",
                  fontWeight: "bold",
                  fontStyle: "normal",
                  lineHeight: "1",
                  cursor: "pointer",
                },
                events: {
                  click: () => {
                    if (!column.isAddingNewCell) {
                      column.isAddingNewCell = true;
                    }
                  },
                },
              },
              {
                template: "<div></div>",
                styles: {
                  display: !column.isAddingNewCell ? "none" : "block",
                },
                children: [
                  {
                    template: "<input></input>",
                    attrs: {
                      type: "text",
                    },
                    styles: {
                      width: "100%",
                      padding: "0.5rem",
                      border: "8px solid rgb(40, 40, 40)",
                      borderRadius: "8px",
                      lineHeight: "1.6",
                      fontSize: "18px",
                      fontWeight: "bold",
                    },
                  },
                  {
                    template: "<div></div>",
                    styles: {
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "8px",
                      marginTop: "5px",
                      marginBottom: "1rem",
                    },
                    children: [
                      {
                        template: "<img>",
                        attrs: {
                          width: "25",
                          height: "25",
                          src: "src/assets/check.svg",
                        },
                        styles: {
                          cursor: "pointer",
                        },
                      },
                      {
                        template: "<img>",
                        attrs: {
                          width: "25",
                          height: "25",
                          src: "src/assets/times.svg",
                        },
                        styles: {
                          cursor: "pointer",
                        },
                      },
                    ],
                  },
                ],
              },
              ...(column.items?.map((item) => ({
                template: "<div></div>",
                attrs: {
                  class: "draggable",
                  id: item.id || randomId(),
                  draggable: true,
                },
                styles: {
                  padding: "0.5rem",
                  marginBottom: "1rem",
                  border: "8px solid rgb(40, 40, 40)",
                  borderRadius: "8px",
                  fontSize: "18px",
                  fontWeight: "bold",
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

  const _ = new Proxy(model, {
    get: (target, prop) => {
      console.log("from model getter, prop", prop);
      return target[prop];
    },
    set: (target, key, value) => {
      target[key] = value;
      console.log("from model setter, key", key);
      renderFromKanbanModel();
      return true;
    },
  });

  _.columns = new Proxy(_.columns, {
    get: (target, prop) => {
      console.log("from columns getter, prop", prop);
      return target[prop];
    },
    set: (target, key, value) => {
      console.log("from columns setter, key", key, value);
      target[key] = value;
      renderFromKanbanModel();
      return true;
    },
  });

  _.columns.push({ name: "todo4" });

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