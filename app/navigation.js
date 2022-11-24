// 登入註冊
// ---------------------//
//         Index        //
// ---------------------//
// 0. DOM
// 1. Axios - signup / login
// 1-1. handler
// 1-2. signup function
// 1-3. login function
// 1-4 show success card function
// 2. Switch signup panel / login panel
// 2-1. handler
// 2-2. switch function
// 3.  Navigation toggle
//

// 0. DOM
const signupAccount = document.querySelector("#signup-account");
const signupPassword = document.querySelector("#signup-password");
const signupBtn = document.querySelector("#signup-btn");

const loginAccount = document.querySelector("#login-account");
const loginPassword = document.querySelector("#login-password");
const loginBtn = document.querySelector("#login-btn");

const openLogin = document.querySelector("#open-login");
const openSignup = document.querySelector("#open-signup");

const signupContainer = document.querySelector("#signup");
const loginContainer = document.querySelector("#login");

const signupAccountMsg = document.querySelector(
  "#signup-account + .signup-msg"
);
const loginAccountMsg = document.querySelector("#login-account + .login-msg");
const signupPasswordMsg = document.querySelector(
  "#signup-password + .signup-msg"
);
const loginPasswordMsg = document.querySelector("#login-password + .login-msg");

const successContainer = document.querySelector(".success.container");
const successMsg = document.querySelector(".success-msg");

// 1. Axios - signup / login
// 1-1. handler
signupBtn.addEventListener("click", (e) => {
  e.preventDefault();
  signupAccountMsg.textContent = "";
  callSignUp();
});

loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  loginAccountMsg.textContent = "";
  callLogIn();
});

signupPassword.addEventListener("keydown", (e) => {
  signupPasswordMsg.textContent = "";
});

keydownCleanMsg(signupPassword, signupPasswordMsg);
keydownCleanMsg(loginPassword, loginPasswordMsg);

function keydownCleanMsg(input, msg) {
  input.addEventListener("keydown", (e) => {
    msg.textContent = "";
  });
}

// 1-2. signup function
function callSignUp() {
  let account = signupAccount.value;
  let password = signupPassword.value;

  let isValid = true;

  if (password == "" || isNaN(Number(password))) {
    signupPasswordMsg.textContent = "生日為四個數字 MMDD";
    isValid = false;
  }
  if (account == "") {
    signupAccountMsg.textContent = "名稱不得為空";
    isValid = false;
  }

  if (!isValid) {
    console.log("表單輸入有誤　(´･_･`)");
    return;
  }

  let obj = {};
  obj.name = account;
  obj.password = password;
  obj.imgUrl = "./asset/svg/avatar01.svg";
  console.log(obj);

  axios
    .post(`${baseUrl}/users`, obj)
    .then(function (response) {
      let data = response.data;
      console.log(data.name);

      if (data.name == obj.name) {
        signupAccount.value = "";
        signupPassword.value = "";
        signupAccountMsg.textContent = "";
        loginAccount.value = account;
        showSuccess(data.name);
        switchPanel(loginContainer, signupContainer);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

// 1-3. login function

function callLogIn() {
  loginContainer.style.display = "none";
  menuBg.classList.remove("bg");
}

// 1-4 show success card function
function showSuccess(message) {
  successContainer.style.display = "flex";
  successMsg.textContent = `Hello，${message}！`;
  successContainer.addEventListener("click", () => {
    successContainer.style.display = "none";
  });
}

// 2. Switch signup panel / login panel
// 2-1. handler
openLogin.addEventListener("click", (e) => {
  e.preventDefault();
  switchPanel(loginContainer, signupContainer);
});

openSignup.addEventListener("click", (e) => {
  e.preventDefault();
  switchPanel(signupContainer, loginContainer);
});

// 2-2. switch function
function switchPanel(openPanel, closePanel) {
  openPanel.style.display = "block";
  openPanel.style.animation = "fadeIn .3s ease";
  closePanel.style.display = "none";
}

// 3. navigation toggle
const navToggle = document.querySelector("#nav-toggle");
const navList = document.querySelector("#nav-list");
const menuBg = document.querySelector("header");

navToggle.addEventListener("click", toggleMenu);
navList.addEventListener("click", togglePanel);

function toggleMenu() {
  navList.classList.toggle("active");
  menuBg.classList.toggle("bg");
}

function togglePanel(e) {
  menuBg.classList.add("bg");
  if (e.target.id === "login-toggle") {
    switchPanel(loginContainer, signupContainer);
  }
  if (e.target.id === "signup-toggle") {
    switchPanel(signupContainer, loginContainer);
  }
  navList.classList.toggle("active");
}
window.addEventListener("click", function (e) {
  if (e.target.id === "signup") {
    signupContainer.style.display = "none";
    menuBg.classList.remove("bg");
  }

  if (e.target.id === "login") {
    loginContainer.style.display = "none";
    menuBg.classList.remove("bg");
  }

  if (e.target.classList.contains("bg")) {
    loginContainer.style.display = "none";
    signupContainer.style.display = "none";
    navList.classList.remove("active");
    menuBg.classList.remove("bg");
  }
});

const loginToggle2 = document.querySelector("#login-toggle2");
loginToggle2.addEventListener("click", () => {
  menuBg.classList.add("bg");
  switchPanel(loginContainer, signupContainer);
});
