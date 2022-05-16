/// utils
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const mounted = (fn) => {
  window.addEventListener("DOMContentLoaded", () => {
    fn();
  });
};

/// template
const template = `
<section>
  <ul>
    <li class="droppable" id="todo">
      <div class="draggable" id="draggable" draggable="true">
        드래그
      </div>
      <div class="draggable" id="draggable2" draggable="true">
        드랍
      </div>
    </li>
    <li class="droppable" id="doing"></li>
    <li class="droppable" id="done"></li>
  </ul>
</section>`

$('#app').innerHTML = template

// component logics
mounted(() => {
  const section = $("section");
  const draggables = $$("[draggable=true]");

  draggables.forEach((dr) => {
    dr.addEventListener("dragstart", (e) => {
      if (e.target.classList.contains("draggable")) {
        e.dataTransfer.setData("text/plain", e.target.id);
        return;
      }
    });
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
  padding: 1rem;
  border: 10px solid rgb(40, 40, 40);
  border-radius: 10px;
  background-color: rgb(167, 173, 199);
  list-style: none;
}

li > div {
  border: 8px solid rgb(40, 40, 40);
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  padding: 0.5rem;
}

li > div:not(:last-child) {
  margin-bottom: 1rem;
}`

const styletag = document.createElement('style')
styletag.innerHTML = style
$('head').appendChild(styletag)