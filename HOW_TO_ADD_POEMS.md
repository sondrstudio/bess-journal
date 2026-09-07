# How to Edit or Add New Daily Poems & Thoughts

This website reads all daily entries dynamically from a simple, clean JSON file:

📁 **`src/data/dailyEntries.json`**

---

## 📝 How to Add a New Day

To add Day 8, Day 9, or beyond, open `src/data/dailyEntries.json` in your editor and add a new entry block inside the `[...]` list:

```json
{
  "id": 8,
  "unlockDate": "2026-09-14T00:00:00",
  "title": "Your New Poem Title",
  "subtitle": "Day 8 — A new morning thought",
  "poem": [
    "First line of your poem,",
    "Second line of your poem.",
    "",
    "Third line after a space."
  ],
  "thought": "Write your personal reflection or message here...",
  "photoUrl": "https://images.unsplash.com/photo-...",
  "photoCaption": "Caption under the polaroid memory photo",
  "secretReveal": "Secret thought that reveals when she taps the secret button!",
  "themeTag": "Love"
}
```

---

## ⏰ How Time-Locking Works

- **`unlockDate`**: Format is `"YYYY-MM-DDT00:00:00"`.
  - On or after that date: The entry unlocks automatically with handwritten text, photo, and secrets.
  - Before that date: A lock badge with a real-time countdown timer (`HH:MM:SS`) is displayed to build anticipation.

---

## 🛠 Previewing Locked Days (Developer Mode)

To preview all future locked days while editing:
- Simply add `?dev=true` to your website URL in the browser (e.g. `http://localhost:5173/?dev=true`).

---

## 🚀 Running Locally

In your terminal:
```bash
cd /Users/admin/Code/Web/Bess
npm run dev
```
