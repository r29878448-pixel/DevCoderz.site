const BASE_URL = "https://mtaiirusapi.onrender.com";
const FALLBACK_IMG = "https://devcoderz.vercel.app/pw.png";
const searchParams = new URLSearchParams(window.location.search);
const batchId = searchParams.get("BatchId") || "";
const subjectSlug = searchParams.get("Subjectslug") || "";
const topicSlug = searchParams.get("topicslug") || "";
const topicName = searchParams.get("topicName") || "Chapter";
const subjectId = searchParams.get("SubjectId") || "";

const pageTitle = document.getElementById("pageTitle");
const topicHeading = document.getElementById("topicHeading");
const topicSub = document.getElementById("topicSub");
const sectionTitle = document.getElementById("sectionTitle");
const sectionCount = document.getElementById("sectionCount");
const contentArea = document.getElementById("contentArea");
const themeBtn = document.getElementById("themeBtn");

const pdfSheetBackdrop = document.getElementById("pdfSheetBackdrop");
const pdfSheetTitle = document.getElementById("pdfSheetTitle");
const pdfOpenBtn = document.getElementById("pdfOpenBtn");
const pdfViewBtn = document.getElementById("pdfViewBtn");
const pdfDownloadBtn = document.getElementById("pdfDownloadBtn");
const pdfCloseBtn = document.getElementById("pdfCloseBtn");
const notesListSheetBackdrop = document.getElementById("notesListSheetBackdrop");
const notesListSheetTitle = document.getElementById("notesListSheetTitle");
const notesListContent = document.getElementById("notesListContent");
const notesListCloseBtn = document.getElementById("notesListCloseBtn");
const videoSheetBackdrop = document.getElementById("videoSheetBackdrop");
const videoSheetTitle = document.getElementById("videoSheetTitle");
const playAppleBtn = document.getElementById("playAppleBtn");
const playAndroidBtn = document.getElementById("playAndroidBtn");
const videoCloseBtn = document.getElementById("videoCloseBtn");

let activeTab = "lectures";
let loading = false;
let currentPdf = null;
let currentVideo = null;
const cache = { lectures: null, notes: null, dpp: null, dppVideos: null, dppQuiz: null };

function escapeHtml(str) { return String(str || "").replace(/[&<>"']/g, function (m) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]; }); }
function formatDate(value) { if (!value) return "Date not available"; try { return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); } catch { return "Date not available"; } }
function applyTheme(mode) { const dark = mode === "dark"; document.body.classList.toggle("dark", dark); themeBtn.textContent = dark ? "☀️ Day Mode" : "🌙 Night Mode"; localStorage.setItem("topic-theme", dark ? "dark" : "light"); }
themeBtn.addEventListener("click", () => applyTheme(document.body.classList.contains("dark") ? "light" : "dark"));
applyTheme(localStorage.getItem("topic-theme") || "light");

pageTitle.textContent = topicName;
topicHeading.textContent = topicName;
topicSub.textContent = topicSlug === "all-contents" ? "Showing content from all topics" : `Topic code: ${topicSlug || "N/A"}`;

async function importAesKey(keyText) { const input = new TextEncoder().encode(keyText); const fixed = new Uint8Array(32); for (let i = 0; i < 32; i++) fixed[i] = i < input.length ? input[i] : 0; return crypto.subtle.importKey("raw", fixed, { name: "AES-GCM", length: 256 }, false, ["decrypt"]); }
function hexToBytes(hex) { return new Uint8Array(hex.match(/.{1,2}/g).map(x => parseInt(x, 16))); }
async function decryptPayload(payload) { try { if (typeof payload !== "string") return { success: true, data: payload }; const [ivHex, dataHex] = String(payload).split(":"); if (!ivHex || !dataHex) throw new Error("Invalid format"); const iv = hexToBytes(ivHex); const encrypted = hexToBytes(dataHex); const key = await importAesKey("maggikhalo"); const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted); return JSON.parse(new TextDecoder().decode(decrypted)); } catch (err) { return { success: false, error: err.message }; } }
async function fetchJson(url) { const res = await fetch(url); if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); }
async function fetchAndDecrypt(url) { const json = await fetchJson(url); if (!json.data) return null; const decrypted = await decryptPayload(json.data); return decrypted.success ? decrypted.data : null; }

