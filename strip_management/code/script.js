UserActivation = "use strict";

/** ====== 設定（URLだけまとめ） ====== */
const BASE_URL = "https://umiumi2002.github.io/strip/";

var request = new XMLHttpRequest();
request.open("GET", BASE_URL, true);
request.responseType = "json";

let flightdata = {};
request.onload = function () {
  flightdata = this.response || {};
  console.log("flightdata:", flightdata);

  initWindPersistence();
  initRunwayStatusButtons();
  initializeStrips();
  updateHiddenStripCounts();
};
request.send();

// 10秒ごとに画面をリロード（現状運用を踏襲）
setInterval(function () {
  location.reload();
}, 10000);

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

      // 全ゾーンを空にしてから作り直す（前回分の残留を防ぐ）
      getManagedZones().forEach((zone) => {
        zone.innerHTML = "";
      });

      // departure
      (data.departures || []).forEach((stripData) => {
        depContainer.appendChild(createStrip(stripData, "departure"));
      });

      // arrival
      (data.arrivals || []).forEach((stripData) => {
        arrContainer.appendChild(createStrip(stripData, "arrival"));
      });

      // コンテナ単位のD&Dを有効化（初回のみ）
      enableDnDForContainers();
      restoreIssuedState(data);
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
  const { id, name, model, runway, time, is_completed, runway_status } = data;

  const strip = document.createElement("div");
  strip.classList.add("strip");
  strip.draggable = true;

  strip.dataset.id = id;
  strip.dataset.type = type; // "departure" or "arrival"
  strip.dataset.runwayStatus = runway_status || "";

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
      <span class="runway-status-badge ${runway_status ? "" : "hidden"}">${
        RUNWAY_STATUS_LABELS[runway_status] || ""
      }</span>
      <div class="strip-buttons">
        <!--
        ${isArrivePanel ? `<button class="emergency-button">緊急</button>` : ""}
        <button class="check-button" data-id="${id}" data-type="${
          isArrivePanel ? "arrival" : "departure"
        }">${is_completed ? "取消" : "完了"}</button>
        <button class="delete-button" data-id="${id}" data-type="${
          isArrivePanel ? "arrival" : "departure"
        }">削</button>
        -->
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

  // TAKE OFF / LINE UP / LAND / GO AROUND / CANCEL ボタンを選択中に押すと、このストリップにステータスが付く/取れる
  strip.addEventListener("click", async (e) => {
    if (e.target.closest("button")) return;
    if (!selectedRunwayStatus) return;

    if (selectedRunwayStatus === "cancel") {
      applyRunwayStatus(strip, null);
      return;
    }

    if (selectedRunwayStatus === "goaround") {
      const alreadyGoAround = (strip.dataset.runwayStatus || null) === "goaround";
      await applyRunwayStatus(strip, alreadyGoAround ? null : "goaround");

      if (!alreadyGoAround) {
        // 緊急ボタンと同じ処理（到着キューに新しい便を追加）
        await addEmergencyStripToArrivals();
      }
      initializeStrips();
      updateHiddenStripCounts();
      return;
    }

    applyRunwayStatus(strip, selectedRunwayStatus);
  });

  /*
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
  */

  return strip;
}

/** ====== TAKE OFF / LINE UP / LAND / GO AROUND ステータス ======
 * 使い方：右端のボタンを押して選択 → ストリップを押すとそのステータスが付く
 * （同じボタン選択中に付与済みのストリップを押すと解除。CANCELは常に解除）
 * GO AROUNDのみ、付与時に緊急ボタンと同じ処理（到着キューへの追加）も行う
 */
const RUNWAY_STATUS_LABELS = {
  takeoff: "TAKE OFF",
  lineup: "LINE UP",
  land: "LAND",
  goaround: "GO AROUND",
};

let selectedRunwayStatus = null;

function initRunwayStatusButtons() {
  const buttons = Array.from(document.querySelectorAll(".bay-button"));

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const status = btn.dataset.status;
      selectedRunwayStatus = selectedRunwayStatus === status ? null : status;

      buttons.forEach((b) =>
        b.classList.toggle("active", b.dataset.status === selectedRunwayStatus)
      );
    });
  });
}

function setRunwayStatusBadge(strip, status) {
  const badge = strip.querySelector(".runway-status-badge");
  if (!badge) return;
  badge.textContent = RUNWAY_STATUS_LABELS[status] || "";
  badge.classList.toggle("hidden", !status);
}

