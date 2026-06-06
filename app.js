// ===== 렌더링 로직 (보통 손댈 필요 없음) =====
// 데이터는 data.js 에 있습니다.

// ---------- 일정 데이터 ----------
// type: spot|hotel|trail|spring|food|airport

const ICON = {airport:"✈️",spot:"📍",hotel:"🛏️",trail:"🥾",spring:"♨️",food:"🍴"};
const DR = {ok:"가능",permit:"허가/조건부",no:"금지"};

// ---------- 지도 ----------
const map = L.map('map',{scrollWheelZoom:true}).setView([64.9,-18.6],6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:17, attribution:'© OpenStreetMap'}).addTo(map);

const dayLayers = [];   // per-day layer group
const allBounds = [];

DAYS.forEach((D, di)=>{
  const grp = L.layerGroup().addTo(map);
  const pts = [];
  D.stops.forEach((s, si)=>{
    allBounds.push(s.c); pts.push(s.c);
    const icon = L.divIcon({className:'', html:`<div class="num" style="background:${D.color}">${si+1}</div>`,
       iconSize:[22,22], iconAnchor:[11,11]});
    const gm = `https://www.google.com/maps/search/?api=1&query=${s.c[0]},${s.c[1]}`;
    L.marker(s.c,{icon}).addTo(grp).bindPopup(
      `<b>${ICON[s.t]||"📍"} ${s.n}</b><br><span style="color:#777">${s.e}</span>`+
      (s.note?`<br>${s.note}`:``)+
      (s.dr?`<br>🚁 드론 <b style="color:${s.dr==='ok'?'#2a8':s.dr==='permit'?'#c80':'#c33'}">${DR[s.dr]}</b> — ${s.drn||''}`:``)+
      `<br><a href="${gm}" target="_blank">Google Maps에서 열기 ↗</a>`);
  });
  // 연결 polyline (당일 + 전날 마지막 → 당일 첫 스팟)
  if(di>0){ const prev = DAYS[di-1].stops; if(prev.length) pts.unshift(prev[prev.length-1].c); }
  if(pts.length>1) L.polyline(pts,{color:D.color,weight:3.5,opacity:.85}).addTo(grp);
  dayLayers.push(grp);
});
map.fitBounds(allBounds,{padding:[30,30]});

// ---------- 필터 칩 ----------
const fbox = document.getElementById('filters');
const allChip = mkChip("전체", "#bbb", ()=>toggleAll());
fbox.appendChild(allChip);
DAYS.forEach((D,di)=>{
  const chip = mkChip(`${D.day}`, D.color, ()=>{ chip.classList.toggle('off'); refresh(); });
  chip.dataset.di = di; fbox.appendChild(chip);
});
function mkChip(label,color,onclick){
  const c=document.createElement('div'); c.className='chip';
  c.innerHTML=`<span class="dot" style="background:${color}"></span>${label}`;
  c.onclick=onclick; return c;
}
let allOn=true;
function toggleAll(){ allOn=!allOn; document.querySelectorAll('.chip[data-di]').forEach(c=>c.classList.toggle('off',!allOn)); refresh(); }
function refresh(){
  document.querySelectorAll('.chip[data-di]').forEach(c=>{
    const di=+c.dataset.di, on=!c.classList.contains('off');
    if(on){ if(!map.hasLayer(dayLayers[di])) dayLayers[di].addTo(map); }
    else map.removeLayer(dayLayers[di]);
  });
}

// ---------- 일자 카드 ----------
const dbox=document.getElementById('days');
DAYS.forEach((D,di)=>{
  const el=document.createElement('div'); el.className='day'+(di===0?' open':'');
  el.style.setProperty('--c',D.color);
  const gmDir = "https://www.google.com/maps/dir/"+D.stops.map(s=>s.c.join(",")).join("/");
  el.innerHTML=`
    <div class="day-h" style="--c:${D.color}">
      <span class="date">${D.day}</span>
      <span class="ttl">${D.title}</span>
      <span class="drive">${D.drive}</span>
      <span class="caret">▶</span>
    </div>
    <div class="day-b">
      ${D.notice?`<div class="note">${D.notice}</div>`:``}
      <div class="gallery">${D.stops.map((s,i)=>cardHTML(s,i,D.color)).join("")}</div>
      <h4>구간 이동</h4>
      <table><thead><tr><th>구간</th><th>거리</th><th>시간</th><th>비고</th></tr></thead><tbody>
        ${D.seg.map(g=>`<tr><td>${g.f==="→"?"↳ ":g.f+" → "}${g.t}</td><td>${g.d}</td>
           <td class="${g.warn?'warn':''}">${g.m}</td><td>${g.note||""}</td></tr>`).join("")}
      </tbody></table>
      ${D.trails.length?`<h4>트레일</h4>`+D.trails.map(t=>`
        <div class="trail"><div class="tn">${t.nm}</div><div class="st">${t.st}</div>
        <div class="ds">${t.ds}</div><div class="tp">${t.tp}</div>
        ${t.links?`<div class="tlinks">${t.links.map(l=>`<a href="${l.u}" target="_blank">${l.t} ↗</a>`).join("")}</div>`:``}</div>`).join(""):``}
      <div class="meta"><span class="pill">🛏 숙박 <b>${D.stay}</b></span></div>
      <a class="gm" href="${gmDir}" target="_blank">🗺️ 이 날 경로 Google Maps로 열기 ↗</a>
    </div>`;
  el.querySelector('.day-h').onclick=()=>el.classList.toggle('open');
  dbox.appendChild(el);
});

