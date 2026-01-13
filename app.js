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

// ================= WALLET CONNECT =================
async function connectWallet() {
    if(!window.ethereum) return alert("Install MetaMask");
    web3 = new Web3(window.ethereum);
    
    const accounts = await ethereum.request({method:"eth_requestAccounts"});
    account = accounts[0];

    // Request signature for on-chain verification
    const message = `ZILA Connect: ${new Date().toISOString()}`;
    const signature = await web3.eth.personal.sign(message, account);

    alert(`Wallet connected & signed!\nAddress: ${account}\nSignature: ${signature}`);
    document.getElementById("connect").innerText = account.slice(0,6)+"..."+account.slice(-4);
    navigator.clipboard.writeText(account);

    staking = new web3.eth.Contract(STAKING_ABI, STAKING_ADDRESS);
    presale = new web3.eth.Contract(PRESALE_ABI, PRESALE_ADDRESS);

    if(account.toLowerCase() === ADMIN){
        const adminSection = document.getElementById("admin");
        if(adminSection) adminSection.classList.remove("hidden");
        loadInbox();
    }
}

document.getElementById("connect")?.addEventListener("click", connectWallet);

// ================= PRESALE =================
const MIN_BUY_POL = 20; // Minimum purchase
async function buyPresale() {
    const val = parseFloat(document.getElementById("buyPol").value);
    if(val < MIN_BUY_POL) return alert(`Minimum purchase is ${MIN_BUY_POL} POL`);
    const weiValue = web3.utils.toWei(val.toString(), "ether");

    const tx = await presale.methods.buy().send({from: account, value: weiValue});
    addHistory("presaleHistory", tx.transactionHash);
    alert("Purchase successful!");
}

async function claimPresale() {
    const tx = await presale.methods.claim().send({from: account});
    addHistory("presaleHistory", tx.transactionHash);
    alert("Claim successful!");
}

// ================= STAKING =================
const MIN_STAKE_ZILA = 20000;
const MIN_STAKE_POL = 50;

async function stakeZILA() {
    const amt = parseFloat(document.getElementById("stakeAmount").value);
    const plan = parseInt(document.getElementById("stakePlan").value);
    if(amt < MIN_STAKE_ZILA) return alert(`Minimum stake ${MIN_STAKE_ZILA} ZILA`);

    const weiAmt = web3.utils.toWei(amt.toString(), "ether");
    const tx = await staking.methods.stake(weiAmt, plan).send({from: account});
    addHistory("stakingHistory", tx.transactionHash);
    alert("Stake successful!");
}

async function unstake() {
    const tx = await staking.methods.unstake().send({from: account});
    addHistory("stakingHistory", tx.transactionHash);
    alert("Unstake successful!");
}

async function claim() {
    const tx = await staking.methods.claim().send({from: account});
    addHistory("stakingHistory", tx.transactionHash);
    alert("Claim reward successful!");
}

// ================= STAKE POL =================
async function stakePOL() {
    const amt = parseFloat(document.getElementById("stakePol").value);
    if(amt < MIN_STAKE_POL) return alert(`Minimum stake ${MIN_STAKE_POL} POL`);
    const weiAmt = web3.utils.toWei(amt.toString(), "ether");

    const tx = await presale.methods.buy().send({from: account, value: weiAmt});
    addHistory("polHistory", tx.transactionHash);
    alert("POL Stake successful!");
}

// ================= ADMIN =================
async function adminWithdraw() {
    if(account.toLowerCase() !== ADMIN) return alert("ADMIN ONLY");
    const tx = await presale.methods.withdrawPOL().send({from: account});
    addHistory("presaleHistory", tx.transactionHash);
    alert("Admin withdraw successful!");
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
    const msg = type==="presale" ? document.getElementById("psMsg").value : document.getElementById("stkMsg").value;
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
