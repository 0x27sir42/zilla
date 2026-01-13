// ================= CONFIG =================
const ADMIN = "0xdaf343Fa66b7ecA5e76246B47fE60857A0572A8E".toLowerCase();
const POLYGON_SCAN = "https://polygonscan.com/tx/";
const STAKING_ADDRESS = "0xef1CC2A23c0023093C545044d9f7154863715a27";
const PRESALE_ADDRESS = "0x72cF8781aa3A6D7FD3324CD0dAA8b858461849d7";

const STAKING_ABI = [{"inputs":[{"internalType":"address","name":"_zilaToken","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint8","name":"_plan","type":"uint8"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}];
const PRESALE_ABI = [{"inputs":[],"name":"buy","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdrawPOL","outputs":[],"stateMutability":"nonpayable","type":"function"}];

// ================= GLOBAL =================
let web3, account, staking, presale;
let supportDB = JSON.parse(localStorage.getItem("support")) || [];
let usersDB = JSON.parse(localStorage.getItem("users")) || [];
let pointsDB = JSON.parse(localStorage.getItem("points")) || [];

// ================= WALLET CONNECT =================
async function connectWallet(){
 if(!window.ethereum) return alert("Install MetaMask");
 web3 = new Web3(window.ethereum);
 account = (await ethereum.request({method:"eth_requestAccounts"}))[0];
 document.getElementById("connect").innerText = account.slice(0,6)+"..."+account.slice(-4);
 staking = new web3.eth.Contract(STAKING_ABI, STAKING_ADDRESS);
 presale = new web3.eth.Contract(PRESALE_ABI, PRESALE_ADDRESS);
 if(account.toLowerCase()===ADMIN) alert("Welcome Admin");
 localStorage.setItem("wallet",account);
}

// ================= PRESALE =================
async function buyPresale(){
 const val = parseFloat(document.getElementById("buyPol").value);
 if(val<20) return alert("Minimum purchase 20 POL");
 const wei = web3.utils.toWei(val.toString(),"ether");
 const tx = await presale.methods.buy().send({from:account,value:wei});
 addHistory("presaleHistory",tx.transactionHash);
}

async function claimPresale(){
 const tx = await presale.methods.claim().send({from:account});
 addHistory("presaleHistory",tx.transactionHash);
}

// ================= STAKING =================
async function stake(){
 const amt = parseFloat(document.getElementById("stakeAmount").value);
 if(amt<20000) return alert("Minimum staking 20,000 ZILA");
 const plan = document.getElementById("stakePlan").value;
 const wei = web3.utils.toWei(amt.toString(),"ether");
 const tx = await staking.methods.stake(wei,plan).send({from:account});
 addHistory("stakingHistory",tx.transactionHash);
}

async function unstake(){
 const tx = await staking.methods.unstake().send({from:account});
 addHistory("stakingHistory",tx.transactionHash);
}

async function claim(){
 const tx = await staking.methods.claim().send({from:account});
 addHistory("stakingHistory",tx.transactionHash);
}

// ================= HISTORY =================
function addHistory(id,hash){
 const div = document.getElementById(id);
 const a = document.createElement("a");
 a.href = POLYGON_SCAN+hash;
 a.target="_blank";
 a.innerText = hash;
 a.className="tx";
 div.prepend(a);
}

// ================= USER REGISTER / LOGIN =================
function registerUser(){
 const username = document.getElementById("regUsername").value;
 const email = document.getElementById("regEmail").value;
 const password = document.getElementById("regPass").value;
 const refCode = document.getElementById("regRef").value;
 if(usersDB.find(u=>u.username===username)) return alert("Username exists");
 const newUser = {username,email,password,refCode,profilePic:"https://via.placeholder.com/120",wallet:""};
 usersDB.push(newUser);
 localStorage.setItem("users",JSON.stringify(usersDB));
 alert("Registered! Check email for code verification");
 window.location.href="index.html";
}

function loginUser(){
 const email = document.getElementById("loginEmail").value;
 const password = document.getElementById("loginPass").value;
 const user = usersDB.find(u=>u.email===email && u.password===password);
 if(!user) return alert("Invalid credentials");
 account=user.wallet||"";
 alert("Login successful!");
 window.location.href="index.html";
}

// ================= PROFILE =================
function saveProfile(){
 const username = document.getElementById("username").value;
 const user = usersDB.find(u=>u.wallet===account);
 if(user) user.username=username;
 localStorage.setItem("users",JSON.stringify(usersDB));
 alert("Profile saved!");
}

function saveWallet(){
 const wal = document.getElementById("wallet").value;
 const user = usersDB.find(u=>u.username===document.getElementById("username").value);
 if(user) user.wallet=wal;
 localStorage.setItem("users",JSON.stringify(usersDB));
 alert("Wallet saved!");
}

function uploadProfilePic(){
 const file = prompt("Paste Image URL max 1MB");
 const user = usersDB.find(u=>u.wallet===account);
 if(file && user) user.profilePic=file;
 localStorage.setItem("users",JSON.stringify(usersDB));
 alert("Profile picture updated!");
}

// ================= TASK / POINTS =================
const sampleTasks=[
 {title:"Follow X account",link:"#",point:100},
 {title:"RT & Like Post 1",link:"#",point:100},
 {title:"Like Post 2",link:"#",point:100},
 {title:"Comment Post",link:"#",point:100},
 {title:"Task 5",link:"#",point:100},
 {title:"Task 6",link:"#",point:100}
];

function loadTasks(){
 const taskList=document.getElementById("taskList");
 taskList.innerHTML="";
 sampleTasks.forEach((t,i)=>{
  const btn=document.createElement("button");
  btn.innerText=`${t.title} - ${t.point} pts`;
  btn.onclick=()=>completeTask(i);
  taskList.appendChild(btn);
 });
}

function completeTask(i){
 const t=sampleTasks[i];
 const user=usersDB.find(u=>u.wallet===account);
 if(!user) return alert("Login first");
 pointsDB.push({username:user.username,task:t.title,point:t.point});
 localStorage.setItem("points",JSON.stringify(pointsDB));
 alert(`Task completed! +${t.point} points`);
}

// ================= LEADERBOARD =================
function loadLeaderboard(){
 const lb=document.getElementById("leaderboardList");
 const scores={};
 pointsDB.forEach(p=>{
   if(!scores[p.username]) scores[p.username]=0;
   scores[p.username]+=p.point;
 });
 const sorted=Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,100);
 lb.innerHTML="";
 sorted.forEach((u,i)=>{
   const div=document.createElement("div");
   div.innerText=`#${i+1} ${u[0]} - ${u[1]} pts`;
   lb.appendChild(div);
 });
}
