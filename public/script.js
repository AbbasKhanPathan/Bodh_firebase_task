import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, addDoc, collection,
  getDocs, deleteDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyA1Vfw91HWEloUWH0S0OZp1VTTw0GzrNtY",
  authDomain: "bodh-proj-task.firebaseapp.com",
  projectId: "bodh-proj-task",
  storageBucket: "bodh-proj-task.appspot.com",
  messagingSenderId: "94749537614",
  appId: "1:94749537614:web:afb2f0e26010d3e4c7da1f",
  measurementId: "G-EET38Y7FYS"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

let currentUser = null;

// Sign In
document.getElementById("loginBtn").addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;

    document.getElementById("userInfo").innerHTML = `
      <p><strong>${currentUser.displayName}</strong></p>
      <img src="${currentUser.photoURL}" alt="Profile Picture" />
    `;

    alert("✅ Signed in successfully!");
    loadNotes();
  } catch (err) {
    console.error("Login error:", err);
    alert("Login failed");
  }
});

// Save Profile
document.getElementById("saveProfileBtn").addEventListener("click", async () => {
  const gender = document.getElementById("sexInput").value;
  const age = document.getElementById("ageInput").value;

  if (!currentUser) {
    return alert("Please sign in first.");
  }

  if (!gender || !age) {
    return alert("Please fill both gender and age.");
  }

  try {
    await setDoc(doc(db, "profiles", currentUser.uid), {
      uid: currentUser.uid,
      gender,
      age: Number(age),
    });
    alert("👤 Profile saved successfully!");
  } catch (err) {
    console.error("Profile save error:", err);
    alert("Failed to save profile");
  }
});

// Add Note
document.getElementById("saveNoteBtn").addEventListener("click", async () => {
  const noteText = document.getElementById("noteInput").value;
  if (!noteText || !currentUser) return alert("Sign in and enter a note.");

  try {
    await addDoc(collection(db, "notes"), {
      uid: currentUser.uid,
      note: noteText,
      timestamp: new Date()
    });
    document.getElementById("noteInput").value = "";
    alert("📝 Note saved successfully!");
    loadNotes();
  } catch (err) {
    console.error("Note save error:", err);
    alert("Failed to save note.");
  }
});

// Load Notes
async function loadNotes() {
  const list = document.getElementById("noteList");
  list.innerHTML = "";

  if (!currentUser) {
    return alert("Please sign in first.");
  }

  try {
    const q = query(collection(db, "notes"), where("uid", "==", currentUser.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("📭 No notes found.");
    } else {
      alert("📄 Notes fetched successfully!");
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const li = document.createElement("li");

      const noteText = document.createElement("div");
      noteText.textContent = data.note;

      const time = data.timestamp?.toDate().toLocaleString() || "No timestamp";
      const timeText = document.createElement("small");
      timeText.textContent = `🕒 ${time}`;

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete Note";
      delBtn.onclick = async () => {
        const confirmed = confirm("Are you sure you want to delete this note?");
        if (confirmed) {
          await deleteDoc(doc(db, "notes", docSnap.id));
          loadNotes();
        }
      };

      li.appendChild(noteText);
      li.appendChild(timeText);
      li.appendChild(delBtn);
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Note load error:", err);
    alert("Failed to load notes. Check permissions.");
  }
}
