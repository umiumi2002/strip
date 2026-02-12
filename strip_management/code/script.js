UserActivation = "use strict";

/** ====== 設定（URLだけまとめ） ====== */
const BASE_URL = "https://strip-1-fv9b.onrender.com";

var request = new XMLHttpRequest();
request.open("GET", BASE_URL, true);
request.responseType = "json";

let flightdata = {};
request.onload = function () {
  flightdata = this.response || {};
  console.log("flightdata:", flightdata);

  initWindPersistence();
  initializeStrips();
  updateHiddenStripCounts();
};
request.send();

// 10秒ごとに画面をリロード（現状運用を踏襲）
// setInterval(function () {
//   location.reload();
// }, 10000);

/** ====== 初期描画：dep/arrを別コンテナに表示 ====== */
function initializeStrips() {
  fetch(`${BASE_URL}/get_strips`)
    .then((response) => response.json())
    .then((data) => {
      const depContainer = document.getElementById("takeoffStripContainer");
      const arrContainer = document.getElementById("landingStripContainer");

      if (!depContainer || !arrContainer) {
        console.warn("containers not found");
        return;
      }

      depContainer.innerHTML = "";
      arrContainer.innerHTML = "";

      // departure
      (data.departures || []).forEach((stripData) => {
        depContainer.appendChild(createStrip(stripData, "departure"));
      });

      // arrival
      (data.arrivals || []).forEach((stripData) => {
        arrContainer.appendChild(createStrip(stripData, "arrival"));
      });

      // コンテナ単位のD&Dを有効化（dep内/arr内の並び替え）
      enableDnDForContainers();
    })
    .catch((error) => console.error("データの取得エラー:", error));
}

/** ====== add strip（既存ロジックを維持） ====== */
async function addStrip(containerId) {
  console.log("✅ addStrip called! containerId =", containerId);

  const openData = await fetch(`${BASE_URL}/get_strips`)
    .then((response) => response.json())
    .then((data) => data);

  if (
    containerId === "takeoffStripContainer" &&
    (openData.departures?.length || 0) < (flightdata.departures?.length || 0)
  ) {
    const stripData = flightdata.departures[openData.departures.length];
    console.log("🚀 Adding departure strip:", stripData);

    fetch(`${BASE_URL}/add_strip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "departure", strip_data: stripData }),
    });

    location.reload();
  } else if (
    containerId === "landingStripContainer" &&
    (openData.arrivals?.length || 0) < (flightdata.arrivals?.length || 0)
  ) {
    const stripData = flightdata.arrivals[openData.arrivals.length];
    console.log("🚀 Adding arrival strip:", stripData);

    fetch(`${BASE_URL}/add_strip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "arrival", strip_data: stripData }),
    });

    location.reload();
  }
}

/** ====== ストリップ生成（typeでarrival/departure出し分け） ====== */
function createStrip(data, type) {
  const { id, name, model, runway, time, is_completed } = data;

  const strip = document.createElement("div");
  strip.classList.add("strip");
  strip.draggable = true;

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

  // Drag (PC)
  strip.addEventListener("dragstart", handleDragStart);
  strip.addEventListener("dragend", handleDragEnd);

  // Touch (iPad)
  strip.addEventListener("touchstart", handleTouchStart, { passive: false });
  strip.addEventListener("touchmove", handleTouchMove, { passive: false });
  strip.addEventListener("touchend", handleTouchEnd);

  // 緊急（arrivalのみ）※サーバ仕様はそのまま
  if (isArrivePanel) {
    const emergencyButton = strip.querySelector(".emergency-button");
    emergencyButton?.addEventListener("click", async function () {
      await addEmergencyStripToArrivals();
      // 表示更新（reload運用ならここは軽くでOK）
      initializeStrips();
      updateHiddenStripCounts();
    });
  }

  // 完了/取消
  const checkButton = strip.querySelector(".check-button");
  const checkMark = strip.querySelector(".check-mark");

  checkButton.addEventListener("click", async function () {
    const newState = !checkMark.classList.contains("hidden");
    checkMark.classList.toggle("hidden");
    checkButton.textContent = newState ? "完了" : "取消";

    const airplaneId = checkButton.dataset.id;
    const airplaneType = checkButton.dataset.type;

    try {
      const response = await fetch(`${BASE_URL}/update_status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: parseInt(airplaneId, 10),
          type: airplaneType,
          is_completed: newState,
        }),
      });

      const resData = await response.json().catch(() => ({}));
      if (!response.ok) console.error("更新失敗:", resData);
      else console.log("更新成功:", resData);
    } catch (error) {
      console.error("エラー:", error);
    }
  });

  // 削除
  const deleteButton = strip.querySelector(".delete-button");
  deleteButton.addEventListener("click", async function () {
    const airplaneId = parseInt(deleteButton.dataset.id, 10);
    const airplaneType = deleteButton.dataset.type;

    const confirmDelete = confirm(`ID ${airplaneId} のストリップを削除しますか？`);
    if (!confirmDelete) return;

    strip.remove();

    try {
      const response = await fetch(`${BASE_URL}/remove_strip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: airplaneId, type: airplaneType }),
      });

      const resData = await response.json().catch(() => ({}));
      if (!response.ok) console.error("削除失敗:", resData);
      else console.log("削除成功:", resData);
    } catch (error) {
      console.error("通信エラー:", error);
    }
  });

  return strip;
}

