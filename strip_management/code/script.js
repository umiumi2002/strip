UserActivation = "use strict";

var request = new XMLHttpRequest();
request.open("GET", "https://strip-1-fv9b.onrender.com", true);
request.responseType = "json";

let flightdata = {};
request.onload = function () {
  flightdata = this.response;
  console.log(flightdata);

  // ページ読み込み時に初期データを表示
  initializeStrips();
  // ページ読み込み時と定期的に更新
  updateHiddenStripCounts();

  // enableDragAndDrop("takeoffStripContainer");
  // enableDragAndDrop("landingStripContainer");
};
request.send();

//10秒ごとに画面をリロード
// setInterval(function () {
//   location.reload();
// }, 10000);

function timeToSeconds(t) {
  if (t == null) return Number.POSITIVE_INFINITY;

  const s = String(t).trim();

  // "0623" / "623" / 623 みたいなHHMM
  if (/^\d{3,4}$/.test(s)) {
    const n = parseInt(s, 10);
    const h = Math.floor(n / 100);
    const m = n % 100;
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) return h * 3600 + m * 60;
    return Number.POSITIVE_INFINITY;
  }

  // "06:23" / "6:23" / "06:23:10" も一応対応
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) {
    const parts = s.split(":").map(Number);
    const [h, m, sec = 0] = parts;
    if ([h, m, sec].some(Number.isNaN)) return Number.POSITIVE_INFINITY;
    return h * 3600 + m * 60 + sec;
  }

  return Number.POSITIVE_INFINITY;
}


function initializeStrips() {
  fetch("https://strip-1-fv9b.onrender.com/get_strips")
    .then((response) => response.json())
    .then((data) => {
      const container = document.getElementById("stripContainer");
      container.innerHTML = "";

      const depMap = new Map((data.departures || []).map(d => [d.id, d]));
      const arrMap = new Map((data.arrivals || []).map(a => [a.id, a]));

      // ★保存順があれば最優先で描画
      if (Array.isArray(data.mixed_order) && data.mixed_order.length > 0) {
        data.mixed_order.forEach(({ id, type }) => {
          const item = (type === "departure") ? depMap.get(id) : arrMap.get(id);
          if (!item) return;

          container.appendChild(createStrip(item, type));
          if (type === "departure") depMap.delete(id);
          else arrMap.delete(id);
        });

        // 保存順に含まれない新規ストリップは末尾に追加（時刻順）
        const rest = [
          ...Array.from(depMap.values()).map(x => ({ ...x, _type: "departure" })),
          ...Array.from(arrMap.values()).map(x => ({ ...x, _type: "arrival" })),
        ];
        rest.sort((x, y) => timeToSeconds(x.time) - timeToSeconds(y.time));
        rest.forEach(x => container.appendChild(createStrip(x, x._type)));

        return; // ★ここで終わり
      }

      // ★保存順がない初期状態は時刻順で混在表示
      const merged = [
        ...(data.departures || []).map(d => ({ ...d, _type: "departure" })),
        ...(data.arrivals || []).map(a => ({ ...a, _type: "arrival" })),
      ];

      merged.sort((x, y) => {
        const diff = timeToSeconds(x.time) - timeToSeconds(y.time);
        if (diff !== 0) return diff;
        return (x._type === "departure" ? -1 : 1);
      });

      merged.forEach((stripData) => {
        container.appendChild(createStrip(stripData, stripData._type));
      });
    })
    .catch((error) => console.error("データの取得エラー:", error));
}

async function addStrip(containerId) {
  console.log("✅ addStrip called! containerId =", containerId); // ← 追加！

  const container = document.getElementById(containerId);
  // サーバーからストリップデータを取得
  const openData = await fetch("https://strip-1-fv9b.onrender.com/get_strips")
    .then((response) => response.json())
    .then((data) => {
      return data;
    });

  // クリックされたボタンによって、適切なデータを選択
  if (
    containerId === "takeoffStripContainer" &&
    openData.departures.length < flightdata.departures.length
  ) {
    const stripData = flightdata.departures[openData.departures.length];

    console.log("🚀 Adding departure strip:", stripData); // ← 追加！

    // サーバーにストリップを追加するリクエストを送信
    fetch("https://strip-1-fv9b.onrender.com/add_strip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "departure",
        strip_data: stripData,
      }),
    });
    // 画面リロード
    location.reload();
  } else if (
    containerId === "landingStripContainer" &&
    openData.arrivals.length < flightdata.arrivals.length
  ) {
    const stripData = flightdata.arrivals[openData.arrivals.length];

    console.log("🚀 Adding arrival strip:", stripData); // ← 追加！

    // サーバーにストリップを追加するリクエストを送信
    fetch("https://strip-1-fv9b.onrender.com/add_strip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "arrival",
        strip_data: stripData,
      }),
    });
    console.log("🔄 Reloading page after adding strip...");
    location.reload();
  }
}

