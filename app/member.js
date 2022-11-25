const userForm1 = document.querySelector("#user-form1");
const userForm2 = document.querySelector("#user-form2");

userForm1.addEventListener("submit", (e) => {
  e.preventDefault();
});
userForm2.addEventListener("submit", (e) => {
  e.preventDefault();
});

const initMember = () => {
  document.querySelector("#user-name").value = localStorage.getItem("myName");
  document.querySelector("#user-birthday").value =
    localStorage.getItem("myBirthday");
};

initMember();

export const getUserFormMember = () => {
  const myUserObj = {
    name: document.querySelector("#user-name").value,
    password: document.querySelector("#user-birthday").value,
  };

  if (myUserObj.name === "" || myUserObj.password === "") {
    return;
  }

  if (myUserObj.password.length < 4) {
    document.querySelector(".user-birthday-msg").classList.add("active");
    return;
  } else {
    document.querySelector(".user-birthday-msg").classList.remove("active");
  }

  localStorage.setItem("myName", myUserObj.name);
  localStorage.setItem("myBirthday", myUserObj.password);

  //   console.log(myUserObj.name);
  //   console.log(myUserObj.password);
  return myUserObj;
};

export const showUserFormWish = () => {
  document.querySelector("#user-form-next").style.display = "none";
  userForm2.classList.add("active");
  userForm2.style.animation = "fadeIn .5s ease";
  return;
};

export const getUserFormWish = () => {
  const myWishObj = {
    imgUrl: document.querySelector("input[name='avatar']:checked").value,
    wish1: document.querySelector("#user-wish1").value,
    wish2: document.querySelector("#user-wish2").value,
    wish3: document.querySelector("#user-wish3").value,
  };

  if (
    myWishObj.imgUrl === "" ||
    myWishObj.wish1 === "" ||
    myWishObj.wish2 === "" ||
    myWishObj.wish3 === ""
  ) {
    return;
  }

  // console.log(myWishObj.imgUrl);
  //   console.log(myWishObj.wish1);
  //   console.log(myWishObj.wish2);
  //   console.log(myWishObj.wish3);

  userForm1.style.animation = "fadeOut .5s ease";
  userForm2.style.animation = "fadeOut .5s ease";
  userForm1.addEventListener("animationend", () => {
    userForm1.classList.remove("active");
  });
  userForm2.addEventListener("animationend", () => {
    userForm2.classList.remove("active");
  });
  return myWishObj;
};