function showLoading() { contentArea.innerHTML = `<div class="loading"><h3>Loading...</h3><p>Fetching content...</p></div>`; sectionCount.textContent = "Loading..."; }
function showError(msg) { contentArea.innerHTML = `<div class="error"><h3>Something went wrong</h3><p>${escapeHtml(msg)}</p></div>`; sectionCount.textContent = "Error"; }
function showEmpty(msg) { contentArea.innerHTML = `<div class="empty"><h3>No content</h3><p>${escapeHtml(msg)}</p></div>`; sectionCount.textContent = "0 items"; }

function renderItems(items) {
    sectionCount.textContent = `${items.length} item${items.length === 1 ? "" : "s"}`;
    if (!items.length) return showEmpty("No content found.");
    if (activeTab === "lectures" || activeTab === "dppVideos") {
        contentArea.innerHTML = `<div class="grid lecture-grid">${items.map(item => `
            <div class="card">
                <div class="lecture-thumb">
                    <img src="${escapeHtml(item.thumbnail)}" alt="${escapeHtml(item.topic)}" onerror="this.src='${FALLBACK_IMG}'"/>
                    <div class="badge">${activeTab === "lectures" ? "Lecture" : "DPP Video"}</div>
                </div>
                <div class="card-body">
                    <div class="meta-line">📅 ${escapeHtml(formatDate(item.date))}</div>
                    <div class="title">${escapeHtml(item.topic)}</div>
                    <div class="info-row"><div>⏱ ${escapeHtml(item.duration)}</div></div>
                    <div class="actions">
                        <button class="btn primary" onclick="openVideoSheet('${escapeHtml(item._id)}')">Play Now</button>
                        <button class="btn secondary" onclick="openNotesList('${escapeHtml(item._id)}')">📝 Notes</button>
                    </div>
                </div>
            </div>`).join("")}</div>`;
    } else {
        contentArea.innerHTML = `<div class="grid doc-grid">${items.map(item => `
            <div class="card"><div class="doc-item"><div class="doc-left"><div class="doc-icon">📄</div>
            <div><div class="doc-title">${escapeHtml(item.topic)}</div><div class="doc-sub">Document</div></div></div>
            <div class="actions" style="min-width:160px; justify-content:flex-end;"><button class="btn" onclick="openPdfSheet('${escapeHtml(item._id)}')">Open</button></div></div></div>`).join("")}</div>`;
    }
}

async function fetchContent(tab) {
    if (!batchId || !subjectSlug || !topicSlug) return showError("Missing parameters.");
    if (cache[tab] !== null) { renderItems(cache[tab]); return; }
    loading = true; showLoading();
    let contentType = { lectures: "videos", dppVideos: "dppVideos", dppQuiz: "DPP_QUIZ", notes: "notes", dpp: "dpp" }[tab];
    try {
        const data = await fetchAndDecrypt(`${BASE_URL}/api/pw/datacontent?batchId=${encodeURIComponent(batchId)}&subjectSlug=${encodeURIComponent(subjectSlug)}&topicSlug=${encodeURIComponent(topicSlug)}&contentType=${encodeURIComponent(contentType)}`);
        const items = (data || []).map(item => ({ ...item, thumbnail: item?.videoDetails?.image || item.previewImage || FALLBACK_IMG, duration: item?.videoDetails?.duration || item.duration || "N/A" }));
        cache[tab] = items; renderItems(items);
    } catch (err) { showError(err.message); } finally { loading = false; }
}

function setTab(tab) {
    activeTab = tab;
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
    fetchContent(tab);
}

document.querySelectorAll(".tab-btn").forEach(btn => btn.addEventListener("click", () => setTab(btn.dataset.tab)));

function openVideoSheet(id) {
    const item = cache[activeTab]?.find(x => String(x._id) === String(id));
    if (!item) return;
    currentVideo = item;
    videoSheetTitle.textContent = item.topic;
    videoSheetBackdrop.classList.add("show");
}

function playVideo(mode) {
    if (!currentVideo) return;
    const target = "/study-v2/player";
    const sSlug = currentVideo.subjectSlug || subjectSlug;
    const tSlug = currentVideo.topicSlug || topicSlug;
    window.location.href = `${target}?video_id=${encodeURIComponent(currentVideo.findKey || currentVideo._id)}&subject_slug=${encodeURIComponent(sSlug)}&batch_id=${encodeURIComponent(batchId)}&schedule_id=${encodeURIComponent(currentVideo._id)}&subject_id=${encodeURIComponent(subjectId || subjectSlug)}&topicSlug=${encodeURIComponent(tSlug)}`;
}

playAndroidBtn.addEventListener("click", () => playVideo("android"));
videoCloseBtn.addEventListener("click", () => videoSheetBackdrop.classList.remove("show"));
setTab("lectures");
