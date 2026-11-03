import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";

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
    } catch (error) {
        console.error("Error loading hike:", error);
        document.getElementById("hikeName").textContent = "Error loading hike.";
    }
}

displayHikeInfo();