function cardHTML(s,i,color){
  const gm=`https://www.google.com/maps/search/?api=1&query=${s.c[0]},${s.c[1]}`;
  const img=PHOTOS[s.e];
  const phStyle = img ? `background-image:url('${img}');color:transparent`
                      : `background:${color}22`;
  const badgeColor = img ? ';color:#fff' : '';
  return `<a class="card" href="${gm}" target="_blank">
     <div class="ph" style="${phStyle}">${ICON[s.t]||"📍"}
       <span class="badge" style="background:${color}cc${badgeColor}">${i+1}</span>
       ${s.dr?`<span class="dbadge dr-${s.dr}" title="${s.drn||''}">🚁 ${DR[s.dr]}</span>`:``}</div>
     <div class="nm">${ICON[s.t]||""} ${s.n}</div><div class="en">${s.e}</div>
     ${s.dr?`<div class="dline dr-${s.dr}">🚁 ${s.drn||DR[s.dr]}</div>`:``}</a>`;
}

// ---------- 범례 ----------
document.getElementById('legend').innerHTML =
  "마커: " + Object.entries(ICON).map(([k,v])=>`${v} ${({airport:'공항',spot:'명소',hotel:'숙박',trail:'트레킹',spring:'온천',food:'맛집'})[k]}`).join(" · ") + " · ⭐ 찜한 곳(Google 저장) · 🅷 숙박 · 🚁 드론 가능/허가/금지";

// ========== ⭐ 찜한 곳 (Google 저장 목록) ==========

const favLayer = L.layerGroup().addTo(map);
FAVORITES.forEach(f=>{
  const icon=L.divIcon({className:'',html:'<div class="star">⭐</div>',iconSize:[22,22],iconAnchor:[11,11]});
  const gm=`https://www.google.com/maps/search/?api=1&query=${f.c[0]},${f.c[1]}`;
  L.marker(f.c,{icon}).addTo(favLayer).bindPopup(
    `<b>⭐ ${f.n}</b><br><span style="color:#777">${f.cat==='near'?'동선 근처':'우회 필요'}${f.note?' · '+f.note:''}</span>`+
    `<br><a href="${gm}" target="_blank">Google Maps ↗</a>`);
});
const favChip = mkChip("⭐ 찜한 곳", "#ffd34d", ()=>{
  favChip.classList.toggle('off');
  if(favChip.classList.contains('off')) map.removeLayer(favLayer); else favLayer.addTo(map);
});
fbox.appendChild(favChip);

function favRow(f){
  const gm=`https://www.google.com/maps/search/?api=1&query=${f.c[0]},${f.c[1]}`;
  return `<a class="favrow" href="${gm}" target="_blank">⭐ <b>${f.n}</b> <span>${f.note||""}</span></a>`;
}
const near=FAVORITES.filter(f=>f.cat==='near'), det=FAVORITES.filter(f=>f.cat==='detour');
const favCard=document.createElement('div');
favCard.className='day'; favCard.style.setProperty('--c','#ffd34d');
favCard.innerHTML=`
  <div class="day-h" style="--c:#ffd34d">
    <span class="date">⭐</span>
    <span class="ttl">찜한 곳 (Google 저장) — 동선 근처 ${near.length} · 우회 ${det.length}</span>
    <span class="drive">지도 칩으로 on/off</span><span class="caret">▶</span>
  </div>
  <div class="day-b">
    <h4>동선 근처 (살짝 추가 가능)</h4>${near.map(favRow).join("")}
    <h4>우회 필요 (별도 일정)</h4>${det.map(favRow).join("")}
  </div>`;
favCard.querySelector('.day-h').onclick=()=>favCard.classList.toggle('open');
dbox.appendChild(favCard);

// ========== 🛏 숙박 위치 (H 마커) ==========

const lodgeLayer = L.layerGroup().addTo(map);
LODGING.forEach(l=>{
  const icon=L.divIcon({className:'',html:'<div class="lodge">H</div>',iconSize:[22,22],iconAnchor:[11,11]});
  const gm=`https://www.google.com/maps/search/?api=1&query=${l.c[0]},${l.c[1]}`;
  L.marker(l.c,{icon}).addTo(lodgeLayer).bindPopup(
    `<b>🛏 ${l.d} 숙박</b><br>${l.n}`+(l.note?`<br><span style="color:#777">${l.note}</span>`:``)+
    `<br><a href="${gm}" target="_blank">Google Maps ↗</a>`);
});
const lodgeChip = mkChip("🛏 숙박(H)", "#5a8bb0", ()=>{
  lodgeChip.classList.toggle('off');
  if(lodgeChip.classList.contains('off')) map.removeLayer(lodgeLayer); else lodgeLayer.addTo(map);
});
fbox.appendChild(lodgeChip);
