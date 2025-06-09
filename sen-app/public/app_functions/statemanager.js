/* Loads match data from localStorage.
 * @returns {object|null} The parsed match data or null if not found/corrupted.
 */

window.loadMatchData = function() {

    const storedData = localStorage.getItem('cricketMatchData'); // Using a specific key
    if (storedData) {
        try {
            return JSON.parse(storedData);
        } catch (e) {
            console.error("Error parsing match data from localStorage:", e);
            localStorage.removeItem('cricketMatchData'); // Clear corrupted data
            return null;
        }
    }
    return null; // No data found

};

/**
 * Saves the current match state to localStorage.
 * This function now captures ALL relevant game state variables.
 */
window.saveMatchData = function() {
    const dataToSave = {
        batsman1: batsman1,
        batsman2: batsman2,
        onStrikeName: onStrike.name,
        nonStrikerName: nonStriker.name,
        currentBowler: currentBowler,
        overBalls: overBalls,
        totalRuns: totalRuns,
        wickets: wickets,
        pendingWicket: pendingWicket,
        pendingBowlerModal: pendingBowlerModal,
        bowlers: bowlers,
        historyStack: historyStack,
        overSummaryHTML: document.getElementById('over-summary').innerHTML
    };
    localStorage.setItem('cricketMatchData', JSON.stringify(dataToSave));
    console.log("Match data saved to localStorage:", dataToSave); // For debugging
};

// Load initial state or set defaults
const initialMatchState = loadMatchData();
// Add this console.log after initialMatchState is determined
if (initialMatchState) {
    console.log("Match data loaded from localStorage:", initialMatchState);
} else {
    console.log("No match data found in localStorage. Starting with defaults.");
}
window.saveState = function()  {
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
};

window.restoreState() = function(){
    if (historyStack.length === 0) {
        alert("Nothing to undo!");
        return;
    }
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
    // After updating matchData
    saveMatchData(); // <-- ADDED: Save state to localStorage after undo

    localMatchState.batsman1 = { ...batsman1 };
    localMatchState.batsman2 = { ...batsman2 };
    localMatchState.bowler = currentBowler; // It should be the string name
    localMatchState.score = totalRuns;
    localMatchState.wickets = wickets;
    localMatchState.overs = parseFloat(`${Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0)}.${overBalls % 6}`); // Corrected overs calculation
    localMatchState.balls = Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent);
    emitUpdate();
};