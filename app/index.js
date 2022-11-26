// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  Timestamp,
  deleteDoc,
  deleteField,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
import {
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  getDocFromCache,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
import {
  getUserFormMember,
  showUserFormWish,
  getUserFormWish,
} from "./member.js";

const firebaseConfig = {
  apiKey: "AIzaSyA3OitJ5ox7qX4h_XtYtQf1_Fs2AYqzUeE",
  authDomain: "secret-santa-7873b.firebaseapp.com",
  projectId: "secret-santa-7873b",
  storageBucket: "secret-santa-7873b.appspot.com",
  messagingSenderId: "268971575410",
  appId: "1:268971575410:web:f10e9db760bf81a7e81aeb",
  measurementId: "G-M7NJ6P8V7H",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const listContainer = document.querySelector("#list-container");
const drawContainer = document.querySelector("#draw-container");
const userFormNext = document.querySelector("#user-form-next");
const userFormSubmit = document.querySelector("#user-form-submit");
// const drawBtn = document.querySelector("#draw-btn");

// handler
userFormNext.addEventListener("click", checkUserFormMember);
userFormSubmit.addEventListener("click", submitUserFormWish);

// 目前使用者
const currentUser = {
  uid: "",
};

// 目前團體
// const getUrlString = location.href;
// const url = new URL(getUrlString);
// const groupId = url.searchParams.get("group");
const groupId = "QA8uhhY0DV5rvrEg4Kvd";

// ---------------------------------------

init();
function init() {
  getGroupInfo();
  getAllCards();
}

// 讀取團體資料
async function getGroupInfo() {
  const groupRef = doc(db, "groups", groupId);
  await getDoc(groupRef).then((groupInfo) => {
    renderGroupInfo(groupInfo);
  });
}
// 渲染團體資料
function renderGroupInfo(groupInfo) {
  let data = groupInfo.data();

  const renderContent = (el, text) => {
    document.querySelector(`#${el}`).textContent = text;
  };

  renderContent("title", data.title);
  renderContent("subtitle", data.subtitle);
  renderContent(
    "date",
    `${data.date.toDate().toLocaleString().substring(0, 10)}`
  );
  renderContent("rule", data.rule);
  renderContent("limit", data.wishLimit);
}

// 讀取團體願望
async function getAllCards() {
  const qCardRef = query(
    collection(db, "wishLists"),
    where("groupId", "==", groupId)
  );
  await getDocs(qCardRef).then((queryCards) => {
    renderCard(queryCards);
  });
}
// 渲染團體所有願望卡片
function renderCard(allCardsData) {
  let cardHtml = "";
  allCardsData.forEach((item) => {
    const receiver = item.data().name;
    const avatar = item.data().imgUrl;
    const wishes = item.data().wishes;
    const cardId = item.id;
    const isSelected = item.data().isSelected;

    let wishHTML = "";
    wishes.forEach((wish) => {
      wishHTML += `<li>${wish}</li>`;
    });

    cardHtml += `
    <div class="list__card" data-card-id="${cardId}" data-selected="${isSelected}">
        <img class="list__receiver-avatar" src="${avatar}" alt="avatar">
        <h3 class="list__receiver-name">${receiver}</h3>
        <ol class="list__wishes hidden">
            ${wishHTML}
        </ol>
    </div>
    `;
  });
  listContainer.innerHTML = cardHtml;
}

// 送出名稱及生日表單
function checkUserFormMember() {
  currentUser.name = getUserFormMember().name;
  currentUser.password = getUserFormMember().password;
  // console.log(currentUser);

  // 取得名稱相同的使用者及生日
  const qUserRef = query(
    collection(db, "users"),
    where("name", "==", currentUser.name),
    where("password", "==", currentUser.password)
  );
  checkUserName(qUserRef).then((myUser) => {
    if (myUser.length == 0) {
      console.log("首次填寫");
      showUserFormWish();
    }

    if (myUser.length > 0) {
      currentUser.uid = myUser[0].uid;
      currentUser.imgUrl = myUser[0].imgUrl;
      renderUserSection(myUser[0]);
    }
  });
}

async function checkUserName(qUserRef) {
  const qUserinfo = await getDocs(qUserRef);

  let userNameArr = [];
  qUserinfo.forEach((data) => {
    userNameArr.push(data.data());
  });

  return userNameArr;
}

// 渲染使用者資料
function renderUserSection(data) {
  // console.log("渲染使用者資料");
  document.querySelector("#profile-container").innerHTML = `

  <img src="${data.imgUrl}" alt="avatar" />
  <h3>${data.name}</h3>
  <p class="highlight" id="myReceiver"></p>
  `;

  renderReceiver(currentUser.uid);

  document.querySelector("#btn-container").innerHTML = `
  <button type="button" class="btn" id="draw-open-btn">抽卡</button>`;

  const drawMsgContainer = document.querySelector("#draw-msg");
  document.querySelector("#draw-open-btn").addEventListener("click", () => {
    drawMsgContainer.classList.add("active");
    document
      .querySelector("#draw-msg .btn__container")
      .addEventListener("click", (e) => {
        if (e.target.id === "draw-btn") {
          drawMsgContainer.classList.remove("active");
          drawCard();
          return;
        }

        if (e.target.id === "draw-close-btn") {
          drawMsgContainer.classList.remove("active");
          return;
        }
      });
  });
}

// 送出願望表單
function submitUserFormWish() {
  currentUser.imgUrl = `../asset/svg/${getUserFormWish().imgUrl}.svg`;
  window.scroll({
    top: 800,
    behavior: "smooth",
  });
  setUser();
}

// 建立使用者資料、儲存願望、渲染
async function setUser() {
  const setUserRef = doc(collection(db, "users"));
  await setDoc(setUserRef, {
    uid: setUserRef.id,
    password: currentUser.password,
    name: currentUser.name,
    imgUrl: currentUser.imgUrl,
  }).then(() => {
    currentUser.uid = setUserRef.id;
    setWishList().then(() => {
      renderUserSection(currentUser);
      getAllCards();
    });
  });
}

// 寫入願望
async function setWishList() {
  // console.log("寫入願望");
  const wishListRef = doc(collection(db, "wishLists"));
  await setDoc(wishListRef, {
    id: wishListRef.id,
    uid: currentUser?.uid,
    name: currentUser.name,
    groupId: groupId,
    imgUrl: currentUser.imgUrl,
    isSelected: false,
    wishes: [
      getUserFormWish().wish1,
      getUserFormWish().wish2,
      getUserFormWish().wish3,
    ],
  });
}

// 渲染使用者抽卡資料
async function renderReceiver(uid) {
  // 讀取卡片&使用者關聯資料
  const qJunctionRef = query(
    collection(db, "junctions"),
    where("giverId", "==", uid)
  );
  const queryJunction = await getDocs(qJunctionRef);
  const wishListArr = [];
  queryJunction.forEach((data) => {
    wishListArr.push(data.data());
  });

  if (wishListArr[0]?.wishListId == undefined) {
    document.querySelector("#myReceiver").textContent = "還沒抽卡 ◝(　ﾟ∀ ﾟ )◟";
    return;
  }

  // 讀取已抽到卡的資料
  const wishLists = await getDoc(
    doc(db, `wishLists/${wishListArr[0].wishListId}`)
  );

  // 渲染已抽卡其卡片主人名稱
  document.querySelector("#myReceiver").innerHTML = `我要準備 <strong>${
    wishLists.data().name
  }</strong> 的禮物`;

  let wishHTML = "";
  wishLists.data().wishes.forEach((wish) => {
    wishHTML += `<li>${wish}</li>`;
  });
  drawContainer.innerHTML = `
  <div class="list__card draw" data-selected="true" data-card-id="${
    wishLists.data().id
  }">
      <img class="list__receiver-avatar" src="${
        wishLists.data().imgUrl
      }" alt="avatar">
      <h3 class="list__receiver-name">${wishLists.data().name}</h3>
      <ol class="list__wishes">
          ${wishHTML}
      </ol>
  </div>`;
  document.querySelector("#draw-open-btn").setAttribute("disabled", "");
}

// 抽卡功能
async function drawCard() {
  // console.log("抽卡");
  // 取得團體中所有的卡並放入陣列 cardsArr
  let cardsArr = [];
  const qCardRef = query(
    collection(db, "wishLists"),
    where("groupId", "==", groupId)
  );
  await getDocs(qCardRef).then((queryCards) => {
    queryCards.forEach((card) => {
      cardsArr.push(card.data());
    });
  });
  // console.log("取得團體中所有的卡並放入陣列 cardsArr");
  // console.log(cardsArr);

  // 篩選出團體中所有"沒"被抽到的卡片 unselectedcardsArr
  let unselectedcardsArr = cardsArr.filter((card) => {
    return card.isSelected === false && card.uid !== currentUser.uid;
  });
  // console.log("篩選出團體中所沒被抽到的卡片");
  // console.log(unselectedcardsArr);
  // console.log("還有多少張沒抽過的?" + unselectedcardsArr.length);

  // 卡全部抽完
  if (unselectedcardsArr.length <= 0) {
    drawContainer.innerHTML = `
          <div class="list__card-warn">
           <p>抽完了捏</p>
           <h3>¯&#92;_(ツ)_/¯</h3>
          </div>
          `;
    return;
  }

  // console.log("開始抽卡");
  const length = unselectedcardsArr.length;
  const getRandomCard = () => {
    const random = Math.floor(Math.random() * length);
    const selectedCard = unselectedcardsArr[random];
    return selectedCard;
  };
  renderSelectedCard(getRandomCard()); // 記得往後放
}

// 渲染抽到的卡片
async function renderSelectedCard(selectedCard) {
  let wishHTML = "";
  selectedCard.wishes.forEach((wish) => {
    wishHTML += `<li>${wish}</li>`;
  });

  drawContainer.innerHTML = `
  <div class="list__card draw" data-selected="true" data-card-id="${selectedCard.id}">
      <img class="list__receiver-avatar" src="${selectedCard.imgUrl}" alt="avatar">
      <h3 class="list__receiver-name">${selectedCard.name}</h3>
      <ol class="list__wishes">
          ${wishHTML}
      </ol>
  </div>
  `;

  document.querySelector(
    "#myReceiver"
  ).innerHTML = `我要準備 <strong>${selectedCard.name}</strong> 的禮物`;

  document.querySelector("#draw-open-btn").setAttribute("disabled", "");

  // 建立關聯
  // console.log("抽中的卡");
  // console.log(selectedCard);
  const junctionObj = {
    giverId: `${currentUser.uid}`,
    groupId: `${groupId}`,
    wishListId: `${selectedCard.id}`,
  };
  // console.log("要寫入的關聯資料");
  // console.log(junctionObj);
  const junctionRef = doc(collection(db, "junctions"));
  await setDoc(junctionRef, junctionObj);

  await updateDoc(doc(db, "wishLists", selectedCard.id), {
    isSelected: true,
  });
}
