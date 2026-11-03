    import { db } from "./firebaseConfig.js";
    import { onAuthReady } from "./authentication.js";
    import { collection, addDoc, serverTimestamp } from "firebase/firestore";

    // Remember the logged-in user so we can save their ID with the hike
    let currentUser = null;

    onAuthReady(function (user) {
        if (!user) {
            location.href = "index.html";   // Not logged in → go away
            return;
        }
        currentUser = user;                 // Logged in → remember them
    });
        // ---- (1) What to do when the form is submitted ----
    async function saveHike(event) {
        event.preventDefault();   // Stop the browser from reloading the page

        // 1. Collect the form values into ONE object (this becomes the Firestore document)
        const newHike = {
            name: document.getElementById("hikeNameInput").value,
            city: document.getElementById("cityInput").value,
            level: document.getElementById("levelInput").value,
            length: Number(document.getElementById("lengthInput").value),   // store a number, not "10.5"
            details: document.getElementById("detailsInput").value,
            owner: currentUser.uid,                                       // WHO added it
            ownerName: currentUser.displayName || currentUser.email,
            last_updated: serverTimestamp()                               // WHEN it was added
        };

        // 2. Save it to the "hikes" collection
        try {
            await addDoc(collection(db, "hikes"), newHike);
            location.href = "main.html";    // 3. Go look at the new card
        } catch (error) {
            alert(`Error saving hike:\n${error.code || ""}\n${error.message || error}`);
        }
    }

    // ---- (2) Connect it: "form, when you are submitted, run saveHike" ----
    document.getElementById("addHikeForm").addEventListener("submit", saveHike);