// ストリップを作成する関数
function createStrip(data, type) {
  const { id, name, model, runway, time, is_completed } = data;
  const strip = document.createElement("div");
  strip.classList.add("strip");

  strip.dataset.id = id;
  strip.dataset.type = type; // "departure" or "arrival"

  const isArrivePanel = type === "arrival";
  strip.classList.add(isArrivePanel ? "strip-arr" : "strip-dep");

  strip.innerHTML = `
    <div class="strip-row-top">
    <div class="left-block">
      <span class="callsign bold">${name}</span>
      <div class="bottom-row">
        <span class="aircraft">${model}</span>
        <span class="time">${time}</span>
      </div>
    </div>
    <div class="right-block">
      <span class="runway bold">${runway}</span>
    </div>
    </div>
      <div class="strip-row-bottom">

    <div class="check-mark ${is_completed ? "" : "hidden"}">✓</div>
    <div class="strip-buttons">

    ${isArrivePanel ? `<button class="emergency-button">緊急</button>` : ""}
    <button class="check-button" data-id="${id}" data-type="${
    isArrivePanel ? "arrival" : "departure"
  }">${is_completed ? "取消" : "完了"}</button>
    <button class="delete-button" data-id="${id}" data-type="${
    isArrivePanel ? "arrival" : "departure"
  }">削</button>
    </div>
    </div>
  `;

  strip.addEventListener("dragstart", handleDragStart);
  strip.addEventListener("dragover", handleDragOver);
  strip.addEventListener("drop", handleDrop);
  strip.addEventListener("dragend", handleDragEnd);
  // タッチ操作（タブレット用）
  strip.addEventListener("touchstart", handleTouchStart);
  strip.addEventListener("touchmove", handleTouchMove);
  strip.addEventListener("touchend", handleTouchEnd);

  let isEmergency = false; // 緊急状態を管理するフラグ

  if (isArrivePanel) {
    const emergencyButton = strip.querySelector(".emergency-button");
    emergencyButton.addEventListener("click", function () {
      if (!isEmergency) {
        // setTimeout(() => {
        addEmergencyStripToArrivals(containerId, data); // 緊急ストリップを追加
        this.textContent = "復行";
        // }, 3000);
      } else {
        // removeEmergencyStripFromArrivals(containerId); // 緊急ストリップを削除
        this.textContent = "緊急";
      }
      isEmergency = !isEmergency; // 緊急状態をトグル
    });
  }

  const checkButton = strip.querySelector(".check-button");
  const checkMark = strip.querySelector(".check-mark");

  // checkMark.style.backgroundColor = isArrivePanel ? "orange" : "lightblue";

  checkButton.addEventListener("click", async function () {
    const newState = !checkMark.classList.contains("hidden");
    checkMark.classList.toggle("hidden");
    checkButton.textContent = newState ? "完了" : "取消";

    const airplaneId = checkButton.dataset.id;
    const airplaneType = checkButton.dataset.type;

    // サーバーに状態を更新するリクエストを送信
    try {
      const response = await fetch(
        "https://strip-1-fv9b.onrender.com/update_status",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: parseInt(airplaneId),
            type: airplaneType,
            is_completed: newState,
          }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        console.log("更新成功:", data);
      } else {
        console.error("更新失敗:", data);
      }
    } catch (error) {
      console.error("エラー:", error);
    }
  });

  const deleteButton = strip.querySelector(".delete-button");

  deleteButton.addEventListener("click", async function () {
    const airplaneId = parseInt(deleteButton.dataset.id);
    const airplaneType = deleteButton.dataset.type;

    const confirmDelete = confirm(
      `ID ${airplaneId} のストリップを削除しますか？`
    );
    if (!confirmDelete) return;

    strip.remove(); // UIから削除

    try {
      const response = await fetch(
        "https://strip-1-fv9b.onrender.com/remove_strip",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: airplaneId, type: airplaneType }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log("削除成功:", data);
      } else {
        console.error("削除失敗:", data);
      }
    } catch (error) {
      console.error("通信エラー:", error);
    }
  });

  return strip;
}

