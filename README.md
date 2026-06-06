# 🇮🇸 아이슬란드 여행 일정 (2026.07.02 – 07.12)

인터랙티브 지도 + 스팟별 사진 · 운전시간 · 트레일 · 드론 가능여부 · 찜한 곳 · 숙박 위치가 담긴 여행 일정 페이지입니다.

## 보기
GitHub Pages로 호스팅됩니다 → `https://<유저명>.github.io/<repo이름>/`
(모바일 브라우저에서 열고 "홈 화면에 추가"하면 앱처럼 쓸 수 있어요.)

## 일정 수정하는 법 ✏️
**`data.js` 파일만 고치면 됩니다.** (GitHub 웹에서 연필 아이콘 → 수정 → Commit 하면 1~2분 뒤 자동 반영)

- `DAYS` — 날짜별 일정. 각 날: `stops`(스팟), `seg`(구간 이동), `trails`(트레일), `stay`(숙박)
  - 스팟 항목 필드: `n`(한글명) `e`(영문명=사진 연결키) `t`(종류: spot/trail/hotel/spring/airport/food) `c`([위도,경도]) `note` `dr`(드론: ok/permit/no) `drn`(드론 사유)
- `FAVORITES` — ⭐ 찜한 곳 마커
- `LODGING` — 🛏 숙박(H) 마커

### 사진 추가/교체
`images/` 폴더에 이미지를 넣고, `PHOTOS` 객체에 `"영문명(e:)": "images/파일명.jpg"` 추가.

## 구조
```
index.html   뼈대 (보통 안 건드림)
data.js      일정 데이터 ← 여기 수정
app.js       렌더링 로직 (보통 안 건드림)
styles.css   디자인
images/       스팟 사진
```

## 로컬에서 미리보기
```bash
cd iceland-trip
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000
```

## 메모
- 🚁 드론 배지는 현재(2025–2026) 규정 기준 가이드 — 실제 비행 전 island.is 드론 지도·현장 표지 확인, 출국 전 flydrone.is 등록
- 운전시간/거리·트레일 정보는 웹 검증 기반 추정치
- F-road(F208·F35)는 4x4 필수, 매일 road.is·safetravel.is 확인
