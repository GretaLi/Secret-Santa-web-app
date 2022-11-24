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
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// DOM
const listContainer = document.querySelector("#list-container");
const drawContainer = document.querySelector("#draw-container");
const userFormNext = document.querySelector("#user-form-next");
const userFormSubmit = document.querySelector("#user-form-submit");
const drawBtn = document.querySelector("#draw-btn");

// handler
userFormNext.addEventListener("click", checkUserFormMember);
userFormSubmit.addEventListener("click", submitUserFormWish);

// 目前使用者
const currentUser = {
  uid: "",
};

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
      console.log(currentUser);
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

function submitUserFormWish() {
  currentUser.imgUrl = `../asset/svg/${getUserFormWish().imgUrl}.svg`;
  setUser().then(() => {
    setWishList();
  });
}

// 目前團體
const getUrlString = location.href;
const url = new URL(getUrlString);
const groupId = url.searchParams.get("group"); // 回傳 21
//
// Set user 建立使用者資料
async function setUser() {
  const setUserRef = doc(collection(db, "users"));
  await setDoc(setUserRef, {
    uid: setUserRef.id,
    password: currentUser.password,
    name: currentUser.name,
    imgUrl: currentUser.imgUrl,
  }).then(() => {
    currentUser.uid = setUserRef.id;
    console.log(currentUser);
  });
}

// Set wish list 許願
async function setWishList() {
  await setDoc(doc(collection(db, "wishLists")), {
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

// Set junction 抽卡時建立許願關聯
async function setJunction(giverId, groupId, wishListId) {
  const junctionRef = doc(collection(db, "junction_wishList_user"));
  await setDoc(junctionRef, {
    giverId: giverId,
    groupId: groupId,
    wishListId: wishListId,
  });
}
// setJunction("", "", "")

// Update wish list 更新願望
// const wishId = "9HEMr0xaMqVSguHlQ9IC";

const updateWish = async (wishId) => {
  await updateDoc(doc(db, "wishLists", wishId), {
    isSelected: true,
  });
};
// updateWish(wishId);

// Delete wish list 刪除願望
const deleteWish = async () => await deleteDoc(wishListRef);
// deleteWish();

// Get all wish lists by group id 用團體 id 讀取全部願望
const qCardRef = query(
  collection(db, "wishLists"),
  where("groupId", "==", groupId)
);
const queryCards = await getDocs(qCardRef);
renderCard(queryCards);

// Get group info by group id 用團體 id 讀取團體資訊
const groupRef = doc(db, "groups", groupId);
const groupInfo = await getDoc(groupRef);
renderGroupInfo(groupInfo);

// Get user info by user id 用使用者 id 讀取使用者資訊
const userRef = doc(db, "users", currentUser.uid);
// const userInfo = await getDoc(userRef);

// ---------------------------------------

// 初始化

function init() {
  // 團體資訊
  renderGroupInfo(groupInfo);

  // 卡片資訊
  renderCard(queryCards);

  // 使用者資訊
  renderUserSection(userInfo);
}

function renderGroupInfo(groupInfo) {
  let data = groupInfo.data();

  const renderContent = (el, text) => {
    document.querySelector(`#${el}`).textContent = text;
  };

  renderContent("title", data.title);
  renderContent("subtitle", data.subtitle);
  renderContent("date", `${data.date.toDate().toISOString().substring(0, 10)}`);
  renderContent("rule", data.rule);
  renderContent("limit", data.wishLimit);
}

function renderCard(queryCards) {
  let cardHtml = "";
  queryCards.forEach((item) => {
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
        <ol class="list__wishes">
            ${wishHTML}
        </ol>
    </div>
    `;
  });
  listContainer.innerHTML = cardHtml;
}

async function renderUserSection(data) {
  document.querySelector("#profile-container").innerHTML = `

  <img src="${data.imgUrl}" alt="avatar" />
  <h3>${data.name}</h3>
  <p id="myReceiver"></p>
  `;

  document.querySelector("#btn-container").innerHTML = `
  <button type="buttn" class="btn" id="draw-btn">抽卡</button>
  <button type="buttn" class="btn" id="add-btn" disabled>許願</button>`;

  renderReceiver(currentUser.uid);
  document.querySelector("#draw-btn").addEventListener("click", drawCard);
}

async function renderReceiver(uid) {
  const qJunctionRef = query(
    collection(db, "junction_wishList_user"),
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

  const wishLists = await getDoc(
    doc(db, `wishLists/${wishListArr[0].wishListId}`)
  );

  document.querySelector("#myReceiver").innerHTML = `我要準備 <strong>${
    wishLists.data().name
  }</strong> 的禮物`;
}

// 抽牌功能
// 卡片是空白的
// 抽出隨機 id 再 render 上去

function drawCard() {
  console.log("card");
  // 取得團體中所有的卡並放入陣列 wishLists
  let cardsArr = [];
  queryCards.forEach((card) => {
    cardsArr.push(card.data());
  });

  // 取得團體中所有卡片的選擇關聯 junction_wishList_user

  // Get selected card by group id 用團體 id 讀取團體中的抽卡關聯

  const selectedCardsArr = [];
  querySelectedCards();
  async function querySelectedCards() {
    const qSelectedCardsRef = query(
      collection(db, "junction_wishList_user"),
      where("groupId", "==", groupId)
    );

    const selectedCards = await getDocs(qSelectedCardsRef);
    selectedCards.forEach((card) => {
      selectedCardsArr.push(card.data());
    });
    console.log(selectedCardsArr);

    // 篩選出團體中所有"沒"被選的卡來抽卡
    let unselectedcardsArr = cardsArr.filter((card) => {
      return card.isSelected === false && card.uid !== currentUser.uid;
    });

    console.log(unselectedcardsArr);

    let hasReceiver = false;

    // 關聯中的 giver id 和使用者相同表示已抽過
    selectedCardsArr.forEach((card) => {
      console.log("關聯中的 giver id 和使用者相同表示已抽過");
      console.log(card.giverId);
      console.log(currentUser.uid);
      if (card.giverId === currentUser.uid) {
        hasReceiver = true;
      }
    });

    console.log(hasReceiver);
    console.log(cardsArr.length);

    // 使用者已抽過，且尚有卡還沒被抽到
    if (hasReceiver && cardsArr.length > 0) {
      console.log("已經抽過了唷");
      drawContainer.innerHTML = `
          <div class="list__card-warn">
           <p>抽過了捏</p>
           <h3>(・ε・)</h3>
          </div>
          `;
      return;
    }

    // 卡全部抽完
    if (cardsArr.length <= 0) {
      drawContainer.innerHTML = `
          <div class="list__card-warn">
           <p>抽完了捏</p>
           <h3>¯&#92;_(ツ)_/¯</h3>
          </div>
          `;
      return;
    }

    renderSelectedCard(unselectedcardsArr); // 記得往後放
  }
}

function renderSelectedCard(cardsArr) {
  console.log("開始抽卡");
  const length = cardsArr.length;
  //  不能抽到自己的

  let getRandomCard = () => {
    let random = Math.floor(Math.random() * length);

    let selectedCard = cardsArr[random];
    return selectedCard;
  };

  let selectedCard = getRandomCard();

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

  // 建立關聯
  console.log(currentUser.uid);
  setJunction(currentUser.uid, groupId, selectedCard.id);
  updateWish(selectedCard.id);
}
