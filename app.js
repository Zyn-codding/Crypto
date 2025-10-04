const users = {
  "ACC_DEV": { password: "ZYN", balance: 1000 },
  "USER_123": { password: "user1", balance: 10 },
  "Anomaly1": { password: "Tung", balance: 10 }
};

let currentUser = null;
let balance = 0;
let chart, chartData = [];
let currentCoin = "BTC";
let position = null;
let timer;

// LOGIN
function login() {
  let u = document.getElementById("username").value;
  let p = document.getElementById("password").value;
  if (users[u] && users[u].password === p) {
    currentUser = u;
    balance = parseFloat(localStorage.getItem(u+"_balance")) || users[u].balance;
    localStorage.setItem("loggedUser", u);
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("loginError").innerText = "Invalid credentials!";
  }
}

// DASHBOARD INIT
window.onload = () => {
  if (document.getElementById("balance")) {
    currentUser = localStorage.getItem("loggedUser");
    if (!currentUser) {
      window.location.href = "index.html";
      return;
    }
    balance = parseFloat(localStorage.getItem(currentUser+"_balance")) || users[currentUser].balance;
    document.getElementById("balance").innerText = balance.toFixed(2);

    let sel = document.getElementById("coinSelect");
    for (let c in coins) {
      let opt = document.createElement("option");
      opt.value = c;
      opt.text = c;
      sel.appendChild(opt);
    }
    changeCoin();
  }
};

// CHART
function changeCoin() {
  currentCoin = document.getElementById("coinSelect").value;
  chartData = generateInitialData(coins[currentCoin]);
  if (chart) chart.destroy();
  clearInterval(timer);

  let ctx = document.getElementById("cryptoChart").getContext("2d");
  chart = new Chart(ctx, {
    type: 'candlestick',
    data: { datasets: [{ label: currentCoin, data: chartData }] },
    options: {
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: {
        x: { ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      }
    }
  });
  timer = setInterval(() => updateChart(), 2000);
}

function generateInitialData(price) {
  let data = [];
  for (let i=0; i<30; i++) {
    let open = price;
    let close = open + (Math.random()-0.5)*open*0.02;
    let high = Math.max(open, close) + Math.random()*open*0.01;
    let low = Math.min(open, close) - Math.random()*open*0.01;
    data.push({x: i, o: open, h: high, l: low, c: close});
    price = close;
  }
  return data;
}

function updateChart() {
  let last = chartData[chartData.length-1];
  let idx = chartData.length;
  let open = last.c;
  let close = open + (Math.random()-0.5)*open*0.02;
  let high = Math.max(open, close) + Math.random()*open*0.01;
  let low = Math.min(open, close) - Math.random()*open*0.01;
  chartData.push({x: idx, o: open, h: high, l: low, c: close});
  if (chartData.length > 50) chartData.shift();
  chart.update();

  if (position && position.coin === currentCoin) {
    let profit = (close - position.price);
    if (["BTC","ETH","LTC","BNB","NEO"].includes(currentCoin)) profit *= 0.1;
    document.getElementById("balance").innerText = (balance+profit).toFixed(2);
  }
}

// TRADING
function buy() {
  if (position) { alert("Already holding! Sell first."); return; }
  let last = chartData[chartData.length-1];
  position = {coin: currentCoin, price: last.c};
  addHistory("BUY " + currentCoin + " @ $" + last.c.toFixed(2));
}

function sell() {
  if (!position) { alert("No active position!"); return; }
  let last = chartData[chartData.length-1];
  let profit = (last.c - position.price);
  if (["BTC","ETH","LTC","BNB","NEO"].includes(currentCoin)) profit *= 0.1;
  balance += profit;
  localStorage.setItem(currentUser+"_balance", balance);
  document.getElementById("balance").innerText = balance.toFixed(2);
  addHistory("SELL " + currentCoin + " @ $" + last.c.toFixed(2) + " | P/L: $" + profit.toFixed(2));
  position = null;
}

// RIWAYAT
function addHistory(msg) {
  let ul = document.getElementById("history");
  let li = document.createElement("li");
  li.innerText = msg;
  ul.prepend(li);
}
