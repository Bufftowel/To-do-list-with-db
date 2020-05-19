
let formCon = document.querySelector("#formContainer");
let formCon2 = document.querySelector("#formContainer2");
let btn = document.querySelector("#add-task");
let btn2 = document.querySelector("#chngpass");
let formDivs = document.querySelectorAll("form div")

btn.addEventListener("click", () => {
    formCon.style.display = "flex";
});

btn2.addEventListener("click", () => {
    formCon2.style.display = "flex";
});

document.getElementById("title").setAttribute("autocomplete", "off");
document.getElementById("link").setAttribute("autocomplete", "off");

function closepopup() {
    formCon.style.display = "none";
}

function closepopup2() {
    formCon2.style.display = "none";
}
