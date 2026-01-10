# 🔧 Google Apps Script 연동 가이드 (초보자용)

## 📌 개요
Google Apps Script를 사용하면 **무료로** 백엔드 서버를 만들 수 있습니다.  
데이터는 Google 스프레드시트에 저장됩니다.

**소요 시간**: 약 15분

---

## 📊 1단계: Google 스프레드시트 생성

1. [Google Sheets](https://sheets.google.com) 접속 (Google 로그인 필요)
2. **+** 버튼 클릭하여 새 스프레드시트 생성
3. 이름을 `갈맷길100M_데이터`로 변경

### 📋 시트 탭 만들기

하단의 시트 탭에서 **+** 버튼을 눌러 다음 6개의 시트를 만드세요:

| 시트 이름 | 용도 |
|-----------|------|
| Config | 대회 설정 |
| Notices | 공지사항 |
| Checkpoints | 체크포인트 |
| Registrations | 참가 신청 |
| Results | 대회 결과 |
| Carpool | 카풀/숙소 |

---

## 📝 2단계: 각 시트에 헤더 추가

### Config 시트
| A | B |
|---|---|
| key | value |
| eventDate | 2026-04-25 |
| eventName | 부산 갈맷길 100M |
| registrationOpen | true |
| maxParticipants | 500 |

### Notices 시트
| A | B | C | D |
|---|---|---|---|
| id | date | title | content |

### Checkpoints 시트
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| id | name | km | cutoff | lat | lon |
| 1 | 출발 (낙동강 하구) | 0 | 04:00 | 35.0475 | 128.9645 |
| 2 | CP1 을숙도 | 15 | 07:00 | 35.0850 | 128.9720 |
| ... | ... | ... | ... | ... | ... |

### Registrations 시트
| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| id | name | phone | birth | course | status | createdAt | bloodType |

### Results 시트
| A | B | C | D | E | F |
|---|---|---|---|---|---|
| bib | name | phone_last4 | course | time | rank |

### Carpool 시트
| A | B | C | D | E |
|---|---|---|---|---|
| id | type | origin | contact | seats |

---

## ⚙️ 3단계: Apps Script 열기

1. 스프레드시트 상단 메뉴: **확장 프로그램** → **Apps Script** 클릭
2. 새 탭에서 Apps Script 에디터가 열립니다
3. 기본 `Code.gs` 파일이 보입니다

---

## 📋 4단계: 코드 복사/붙여넣기

1. `Code.gs` 파일의 기존 내용을 **모두 삭제**
2. 프로젝트 폴더의 `Code.gs` 파일 내용을 **전체 복사**
   - 경로: `C:\Users\USER\Desktop\Busan100\Code.gs`
3. Apps Script 에디터에 **붙여넣기**
4. **Ctrl + S** 눌러 저장

---

## 🚀 5단계: 웹 앱으로 배포

1. 우측 상단 **배포** 버튼 클릭 → **새 배포**
2. **유형 선택**에서 톱니바퀴(⚙️) 클릭 → **웹 앱** 선택
3. 설정:
   - 설명: `갈맷길 100M API`
   - 실행할 사용자: **나**
   - 액세스 권한: **모든 사용자** ⚠️ 중요!
4. **배포** 버튼 클릭
5. **액세스 승인** 클릭 → Google 계정 선택
6. "Google에서 확인하지 않은 앱입니다" 경고가 나오면:
   - **고급** 클릭 → **~(으)로 이동(안전하지 않음)** 클릭
7. **허용** 클릭

---

## 🔗 6단계: API URL 복사

배포 완료 후 표시되는 **웹 앱 URL**을 복사하세요:

```
https://script.google.com/macros/s/AKfy.../exec
```

---

## 🔧 7단계: 프론트엔드에 URL 연결

1. `js/app.js` 파일 열기
2. 상단의 설정 수정:

```javascript
const USE_MOCK = false;  // true → false로 변경
const API_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';  // 복사한 URL
```

3. 저장 후 GitHub에 업로드

---

## ✅ 완료!

이제 사이트에서:
- 참가 신청 → 스프레드시트에 저장
- 결과 조회 → 스프레드시트에서 검색
- 공지사항 → 스프레드시트에서 불러오기

모든 데이터가 Google 스프레드시트에서 관리됩니다! 📊

---

## ❓ 문제 해결

| 문제 | 해결책 |
|------|--------|
| CORS 에러 | 액세스 권한을 "모든 사용자"로 설정했는지 확인 |
| 권한 에러 | 배포 시 "액세스 승인" 완료했는지 확인 |
| 데이터 안 보임 | 스프레드시트 시트 이름이 정확한지 확인 |