async function applyRunwayStatus(strip, status) {
  const currentStatus = strip.dataset.runwayStatus || null;
  const newStatus = currentStatus === status ? null : status;

  strip.dataset.runwayStatus = newStatus || "";
  setRunwayStatusBadge(strip, newStatus);

  const airplaneId = parseInt(strip.dataset.id, 10);
  const airplaneType = strip.dataset.type;

  try {
    const response = await fetch(`${BASE_URL}/update_runway_status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: airplaneId,
        type: airplaneType,
        status: newStatus,
      }),
    });

    const resData = await response.json().catch(() => ({}));
    if (!response.ok) console.error("ステータス更新失敗:", resData);
    else console.log("ステータス更新成功:", resData);
  } catch (error) {
    console.error("ステータス更新エラー:", error);
  }
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

/** ====== D&D（ゾーン間の移動・並び替え） ====== */
let draggedElement = null;

// ドラッグ＆ドロップで扱う全ゾーン（IDがそのままサーバ保存時の lane 名になる）
const MANAGED_ZONE_IDS = [
  "takeoffStripContainer",
  "landingStripContainer",
  "combinedStripContainer",
  "runwayOccupancyContainer",
  "stripContainerMid",
];

function getManagedZones() {
  return MANAGED_ZONE_IDS.map((id) => document.getElementById(id)).filter(
    Boolean
  );
}

let dndZonesEnabled = false;

function enableDnDForContainers() {
  if (dndZonesEnabled) return; // initializeStrips()が再実行されても二重登録しない
  dndZonesEnabled = true;

  getManagedZones().forEach((zone) => {
    zone.addEventListener("dragover", handleZoneDragOver);
    zone.addEventListener("drop", handleZoneDrop);
  });
}

/** ====== ハンドオフ済みエリア：10秒滞在したら自動で消す ====== */
const HANDOFF_ZONE_ID = "stripContainerMid";
const HANDOFF_TIMEOUT_MS = 10000;
const handoffTimers = new Map(); // `${type}:${id}` -> timeoutId

function stripKey(el) {
  return `${el.dataset.type}:${el.dataset.id}`;
}

function clearHandoffTimer(key) {
  const existing = handoffTimers.get(key);
  if (existing) {
    clearTimeout(existing);
    handoffTimers.delete(key);
  }
}

function scheduleHandoffRemoval(strip, delayMs) {
  const key = stripKey(strip);
  clearHandoffTimer(key);
  const timeoutId = setTimeout(() => {
    handoffTimers.delete(key);
    removeStripPermanently(strip);
  }, Math.max(0, delayMs));
  handoffTimers.set(key, timeoutId);
}

async function removeStripPermanently(strip) {
  const airplaneId = parseInt(strip.dataset.id, 10);
  const airplaneType = strip.dataset.type;
  strip.remove();

  try {
    await fetch(`${BASE_URL}/remove_strip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: airplaneId, type: airplaneType }),
    });
  } catch (error) {
    console.error("ハンドオフ済み自動削除エラー:", error);
  }

  saveAllZonesState();
}

// ゾーンをまたいで移動した瞬間に、ハンドオフ済みエリアへの出入りを検知する
function handleZoneEntryForHandoff(strip, newZoneId) {
  const originZoneId = strip.dataset.originZoneId || "";
  if (newZoneId === originZoneId) return; // 同じゾーン内の並び替えは無視

  if (newZoneId === HANDOFF_ZONE_ID) {
    strip.dataset.handoffEnteredAt = String(Date.now());
    scheduleHandoffRemoval(strip, HANDOFF_TIMEOUT_MS);
  } else if (originZoneId === HANDOFF_ZONE_ID) {
    delete strip.dataset.handoffEnteredAt;
    clearHandoffTimer(stripKey(strip));
  }
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
  this.dataset.originZoneId = this.parentElement?.id || "";
  event.dataTransfer.effectAllowed = "move";
  this.classList.add("dragging");
}

function handleDragEnd() {
  this.classList.remove("dragging");
  draggedElement = null;

  // 移動後に全ゾーンの状態をサーバへ保存
  saveAllZonesState();
}

function handleZoneDragOver(e) {
  e.preventDefault();
  if (!draggedElement) return;

  const zone = e.currentTarget;
  const before = getBeforeElementInZone(zone, e.clientY, draggedElement);
  if (before) zone.insertBefore(draggedElement, before);
  else zone.appendChild(draggedElement);
}

function handleZoneDrop(e) {
  e.preventDefault();
  const zone = e.currentTarget;

  if (draggedElement) {
    handleZoneEntryForHandoff(draggedElement, zone.id);
  }

  saveAllZonesState();
}

/** ====== Touch D&D（コンテナ内並び替え専用） ====== */
let touchStartElement = null;
let touchDragging = false;

function getZoneFromPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  return el.closest(MANAGED_ZONE_IDS.map((id) => `#${id}`).join(", "));
}

