import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBjKUNW4fjrlxss9B-vnp2B1D9b5-XtZTE",
  authDomain: "book-tracker-72a8a.firebaseapp.com",
  databaseURL: "https://book-tracker-72a8a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "book-tracker-72a8a",
  storageBucket: "book-tracker-72a8a.firebasestorage.app",
  messagingSenderId: "717626063106",
  appId: "1:717626063106:web:6ff1954f3b5dbbd7672a1b",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Fixed shared key — every device using this app reads/writes the same node,
// so no login is needed and all devices stay in sync automatically.
const BOOKS_PATH = "shared/books";

export function subscribeToBooks(callback) {
  const booksRef = ref(db, BOOKS_PATH);
  const unsubscribe = onValue(
    booksRef,
    (snapshot) => {
      const data = snapshot.val();
      callback(data ? Object.values(data) : []);
    },
    (error) => {
      console.error("Firebase read failed:", error);
    }
  );
  return unsubscribe;
}

export function saveBooksToCloud(books) {
  const booksRef = ref(db, BOOKS_PATH);
  const booksObject = {};
  books.forEach((b) => {
    booksObject[b.id] = b;
  });
  return set(booksRef, booksObject).catch((error) => {
    console.error("Firebase write failed:", error);
  });
}
