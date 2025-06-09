window.updateBatsmanUI = function(){
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
    console.log("✅ updateBatsmanUI called");
};

window.updateScoreboard= function(){
    const totalOvers = Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0) + overBalls / 6;
    document.querySelector(".score-display").textContent = `${totalRuns} - ${wickets}`;
    document.querySelector(".over-display").textContent = `(${Math.floor(totalOvers)}.${overBalls % 6})`;
};

window.updateCRR = function() {
    const totalBalls = Object.values(bowlers).reduce((acc, b) => acc + b.overs * 6, 0) + overBalls;
    const oversFaced = totalBalls / 6;
    const crr = oversFaced > 0 ? (totalRuns / oversFaced).toFixed(2) : "0.00";
    document.getElementById("crrValue").textContent = crr;
}

window.updateBowlerStats = function() {
    const stats = bowlers[currentBowler];
    document.querySelector(".bowler-name").textContent = currentBowler;
    document.querySelector(".bow-runs").textContent = stats.runs;
    document.querySelector(".bow-overs").textContent = `${stats.overs}.${overBalls}`;
    const totalBalls = stats.overs * 6 + overBalls;
    const economy = (stats.runs / (totalBalls / 6)).toFixed(1);
    document.querySelector(".bow-eco").textContent = isNaN(economy) ? "0.0" : economy;
}