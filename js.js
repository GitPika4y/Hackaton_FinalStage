let selectedColor = "#ffffff";

//<-----------------------------------SET EVENTS------------------------------------->

//Кнопки цветов
$(document).on("click", ".color", function () {
  if ($(this).hasClass("func")) return; //Если клавиша функциональна, ничего не делаем
  $(".color").removeClass("selected");
  $(this).addClass("selected");
  selectedColor = $(this).css("background-color");
});

//Кнопка выбора цвета(Color Picker)
$(".userColor").change(function () {
  color = hexToRgb($(this).val()); //Смена цвета в rgb (по умол. возвращается hex)
  addNewColor(color); //Добавление нового цвета
});

//Setting sideBar
$(".sideBar>div").click(function () {
  let psevdoAfter = $(this).get(0);
  const child = $(this).find(".description").get(0);
  if (psevdoAfter.style.getPropertyValue("--opacity-sideBar") != "0") {
    //Not open
    psevdoAfter.style.setProperty("--opacity-sideBar", "0");
    child.style.setProperty("--_height", "auto");
    child.style.setProperty("--_width", "200px");
  } else {
    //already open
    psevdoAfter.style.setProperty("--opacity-sideBar", "1");
    child.style.setProperty("--_height", "0px");
    child.style.setProperty("--_width", "0px");
  }
});

$(".deleteColor").on("click", deleteColor);

$('#closeBtn').on('click', function(){
  $(this).parent().remove()
})
/*<------------------------------------FUNCTIONS-------------------------------------------->*/

//добавление нового цвета в палитру
function addNewColor(color) {
  let $parent = $(".addedColors");
  let isDuplicate = false;

  $('.color').each(function () {
    //Проверка на наличие уже имеющегося цвета
    if ($(this).css("background-color") === color) {//Если цвет уже есть
      isDuplicate = true;
      animate($(this).css('background-color'))//Анимация того что цвет уже есть
      return false;
    }
  });

  if (isDuplicate){
    $('.colorError').css('display', 'block')
    setTimeout(()=> $('.colorError').css('display', 'none'),2000)
    return;
  }

  $(`<div class='color' 
            style = "background-color: ${color}"></div>`).appendTo($parent);
}

function animate(targetColor) {
  //функция анимации повторяющегося цвета
  const $animatedBoxes = $(`.color`);

  $animatedBoxes.each(function () {
    const $box = $(this);
    if ($box.css("background-color") === targetColor) {
      $box.removeClass("animate");
      void $box[0].offsetWidth; // Фикс для принудительного пересчета стилей
      $box.addClass("animate");
    }
  });
}
function hexToRgb(hex) {
  // Проверяем, является ли входная строка валидным HEX-цветом
  if (!hex.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)) {
    throw new Error("Invalid hex color format.");
  }

  // Убираем символ решетки (#) и разбиваем строку на пары символов
  const hexValues = hex.slice(1).match(/.{1,2}/g);

  // Преобразуем каждую пару символов в десятичное число и собираем результат
  const rgbValues = hexValues.map((value) => parseInt(value, 16));

  // Формируем строку формата "rgb(R G B)"
  return `rgb(${rgbValues.join(" ")})`;
}

//Удаление уже добавленного цвета
function deleteColor() {
  let $parent = $(".addedColors");

  $parent.children().each(function () {
    el = $(this);
    if ($(this).hasClass("selected")) {
      $(el).remove();
    }
  });
}

//Скачать canvas-изображение
function downloadImage() {
  const canvas = document.getElementById("canvas");
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "downloaded_image.png";
  link.click();
}
/*------------------------CANVAS DRAWING-------------------------------------------------------->*/

//Setting Canvas
const canvas = document.querySelector("canvas");
const guide = document.getElementById("guide");
const ctx = canvas.getContext("2d");
const CELL_SIDE_COUNT = 30;
const cellPixelLength = canvas.width / CELL_SIDE_COUNT;
const colorHistory = {};

ctx.fillStyle = selectedColor;
ctx.fillRect(0, 0, canvas.width, canvas.height);

//Setting bounds(guide)
{
  guide.style.width = `${canvas.width}px`;
  guide.style.height = `${canvas.height}px`;
  guide.style.gridTemplateColumns = `repeat(${CELL_SIDE_COUNT}, 1fr)`;
  guide.style.gridTemplateRows = `repeat(${CELL_SIDE_COUNT}, 1fr)`;

  [...Array(CELL_SIDE_COUNT ** 2)].forEach(() =>
    guide.insertAdjacentHTML("beforeend", "<div></div>")
  );
}

//Functions to draw
function handleCanvasMousedown(e) {
  // Ensure user is using their primary mouse button
  if (e.button !== 0) {
    return;
  }
  const canvasBoundingRect = canvas.getBoundingClientRect();
  const x = e.clientX - canvasBoundingRect.left;
  const y = e.clientY - canvasBoundingRect.top;
  const cellX = Math.floor(x / cellPixelLength);
  const cellY = Math.floor(y / cellPixelLength);
  const currentColor = colorHistory[`${cellX}_${cellY}`];

  if (e.ctrlKey) {
    if (currentColor) {
      //если с нажатым ctrl цвета нет в палитре
      addNewColor(currentColor); //добавление нового цвета(div)
    }
  } else {
    fillCell(cellX, cellY);
  }
}

function fillCell(cellX, cellY) {
  const startX = cellX * cellPixelLength;
  const startY = cellY * cellPixelLength;

  ctx.fillStyle = selectedColor;
  ctx.fillRect(startX, startY, cellPixelLength, cellPixelLength);
  colorHistory[`${cellX}_${cellY}`] = selectedColor;
}

canvas.addEventListener("mousedown", handleCanvasMousedown);
/*<--------------------------------------------------------------------------->*/
