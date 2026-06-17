import React, { useState, useMemo, useRef, useCallback, useEffect } from "react";

const STORAGE_KEY = "shelfkeeper_books_v2";
const COVER_CACHE_KEY = "shelfkeeper_cover_cache_v1";

// --- Theme tokens (earthy forest/sage palette) ---
const THEME = {
  bg: "#f3ede2",
  surface: "#fbf8f2",
  surfaceAlt: "#ede6d8",
  border: "#dad7cd",
  borderStrong: "#c7c2b3",
  textPrimary: "#283c2b",
  textHeading: "#344e41",
  textSecondary: "#3a5a40",
  textMuted: "#6b7a64",
  textFaint: "#94a08d",
  primary: "#3a5a40",
  primaryDark: "#283c2b",
  primaryHover: "#2e4734",
  accent: "#588157",
  accentSoft: "#a3b18a",
  accentSoftBg: "#e3e7d6",
  rose: "#c97b88",
  roseSoftBg: "#f3dde1",
  gold: "#a9822f",
  goldSoftBg: "#f0e3c4",
  blue: "#4a6a78",
  blueSoftBg: "#dde8ea",
  danger: "#a85a4f",
  dangerSoftBg: "#f3ddd8",
};

// Seeded from the uploaded books.csv (2014-present reading history)
const SEED_BOOKS = [
  { id: "1", title: "Throne of Glass", series: "Throne of Glass", seriesNumber: "1", author: "Sarah J. Maas", rating: 5, status: "Read", startDate: "", finishDate: "2017-01-01", genre: "Fantasy", notes: "Best!", cover: "" },
  { id: "2", title: "Shatter Me", series: "Shatter Me", seriesNumber: "1", author: "Tahereh Mafi", rating: 5, status: "Read", startDate: "", finishDate: "2018-01-01", genre: "YA Dystopian", notes: "emotionally impactful", cover: "" },
  { id: "3", title: "Unravel Me", series: "Shatter Me", seriesNumber: "2", author: "Tahereh Mafi", rating: 5, status: "Read", startDate: "", finishDate: "2018-01-01", genre: "YA Dystopian", notes: "", cover: "" },
  { id: "4", title: "Harry Potter and the Sorcerer's Stone", series: "Harry Potter", seriesNumber: "1", author: "J.K Rowling", rating: 5, status: "Read", startDate: "", finishDate: "2015-01-01", genre: "Fantasy", notes: "most life changing", cover: "" },
  { id: "5", title: "Harry Potter and the Chamber of Secrets", series: "Harry Potter", seriesNumber: "2", author: "J.K Rowling", rating: 5, status: "Read", startDate: "", finishDate: "2015-01-01", genre: "Fantasy", notes: "", cover: "" },
  { id: "6", title: "Harry Potter and the Prisoner of Azkaban", series: "Harry Potter", seriesNumber: "3", author: "J.K Rowling", rating: 5, status: "Read", startDate: "", finishDate: "2015-01-01", genre: "Fantasy", notes: "", cover: "" },
  { id: "7", title: "Pride and Prejudice", series: "", seriesNumber: "", author: "Jane Austen", rating: 3, status: "Read", startDate: "", finishDate: "2019-01-01", genre: "Classic", notes: "classic", cover: "" },
  { id: "8", title: "The Fault in Our Stars", series: "", seriesNumber: "", author: "John Green", rating: 3.5, status: "Read", startDate: "", finishDate: "2019-09-01", genre: "Contemporary", notes: "cry fest", cover: "" },
  { id: "9", title: "Harry Potter and the Goblet of Fire", series: "Harry Potter", seriesNumber: "4", author: "J.K Rowling", rating: 5, status: "Read", startDate: "", finishDate: "2015-01-01", genre: "Fantasy", notes: "", cover: "" },
  { id: "10", title: "Matilda", series: "", seriesNumber: "", author: "Roald Dalh", rating: 3.5, status: "Read", startDate: "", finishDate: "2014-01-01", genre: "Children's", notes: "", cover: "" },
  { id: "11", title: "Charlie and the Chocolate Factory", series: "", seriesNumber: "", author: "Roald Dalh", rating: 3.5, status: "Read", startDate: "", finishDate: "2014-01-01", genre: "Children's", notes: "", cover: "" },
  { id: "12", title: "Harry Potter and the Order of the Phoenix", series: "Harry Potter", seriesNumber: "5", author: "J.K Rowling", rating: 5, status: "Read", startDate: "", finishDate: "2016-01-01", genre: "Fantasy", notes: "best in the series", cover: "" },
  { id: "13", title: "Harry Potter and the Half-Blood Prince", series: "Harry Potter", seriesNumber: "6", author: "J.K Rowling", rating: 5, status: "Read", startDate: "", finishDate: "2016-01-01", genre: "Fantasy", notes: "", cover: "" },
  { id: "14", title: "Harry Potter and the Deathly Hallows", series: "Harry Potter", seriesNumber: "7", author: "J.K Rowling", rating: 5, status: "Read", startDate: "", finishDate: "2016-01-01", genre: "Fantasy", notes: "", cover: "" },
  { id: "15", title: "Harry Potter and the Cursed Child", series: "Harry Potter", seriesNumber: "8", author: "J.K Rowling", rating: 5, status: "Read", startDate: "", finishDate: "2016-01-01", genre: "Fantasy", notes: "", cover: "" },
  { id: "16", title: "Life of Pi", series: "", seriesNumber: "", author: "Yann Martel", rating: 3.5, status: "Read", startDate: "", finishDate: "2015-01-01", genre: "Literary Fiction", notes: "", cover: "" },
  { id: "17", title: "The Maze Runner", series: "The Maze Runner", seriesNumber: "1", author: "James Dashner", rating: 4.5, status: "Read", startDate: "", finishDate: "2015-01-01", genre: "YA Dystopian", notes: "", cover: "" },
  { id: "18", title: "The Scorch Trials", series: "The Maze Runner", seriesNumber: "2", author: "James Dashner", rating: 4.5, status: "Read", startDate: "", finishDate: "2016-01-01", genre: "YA Dystopian", notes: "", cover: "" },
  { id: "19", title: "The Death Cure", series: "The Maze Runner", seriesNumber: "3", author: "James Dashner", rating: 3.5, status: "Read", startDate: "", finishDate: "2016-05-01", genre: "YA Dystopian", notes: "", cover: "" },
  { id: "20", title: "Station Eleven", series: "", seriesNumber: "", author: "Emily St. John Mendel", rating: 4, status: "Read", startDate: "", finishDate: "2025-01-01", genre: "Literary Fiction", notes: "unexpected but insightful", cover: "" },
  { id: "21", title: "Manacled - Dramione", series: "", seriesNumber: "", author: "Fanfiction", rating: 5, status: "Read", startDate: "", finishDate: "2025-01-01", genre: "Romance", notes: "altered brain chemistry - 900+ pages", cover: "" },
  { id: "22", title: "A Darker Shade of Magic", series: "Shades of Magic", seriesNumber: "1", author: "V.E Schwab", rating: 3.5, status: "Read", startDate: "", finishDate: "2025-05-01", genre: "Fantasy", notes: "could be better", cover: "" },
  { id: "23", title: "The Deal", series: "", seriesNumber: "", author: "Elle Kennedy", rating: 4, status: "Read", startDate: "", finishDate: "2025-01-01", genre: "Romance", notes: "cute cliche rom-com", cover: "" },
  { id: "24", title: "Ninth House", series: "Alex Stern", seriesNumber: "1", author: "Leigh Bardugo", rating: 4, status: "Read", startDate: "", finishDate: "2024-01-01", genre: "Fantasy", notes: "dark and gothic, not my style but good", cover: "" },
  { id: "25", title: "1984", series: "", seriesNumber: "", author: "George Orwell", rating: 5, status: "Read", startDate: "", finishDate: "2024-02-01", genre: "Classic", notes: "scarily plausible", cover: "" },
  { id: "26", title: "The Kite Runner", series: "", seriesNumber: "", author: "Khaled Hosseini", rating: 3.5, status: "Read", startDate: "", finishDate: "2024-02-01", genre: "Literary Fiction", notes: "trauma porn", cover: "" },
  { id: "27", title: "House of Sky and Breath", series: "Crescent City", seriesNumber: "2", author: "Sarah J. Maas", rating: 4, status: "Read", startDate: "", finishDate: "2024-06-01", genre: "Fantasy", notes: "", cover: "" },
  { id: "28", title: "Red Queen", series: "", seriesNumber: "", author: "Victoria Aveyard", rating: 3, status: "Read", startDate: "", finishDate: "2022-07-01", genre: "YA Fantasy", notes: "classic YA", cover: "" },
  { id: "29", title: "Beach Read", series: "", seriesNumber: "", author: "Emily Henry", rating: 3.5, status: "Read", startDate: "", finishDate: "2022-09-01", genre: "Romance", notes: "bearable contemporary romance", cover: "" },
  { id: "30", title: "Crown of Midnight", series: "Throne of Glass", seriesNumber: "2", author: "Sarah J. Maas", rating: 4, status: "Read", startDate: "", finishDate: "2017-10-01", genre: "Fantasy", notes: "", cover: "" },
  { id: "31", title: "Heir of Fire", series: "Throne of Glass", seriesNumber: "3", author: "Sarah J. Maas", rating: 4.5, status: "Read", startDate: "", finishDate: "2017-11-01", genre: "Fantasy", notes: "", cover: "" },
  { id: "32", title: "Queen of Shadows", series: "Throne of Glass", seriesNumber: "4", author: "Sarah J. Maas", rating: 5, status: "Read", startDate: "", finishDate: "2017-11-01", genre: "Fantasy", notes: "", cover: "" },
  { id: "33", title: "Empire of Storms", series: "Throne of Glass", seriesNumber: "5", author: "Sarah J. Maas", rating: 5, status: "Read", startDate: "", finishDate: "2017-11-01", genre: "Fantasy", notes: "", cover: "" },
  { id: "34", title: "Tower of Dawn", series: "Throne of Glass", seriesNumber: "6", author: "Sarah J. Maas", rating: 5, status: "Read", startDate: "", finishDate: "2017-12-01", genre: "Fantasy", notes: "", cover: "" },
  { id: "35", title: "Kingdom of Ash", series: "Throne of Glass", seriesNumber: "7", author: "Sarah J. Maas", rating: 5, status: "Read", startDate: "", finishDate: "2018-11-01", genre: "Fantasy", notes: "", cover: "" },
  { id: "36", title: "The Mistake", series: "", seriesNumber: "", author: "Elle Kennedy", rating: 4, status: "Read", startDate: "", finishDate: "2025-10-27", genre: "Romance", notes: "good wattpad romance", cover: "" },
  { id: "37", title: "Daughter of No Worlds", series: "", seriesNumber: "", author: "Carissa Broadbent", rating: 4, status: "Read", startDate: "", finishDate: "2025-11-01", genre: "Fantasy", notes: "decent fantasy but would not continue the series", cover: "" },
  { id: "38", title: "Fourth Wing", series: "The Empyrean", seriesNumber: "1", author: "Rebecca Yarros", rating: 4.5, status: "Read", startDate: "", finishDate: "2025-01-01", genre: "Fantasy Romance", notes: "almost as addictive as ToG", cover: "" },
  { id: "39", title: "Iron Flame", series: "The Empyrean", seriesNumber: "2", author: "Rebecca Yarros", rating: 4.5, status: "Read", startDate: "", finishDate: "2025-01-01", genre: "Fantasy Romance", notes: "very good sequel, although a bit long", cover: "" },
  { id: "40", title: "Onyx Storm", series: "The Empyrean", seriesNumber: "3", author: "Rebecca Yarros", rating: 3, status: "DNF", startDate: "", finishDate: "2025-01-01", genre: "Fantasy Romance", notes: "Totally lost the plot, DNF", cover: "" },
  { id: "41", title: "Road of Bones", series: "The Ashen Series", seriesNumber: "1", author: "Demi Winters", rating: 5, status: "Read", startDate: "", finishDate: "2026-03-01", genre: "Fantasy Romance", notes: "ToG levels good", cover: "" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const FIELDS = ["title", "series", "seriesNumber", "author", "rating", "status", "startDate", "finishDate", "genre", "notes", "cover"];

function booksToCsv(books) {
  const header = FIELDS.join(",");
  const rows = books.map((b) => FIELDS.map((f) => csvEscape(b[f])).join(","));
  return [header, ...rows].join("\n");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(cur);
        cur = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
      } else {
        cur += c;
      }
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function csvToBooks(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = { id: uid() };
    header.forEach((h, idx) => {
      const key = FIELDS.find((f) => f.toLowerCase() === h.toLowerCase()) || h;
      obj[key] = r[idx] ?? "";
    });
    if (obj.rating) obj.rating = Number(obj.rating) || 0;
    FIELDS.forEach((f) => {
      if (!(f in obj)) obj[f] = f === "rating" ? 0 : "";
    });
    return obj;
  });
}

