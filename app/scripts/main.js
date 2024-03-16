// import 'fslightbox'; // Lightbox: npm install fslightbox, site: https://fslightbox.com/javascript/documentation
// import Swiper from 'swiper'; // Slider: npm install swiper, site: https://swiperjs.com/get-started
// import AirDatepicker from 'air-datepicker'; // Datepicker: npm i air-datepicker -S, site: https://air-datepicker.com/ru
console.log("main init");

let date = new Date().getFullYear();
document.getElementById("year").innerHTML = date;

// Drupal.behaviors.afterAjax = {
// 	attach: function (context, settings){
// 		maskPhone(context);
// 		popups(context);
// 		// Этот html нужно засунуть при успешной отправке.
// 		// <div fid="block-form-order" id="webform--submitted" style="display:none">Сообщение успешно отправлено</div>
// 		let wfsbmt = document.getElementById("webform--submitted");
// 		if (wfsbmt) {
// 			if (wfsbmt.getAttribute("fid")){
// 				document.getElementById(wfsbmt.getAttribute("fid")).classList.remove("active");
// 				document.getElementById("win-thanks").classList.add("active");
// 			};
// 		};
// 	}
// };

popups();
maskPhone();

// Окна
function popups(elem = document) {
  // Открыть
  let buttonOpenPopup = elem.querySelectorAll("[data-popup]");
  if (buttonOpenPopup.length) {
    //buttonOpenPopup = once("popups",buttonOpenPopup);

    buttonOpenPopup.forEach(function (item) {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        let popup_id = item.getAttribute("data-popup");
        elem.querySelector("#" + popup_id + "").classList.add("active");
        document.body.classList.add("no-scroll");
      });
    });
  }
  // Закрыть
  let popup = elem.querySelectorAll(".popup");
  if (popup.length < 1 && elem.classList.contains("popup")) {
    popup = [elem];
  }
  if (popup.length) {
    //once("popups",popup);

    popup.forEach(function (item) {
      item.addEventListener("click", function (e) {
        if (e.target.matches(".popup") || e.target.matches(".popup__close")) {
          item.classList.remove("active");
          document.body.classList.remove("no-scroll");
        }
      });
    });
  }
}

// Маска телефона
function maskPhone(elem = document) {
  let inputs = elem.querySelectorAll('input[type="tel"]');
  if (inputs.length) {
    //inputs = once("inputs",inputs);

    inputs.forEach((phone) => {
      let code = "+7",
        find = /\+7/;
      code = "+7";
      find = /\+7/;
      phone.addEventListener("focus", function () {
        phone.value = code + " " + phone.value.replace(code + " ", "");
      });
      phone.addEventListener("input", function () {
        let val = phone.value.replace(find, ""),
          res = code + " ";
        val = val.replace(/[^0-9]/g, "");
        for (let i = 0; i < val.length; i++) {
          res += i === 0 ? " (" : "";
          res += i == 3 ? ") " : "";
          res += i == 6 || i == 8 ? "-" : "";
          if (i == 10) break;
          res += val[i];
        }
        phone.value = res;
      });
      phone.addEventListener("blur", function () {
        let val = phone.value.replace(find, "");
        val = val.trim();
        if (!val) phone.value = null;
      });
    });
  }
}

// const mainSlider = document.querySelector(".swiper");
// if(mainSlider){
// 	const mainSliderSwiper = new Swiper(mainSlider, {
// 		slidesPerView: 1,
// 		spaceBetween: 10,
// 		navigation: {
// 			prevEl: '.main-slider .arrows__prev',
// 			nextEl: '.main-slider .arrows__next',
// 		},
// 	});
// };

// Обернуть таблицы
if (window.innerWidth < 768) {
  let contentTable = document.querySelectorAll(".content table");
  if (contentTable.length) {
    contentTable.forEach(function (item) {
      let tableWrap = document.createElement("div");
      tableWrap.setAttribute("class", "table-wrap");
      item.parentNode.insertBefore(tableWrap, item);
      tableWrap.appendChild(item);
    });
  }
}

// // Fancybox
// Fancybox.bind(':not(.swiper-slide-duplicate) > [data-fancybox]', {
// 	groupAll: true,
// 	placeFocusBack: false, // Починить баг с фенсибоксом и свипером
// 	Image:{
// 		wheel: "slide",
// 	},
// });
// // Исправить баг с дублированием изображений в фенсибоксе, если свипер бесконечный
// document.addEventListener("DOMContentLoaded", function(){
// 	let fancyboxInSlider = document.querySelectorAll('.swiper-slide-duplicate [data-fancybox]');
// 	if(fancyboxInSlider.length){
// 		fancyboxInSlider.forEach(function(item){
// 			item.addEventListener("click", function(e){
// 				e.preventDefault();
// 				let href = item.getAttribute("href");
// 				item.closest(".swiper").querySelector(".swiper-slide:not(.swiper-slide-duplicate) [data-fancybox][href='"+href+"']").click();
// 			});
// 		});
// 	};

// });
