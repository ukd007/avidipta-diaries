// ===== NEW CODE: Socket.IO connection and update emitter =====
const socket = io();

let localMatchState = {
  score: 0,
  wickets: 0,
  overs: 0.0,
  batsman1: window.matchData?.batsman1 || 'Player 1',
  batsman2: window.matchData?.batsman2 || 'Player 2',
  bowler: window.matchData?.bowler || 'Bowler 1',
  balls: []
};

function emitUpdate() {
  const totalOvers = Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0) + overBalls / 6;
  socket.emit('update', {
    score: totalRuns,
    wickets,
    overs: Math.floor(totalOvers) + '.' + (overBalls % 6),
    batsman1: batsman1.name + (onStrike === batsman1 ? '*' : ''),
    batsman2: batsman2.name + (onStrike === batsman2 ? '*' : ''),
    bowler: currentBowler,
    balls: Array.from(document.querySelectorAll('#over-summary .ball')).map(b => b.textContent)
  });
}

socket.on('update', (data) => {
  document.querySelector('.score-display').textContent = `${data.score}/${data.wickets}`;
  document.querySelector('.over-display').textContent = `(${data.overs})`;
  document.querySelector('.bat1-name').textContent = data.batsman1;
  document.querySelector('.bat2-name').textContent = data.batsman2;
  document.querySelector('.bowler-name').textContent = data.bowler;

  const summaryEl = document.getElementById('over-summary');
  summaryEl.innerHTML = '';
  data.balls.forEach((ball) => {
    const span = document.createElement('span');
    span.className = 'mx-1';
    span.textContent = ball;
    summaryEl.appendChild(span);
  });
});
// ===== END OF NEW CODE =====

let batsman1 = { name: window.matchData.batsman1, runs: 0, balls: 0, fours: 0, sixes: 0 };
let batsman2 = { name: window.matchData.batsman2, runs: 0, balls: 0, fours: 0, sixes: 0 };
let currentBowler = window.matchData.bowler;

let onStrike = batsman1;
let nonStriker = batsman2;
let overBalls = 0;
let totalRuns = 0;
let wickets = 0;
let pendingWicket = false;
let pendingBowlerModal = false;

let bowlers = {
  [currentBowler]: { overs: 0, runs: 0 }
};

const historyStack = [];

function updateBatsmanUI() {
  document.querySelector(".bat1-name").textContent = batsman1 === onStrike ? batsman1.name + "*" : batsman1.name;
  document.querySelector(".bat2-name").textContent = batsman2 === onStrike ? batsman2.name + "*" : batsman2.name;

  const rows = document.querySelectorAll(".score-table tbody tr");
  rows[0].children[1].textContent = batsman1.runs;
  rows[0].children[2].textContent = batsman1.balls;
  rows[0].children[3].textContent = batsman1.fours;
  rows[0].children[4].textContent = batsman1.sixes;
  rows[0].children[5].textContent = batsman1.balls > 0 ? ((batsman1.runs / batsman1.balls) * 100).toFixed(1) : "0.0";

  rows[1].children[1].textContent = batsman2.runs;
  rows[1].children[2].textContent = batsman2.balls;
  rows[1].children[3].textContent = batsman2.fours;
  rows[1].children[4].textContent = batsman2.sixes;
  rows[1].children[5].textContent = batsman2.balls > 0 ? ((batsman2.runs / batsman2.balls) * 100).toFixed(1) : "0.0";
}

function updateScoreboard() {
  const totalOvers = Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0) + overBalls / 6;
  document.querySelector(".score-display").textContent = `${totalRuns} - ${wickets}`;
  document.querySelector(".over-display").textContent = `(${Math.floor(totalOvers)}.${overBalls % 6})`;
}

function updateCRR() {
  const totalBalls = Object.values(bowlers).reduce((acc, b) => acc + b.overs * 6, 0) + overBalls;
  const oversFaced = totalBalls / 6;
  const crr = oversFaced > 0 ? (totalRuns / oversFaced).toFixed(2) : "0.00";
  document.getElementById("crrValue").textContent = crr;
}

function updateBowlerStats() {
  const stats = bowlers[currentBowler];
  document.querySelector(".bowler-name").textContent = currentBowler;
  document.querySelector(".bow-runs").textContent = stats.runs;
  document.querySelector(".bow-overs").textContent = `${stats.overs}.${overBalls}`;
  const totalBalls = stats.overs * 6 + overBalls;
  const economy = (stats.runs / (totalBalls / 6)).toFixed(1);
  document.querySelector(".bow-eco").textContent = isNaN(economy) ? "0.0" : economy;
}