function handleTouchStart(event) {
  if (event.target.tagName === "INPUT") return;
  if (event.target.closest("button")) return;

  touchStartElement = this;
  touchDragging = true;
  this.dataset.originZoneId = this.parentElement?.id || "";
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

  const finalZoneId = touchStartElement.parentElement?.id || "";
  handleZoneEntryForHandoff(touchStartElement, finalZoneId);

  touchStartElement.classList.remove("dragging");
  touchStartElement = null;
  touchDragging = false;

  saveAllZonesState();
}

/** ====== wind（localStorage保持） ====== */
function getWind() {
  const dir = Number(document.getElementById("windDir")?.value);
  const spd = Number(document.getElementById("windSpd")?.value);
  return { dir, spd };
}

// station: 1つ目は "dir"/"spd"、2つ目は "dir2"/"spd2" というキー名でサーバとやり取りする
const WIND_STATIONS = [
  { dirId: "windDir", spdId: "windSpd", dirKey: "dir", spdKey: "spd" },
  { dirId: "windDir2", spdId: "windSpd2", dirKey: "dir2", spdKey: "spd2" },
];

function initWindPersistence() {
  const stations = WIND_STATIONS.map((s) => ({
    ...s,
    dirEl: document.getElementById(s.dirId),
    spdEl: document.getElementById(s.spdId),
  })).filter((s) => s.dirEl && s.spdEl);

  if (stations.length === 0) return;

  fetch(`${BASE_URL}/get_wind`)
    .then((res) => res.json())
    .then((data) => {
      stations.forEach((s) => {
        if (data[s.dirKey] !== undefined) s.dirEl.value = data[s.dirKey];
        if (data[s.spdKey] !== undefined) s.spdEl.value = data[s.spdKey];
      });
    })
    .catch(() => {
      // サーバ失敗時はlocalStorageにフォールバック
      stations.forEach((s) => {
        const savedDir = localStorage.getItem(s.dirId);
        const savedSpd = localStorage.getItem(s.spdId);
        if (savedDir !== null) s.dirEl.value = savedDir;
        if (savedSpd !== null) s.spdEl.value = savedSpd;
      });
    });

  stations.forEach((s) => {
    const save = () => {
      localStorage.setItem(s.dirId, s.dirEl.value);
      localStorage.setItem(s.spdId, s.spdEl.value);
      fetch(`${BASE_URL}/update_wind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [s.dirKey]: s.dirEl.value,
          [s.spdKey]: s.spdEl.value,
        }),
      });
    };

    s.dirEl.addEventListener("input", save);
    s.spdEl.addEventListener("input", save);
  });
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

/** ====== 全ゾーンの現在の中身をサーバへ保存 ====== */
function saveAllZonesState() {
  const order = [];

  getManagedZones().forEach((zone) => {
    zone.querySelectorAll(".strip").forEach((el) => {
      const item = {
        id: parseInt(el.dataset.id, 10),
        type: el.dataset.type, // "departure" or "arrival"
        lane: zone.id,
      };

      if (zone.id === HANDOFF_ZONE_ID && el.dataset.handoffEnteredAt) {
        item.enteredAt = parseInt(el.dataset.handoffEnteredAt, 10);
      }

      order.push(item);
    });
  });

  fetch(`${BASE_URL}/update_order_mixed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order }),
  })
    .then(async (res) => {
      const text = await res.text();
      if (!res.ok) throw new Error(text || "update_order_mixed failed");
      return text;
    })
    .then((text) => console.log("✅ zones saved:", text))
    .catch((err) => console.error("❌ zones save error:", err));
}

/** ====== 保存済みの配置をゾーンへ復元 ====== */
function restoreIssuedState(data) {
  const mixed = Array.isArray(data?.mixed_order) ? data.mixed_order : [];
  if (mixed.length === 0) return;

  const zoneById = new Map(getManagedZones().map((z) => [z.id, z]));

  // ★ type:id で一意にする
  const keyOfEl = (el) => `${el.dataset.type}:${el.dataset.id}`;
  const all = new Map(
    Array.from(document.querySelectorAll(".strip")).map((el) => [keyOfEl(el), el])
  );

  mixed.forEach((item) => {
    if (!item) return;
    const zone = zoneById.get(item.lane);
    if (!zone) return;

    const key = `${item.type}:${item.id}`;
    const el = all.get(key);
    if (!el) return;

    if (item.lane === HANDOFF_ZONE_ID) {
      const enteredAt = item.enteredAt || Date.now();
      const elapsed = Date.now() - enteredAt;

      if (elapsed >= HANDOFF_TIMEOUT_MS) {
        // すでに10秒経過している → 復元せず削除する
        removeStripPermanently(el);
        return;
      }

      el.dataset.handoffEnteredAt = String(enteredAt);
      scheduleHandoffRemoval(el, HANDOFF_TIMEOUT_MS - elapsed);
    }

    el.dataset.originZoneId = item.lane;
    zone.appendChild(el);
  });
}