function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function getYear(dateStr) {
  if (!dateStr) return null;
  const m = /^(\d{4})/.exec(dateStr);
  return m ? m[1] : null;
}

// --- Automatic cover fetching via Open Library / Google Books ---
function coverCacheGet() {
  try {
    return JSON.parse(localStorage.getItem(COVER_CACHE_KEY) || "{}");
  } catch (e) {
    return {};
  }
}
function coverCacheSet(cache) {
  try {
    localStorage.setItem(COVER_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {}
}

async function fetchCoverUrl(title, author) {
  // Primary: Google Books API (open CORS, reliable JSON search)
  try {
    const q = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
    if (res.ok) {
      const data = await res.json();
      const item = data.items && data.items[0];
      const links = item && item.volumeInfo && item.volumeInfo.imageLinks;
      if (links) {
        let url = links.thumbnail || links.smallThumbnail || "";
        if (url) {
          url = url.replace("http://", "https://").replace("&edge=curl", "");
          return url;
        }
      }
    }
  } catch (e) {}

  // Fallback: Open Library
  try {
    const q = encodeURIComponent(`${title} ${author}`);
    const res = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=1&fields=cover_i,cover_edition_key`);
    if (res.ok) {
      const data = await res.json();
      const doc = data.docs && data.docs[0];
      if (doc && doc.cover_i) {
        return `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
      }
      if (doc && doc.cover_edition_key) {
        return `https://covers.openlibrary.org/b/olid/${doc.cover_edition_key}-M.jpg`;
      }
    }
  } catch (e) {}

  return "";
}