function saveState() {
  historyStack.push({
    batsman1: { ...batsman1 },
    batsman2: { ...batsman2 },
    onStrikeName: onStrike.name,
    totalRuns,
    wickets,
    overBalls,
    currentBowler,
    bowlers: JSON.parse(JSON.stringify(bowlers)),
    overHTML: document.getElementById("over-summary").innerHTML
  });
}

function restoreState() {
  if (historyStack.length === 0) return alert("Nothing to undo!");
  const prev = historyStack.pop();
  batsman1 = { ...prev.batsman1 };
  batsman2 = { ...prev.batsman2 };
  onStrike = batsman1.name === prev.onStrikeName ? batsman1 : batsman2;
  nonStriker = onStrike === batsman1 ? batsman2 : batsman1;
  totalRuns = prev.totalRuns;
  wickets = prev.wickets;
  overBalls = prev.overBalls;
  currentBowler = prev.currentBowler;
  bowlers = JSON.parse(JSON.stringify(prev.bowlers));
  document.getElementById("over-summary").innerHTML = prev.overHTML;
  updateBatsmanUI();
  updateScoreboard();
  updateBowlerStats();
  updateCRR();

  localMatchState.batsman1 = { ...batsman1 };
localMatchState.batsman2 = {...batsman2};
localMatchState.bowler = {...currentBowler};
localMatchState.score = {...totalRuns};
localMatchState.wickets = {...wickets};
localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls}`);
localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
  emitUpdate(); // ===== NEW CODE =====
}


function handleRun(run) {
  saveState();

  const isWicket = document.getElementById("defaultCheck1").checked;
  const isWide = document.getElementById("defaultCheck2").checked;
  const isNoBall = document.getElementById("defaultCheck3").checked;

  let extra = 0;
  let ballText = "";

  if (isWide || isNoBall) {
    extra = 1;
    totalRuns += extra + run;
    bowlers[currentBowler].runs += extra + run;
    onStrike.runs += run;
    if (run === 4) onStrike.fours++;
    if (run === 6) onStrike.sixes++;
    ballText = (isWide ? "Wd" : "Nb") + (run > 0 ? "+" + run : "");
  } else {
    totalRuns += run;
    onStrike.runs += run;
    onStrike.balls++;
    bowlers[currentBowler].runs += run;
    if (run === 4) onStrike.fours++;
    if (run === 6) onStrike.sixes++;
    overBalls++;
    ballText = isWicket ? "W" : run;
    if (run % 2 === 1) [onStrike, nonStriker] = [nonStriker, onStrike];
    if (isWicket) {
      wickets++;
      pendingWicket = true;
      pendingBowlerModal = false;
      setTimeout(() => {
        const modal = new bootstrap.Modal(document.getElementById("wicketModal"));
        modal.show();
      }, 300);
    }
  }

  const ballDiv = document.createElement("div");
  ballDiv.className = "ball p-2 border rounded m-1";
  ballDiv.textContent = ballText;
  document.getElementById("over-summary").appendChild(ballDiv);

  if (!isWide && !isNoBall && overBalls === 6) {
    overBalls = 0;
    bowlers[currentBowler].overs++;
    [onStrike, nonStriker] = [nonStriker, onStrike];
    if (pendingWicket) {
      pendingBowlerModal = true;
    } else {
      const newBowlerModal = new bootstrap.Modal(document.getElementById("newBowlerModal"));
      newBowlerModal.show();
    }
  }

  document.getElementById("defaultCheck1").checked = false;
  document.getElementById("defaultCheck2").checked = false;
  document.getElementById("defaultCheck3").checked = false;

  updateBatsmanUI();
  updateScoreboard();
  updateBowlerStats();
  updateCRR();
  localMatchState.batsman1 = batsman1.name;
localMatchState.batsman2 = batsman2.name;
localMatchState.bowler = currentBowler;
localMatchState.score = totalRuns;
localMatchState.wickets = wickets;
localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls}`);
localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
  emitUpdate(); // ===== NEW CODE =====
}

document.getElementById("wicketType").addEventListener("change", function () {
  const needsHelper = ["catch", "stumping"].includes(this.value);
  document.getElementById("helperField").classList.toggle("d-none", !needsHelper);
});