// 緊急時にストリップをarrivalsに追加する関数
function addEmergencyStripToArrivals(data) {
  fetch("https://strip-1-fv9b.onrender.com/update_emergency", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Emergency flight added:", data);
      // 追加後の到着機データを表示などの処理を行う
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// 緊急ストリップを削除する関数
function removeEmergencyStripFromArrivals(containerId) {
  // flightStripから緊急ストリップを削除
  flightStrip.arrivals.pop();

  // UIから削除
  const container = document.getElementById(containerId);
  const strips = container.querySelectorAll(".strip");
  const lastStrip = strips[strips.length - 1];
  container.removeChild(lastStrip);

  // サーバーに更新内容を送信
  fetch("https://strip-1-fv9b.onrender.com/update_arrivals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      arrivals: flightStrip.arrivals, // 更新されたarrivalsデータ
    }),
  })
    .then((response) => response.json())
    .then((data) => console.log("Arrivals updated successfully:", data))
    .catch((error) => console.error("Error updating arrivals:", error));
}

let touchStartY = 0; // タッチの開始位置を記録
let touchStartElement = null; // ドラッグしている要素を記録

function handleTouchStart(event) {
  if (event.target.tagName === "INPUT") {
    return; // inputフィールド内でのタッチを無視
  }
  touchStartElement = this; // タッチした要素を保持
  console.log("touchStartElement", touchStartElement);
  touchStartY = event.touches[0].clientY; // タッチ開始位置を記録
  this.classList.add("dragging"); // 視覚的なドラッグ中の効果を追加
}

function handleTouchMove(event) {
  event.preventDefault(); // スクロール動作を防止

  if (event.target.tagName === "INPUT") {
    return; // inputフィールド内でのタッチ動作を無視
  }
  const touchY = event.touches[0].clientY; // 現在のタッチ位置

  const container = this.parentElement; // 親要素を取得
  const allStrips = Array.from(container.children); // 全ストリップを配列化
  const targetElement = allStrips.find((strip) => {
    const rect = strip.getBoundingClientRect();
    return touchY >= rect.top && touchY <= rect.bottom;
  });

  if (targetElement && targetElement !== touchStartElement) {
    const targetIndex = allStrips.indexOf(targetElement);
    const draggedIndex = allStrips.indexOf(touchStartElement);

    if (draggedIndex < targetIndex) {
      container.insertBefore(touchStartElement, targetElement.nextSibling);
    } else {
      container.insertBefore(touchStartElement, targetElement);
    }
  }
}

function handleTouchEnd() {
  this.classList.remove("dragging"); // 視覚効果をリセット
  touchStartElement = null; // 状態をリセット
  touchStartY = 0;

  // 親要素が takeoffStripContainer の場合
  updateOrder("takeoffStripContainer", "departure");

  // 親要素が landingStripContainer の場合
  updateOrder("landingStripContainer", "arrival");

  updateMixedOrder();
}

// 共通の順番取得＆送信処理を関数化
function updateOrder(containerId, type) {
  const container = document.getElementById(containerId);
  if (container) {
    const newOrder = Array.from(container.children)
      .map((child) => {
        const checkButton = child.querySelector(".check-button"); // ストリップ内のチェックボタンを探す
        return checkButton ? checkButton.dataset.id : null; // data-id を取得
      })
      .filter((id) => id !== null); // null を除外

    console.log(`New order for ${type}s:`, newOrder);

    // サーバーに順番を送信
    fetch("https://strip-1-fv9b.onrender.com/update_order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: type, // "departure" または "arrival"
        order: newOrder, // 順番
      }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then((data) => {
        console.log(`Order updated on server successfully for ${type}s:`, data);
      })
      .catch((error) =>
        console.error(`Error updating order on server for ${type}s:`, error)
      );
  }
}

