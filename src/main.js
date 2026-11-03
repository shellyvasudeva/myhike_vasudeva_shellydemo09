import { onAuthReady } from "/src/authentication.js";
import { db } from "./firebaseConfig.js";
import { doc, onSnapshot } from "firebase/firestore";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";

let currentUser = null;   // who is logged in
let favourites = [];      // the hike IDs they've favourited

function showName() {
    onAuthReady(function (user) {
        // console.log(user.displayName);
        if (user) {
            const name = document.getElementById("name-goes-here");
            const nameInFirebase = user.displayName || user.email;
            name.textContent = nameInFirebase;
        } else {
            console.log("user not logged in")
        }
    })
}
showName();


function readQuote(day) {
    //refrence to the quotes collection
    const quoteRef = doc(db, "quotes", day);

    //read the collection
    onSnapshot(quoteRef, docSnap => {
        if (docSnap.exists()) {
            //replace the front end with the quote from the day document
            document.getElementById("quote-goes-here").innerHTML = docSnap.data().quote;
        } else {
            console.log("no such document");
        }

    }, (error) => {
        console.error("failed reading the document", error);
    })

}
readQuote("tuesday");

// Helper function to add the sample hike documents.
function addHikeData() {
    const hikesRef = collection(db, "hikes");
    console.log("Adding sample hike data...");
    addDoc(hikesRef, {
        code: "BBY01", name: "Burnaby Lake Park Trail", city: "Burnaby",
        level: "easy", details: "A lovely place for a lunch walk.", length: 10,
        hike_time: 60, lat: 49.2467097082573, lng: -122.9187029619698,
        last_updated: serverTimestamp()
    });
    addDoc(hikesRef, {
        code: "AM01", name: "Buntzen Lake Trail", city: "Anmore",
        level: "moderate", details: "Close to town, and relaxing.", length: 10.5,
        hike_time: 80, lat: 49.3399431028579, lng: -122.85908496766939,
        last_updated: serverTimestamp()
    });
    addDoc(hikesRef, {
        code: "NV01", name: "Mount Seymour Trail", city: "North Vancouver",
        level: "hard", details: "Amazing ski slope views.", length: 8.2,
        hike_time: 120, lat: 49.38847101455571, lng: -122.94092543551031,
        last_updated: serverTimestamp()
    });
}

async function seedHikes() {
    //make reference to the hikes collection
    const hikesRef = collection(db, "hikes");

    //read this hikesRef to go through checks later:
    const hikesSnapshot = await getDocs(hikesRef);

    //if hikes collection does not exist, then write
    if (hikesSnapshot.empty) {
        console.log("seeding the hikes collection...")
        addHikeData();
    } else {
        //else do nothing
        // console.log("hikes collection already exists")
    }
}
seedHikes()


async function displayHikesDynamically() {
    // reference to the hikes colleciton
    const hikesRef = collection(db, "hikes");

    // get the template from front-end
    let cartTemplate = document.getElementById("hikeCardTemplate");

    // read the hikes colelciton
    const querySnapshot = await getDocs(hikesRef);

    //loop through three hikes
    querySnapshot.forEach(doc => {
        // create the copy of the template
        let newcard = cartTemplate.content.cloneNode(true);

        //read this hike in the loop
        const hike = doc.data();

        //populate data in the template
        newcard.querySelector('.card-title').textContent = hike.name;
        newcard.querySelector('.card-text').textContent = hike.details || `Located in ${hike.city}.`;
        newcard.querySelector('.card-length').textContent = hike.length;
        newcard.querySelector('.card-image').src = `./images/${hike.code}.jpg`;
        newcard.querySelector(".read-more").href = `eachHike.html?docID=${doc.id}`;
        // Activate the heart for this card
        setupHeart(newcard, doc.id);

        // attach the template to the fron-end
        document.getElementById("hikes-go-here").appendChild(newcard);
    })


}
function setupHeart(card, hikeID) {

    // Find the heart icon
    const heart = card.querySelector(".fav-btn");

    // Fill the heart if already favourited
    if (favourites.includes(hikeID)) {
        heart.classList.replace("bi-heart", "bi-heart-fill");
    }

    // When clicked, run toggleFavourite
    heart.addEventListener("click", function () {
        toggleFavourite(heart, hikeID);
    });
}
async function toggleFavourite(heart, hikeID) {

    // Find the logged-in user's document
    const userRef = doc(db, "users", currentUser.uid);

    // If heart is filled, remove favourite
    if (heart.classList.contains("bi-heart-fill")) {

        await setDoc(userRef, { favourites: arrayRemove(hikeID) }, { merge: true });

        heart.classList.replace("bi-heart-fill", "bi-heart");

    } else {

        // If heart is empty, add favourite
        await setDoc(userRef, { favourites: arrayUnion(hikeID) }, { merge: true });

        heart.classList.replace("bi-heart", "bi-heart-fill");
    }
}
// Runs once Firebase knows if someone is logged in
onAuthReady(async function (user) {
  if (!user) {
    location.href = "index.html";                              // Not logged in → back to start
  } else {
    currentUser = user;                                        // 1. Remember who's logged in
    const userDoc = await getDoc(doc(db, "users", user.uid));  // 2. Get their user doc

    // 3. Load user's favourites, or use an empty array if none exist
    favourites = userDoc.data()?.favourites || [];   // uses "optional chaining" (?.)

    // Beginner version of the line above:
    // if (userDoc.exists() && userDoc.data().favourites) {
    //   favourites = userDoc.data().favourites;
    // } else {
    //   favourites = [];
    // }

    displayHikesDynamically();                                 // 4. Draw the cards
  }
});