document.getElementById("wicketForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const wicketType = document.getElementById("wicketType").value;
  const helper = document.getElementById("helperName").value.trim();
  const newBatsmanName = document.getElementById("newBatsmanName").value.trim();

  if (!newBatsmanName) return alert("Please enter a new batsman name.");

  const outInfo = helper ? `${wicketType} (${helper})` : wicketType;
  console.log(`${onStrike.name} is out: ${outInfo}`);

  if (wicketType === "runout") {
    const whoOut = prompt("Who was run out? Type 'striker' or 'non-striker':");
    if (whoOut !== "striker" && whoOut !== "non-striker") return alert("Invalid input.");
    const outBatsman = whoOut === "striker" ? onStrike : nonStriker;
    if (outBatsman === batsman1) batsman1 = { name: newBatsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
    else batsman2 = { name: newBatsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
    if (whoOut === "striker") onStrike = batsman1.name === newBatsmanName ? batsman1 : batsman2;
    else nonStriker = batsman1.name === newBatsmanName ? batsman1 : batsman2;
  } else {
    if (onStrike === batsman1) {
      batsman1 = { name: newBatsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
      onStrike = batsman1;
    } else {
      batsman2 = { name: newBatsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
      onStrike = batsman2;
    }
    nonStriker = onStrike === batsman1 ? batsman2 : batsman1;
  }

  updateBatsmanUI();
  bootstrap.Modal.getInstance(document.getElementById("wicketModal")).hide();
  document.getElementById("wicketForm").reset();
  document.getElementById("helperField").classList.add("d-none");
  pendingWicket = false;

  if (pendingBowlerModal) {
    pendingBowlerModal = false;
    const newBowlerModal = new bootstrap.Modal(document.getElementById("newBowlerModal"));
    newBowlerModal.show();
  }
  localMatchState.batsman1 = batsman1.name;
localMatchState.batsman2 = batsman2.name;
localMatchState.bowler = currentBowler;
localMatchState.score = totalRuns;
localMatchState.wickets = wickets;
localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls}`);
localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
  emitUpdate(); // ===== NEW CODE =====
});

document.getElementById("newBowlerForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const newNameInput = document.getElementById("newBowlerInput");
  const newName = newNameInput.value.trim();
  if (newName !== "") {
    currentBowler = newName;
    if (!bowlers[currentBowler]) bowlers[currentBowler] = { overs: 0, runs: 0 };
    overBalls = 0;
    document.getElementById("over-summary").innerHTML = "";
    newNameInput.value = "";
    bootstrap.Modal.getInstance(document.getElementById("newBowlerModal")).hide();
    updateBowlerStats();
    localMatchState.batsman1 = batsman1.name;
localMatchState.batsman2 = batsman2.name;
localMatchState.bowler = currentBowler;
localMatchState.score = totalRuns;
localMatchState.wickets = wickets;
localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls}`);
localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
    emitUpdate(); // ===== NEW CODE =====
  }
});

document.querySelectorAll(".run-btn").forEach((button) => {
  button.addEventListener("click", () => handleRun(parseInt(button.dataset.run)));
});

document.querySelector(".undo-btn").addEventListener("click", restoreState);

document.querySelector(".swap-btn").addEventListener("click", () => {
  saveState();
  [onStrike, nonStriker] = [nonStriker, onStrike];
  updateBatsmanUI();

  localMatchState.batsman1 = batsman1.name;
localMatchState.batsman2 = batsman2.name;
localMatchState.bowler = currentBowler;
localMatchState.score = totalRuns;
localMatchState.wickets = wickets;
localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls}`);
localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
  emitUpdate(); // ===== NEW CODE =====
});

document.querySelector(".retire-btn").addEventListener("click", () => {
  saveState();
  onStrike.runs = 0;
  onStrike.balls = 0;
  onStrike.fours = 0;
  onStrike.sixes = 0;
  [onStrike, nonStriker] = [nonStriker, onStrike];
  updateBatsmanUI();

  localMatchState.batsman1 = batsman1.name;
localMatchState.batsman2 = batsman2.name;
localMatchState.bowler = currentBowler;
localMatchState.score = totalRuns;
localMatchState.wickets = wickets;
localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls}`);
localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
  emitUpdate(); // ===== NEW CODE =====
});

updateBatsmanUI();
updateScoreboard();
updateBowlerStats();
updateCRR();
emitUpdate(); // ===== NEW CODE =====