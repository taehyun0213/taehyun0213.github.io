# Taehyun Kim — 학술 홈페이지

영어 기본 페이지와 한국어 페이지를 갖춘 GitHub Pages용 홈페이지입니다. 설치해야 할 웹 프레임워크나 유료 서비스는 없습니다.

## 현재 공개 주소

- 영어: https://taehyun0213.github.io/
- 한국어: https://taehyun0213.github.io/ko/
- 내용 편집: https://taehyun0213.github.io/edit.html

홈페이지는 로그인 없이 누구나 접근할 수 있습니다. 소스 저장소는 https://github.com/taehyun0213/taehyun0213.github.io 입니다. `main` 브랜치에 변경사항을 저장하면 GitHub Actions가 영어·한국어 페이지를 생성하여 자동 게시합니다.

## 먼저 보기

압축을 풀고 `index.html`을 더블클릭하면 영어 홈페이지가 열립니다. 한국어는 `ko/index.html`에서 볼 수 있습니다. `edit.html`을 더블클릭하면 내용을 수정하는 화면이 열립니다. 홈페이지는 JavaScript를 꺼도 본문과 언어 전환 링크가 표시됩니다.

## GitHub에 공개하기

1. GitHub 계정 `taehyun0213`의 Public 저장소 **taehyun0213.github.io**를 사용합니다. 기존 내용을 확인한 뒤 필요한 파일만 수정하세요.
2. 이 폴더의 파일과 하위 폴더를 저장소의 최상위에 올립니다. `taehyun-homepage` 폴더를 한 단계 더 넣지 마세요. 숨겨진 `.github/workflows/pages.yml`과 `.nojekyll`도 포함해야 합니다.
3. 저장소의 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
4. **Actions → Publish academic homepage → Run workflow**를 실행합니다. 기본 브랜치는 `main`을 사용합니다.
5. 실행이 완료되면 `https://taehyun0213.github.io/`에서 로그인 없이 누구나 접근할 수 있습니다. 한국어 주소는 `https://taehyun0213.github.io/ko/`입니다.

공개 여부는 실제 주소를 로그아웃한 브라우저에서 열어 확인하세요. GitHub 계정에 게시하지 않은 로컬 파일만으로는 공개 URL이 만들어지지 않습니다.

공식 안내: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site

## 코드를 몰라도 내용 수정하기

1. `edit.html`을 엽니다. 공개 후에는 홈페이지 주소 뒤에 `/edit.html`을 붙여 접근할 수 있습니다.
2. 왼쪽 메뉴에서 소개, 프로젝트, 논문, 약력, 학생 모집 등을 선택합니다. 영어와 한국어 칸을 각각 수정하세요.
3. 논문과 프로젝트는 **항목 추가**, **삭제**, **위로**, **아래로**로 관리할 수 있습니다.
4. **content.json 다운로드**를 누릅니다.
5. [GitHub 저장소의 파일 업로드 화면](https://github.com/taehyun0213/taehyun0213.github.io/upload/main)에서 다운로드한 `content.json`을 같은 이름으로 올리고 **Commit changes**로 저장합니다. [기존 content.json 직접 편집](https://github.com/taehyun0213/taehyun0213.github.io/edit/main/content.json)도 가능합니다. 본인 GitHub 계정으로 로그인해야 저장할 수 있습니다.
6. **Actions** 실행이 완료되면 영어·한국어 페이지가 함께 자동 갱신됩니다. 빌드가 실패하면 공개 홈페이지는 이전 정상 버전을 유지합니다.

편집 화면의 임시 저장은 해당 브라우저에만 보관됩니다. 공개 페이지를 직접 바꾸거나 다른 사람이 홈페이지를 수정할 수 있는 기능은 아닙니다. 수정을 요청할 때는 변경할 내용을 이 대화에서 알려주셔도 됩니다. 파일 다운로드 후 GitHub에 저장해야 공개 내용에 반영됩니다. 별도의 로그인 정보, 비밀번호, GitHub 토큰을 입력하지 마세요.

사진을 바꾸려면 `assets/taehyun-kim.png`를 같은 이름의 이미지로 교체하면 됩니다. 다른 파일 이름을 쓰려면 소개 메뉴에서 사진 경로도 바꾸세요. 프로젝트 이미지는 `assets/chromosome-vr.jpg`입니다.

## 파일 구성

| 파일 | 역할 |
|---|---|
| `content.json` | 영어·한국어 내용의 원본. 일반적인 내용 수정은 이 파일에서 합니다. |
| `edit.html`, `assets/editor.js` | 입력칸으로 원본 내용을 수정하고 다운로드하는 편집 도구 |
| `build.py` | 원본에서 영어·한국어 HTML을 생성하는 Python 스크립트 |
| `index.html`, `ko/index.html` | 생성된 영어·한국어 홈페이지 |
| `assets/styles.css` | 색상, 글꼴, 간격, 휴대폰 화면 등 디자인 |
| `assets/site.js` | 모바일 메뉴, 논문 종류 필터, 언어 전환 시 현재 섹션 유지 |
| `.github/workflows/pages.yml` | 수정사항 저장 후 홈페이지를 자동으로 공개하는 설정 |
| `SOURCES.md` | 약력·논문·프로젝트·사진의 확인 자료와 편집 참고사항 |

`index.html`을 직접 편집하면 다음 자동 생성 때 바뀔 수 있습니다. 내용은 `content.json`, 구조는 `build.py`, 디자인은 `assets/styles.css`를 수정하세요.

## 로컬에서 다시 만들기

Python 3.10 이상이 있으면 다음 명령으로 다시 생성할 수 있습니다. 추가 패키지는 필요하지 않습니다.

```bash
python3 build.py
```

로컬 웹서버로 확인하려면:

```bash
python3 -m http.server 8000
```

이후 브라우저에서 `http://localhost:8000`을 엽니다.

공개용 파일만 생성하려면:

```bash
python3 build.py --output dist
```

## 편집 원칙

- 한국어 페이지는 준비된 번역을 사용합니다. 영어만 수정하면 한국어는 자동 번역되지 않으므로 두 언어를 함께 수정하세요.
- 논문은 **주요 실적을 선별한 목록**이며 전체 Google Scholar 실적의 자동 수집 결과는 아닙니다. 전체 실적은 연결된 Scholar에서 확인합니다.
- 연구 실적에는 실제 출판된 제목, 저자, DOI를 사용하세요. 학회 확장초록·포스터를 정규 학술지 논문으로 바꾸지 마세요.
- 학생 모집에는 확정되지 않은 장학금이나 입학 보장 문구를 추가하지 않았습니다.
- 연락처는 `taehyun.kim@skku.edu`를 사용합니다.
- 기본 언어는 영어입니다. 한국어 버튼을 누르면 별도 한국어 주소로 이동합니다.