/** ====== 緊急追加 ====== */
async function addEmergencyStripToArrivals() {
  try {
    const res = await fetch(`${BASE_URL}/update_emergency`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    const text = await res.text();
    console.log("update_emergency status:", res.status);
    console.log("update_emergency body:", text);

    if (!res.ok) throw new Error(`update_emergency failed: ${res.status}`);
  } catch (error) {
    console.error("Error:", error);
  }
}

/** ====== D&D（コンテナ内並び替え専用） ====== */
let draggedElement = null;

function enableDnDForContainers() {
  const dep = document.getElementById("takeoffStripContainer");
  const arr = document.getElementById("landingStripContainer");
  if (!dep || !arr) return;

  [dep, arr].forEach((zone) => {
    zone.addEventListener("dragover", handleZoneDragOver);
    zone.addEventListener("drop", handleZoneDrop);
  });
}

function getBeforeElementInZone(zone, clientY, draggingEl) {
  const items = Array.from(zone.querySelectorAll(".strip")).filter(
    (el) => el !== draggingEl
  );

  for (const el of items) {
    const r = el.getBoundingClientRect();
    const midY = r.top + r.height / 2;
    if (clientY < midY) return el;
  }
  return null;
}

function handleDragStart(event) {
  draggedElement = this;
  event.dataTransfer.effectAllowed = "move";
  this.classList.add("dragging");
}

function handleDragEnd() {
  this.classList.remove("dragging");
  draggedElement = null;

  // 並び替え後にコンテナ単位でサーバへ順序保存
  saveOrderForContainer(this.parentElement);
}

function handleZoneDragOver(e) {
  e.preventDefault();
  if (!draggedElement) return;

  const zone = e.currentTarget; // dep or arr
  const before = getBeforeElementInZone(zone, e.clientY, draggedElement);
  if (before) zone.insertBefore(draggedElement, before);
  else zone.appendChild(draggedElement);
}

function handleZoneDrop(e) {
  e.preventDefault();
}

/** ====== Touch D&D（コンテナ内並び替え専用） ====== */
let touchStartElement = null;
let touchDragging = false;

function getZoneFromPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  return el.closest("#takeoffStripContainer, #landingStripContainer");
}

function handleTouchStart(event) {
  if (event.target.tagName === "INPUT") return;
  if (event.target.closest("button")) return;

  touchStartElement = this;
  touchDragging = true;
  this.classList.add("dragging");
}

function handleTouchMove(event) {
  if (!touchDragging || !touchStartElement) return;

  event.preventDefault();
  const t = event.touches[0];
  const zone = getZoneFromPoint(t.clientX, t.clientY);
  if (!zone) return;

  const before = getBeforeElementInZone(zone, t.clientY, touchStartElement);
  if (before) zone.insertBefore(touchStartElement, before);
  else zone.appendChild(touchStartElement);
}

function handleTouchEnd() {
  if (!touchStartElement) return;

  const parent = touchStartElement.parentElement;

  touchStartElement.classList.remove("dragging");
  touchStartElement = null;
  touchDragging = false;

  saveOrderForContainer(parent);
}

/** ====== 並び順を保存（既存API update_order を使用） ====== */
function saveOrderForContainer(containerEl) {
  if (!containerEl || !containerEl.id) return;

  if (containerEl.id === "takeoffStripContainer") {
    updateOrder("takeoffStripContainer", "departure");
  } else if (containerEl.id === "landingStripContainer") {
    updateOrder("landingStripContainer", "arrival");
  }
}

// 既存の update_order を使う（あなたのAPIに合わせて維持）
function updateOrder(containerId, type) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const newOrder = Array.from(container.querySelectorAll(".strip"))
    .map((el) => parseInt(el.dataset.id, 10))
    .filter((id) => Number.isFinite(id));

  console.log(`New order for ${type}s:`, newOrder);

  fetch(`${BASE_URL}/update_order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: type, // "departure" or "arrival"
      order: newOrder,
    }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json().catch(() => ({}));
    })
    .then((data) => console.log(`Order updated on server for ${type}s:`, data))
    .catch((error) =>
      console.error(`Error updating order on server for ${type}s:`, error)
    );
}

/** ====== wind（localStorage保持） ====== */
function getWind() {
  const dir = Number(document.getElementById("windDir")?.value);
  const spd = Number(document.getElementById("windSpd")?.value);
  return { dir, spd };
}

function initWindPersistence() {
  const dirEl = document.getElementById("windDir");
  const spdEl = document.getElementById("windSpd");
  if (!dirEl || !spdEl) return;

  const savedDir = localStorage.getItem("windDir");
  const savedSpd = localStorage.getItem("windSpd");
  if (savedDir !== null) dirEl.value = savedDir;
  if (savedSpd !== null) spdEl.value = savedSpd;

  const save = () => {
    localStorage.setItem("windDir", dirEl.value);
    localStorage.setItem("windSpd", spdEl.value);
  };
  dirEl.addEventListener("input", save);
  spdEl.addEventListener("input", save);

  // 例：確認ログ（任意）
  dirEl.addEventListener("change", () => console.log("wind:", getWind()));
}

/** ====== 非表示枚数（そのまま） ====== */
function updateHiddenStripCounts() {
  fetch(`${BASE_URL}/`)
    .then((response) => response.json())
    .then((allStrips) => {
      fetch(`${BASE_URL}/get_strips`)
        .then((response) => response.json())
        .then((visibleStrips) => {
          const allTakeoffIds = (allStrips.departures || []).map((s) => s.id);
          const visibleTakeoffIds = (visibleStrips.departures || []).map(
            (s) => s.id
          );
          const hiddenTakeoffCount = allTakeoffIds.filter(
            (id) => !visibleTakeoffIds.includes(id)
          ).length;

          const allLandingIds = (allStrips.arrivals || []).map((s) => s.id);
          const visibleLandingIds = (visibleStrips.arrivals || []).map(
            (s) => s.id
          );
          const hiddenLandingCount = allLandingIds.filter(
            (id) => !visibleLandingIds.includes(id)
          ).length;

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
