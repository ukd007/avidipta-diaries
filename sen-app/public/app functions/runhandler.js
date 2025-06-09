window.handleRun = function(run) {
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
        onStrike.runs += run; // Runs on wide/no-ball go to batsman as well
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

    const ballDiv = document.createElement("span"); // Changed to span for consistency with other elements
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
    // After updating matchData
    saveMatchData(); // <-- ADDED: Save state to localStorage after handling a run

    localMatchState.batsman1 = batsman1; // Assign objects directly
    localMatchState.batsman2 = batsman2;
    localMatchState.bowler = currentBowler;
    localMatchState.score = totalRuns;
    localMatchState.wickets = wickets;
    localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls % 6}`); // Corrected overs calculation
    localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
    emitUpdate(); // ===== NEW CODE =====
};
