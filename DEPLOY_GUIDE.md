# 🚀 GitHub Pages 배포 가이드 (초보자용)

## 📌 개요
GitHub Pages는 **무료**로 웹사이트를 호스팅할 수 있는 서비스입니다.  
이 가이드를 따라하면 약 **10분** 안에 사이트를 배포할 수 있습니다.

---

## 🔐 1단계: GitHub 계정 만들기 (이미 있으면 건너뛰기)

1. [github.com](https://github.com) 접속
2. **Sign up** 클릭
3. 이메일, 비밀번호, 사용자명 입력
4. 이메일 인증 완료

---

## 📁 2단계: 새 저장소(Repository) 만들기

1. GitHub 로그인 후 우측 상단 **+** 버튼 클릭
2. **New repository** 선택
3. 아래와 같이 입력:

| 항목 | 입력값 |
|------|--------|
| Repository name | `busan-100m` (원하는 이름) |
| Description | 부산 갈맷길 100M 공식 웹사이트 |
| Public/Private | ✅ **Public** 선택 |
| Add README | ❌ 체크 해제 |

4. **Create repository** 버튼 클릭

---

## ⬆️ 3단계: 파일 업로드

### 방법 A: 웹에서 직접 업로드 (쉬움 ⭐)

1. 생성된 저장소 페이지에서 **"uploading an existing file"** 클릭
2. `Busan100` 폴더 안의 모든 파일/폴더를 드래그앤드롭:
   ```
   📁 Busan100
   ├── index.html
   ├── course.html
   ├── schedule.html
   ├── registration.html
   ├── notices.html
   ├── community.html
   ├── results.html
   ├── 📁 css/
   ├── 📁 js/
   ├── 📁 assets/
   └── 📁 public/
   ```
3. 아래쪽 **Commit changes** 버튼 클릭

> ⚠️ **주의**: 폴더째로 업로드하지 말고, 폴더 **안의 내용물**을 업로드하세요!

---

## 🌐 4단계: GitHub Pages 활성화

1. 저장소 페이지에서 **Settings** (⚙️) 탭 클릭
2. 왼쪽 메뉴에서 **Pages** 클릭
3. **Source** 섹션에서:
   - Branch: `main` 선택
   - Folder: `/ (root)` 선택
4. **Save** 버튼 클릭

---

## ⏳ 5단계: 배포 완료 확인

1. 1~2분 기다리기 (자동 빌드 중)
2. 페이지 새로고침
3. 상단에 표시되는 URL 확인:
   ```
   🔗 https://[사용자명].github.io/busan-100m/
   ```
4. 링크 클릭하여 사이트 확인!

---

## ✅ 완료!

이제 전 세계 누구나 위 URL로 사이트에 접속할 수 있습니다.

### 🔧 수정이 필요할 때
1. 저장소에서 파일 클릭
2. ✏️ 연필 아이콘 클릭 (Edit)
3. 수정 후 **Commit changes** 클릭
4. 1~2분 후 자동 반영

---

## ❓ 문제 해결

| 문제 | 해결책 |
|------|--------|
| 404 에러 | `index.html` 파일이 저장소 루트에 있는지 확인 |
| 스타일 깨짐 | `css/` 폴더가 제대로 업로드되었는지 확인 |
| 이미지 안 보임 | `assets/` 폴더 업로드 확인 |
