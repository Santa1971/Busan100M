# 🔧 Google Apps Script 연동 가이드

## 📌 개요
Google Apps Script를 사용하면 **무료로** 백엔드 서버를 만들 수 있습니다.  
데이터는 Google 스프레드시트에 저장됩니다.

**소요 시간**: 약 15분

---

## 📊 1단계: Google 스프레드시트 생성

1. [Google Sheets](https://sheets.google.com) 접속 (Google 로그인 필요)
2. **+** 버튼 클릭하여 새 스프레드시트 생성
3. 이름을 `갈맷길100M_데이터`로 변경
4. URL에서 **스프레드시트 ID** 복사 (나중에 사용)
   ```
   https://docs.google.com/spreadsheets/d/[이 부분이 ID]/edit
   ```

---

## 📋 2단계: 시트 자동 생성 (권장)

> 💡 `setupSpreadsheet()` 함수를 실행하면 모든 시트가 자동 생성됩니다!

수동으로 생성하려면 아래 **9개 시트**를 만드세요:

| 시트 이름 | 용도 |
|-----------|------|
| **Config** | 대회 설정, 카카오톡 링크 등 |
| **Notices** | 공지사항 |
| **Checkpoints** | 체크포인트 + 컷오프 |
| **Schedule** | 대회 일정 |
| **Registrations** | 참가 신청 (자동 저장) |
| **Results** | 대회 결과 |
| **Carpool** | 카풀/숙소 공유 |
| **Emergency** | SOS 긴급 신호 (자동 저장) |
| **Cheers** | 응원 메시지 (실시간 마키) |

---

## 📝 3단계: 각 시트 헤더 및 데이터

### 1️⃣ Config 시트
| Key | Value |
|-----|-------|
| eventDate | 2026-03-01 |
| eventName | 부산 갈맷길 100M |
| kakaoLink | https://open.kakao.com/o/gXXXXXXX |
| registrationOpen | true |
| maxParticipants | 500 |

### 2️⃣ Checkpoints 시트
| id | name | km | cutoff | lat | lon |
|----|------|-----|--------|-----|-----|
| 1 | 출발 (다대포해수욕장) | 0 | 16:00 | 35.0465 | 128.9660 |
| 2 | CP1 화명생태공원 | 20 | 19:00 | 35.2103 | 129.0156 |
| 3 | CP2 기장군청 | 45 | 23:00 | 35.2447 | 129.2222 |
| 4 | CP3 해운대해수욕장 | 60 | 02:00 | 35.1587 | 129.1604 |
| 5 | CP4 송도해수욕장 | 80 | 05:00 | 35.0753 | 129.0237 |
| 6 | 완주 (다대포해수욕장) | 100 | 10:00 | 35.0465 | 128.9660 |

### 3️⃣ Schedule 시트
| id | time | title | location | icon |
|----|------|-------|----------|------|
| 1 | 15:00 | 접수 개시 | 다대포해수욕장 | 📋 |
| 2 | 16:00 | 100M 출발 | 다대포해수욕장 | 🏃 |
| 3 | 10:00 (+1일) | 완주 마감 | 다대포해수욕장 | 🏁 |
| 4 | 11:00 (+1일) | 시상식 | 다대포해수욕장 | 🏆 |

### 4️⃣ Cheers 시트 (응원메시지 - 실시간)
| message | name | timestamp |
|---------|------|-----------|
| 아빠 화이팅! 완주하세요! 💪 | 딸 | 2026-01-10 |
| 부산 갈맷길 최고! 🏔️ | 응원단 | 2026-01-10 |
| 100M 도전자들 모두 힘내세요! 🔥 | 러너 | 2026-01-10 |

> ⚡ 30초마다 자동 새로고침! 실시간으로 메시지 추가/수정 가능

### 5️⃣ Notices 시트
| id | date | title | content | image_url |
|----|------|-------|---------|-----------|
| 1 | 2026-01-09 | 참가신청 오픈! | 내용... | |

### 6️⃣ Registrations 시트 (자동 생성)
| timestamp | name | birth | phone | course | bloodType | emergencyContact | emergencyPhone | status |
|-----------|------|-------|-------|--------|-----------|------------------|----------------|--------|

### 7️⃣ Results 시트
| bib | name | phone_last4 | course | time | rank |
|-----|------|-------------|--------|------|------|
| 001 | 김철수 | 1234 | 100M | 12:34:56 | 1 |

### 8️⃣ Carpool 시트
| id | type | origin | contact | seats | time | password |
|----|------|--------|---------|-------|------|----------|

### 9️⃣ Emergency 시트 (자동 생성)
| timestamp | lat | lon | status |
|-----------|-----|-----|--------|

---

## ⚙️ 4단계: Apps Script 설정

1. 스프레드시트 상단 메뉴: **확장 프로그램** → **Apps Script** 클릭
2. 기본 `Code.gs` 파일의 내용을 **모두 삭제**
3. 프로젝트의 `Code.gs` 파일 내용을 **전체 복사**하여 붙여넣기
4. **9번째 줄**의 `YOUR_SPREADSHEET_ID`를 실제 스프레드시트 ID로 변경:
   ```javascript
   const SPREADSHEET_ID = '1ABC...xyz';  // 실제 ID로 변경
   ```
5. **Ctrl + S** 저장

### 📋 시트 자동 생성
1. 상단 드롭다운에서 `setupSpreadsheet` 선택
2. **▶ 실행** 버튼 클릭
3. 권한 승인 (최초 1회)
4. 모든 시트가 자동 생성됨!

---

## 🚀 5단계: 웹 앱으로 배포

1. 우측 상단 **배포** → **새 배포**
2. **유형 선택** ⚙️ → **웹 앱** 선택
3. 설정:
   - 설명: `갈맷길 100M API`
   - 실행할 사용자: **나**
   - 액세스 권한: **모든 사용자** ⚠️ 중요!
4. **배포** 클릭 → **액세스 승인** → Google 계정 선택
5. "확인되지 않은 앱" 경고: **고급** → **~로 이동** 클릭
6. **허용** 클릭

---

## 🔗 6단계: 프론트엔드 연결

1. `js/app.js` 파일 열기
2. 상단 설정 수정:

```javascript
const USE_MOCK = false;  // true → false
const API_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';  // 배포 URL
```

3. 저장 후 GitHub/Vercel에 업로드

---

## 📡 API 엔드포인트 요약

| Action | 기능 | 메서드 |
|--------|------|--------|
| `getConfig` | 설정 조회 | GET |
| `getCheckpoints` | 체크포인트/컷오프 | GET |
| `getSchedule` | 대회 일정 | GET |
| `getCheers` | 응원 메시지 | GET |
| `getNotices` | 공지사항 | GET |
| `getCarpool` | 카풀/숙소 | GET |
| `checkStatus` | 신청현황 조회 | GET |
| `getResult` | 결과 조회 | GET |
| `register` | 참가 신청 | POST |
| `submitSOS` | SOS 신호 | POST |

---

## ✅ 완료!

이제 사이트에서:
- ✅ 참가 신청 → 스프레드시트에 저장
- ✅ 결과 조회 → 스프레드시트에서 검색
- ✅ 공지사항/일정 → 스프레드시트에서 불러오기
- ✅ 응원 메시지 → 30초마다 실시간 업데이트
- ✅ 카카오톡 링크 → Config에서 관리

---

## ❓ 문제 해결

| 문제 | 해결책 |
|------|--------|
| CORS 에러 | 액세스 권한을 "모든 사용자"로 설정 |
| 권한 에러 | 배포 시 "액세스 승인" 완료 확인 |
| 데이터 안 보임 | 시트 이름이 정확한지 확인 (대소문자 구분) |
| 응원메시지 안 나옴 | Cheers 시트에 데이터가 있는지 확인 |
| 카카오톡 링크 안 됨 | Config 시트의 `kakaoLink` 값 확인 |
