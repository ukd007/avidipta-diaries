
document.getElementById("wicketType").addEventListener("change", function () {
    const needsHelper = ["catch", "stumping"].includes(this.value);
    document.getElementById("helperField").classList.toggle("d-none", !needsHelper);
});

document.getElementById("wicketForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // Check for all out
    if (wickets >= 10) {
        alert("All out! The innings has ended.");
        bootstrap.Modal.getInstance(document.getElementById("wicketModal")).hide();
        return;
    }

    const wicketType = document.getElementById("wicketType").value;
    const helper = document.getElementById("helperName").value.trim();
    const newBatsmanName = document.getElementById("newBatsmanName").value.trim();

    if (!newBatsmanName) return alert("Please enter a new batsman name.");

    const outInfo = helper ? `${wicketType} (${helper})` : wicketType;
    console.log(`${onStrike.name} is out: ${outInfo}`);

    if (wicketType === "runout") {
        const whoOut = prompt("Who was run out? Type 'striker' or 'non-striker':").toLowerCase();
        if (whoOut !== "striker" && whoOut !== "non-striker") {
            alert("Invalid input. Please type 'striker' or 'non-striker'.");
            return;
        }
        let outBatsman = whoOut === "striker" ? onStrike : nonStriker;

        if (outBatsman === batsman1) batsman1 = { name: newBatsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };
        else batsman2 = { name: newBatsmanName, runs: 0, balls: 0, fours: 0, sixes: 0 };

        if (outBatsman === onStrike) { // If striker was out, new batsman becomes striker
            onStrike = (batsman1.name === newBatsmanName) ? batsman1 : batsman2;
            nonStriker = (onStrike === batsman1) ? batsman2 : batsman1;
        } else { // If non-striker was out, new batsman becomes non-striker
            nonStriker = (batsman1.name === newBatsmanName) ? batsman1 : batsman2;
            onStrike = (nonStriker === batsman1) ? batsman2 : batsman1;
        }
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
    saveMatchData(); // <-- ADDED: Save state to localStorage after a wicket
    localMatchState.batsman1 = batsman1;
    localMatchState.batsman2 = batsman2;
    localMatchState.bowler = currentBowler;
    localMatchState.score = totalRuns;
    localMatchState.wickets = wickets;
    localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls % 6}`); // Corrected overs calculation
    localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
    emitUpdate(); // ===== NEW CODE =====
});