function updateMixedOrder() {
  const container = document.getElementById("stripContainer");
  if (!container) return;

  const order = Array.from(container.querySelectorAll(".strip")).map((el) => ({
    id: parseInt(el.dataset.id, 10),
    type: el.dataset.type, // "departure" or "arrival"
  }));

  console.log("New mixed order:", order);

  fetch("https://strip-1-fv9b.onrender.com/update_order_mixed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  })
    .then((r) => {
      if (!r.ok) throw new Error("Network response was not ok");
      return r.json();
    })
    .then((data) => console.log("Mixed order saved:", data))
    .catch((e) => console.error("Error saving mixed order:", e));
}


// inputフィールドのクリック時にタッチイベントを無効化
document.querySelectorAll("input").forEach((input) => {
  input.addEventListener("touchstart", function (event) {
    event.stopPropagation(); // input内のタッチイベントの伝播を停止
  });
});

function enableDragAndDrop(containerId) {
  const container = document.getElementById(containerId);
  const strips = container.querySelectorAll(".strip");

  strips.forEach((strip) => {
    strip.setAttribute("draggable", "true");

    strip.addEventListener("dragstart", handleDragStart);
    strip.addEventListener("dragover", handleDragOver);
    strip.addEventListener("drop", handleDrop);
    strip.addEventListener("dragend", handleDragEnd);

    // タッチ操作（タブレット用）
    strip.addEventListener("touchstart", handleTouchStart);
    strip.addEventListener("touchmove", handleTouchMove);
    strip.addEventListener("touchend", handleTouchEnd);
  });
}

let draggedElement = null;

function handleDragStart(event) {
  draggedElement = this; // ドラッグしている要素を保持
  event.dataTransfer.effectAllowed = "move";
  this.classList.add("dragging");
}

function handleDragOver(event) {
  event.preventDefault(); // ドロップ可能にする
  event.dataTransfer.dropEffect = "move";

  // ドラッグ中の要素を挿入位置の前に移動
  const container = this.parentElement;
  const allStrips = Array.from(container.children);
  const draggedIndex = allStrips.indexOf(draggedElement);
  const targetIndex = allStrips.indexOf(this);

  if (draggedIndex < targetIndex) {
    container.insertBefore(draggedElement, this.nextSibling);
  } else {
    container.insertBefore(draggedElement, this);
  }
}

function handleDrop(event) {
  event.preventDefault();
}

function handleDragEnd() {
  this.classList.remove("dragging");
  draggedElement = null; // ドラッグ要素をリセット

  updateMixedOrder();
}

function updateHiddenStripCounts() {
  // 全ストリップ情報を取得
  fetch("https://strip-1-fv9b.onrender.com/")
    .then((response) => response.json())
    .then((allStrips) => {
      // 表示中のストリップ情報を取得
      fetch("https://strip-1-fv9b.onrender.com/get_strips")
        .then((response) => response.json())
        .then((visibleStrips) => {
          // 離陸の非表示ストリップ数を計算
          const allTakeoffIds = allStrips.departures.map((strip) => strip.id);
          const visibleTakeoffIds = visibleStrips.departures.map(
            (strip) => strip.id
          );
          const hiddenTakeoffCount = allTakeoffIds.filter(
            (id) => !visibleTakeoffIds.includes(id)
          ).length;

          // 着陸の非表示ストリップ数を計算
          const allLandingIds = allStrips.arrivals.map((strip) => strip.id);
          const visibleLandingIds = visibleStrips.arrivals.map(
            (strip) => strip.id
          );
          const hiddenLandingCount = allLandingIds.filter(
            (id) => !visibleLandingIds.includes(id)
          ).length;

          // 非表示枚数をHTMLに表示
          document.getElementById(
            "takeoffHiddenCount"
          ).textContent = `非表示ストリップ: ${hiddenTakeoffCount} 枚`;
          document.getElementById(
            "landingHiddenCount"
          ).textContent = `非表示ストリップ: ${hiddenLandingCount} 枚`;
        })
        .catch((error) =>
          console.error("表示中ストリップ情報の取得エラー:", error)
        );
    })
    .catch((error) => console.error("全ストリップ情報の取得エラー:", error));
}
