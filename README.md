# GitHub Pages Portfolio

這是一個純靜態的個人履歷 / portfolio 頁面，可以直接部署到 GitHub Pages。

## 怎麼發布到 GitHub Pages

GitHub Pages 需要一個 GitHub repo。常見做法有兩種：

1. 建立 `你的帳號.github.io` repo，將這個資料夾內容放到 repo 根目錄。
2. 建立一般 repo，例如 `portfolio`，到 GitHub repo 的 `Settings > Pages`，將來源設成 `Deploy from a branch`，branch 選 `main`，資料夾選 `/(root)`。

## 建議先改的內容

- `index.html`：姓名、職稱、自我介紹、技能、side projects、經歷、證照、Email、GitHub、LinkedIn。
- `assets/hero-workspace.png`：可以換成你的個人照片、桌面照或專案截圖。
- `styles.css`：色系、間距、字體大小與區塊樣式。

## 公開內容注意

這版的 Resume Helper 專案卡有參考本機 `resumeHelper` repo 的公開型 README、docs、測試與檔案結構來撰寫，但沒有放入私人履歷原文、實際 JD 原文、環境變數、token、內部路徑或部署網址。上傳前仍建議檢查：

- `mailto:your.email@example.com`
- `https://github.com/your-github-id`
- `https://www.linkedin.com/in/your-linkedin-id`
- 任何你不想公開的公司名稱、專案名稱或個人資料

## 本機預覽

直接用瀏覽器開 `index.html` 即可。若想用本機伺服器，也可以在資料夾內執行：

```powershell
python -m http.server 8080
```

然後開啟 `http://localhost:8080`。

## Git 指令範例

```powershell
git init
git add .
git commit -m "Initial portfolio page"
git branch -M main
git remote add origin https://github.com/你的帳號/你的帳號.github.io.git
git push -u origin main
```
