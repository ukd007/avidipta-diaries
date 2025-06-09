window.initControlButtons = function () {
document.querySelectorAll(".run-btn").forEach((button) => {
    button.addEventListener("click", () => handleRun(parseInt(button.dataset.run)));
});

document.querySelector(".undo-btn").addEventListener("click", restoreState);

document.querySelector(".swap-btn").addEventListener("click", () => {
    saveState();
    [onStrike, nonStriker] = [nonStriker, onStrike];
    updateBatsmanUI();

    saveMatchData(); // <-- ADDED: Save state to localStorage after swap
    localMatchState.batsman1 = batsman1;
    localMatchState.batsman2 = batsman2;
    localMatchState.bowler = currentBowler;
    localMatchState.score = totalRuns;
    localMatchState.wickets = wickets;
    localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls % 6}`); // Corrected overs calculation
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

    saveMatchData(); // <-- ADDED: Save state to localStorage after retire
    localMatchState.batsman1 = batsman1;
    localMatchState.batsman2 = batsman2;
    localMatchState.bowler = currentBowler;
    localMatchState.score = totalRuns;
    localMatchState.wickets = wickets;
    localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls % 6}`); // Corrected overs calculation
    localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
    emitUpdate(); // ===== NEW CODE =====
});
};