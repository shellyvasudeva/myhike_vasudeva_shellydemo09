import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { updateDoc, increment } from "firebase/firestore";

// Declare variable: the hike ID from the URL (eachHike.html?docID=abc123)
const params = new URL(window.location.href).searchParams;
const hikeId = params.get("docID");

// Fetch the hike and display its name and image
async function displayHikeInfo() {
    try {
        const hikeRef = doc(db, "hikes", hikeId);
        const hikeSnap = await getDoc(hikeRef);

        const hike = hikeSnap.data();
        const name = hike.name;
        const code = hike.code;

        // Update the page
        document.getElementById("hikeName").textContent = name;
        const img = document.getElementById("hikeImage");
        img.src = `./images/${code}.jpg`;
        img.alt = `${name} image`;
        // [BACK END] Count this visit: add 1 to this hike's "views" in Firestore
        await updateDoc(hikeRef, { views: increment(1) });

        // [FRONT END] Show the new number (old count + this visit)
        document.getElementById("viewCount").textContent = (hike.views || 0) + 1;
    } catch (error) {
        console.error("Error loading hike:", error);
        document.getElementById("hikeName").textContent = "Error loading hike.";
    }
}

displayHikeInfo();
