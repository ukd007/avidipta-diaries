
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
            saveMatchData(); // <-- ADDED: Save state to localStorage after new bowler
            localMatchState.batsman1 = batsman1;
            localMatchState.batsman2 = batsman2;
            localMatchState.bowler = currentBowler;
            localMatchState.score = totalRuns;
            localMatchState.wickets = wickets;
            localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls % 6}`); // Corrected overs calculation
            localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
            emitUpdate(); // ===== NEW CODE =====
        }
    });
    window.handleBowling = function(bowlerName) {
};