function useCoverLookup(books, persist) {
  const inFlight = useRef(new Set());

  useEffect(() => {
    const cache = coverCacheGet();
    const needsFetch = books.filter((b) => !b.cover && !cache[b.id] && !inFlight.current.has(b.id));
    if (needsFetch.length === 0) return;

    let cancelled = false;

    (async () => {
      for (const book of needsFetch) {
        if (cancelled) break;
        inFlight.current.add(book.id);
        const url = await fetchCoverUrl(book.title, book.author);
        if (cancelled) break;
        if (url) {
          const latestCache = coverCacheGet();
          latestCache[book.id] = url;
          coverCacheSet(latestCache);
          persist((prev) => prev.map((b) => (b.id === book.id ? { ...b, cover: url } : b)));
        }
        inFlight.current.delete(book.id);
        await new Promise((r) => setTimeout(r, 150));
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books.length]);
}

function Stars({ value, onChange, size = 16 }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(value);
        return (
          <button
            key={n}
            type="button"
            aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
            onClick={() => onChange && onChange(n === value ? 0 : n)}
            style={{
              border: "none",
              background: "transparent",
              cursor: onChange ? "pointer" : "default",
              padding: 0,
              lineHeight: 0,
            }}
          >
            <i
              className={filled ? "ti ti-star-filled" : "ti ti-star"}
              style={{ fontSize: size, color: filled ? THEME.gold : "#d9d2bf" }}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}

function CoverThumb({ src, title, size = 56, loading }) {
  const [error, setError] = useState(false);
  const initials = title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  if (!src || error) {
    return (
      <div
        style={{
          width: size,
          height: size * 1.45,
          borderRadius: 6,
          background: `linear-gradient(160deg, ${THEME.roseSoftBg}, ${THEME.accent})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: "#fff",
          fontWeight: 600,
          fontSize: size * 0.32,
          border: `1px solid ${THEME.borderStrong}`,
        }}
        aria-hidden="true"
      >
        {loading ? <i className="ti ti-loader-2" style={{ fontSize: size * 0.4 }} /> : initials || "?"}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={`Cover of ${title}`}
      onError={() => setError(true)}
      style={{
        width: size,
        height: size * 1.45,
        objectFit: "cover",
        borderRadius: 6,
        flexShrink: 0,
        border: `1px solid ${THEME.borderStrong}`,
        background: "#fff",
      }}
    />
  );
}

const STATUS_OPTIONS = ["Read", "Reading", "Want to read", "DNF"];
const STATUS_COLORS = {
  Read: { bg: THEME.accentSoftBg, text: THEME.primary },
  Reading: { bg: THEME.goldSoftBg, text: THEME.gold },
  "Want to read": { bg: THEME.blueSoftBg, text: THEME.blue },
  DNF: { bg: THEME.dangerSoftBg, text: THEME.danger },
};

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS["Read"];
  return (
    <span
      style={{
        background: c.bg,
        color: c.text,
        fontSize: 12,
        padding: "2px 10px",
        borderRadius: 999,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {status || "Read"}
    </span>
  );
}

function emptyBook() {
  return {
    id: "",
    title: "",
    series: "",
    seriesNumber: "",
    author: "",
    rating: 0,
    status: "Read",
    startDate: "",
    finishDate: "",
    genre: "",
    notes: "",
    cover: "",
  };
}

function BookForm({ book, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState(book || emptyBook());
  const isEdit = !!book;

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.author.trim()) return;
    onSave({ ...form, id: form.id || uid() });
  }

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 8,
    border: `1px solid ${THEME.border}`,
    fontSize: 14,
    background: "#fff",
    color: THEME.textPrimary,
    boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, color: THEME.textMuted, fontWeight: 600, marginBottom: 4, display: "block" };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Title *</label>
          <input style={inputStyle} value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </div>
        <div>
          <label style={labelStyle}>Author *</label>
          <input style={inputStyle} value={form.author} onChange={(e) => update("author", e.target.value)} required />
        </div>
        <div>
          <label style={labelStyle}>Genre</label>
          <input style={inputStyle} value={form.genre} onChange={(e) => update("genre", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Series name</label>
          <input style={inputStyle} value={form.series} onChange={(e) => update("series", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}># in series</label>
          <input style={inputStyle} value={form.seriesNumber} onChange={(e) => update("seriesNumber", e.target.value)} placeholder="e.g. 1" />
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={inputStyle} value={form.status} onChange={(e) => update("status", e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>My rating</label>
          <Stars value={form.rating} onChange={(v) => update("rating", v)} size={20} />
        </div>
        <div>
          <label style={labelStyle}>Started</label>
          <input type="date" style={inputStyle} value={form.startDate} onChange={(e) => update("startDate", e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Finished</label>
          <input type="date" style={inputStyle} value={form.finishDate} onChange={(e) => update("finishDate", e.target.value)} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Notes</label>
          <textarea
            style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="What did you think?"
          />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={labelStyle}>Cover image URL (optional — fetched automatically if left blank)</label>
          <input style={inputStyle} value={form.cover} onChange={(e) => update("cover", e.target.value)} placeholder="https://..." />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 4 }}>
        <div>
          {isEdit && (
            <button
              type="button"
              onClick={() => onDelete(form.id)}
              style={{
                background: THEME.dangerSoftBg,
                color: THEME.danger,
                border: "none",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Delete
            </button>
          )}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "transparent",
              border: `1px solid ${THEME.border}`,
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 13,
              cursor: "pointer",
              color: THEME.textMuted,
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              background: THEME.primary,
              border: "none",
              borderRadius: 8,
              padding: "8px 18px",
              fontSize: 13,
              cursor: "pointer",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {isEdit ? "Save changes" : "Add book"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Modal({ children, onClose, title }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(40, 60, 43, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: THEME.surface,
          borderRadius: 16,
          padding: 24,
          maxWidth: 560,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 12px 40px rgba(40, 60, 43, 0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: THEME.textHeading }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: 18, color: THEME.textFaint }}
          >
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function BookCard({ book, onEdit, coverLoading }) {
  const ratingDisplay = book.rating ? (Number.isInteger(book.rating) ? book.rating : book.rating.toFixed(1)) : null;
  return (
    <div
      onClick={() => onEdit(book)}
      style={{
        display: "flex",
        gap: 12,
        background: THEME.surface,
        border: `1px solid ${THEME.border}`,
        borderRadius: 12,
        padding: 12,
        cursor: "pointer",
        transition: "box-shadow 0.15s, border-color 0.15s, transform 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = THEME.accent;
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(58, 90, 64, 0.16)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = THEME.border;
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      <CoverThumb src={book.cover} title={book.title} loading={coverLoading} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: THEME.textHeading, lineHeight: 1.3 }}>{book.title}</div>
            <div style={{ fontSize: 12.5, color: THEME.textMuted, marginTop: 1 }}>{book.author}</div>
          </div>
          <StatusBadge status={book.status} />
        </div>
        {book.series && (
          <div style={{ fontSize: 12, color: THEME.accent, fontWeight: 500 }}>
            {book.series}{book.seriesNumber ? ` #${book.seriesNumber}` : ""}
          </div>
        )}
        {book.notes && (
          <div style={{ fontSize: 12, color: THEME.textMuted, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {book.notes}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Stars value={book.rating || 0} size={14} />
            {ratingDisplay && <span style={{ fontSize: 11.5, color: THEME.textFaint }}>{ratingDisplay}</span>}
            {book.rating >= 5 && (
              <i className="ti ti-heart-filled" aria-hidden="true" style={{ fontSize: 12, color: THEME.rose }} />
            )}
          </div>
          <div style={{ fontSize: 11.5, color: THEME.textFaint }}>
            {book.finishDate ? book.finishDate : book.startDate ? `Started ${book.startDate}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Reading stats dashboard ---
function YearBarChart({ data, maxYear }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140, padding: "0 4px" }}>
      {data.map((d) => {
        const isMax = d.year === maxYear && d.count > 0;
        const heightPct = (d.count / max) * 100;
        return (
          <div key={d.year} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: isMax ? THEME.rose : THEME.textSecondary }}>{d.count || ""}</div>
            <div
              title={`${d.count} book${d.count === 1 ? "" : "s"} in ${d.year}`}
              style={{
                width: "100%",
                maxWidth: 28,
                height: `${Math.max(heightPct, d.count > 0 ? 6 : 2)}%`,
                background: isMax
                  ? `linear-gradient(180deg, ${THEME.rose}, #b56673)`
                  : `linear-gradient(180deg, ${THEME.accentSoft}, ${THEME.accent})`,
                borderRadius: 5,
                minHeight: 3,
                transition: "height 0.3s ease",
              }}
            />
            <div style={{ fontSize: 10.5, color: THEME.textFaint, writingMode: "horizontal-tb" }}>
              {d.year.slice(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RatingDistribution({ counts }) {
  const max = Math.max(...counts.map((c) => c.count), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {counts.map((c) => (
        <div key={c.rating} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 38, fontSize: 12, color: THEME.textSecondary, display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
            {c.rating}<i className="ti ti-star-filled" style={{ fontSize: 11, color: THEME.gold }} />
          </div>
          <div style={{ flex: 1, background: THEME.surfaceAlt, borderRadius: 6, height: 14, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${(c.count / max) * 100}%`,
                background: `linear-gradient(90deg, ${THEME.accentSoft}, ${THEME.accent})`,
                borderRadius: 6,
                minWidth: c.count > 0 ? 4 : 0,
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <div style={{ width: 24, fontSize: 12, color: THEME.textFaint, textAlign: "right", flexShrink: 0 }}>{c.count}</div>
        </div>
      ))}
    </div>
  );
}

function StatsPanel({ books }) {
  const yearData = useMemo(() => {
    const counts = {};
    books.forEach((b) => {
      const y = getYear(b.finishDate);
      if (y) counts[y] = (counts[y] || 0) + 1;
    });
    const years = Object.keys(counts);
    if (years.length === 0) return { data: [], maxYear: null, maxCount: 0 };
    const minY = Math.min(...years.map(Number));
    const maxY = Math.max(...years.map(Number));
    const data = [];
    for (let y = minY; y <= maxY; y++) {
      data.push({ year: String(y), count: counts[String(y)] || 0 });
    }
    let maxYear = null;
    let maxCount = 0;
    data.forEach((d) => {
      if (d.count > maxCount) {
        maxCount = d.count;
        maxYear = d.year;
      }
    });
    return { data, maxYear, maxCount };
  }, [books]);

  const topAuthors = useMemo(() => {
    const counts = {};
    books.forEach((b) => {
      if (!b.author) return;
      counts[b.author] = (counts[b.author] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [books]);

  const ratingCounts = useMemo(() => {
    const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    books.forEach((b) => {
      const r = Math.round(b.rating || 0);
      if (r >= 1 && r <= 5) buckets[r] += 1;
    });
    return [5, 4, 3, 2, 1].map((r) => ({ rating: r, count: buckets[r] }));
  }, [books]);

  const avgPerYear = useMemo(() => {
    if (yearData.data.length === 0) return 0;
    const totalBooks = yearData.data.reduce((s, d) => s + d.count, 0);
    return (totalBooks / yearData.data.length).toFixed(1);
  }, [yearData]);

  const thisYear = new Date().getFullYear().toString();
  const readThisYear = yearData.data.find((d) => d.year === thisYear)?.count || 0;

  return (
    <div
      style={{
        background: THEME.surface,
        border: `1px solid ${THEME.border}`,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
        <i className="ti ti-chart-bar" aria-hidden="true" style={{ color: THEME.accent, fontSize: 18 }} />
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: THEME.textHeading }}>Reading stats</h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 22 }}>
        {[
          { label: `Read in ${thisYear}`, value: readThisYear, icon: "ti-calendar-event" },
          { label: "Best year", value: yearData.maxYear || "—", sub: yearData.maxCount ? `${yearData.maxCount} books` : "", icon: "ti-trophy", pink: true },
          { label: "Avg. per year", value: avgPerYear, icon: "ti-chart-line" },
          { label: "Years tracked", value: yearData.data.length, icon: "ti-timeline" },
        ].map((s) => (
          <div key={s.label} style={{ background: s.pink ? THEME.roseSoftBg : THEME.surfaceAlt, borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: s.pink ? THEME.rose : THEME.accent, marginBottom: 2 }}>
              <i className={`ti ${s.icon}`} aria-hidden="true" style={{ fontSize: 13 }} />
              <span style={{ fontSize: 11, color: THEME.textMuted }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 19, fontWeight: 700, color: THEME.textHeading }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: 10.5, color: THEME.textFaint }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: THEME.textSecondary, marginBottom: 10 }}>Books finished per year</div>
          {yearData.data.length > 0 ? (
            <YearBarChart data={yearData.data} maxYear={yearData.maxYear} />
          ) : (
            <div style={{ fontSize: 12, color: THEME.textFaint }}>No dated books yet.</div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: THEME.textSecondary, marginBottom: 10 }}>Rating distribution</div>
          <RatingDistribution counts={ratingCounts} />
        </div>
      </div>

      {topAuthors.length > 0 && (
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: THEME.textSecondary, marginBottom: 10 }}>Most-read authors</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {topAuthors.map(([author, count]) => (
              <div
                key={author}
                style={{
                  background: THEME.accentSoftBg,
                  color: THEME.primaryDark,
                  borderRadius: 999,
                  padding: "5px 12px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {author}
                <span style={{ background: THEME.primary, color: "#fff", borderRadius: 999, padding: "1px 7px", fontSize: 11 }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "finishDate-desc", label: "Date finished (newest)" },
  { value: "finishDate-asc", label: "Date finished (oldest)" },
  { value: "startDate-desc", label: "Date started (newest)" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "author-asc", label: "Author (A-Z)" },
  { value: "rating-desc", label: "Rating (high to low)" },
  { value: "rating-asc", label: "Rating (low to high)" },
];

export default function BookTracker() {
  const [books, setBooksRaw] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return SEED_BOOKS;
  });

  const persist = useCallback((updater) => {
    setBooksRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch (e) {}
      return next;
    });
  }, []);

  useCoverLookup(books, persist);

  const [search, setSearch] = useState("");
  const [groupBy, setGroupBy] = useState("none");
  const [sortBy, setSortBy] = useState("finishDate-desc");
  const [statusFilter, setStatusFilter] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [genreFilter, setGenreFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [showStats, setShowStats] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const fileInputRef = useRef(null);

  const genres = useMemo(() => {
    const set = new Set(books.map((b) => b.genre).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [books]);

  const years = useMemo(() => {
    const set = new Set(books.map((b) => getYear(b.finishDate)).filter(Boolean));
    return ["All", ...Array.from(set).sort((a, b) => b.localeCompare(a))];
  }, [books]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter((b) => {
      if (statusFilter !== "All" && (b.status || "Read") !== statusFilter) return false;
      if (minRating > 0 && (b.rating || 0) < minRating) return false;
      if (genreFilter !== "All" && b.genre !== genreFilter) return false;
      if (yearFilter !== "All" && getYear(b.finishDate) !== yearFilter) return false;
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.series || "").toLowerCase().includes(q) ||
        (b.genre || "").toLowerCase().includes(q) ||
        (b.notes || "").toLowerCase().includes(q)
      );
    });
  }, [books, search, statusFilter, minRating, genreFilter, yearFilter]);

  const sorted = useMemo(() => {
    const [field, dir] = sortBy.split("-");
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av = a[field];
      let bv = b[field];
      if (field === "rating") {
        av = av || 0;
        bv = bv || 0;
      } else {
        av = (av || "").toString().toLowerCase();
        bv = (bv || "").toString().toLowerCase();
      }
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortBy]);

  const grouped = useMemo(() => {
    if (groupBy === "none") return [{ key: null, items: sorted }];
    const map = new Map();
    sorted.forEach((b) => {
      const key = groupBy === "series" ? (b.series || "Standalone") : (b.author || "Unknown author");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(b);
    });
    const groups = Array.from(map.entries()).map(([key, items]) => ({ key, items }));
    groups.sort((a, b) => {
      if (a.key === "Standalone") return 1;
      if (b.key === "Standalone") return -1;
      return a.key.localeCompare(b.key);
    });
    if (groupBy === "series") {
      groups.forEach((g) => {
        if (g.key !== "Standalone") {
          g.items.sort((a, b) => {
            const an = parseFloat(a.seriesNumber) || 0;
            const bn = parseFloat(b.seriesNumber) || 0;
            return an - bn;
          });
        }
      });
    }
    return groups;
  }, [sorted, groupBy]);

  const headerStats = useMemo(() => {
    const total = books.length;
    const read = books.filter((b) => (b.status || "Read") === "Read").length;
    const ratedBooks = books.filter((b) => b.rating);
    const avgRating = ratedBooks.length
      ? (ratedBooks.reduce((s, b) => s + (b.rating || 0), 0) / ratedBooks.length)
      : 0;
    return { total, read, avgRating: avgRating ? avgRating.toFixed(1) : "—" };
  }, [books]);

  function handleSave(book) {
    persist((prev) => {
      const exists = prev.some((b) => b.id === book.id);
      return exists ? prev.map((b) => (b.id === book.id ? book : b)) : [...prev, book];
    });
    setEditing(null);
    setShowAdd(false);
  }

  function handleDelete(id) {
    persist((prev) => prev.filter((b) => b.id !== id));
    setEditing(null);
  }

  function handleExport() {
    downloadFile("my_books.csv", booksToCsv(books), "text/csv");
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = csvToBooks(String(reader.result));
      if (imported.length) {
        persist((prev) => [...prev, ...imported]);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  const selectStyle = {
    padding: "7px 10px",
    borderRadius: 8,
    border: `1px solid ${THEME.border}`,
    fontSize: 13,
    background: THEME.surface,
    color: THEME.textSecondary,
  };

  return (
    <div style={{ fontFamily: "'Poppins', 'Segoe UI', sans-serif", background: THEME.bg, minHeight: "100vh", padding: "0 0 60px" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 20px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: THEME.textHeading, display: "flex", alignItems: "center", gap: 10 }}>
              <i className="ti ti-books" aria-hidden="true" style={{ color: THEME.accent }} />
              My reading shelf
            </h1>
            <p style={{ margin: "4px 0 0", color: THEME.textMuted, fontSize: 14 }}>
              {headerStats.total} books tracked since 2014
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => setShowStats((s) => !s)}
              style={{ ...selectStyle, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <i className={showStats ? "ti ti-chart-bar-off" : "ti ti-chart-bar"} aria-hidden="true" /> {showStats ? "Hide stats" : "Show stats"}
            </button>
            <button
              onClick={handleExport}
              style={{ ...selectStyle, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <i className="ti ti-download" aria-hidden="true" /> Export CSV
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ ...selectStyle, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
            >
              <i className="ti ti-upload" aria-hidden="true" /> Import CSV
            </button>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleImport} style={{ display: "none" }} />
            <button
              onClick={() => setShowAdd(true)}
              style={{
                background: THEME.primary,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "7px 16px",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <i className="ti ti-plus" aria-hidden="true" /> Add book
            </button>
          </div>
        </header>

        {showStats && <StatsPanel books={books} />}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <i className="ti ti-search" aria-hidden="true" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: THEME.textFaint, fontSize: 16 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, author, series, genre, notes..."
              onFocus={(e) => { e.target.style.borderColor = THEME.rose; e.target.style.boxShadow = `0 0 0 3px ${THEME.roseSoftBg}`; }}
              onBlur={(e) => { e.target.style.borderColor = THEME.border; e.target.style.boxShadow = "none"; }}
              style={{
                width: "100%",
                padding: "9px 12px 9px 36px",
                borderRadius: 10,
                border: `1px solid ${THEME.border}`,
                fontSize: 14,
                background: THEME.surface,
                color: THEME.textPrimary,
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            />
          </div>
          <select value={groupBy} onChange={(e) => setGroupBy(e.target.value)} style={selectStyle}>
            <option value="none">No grouping</option>
            <option value="series">Group by series</option>
            <option value="author">Group by author</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={selectStyle}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} style={selectStyle}>
            {years.map((y) => (
              <option key={y} value={y}>{y === "All" ? "All years" : y}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="All">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)} style={selectStyle}>
            {genres.map((g) => (
              <option key={g} value={g}>{g === "All" ? "All genres" : g}</option>
            ))}
          </select>
          <select value={minRating} onChange={(e) => setMinRating(Number(e.target.value))} style={selectStyle}>
            <option value={0}>Any rating</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n}+ stars</option>
            ))}
          </select>
        </div>

        {yearFilter !== "All" && (
          <div style={{ marginBottom: 16, fontSize: 13, color: THEME.textSecondary, display: "flex", alignItems: "center", gap: 6 }}>
            <i className="ti ti-calendar" aria-hidden="true" style={{ color: THEME.accent }} />
            {sorted.length} book{sorted.length === 1 ? "" : "s"} finished in {yearFilter}
          </div>
        )}

        {sorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: THEME.textFaint }}>
            <i className="ti ti-book-off" aria-hidden="true" style={{ fontSize: 40 }} />
            <p style={{ marginTop: 12, fontSize: 14 }}>No books match your filters yet.</p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.key || "all"} style={{ marginBottom: 28 }}>
              {group.key && (
                <h2 style={{ fontSize: 15, fontWeight: 700, color: THEME.textSecondary, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  <i className={groupBy === "series" ? "ti ti-stack-2" : "ti ti-user"} aria-hidden="true" style={{ fontSize: 16, color: THEME.accent }} />
                  {group.key}
                  <span style={{ fontSize: 12, color: THEME.textFaint, fontWeight: 400 }}>({group.items.length})</span>
                </h2>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                {group.items.map((b) => (
                  <BookCard key={b.id} book={b} onEdit={setEditing} coverLoading={!b.cover} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {(showAdd || editing) && (
        <Modal title={editing ? "Edit book" : "Add a new book"} onClose={() => { setEditing(null); setShowAdd(false); }}>
          <BookForm
            book={editing}
            onSave={handleSave}
            onCancel={() => { setEditing(null); setShowAdd(false); }}
            onDelete={handleDelete}
          />
        </Modal>
      )}
    </div>
  );
}
