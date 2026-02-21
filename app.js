import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, collection, doc, setDoc, getDocs, query, where, onSnapshot, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

/* ===== Firebase Config ===== */
const firebaseConfig = {
  apiKey: "AIzaSyB8uRhsUJCxVO8gs7bNBhRYKh_JJEhrfDE",
  authDomain: "clark-56699.firebaseapp.com",
  projectId: "clark-56699",
  storageBucket: "clark-56699.firebasestorage.app",
  messagingSenderId: "254939761656",
  appId: "1:254939761656:web:31cb53af0b6210f71b640d",
  measurementId: "G-9PRJGJY11P"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* ===== Globals ===== */
let profiles = [];
let currentCard = 0;
let currentMatchId = null;
let currentChatUnsub = null;

/* ===== Homepage Buttons ===== */
document.getElementById('browseBtn').addEventListener('click', ()=>{
    document.getElementById('homepage').style.display='none';
    document.getElementById('signup-section').classList.remove('hidden');
});

document.getElementById('loginBtn').addEventListener('click', ()=>{
    document.getElementById('homepage').style.display='none';
    document.getElementById('login-section').classList.remove('hidden');
});

/* ===== Preview photo ===== */
document.getElementById('photo').addEventListener('change', function(e){
    const file = e.target.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(evt){
            const preview = document.getElementById('photo-preview');
            preview.src = evt.target.result;
            preview.classList.remove('hidden');
        }
        reader.readAsDataURL(file);
    }
});

/* ===== Sign Up ===== */
document.getElementById('signup-form').addEventListener('submit', async function(e){
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const desc = document.getElementById('desc').value;
    const files = document.getElementById('photo').files;

    try{
        const userCred = await createUserWithEmailAndPassword(auth,email,pass);
        const uid = userCred.user.uid;

        // Upload photos
        const photoURLs = [];
        for(const file of files){
            const storageRef = ref(storage, `profiles/${uid}/${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            photoURLs.push(url);
        }

        // Save profile
        await setDoc(doc(db,'profiles',uid), { name:`${name}, ${age}`, desc, imgs:photoURLs });

        alert("Profile imehifadhiwa kwenye Firebase!");

        // Show app only now
        showApp();

    }catch(err){
        alert(err.message);
    }
});

/* ===== Login Form ===== */
document.getElementById('login-form').addEventListener('submit', async function(e){
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try{
        await signInWithEmailAndPassword(auth,email,password);
        alert("Login Success!");
        document.getElementById('login-section').classList.add('hidden');
        showApp();
    }catch(err){
        alert(err.message);
    }
});

/* ===== Show App ===== */
function showApp(){
    document.getElementById('signup-section').classList.add('hidden');
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('homepage').style.display='none';
    document.getElementById('app').style.display='block';
    currentCard = 0;
    initApp();
}

/* ===== Auth State Changed ===== */
onAuthStateChanged(auth,(user)=>{
    // Always show homepage first
    document.getElementById('homepage').style.display = 'flex';
    document.getElementById('signup-section').classList.add('hidden');
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('app').style.display = 'none';
    // Do NOT auto-show cards even if user is logged in
});

/* ===== Init App ===== */
async function initApp(){
    await loadProfiles();
}

/* ===== Load profiles ===== */
async function loadProfiles(){
    const snapshot = await getDocs(collection(db,'profiles'));
    profiles = [];
    const currentUid = auth.currentUser.uid;

    snapshot.forEach(doc=>{
        if(doc.id !== currentUid){
            profiles.push({...doc.data(), uid: doc.id});
        }
    });

    document.getElementById('app').innerHTML = `
        <div class="buttons">
            <button class="dislike" id="btnDislike">✖</button>
            <button class="like" id="btnLike">❤️</button>
            <button id="chat-btn">💬</button>
        </div>
    `;

    profiles.forEach((p,i)=>createCard(p,i));

    document.getElementById('btnLike').addEventListener('click', async ()=>likeCurrentProfile());
    document.getElementById('btnDislike').addEventListener('click', ()=>swipe('left'));
}

/* ===== Create Card ===== */
function createCard(profile,index){
    const card = document.createElement('div');
    card.className='profile-card';
    card.id=`card${index}`;
    card.dataset.photoIndex = 0;

    card.style.backgroundImage = `url(${profile.imgs[0]})`;

    card.addEventListener('click', ()=>{
        let currentIndex = parseInt(card.dataset.photoIndex);
        currentIndex = (currentIndex + 1) % profile.imgs.length;
        card.dataset.photoIndex = currentIndex;
        card.style.backgroundImage = `url(${profile.imgs[currentIndex]})`;
    });

    card.innerHTML = `<div class="profile-info"><h2>${profile.name}</h2><p>${profile.desc}</p></div>`;
    document.getElementById('app').appendChild(card);
}

/* ===== Swipe ===== */
function swipe(dir){
    const card = document.getElementById(`card${currentCard}`);
    if(!card) return;
    card.style.transform = dir==='right'? 'translateX(1000px) rotate(30deg)' : 'translateX(-1000px) rotate(-30deg)';
    card.style.opacity=0;
    currentCard++;
}

/* ===== Like + Mutual Match ===== */
async function likeCurrentProfile(){
    const user = auth.currentUser;
    if(!user) return;
    const profile = profiles[currentCard];
    if(!profile) return;

    await setDoc(doc(collection(db,"likes")), { from:user.uid, to:profile.uid, timestamp:Date.now() });

    const q = query(collection(db,"likes"), where("from","==",profile.uid), where("to","==",user.uid));
    const mutualSnap = await getDocs(q);

    if(!mutualSnap.empty){
        const matchId = [user.uid,profile.uid].sort().join('_');
        currentMatchId = matchId;
        await setDoc(doc(db,"matches",matchId), { users:[user.uid,profile.uid], createdAt:Date.now() });
        await setDoc(doc(db,"chats",matchId), { users:[user.uid,profile.uid], messages:[] });
        alert("Ni match! Sasa unaweza ku-chat privately.");
        document.getElementById('chat-btn').style.display='inline-block';
    }

    swipe('right');
}

/* ===== Chat ===== */
document.getElementById('chat-btn').addEventListener('click', ()=>{
    document.getElementById('chat-box').style.display='flex';
    loadChat();
});

document.getElementById('sendChatBtn').addEventListener('click', async ()=>{
    const text = document.getElementById('chat-text').value;
    if(!text || !currentMatchId) return;
    const user = auth.currentUser;
    await updateDoc(doc(db,"chats",currentMatchId), {
        messages: arrayUnion({sender:user.uid,text,timestamp:Date.now()})
    });
    document.getElementById('chat-text').value='';
});

function loadChat(){
    if(currentChatUnsub) currentChatUnsub();
    currentChatUnsub = onSnapshot(doc(db,"chats",currentMatchId), docSnap=>{
        if(docSnap.exists()){
            const msgs = docSnap.data().messages;
            document.getElementById('chat-messages').innerHTML = msgs.map(m=>`<div><b>${m.sender}:</b> ${m.text}</div>`).join('');
            document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
        }
    });
}
