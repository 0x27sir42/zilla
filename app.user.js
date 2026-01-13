// ===== DATABASE SIMULATION =====
let usersDB = JSON.parse(localStorage.getItem("usersDB")) || [];
let tasksDB = [
  {id:1,title:"Follow account X",link:"https://x.com/zila",points:100},
  {id:2,title:"RT & Like postingan ini",link:"https://x.com/post1",points:100},
  {id:3,title:"Like postingan ini 2",link:"https://x.com/post2",points:100},
  {id:4,title:"Comment postingan",link:"https://x.com/post3",points:100},
  {id:5,title:"Share post",link:"https://x.com/post4",points:100}
];

// ===== MODAL LOGIN =====
const authModal = document.getElementById("authModal");
document.getElementById("loginBtn").onclick = ()=> authModal.classList.add("active");

document.getElementById("authSubmit").onclick = ()=>{
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const profileImage = document.getElementById("profileImage").files[0];
    const xAcc = document.getElementById("xAccount").value.trim();
    const tgAcc = document.getElementById("telegramAccount").value.trim();

    if(!username || !email || !password) return alert("Fill required fields");

    if(profileImage && profileImage.size > 1024*1024) return alert("Max image size 1MB");

    let user = usersDB.find(u=>u.email===email);
    if(!user){
        // Register
        user = {id:Date.now(),username,email,password,profile:"",xAcc,tgAcc,points:0,completedTasks:[]};
        if(profileImage){
            const reader = new FileReader();
            reader.onload = function(e){ user.profile = e.target.result; saveUser(user); };
            reader.readAsDataURL(profileImage);
        } else saveUser(user);
        alert("Registered!");
    } else {
        // Login
        if(user.password!==password) return alert("Wrong password");
        alert("Login successful!");
    }
    authModal.classList.remove("active");
    renderProfiles();
    renderTasks();
    renderLeaderboard();
}

function saveUser(user){
    const idx = usersDB.findIndex(u=>u.email===user.email);
    if(idx>=0) usersDB[idx]=user;
    else usersDB.push(user);
    localStorage.setItem("usersDB",JSON.stringify(usersDB));
}

// ===== RENDER PROFILES =====
function renderProfiles(){
    const container = document.getElementById("profiles");
    container.innerHTML="";
    usersDB.forEach(u=>{
        container.innerHTML+=`
            <div class="profile">
                <div class="profile-info">
                    <img src="${u.profile || 'https://via.placeholder.com/80'}" alt="">
                    <div>
                        <b>${u.username}</b><br>
                        X: ${u.xAcc || '-'}<br>
                        Telegram: ${u.tgAcc || '-'}<br>
                        Points: ${u.points}
                    </div>
                </div>
            </div>
        `;
    });
}

// ===== TASKS =====
function renderTasks(){
    const container = document.getElementById("tasks");
    container.innerHTML="";
    tasksDB.forEach(t=>{
        container.innerHTML+=`
            <div class="task" onclick="completeTask(${t.id})">
                ${t.title} - ${t.points} points
            </div>
        `;
    });
}

function completeTask(taskId){
    const user = usersDB[0]; // contoh: user pertama
    if(!user) return alert("Please login");

    if(user.completedTasks.includes(taskId)) return alert("Task already completed");

    user.completedTasks.push(taskId);
    const task = tasksDB.find(t=>t.id===taskId);
    user.points += task.points;
    saveUser(user);
    alert(`Task completed! +${task.points} points`);
    renderProfiles();
    renderLeaderboard();
}

// ===== LEADERBOARD =====
function renderLeaderboard(){
    const container = document.getElementById("leaderboard");
    container.innerHTML="";
    const sorted = [...usersDB].sort((a,b)=>b.points-a.points).slice(0,100);
    sorted.forEach((u,i)=>{
        container.innerHTML+=`${i+1}. ${u.username} - ${u.points} points<br>`;
    });
}

// ===== INITIAL RENDER =====
renderProfiles();
renderTasks();
renderLeaderboard();
