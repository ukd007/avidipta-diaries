// Utility function: Deep clone using JSON
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Utility function: Calculate overs string
function calculateOvers(bowlers, overBalls) {
    const totalOvers = Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0);
    return `${Math.floor(totalOvers + overBalls / 6)}.${overBalls % 6}`;
}

// Load match data from localStorage
window.loadMatchData = function () {
    const storedData = localStorage.getItem('cricketMatchData');
    if (!storedData) return null;

    try {
        return JSON.parse(storedData);
    } catch (e) {
        console.error("Error parsing match data from localStorage:", e);
        localStorage.removeItem('cricketMatchData');
        return null;
    }
};

// Save current match state to localStorage
window.saveMatchData = function () {
    const dataToSave = {
        batsman1,
        batsman2,
        onStrikeName: onStrike.name,
        nonStrikerName: nonStriker.name,
        currentBowler,
        overBalls,
        totalRuns,
        wickets,
        pendingWicket,
        pendingBowlerModal,
        bowlers,
        historyStack,
        overSummaryHTML: document.getElementById('over-summary').innerHTML
    };

    localStorage.setItem('cricketMatchData', JSON.stringify(dataToSave));
    console.log("Match data saved to localStorage:", dataToSave);
};

// Initial state loading
const initialMatchState = loadMatchData();
console.log(initialMatchState ? "Match data loaded from localStorage:" : "No match data found in localStorage. Starting with defaults.", initialMatchState);

// Save history snapshot
window.saveState = function () {
    historyStack.push({
        batsman1: { ...batsman1 },
        batsman2: { ...batsman2 },
        onStrikeName: onStrike.name,
        totalRuns,
        wickets,
        overBalls,
        currentBowler,
        bowlers: deepClone(bowlers),
        overHTML: document.getElementById("over-summary").innerHTML
    });
};

// Restore previous state
window.restoreState = function () {
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
    bowlers = deepClone(prev.bowlers);

    document.getElementById("over-summary").innerHTML = prev.overHTML;

    updateBatsmanUI();
    updateScoreboard();
    updateBowlerStats();
    updateCRR();
    saveMatchData();

    // Update localMatchState object
    localMatchState = {
        batsman1: { ...batsman1 },
        batsman2: { ...batsman2 },
        bowler: currentBowler,
        score: totalRuns,
        wickets,
        overs: parseFloat(calculateOvers(bowlers, overBalls)),
        balls: Array.from(document.querySelectorAll("#over-summary .ball")).map(el => el.textContent)
    };

    emitUpdate();
};
