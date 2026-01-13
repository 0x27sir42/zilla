// ================= CONFIG =================
const ADMIN = "0xdaf343Fa66b7ecA5e76246B47fE60857A0572A8E".toLowerCase();
const POLYGON_SCAN = "https://polygonscan.com/tx/";

const STAKING_ADDRESS = "0xef1CC2A23c0023093C545044d9f7154863715a27";
const PRESALE_ADDRESS = "0x72cF8781aa3A6D7FD3324CD0dAA8b858461849d7";

// ===== STAKING ABI =====
const STAKING_ABI = [{"inputs":[{"internalType":"address","name":"_zilaToken","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint8","name":"_plan","type":"uint8"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}];

// ===== PRESALE ABI =====
const PRESALE_ABI = [{"inputs":[],"name":"buy","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawPOL","outputs":[],"stateMutability":"nonpayable","type":"function"}];

// =========================================
let web3, account, staking, presale;
let supportDB = JSON.parse(localStorage.getItem("support")) || [];
let usersDB = JSON.parse(localStorage.getItem("usersDB")) || [];
let tasksDB = [
  {id:1,title:"Follow X account",link:"#",points:100},
  {id:2,title:"RT & Like postingan",link:"#",points:100},
  {id:3,title:"Like postingan ini juga",link:"#",points:100},
  {id:4,title:"Comment post",link:"#",points:100},
  {id:5,title:"Share post",link:"#",points:100}
];
let leaderboardDB = JSON.parse(localStorage.getItem("leaderboard")) || [];

// ================= WALLET =================
async function connectWallet(){
  if(!window.ethereum) return alert("Install MetaMask");
  web3 = new Web3(window.ethereum);
  account = (await ethereum.request({method:"eth_requestAccounts"}))[0];
  
  // signature verification
  const message = "Connect ZILA Wallet";
  const signature = await web3.eth.personal.sign(message, account);
  
  document.getElementById("connect").innerText = account.slice(0,6)+"..."+account.slice(-4);
  document.getElementById("walletStatus")?.innerText = "Connected: " + account;
  
  staking = new web3.eth.Contract(STAKING_ABI, STAKING_ADDRESS);
  presale = new web3.eth.Contract(PRESALE_ABI, PRESALE_ADDRESS);

  if(account.toLowerCase() === ADMIN){
    document.getElementById("admin")?.classList.remove("hidden");
    loadInbox();
  }
}
document.getElementById("connect")?.addEventListener("click", connectWallet);

// ================= PRESALE =================
async function buyPresale(){
  const pol = parseFloat(document.getElementById("buyPol").value);
  if(pol < 20) return alert("Minimum purchase is 20 POL");
  const val = web3.utils.toWei(pol.toString(),"ether");
  const tx = await presale.methods.buy().send({from:account,value:val});
  addHistory("presaleHistory", tx.transactionHash);
}
async function claimPresale(){
  const tx = await presale.methods.claim().send({from:account});
  addHistory("presaleHistory", tx.transactionHash);
}

// ================= STAKING =================
async function stake(){
  const amt = parseFloat(document.getElementById("stakeAmount").value);
  const plan = document.getElementById("stakePlan").value;
  // minimum stake rules
  if(plan=="0" && amt<20000) return alert("Minimum 20,000 ZILA for flexible plan");
  if(plan=="1" && amt<50000) return alert("Minimum 50,000 ZILA for 6 months");
  if(plan=="2" && amt<100000) return alert("Minimum 100,000 ZILA for 1 year");
  const amtWei = web3.utils.toWei(amt.toString(),"ether");
  const tx = await staking.methods.stake(amtWei, plan).send({from:account});
  addHistory("stakingHistory", tx.transactionHash);
}
async function unstake(){
  const tx = await staking.methods.unstake().send({from:account});
  addHistory("stakingHistory", tx.transactionHash);
}
async function claim(){
  const tx = await staking.methods.claim().send({from:account});
  addHistory("stakingHistory", tx.transactionHash);
}

// ================= ADMIN =================
async function adminWithdraw(){
  if(account.toLowerCase() !== ADMIN) return alert("ADMIN ONLY");
  const tx = await presale.methods.withdrawPOL().send({from:account});
  alert("Withdraw success");
  addHistory("presaleHistory", tx.transactionHash);
}

// ================= HISTORY =================
function addHistory(id, hash){
  const div = document.getElementById(id);
  if(!div) return;
  const a = document.createElement("a");
  a.href = POLYGON_SCAN + hash;
  a.target = "_blank";
  a.innerText = hash;
  a.className = "tx";
  div.prepend(a);
}

// ================= SUPPORT =================
function sendSupport(type){
  const msg = type==="presale"
    ? document.getElementById("psMsg").value
    : document.getElementById("stkMsg").value;
  supportDB.push({from:account,type,msg,reply:""});
  localStorage.setItem("support", JSON.stringify(supportDB));
  alert("Support request sent");
}
function loadInbox(){
  const box = document.getElementById("adminInbox");
  if(!box) return;
  box.innerHTML="";
  supportDB.forEach((s)=>{
    box.innerHTML += `<p><b>${s.type}</b><br>${s.from}<br>${s.msg}</p><hr>`;
  });
}
function replySupport(){
  const reply = document.getElementById("adminReply").value;
  supportDB[supportDB.length-1].reply = reply;
  localStorage.setItem("support", JSON.stringify(supportDB));
  alert("Reply sent (only user can see)");
}

// ================= REGISTER / LOGIN =================
function registerUser(){
  const username = document.getElementById("regUsername").value;
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const ref = document.getElementById("regRef").value;
  if(!username || !email || !password) return alert("Fill all fields");
  if(usersDB.find(u=>u.email===email)) return alert("Email already registered");
  const user = {id:Date.now(),username,email,password,ref,points:0,profilePic:"https://via.placeholder.com/120"};
  usersDB.push(user);
  localStorage.setItem("usersDB", JSON.stringify(usersDB));
  alert("Registered successfully. Check email for 4-digit code to verify");
}

// ================= PROFILE =================
function uploadProfilePic(){
  const input = document.createElement("input");
  input.type="file";
  input.accept="image/*";
  input.onchange = e=>{
    const file = e.target.files[0];
    if(file.size>1024*1024) return alert("Max 1MB");
    const reader = new FileReader();
    reader.onload = function(ev){
      document.getElementById("profilePic").src = ev.target.result;
      const user = usersDB.find(u=>u.email===localStorage.getItem("currentUser"));
      if(user){ user.profilePic = ev.target.result; localStorage.setItem("usersDB", JSON.stringify(usersDB)); }
    }
    reader.readAsDataURL(file);
  }
  input.click();
}
function saveProfile(){
  const user = usersDB.find(u=>u.email===localStorage.getItem("currentUser"));
  if(!user) return alert("Not logged in");
  user.username = document.getElementById("username").value;
  localStorage.setItem("usersDB", JSON.stringify(usersDB));
  alert("Profile saved");
}
function saveWallet(){
  const user = usersDB.find(u=>u.email===localStorage.getItem("currentUser"));
  if(!user) return alert("Not logged in");
  user.wallet = document.getElementById("wallet").value;
  localStorage.setItem("usersDB", JSON.stringify(usersDB));
  alert("Wallet saved ✅");
}

// ================= TASK =================
function loadTasks(){
  const div = document.getElementById("taskList");
  if(!div) return;
  div.innerHTML="";
  tasksDB.forEach(t=>{
    const taskDiv = document.createElement("div");
    taskDiv.className="task";
    taskDiv.innerHTML=`<span>${t.title} (+${t.points} pts)</span><button onclick="completeTask(${t.id})">Do Task</button>`;
    div.appendChild(taskDiv);
  });
}
function completeTask(id){
  const user = usersDB.find(u=>u.email===localStorage.getItem("currentUser"));
  if(!user) return alert("Login first");
  const task = tasksDB.find(t=>t.id===id);
  if(!task) return;
  // Simulate checking completion, add points
  user.points += task.points;
  localStorage.setItem("usersDB", JSON.stringify(usersDB));
  updateLeaderboard();
  alert(`Task completed! +${task.points} points`);
  loadTasks();
}

// ================= LEADERBOARD =================
function updateLeaderboard(){
  leaderboardDB = usersDB.sort((a,b)=>b.points-a.points).slice(0,100);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboardDB));
  const div = document.getElementById("leaderboardList");
  if(!div) return;
  div.innerHTML="";
  leaderboardDB.forEach((u,i)=>{
    div.innerHTML += `<div class="userRow">${i+1}. ${u.username} - ${u.points} pts</div>`;
  });
}

// ================= CHART EXAMPLE =================
let price = 0.000625;
const ctx = document.getElementById("chart")?.getContext("2d");
if(ctx){
  const prices = Array(25).fill(price);
  const chart = new Chart(ctx,{
    type:"line",
    data:{labels:Array(25).fill(0).map((_,i)=>i),datasets:[{data:prices,borderWidth:2,borderColor:"#00ffd5",tension:.4,pointRadius:0}]},
    options:{plugins:{legend:{display:false}},scales:{x:{display:false},y:{display:false}}}
  });
  setInterval(()=>{
    price += (Math.random()*0.00000015);
    prices.push(price);
    prices.shift();
    chart.update();
    document.getElementById("priceLabel")?.innerText="Current Price: "+price.toFixed(8)+" POL";
  },3000);
}

// ================= INITIALIZE =================
window.onload = ()=>{
  loadTasks();
  updateLeaderboard();
}
