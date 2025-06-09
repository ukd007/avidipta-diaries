const socket = io();
window.emitUpdate = function()  {
    const currentTotalOvers = Object.values(bowlers).reduce((acc, b) => acc + b.overs, 0);
    const displayedOvers = `${Math.floor(currentTotalOvers + overBalls / 6)}.${overBalls % 6}`;

    socket.emit('update', {
        score: totalRuns,
        wickets,
        overs: displayedOvers,
        batsman1: batsman1,
        batsman2: batsman2,
        onStrike: onStrike.name,
        bowler: currentBowler,
        bowlerStats: bowlers[currentBowler],
        balls: Array.from(document.querySelectorAll('#over-summary .ball')).map(b => b.textContent)
    });
};

window.setupSocketListeners = function() {
socket.on('update', (data) => {
    // Main score & overs
    document.querySelector('.score-display').textContent = `${data.score}/${data.wickets}`;
    document.querySelector('.over-display').textContent = `(${data.overs})`;

    // Batsman names (with * on striker)
    document.querySelector('.bat1-name').textContent =
        data.onStrike === data.batsman1.name ? data.batsman1.name + '*' : data.batsman1.name;
    document.querySelector('.bat2-name').textContent =
        data.onStrike === data.batsman2.name ? data.batsman2.name + '*' : data.batsman2.name;

    const rows = document.querySelectorAll('.score-table tbody tr');

    // Batsman 1 stats
    rows[0].children[1].textContent = data.batsman1.runs;
    rows[0].children[2].textContent = data.batsman1.balls;
    rows[0].children[3].textContent = data.batsman1.fours;
    rows[0].children[4].textContent = data.batsman1.sixes;
    rows[0].children[5].textContent =
        data.batsman1.balls > 0 ? ((data.batsman1.runs / data.batsman1.balls) * 100).toFixed(1) : '0.0';

    // Batsman 2 stats
    rows[1].children[1].textContent = data.batsman2.runs;
    rows[1].children[2].textContent = data.batsman2.balls;
    rows[1].children[3].textContent = data.batsman2.fours;
    rows[1].children[4].textContent = data.batsman2.sixes;
    rows[1].children[5].textContent =
        data.batsman2.balls > 0 ? ((data.batsman2.runs / data.batsman2.balls) * 100).toFixed(1) : '0.0';

    // Bowler info
    document.querySelector('.bowler-name').textContent = data.bowler;
    document.querySelector('.bow-runs').textContent = data.bowlerStats.runs;
    document.querySelector('.bow-overs').textContent = data.bowlerStats.overs.toFixed(1);

    // Economy calculation
    const bowledBalls = Math.floor(data.bowlerStats.overs) * 6 + (parseFloat(data.bowlerStats.overs.toString().split('.')[1] || 0));
    const economy =
        bowledBalls > 0 ? (data.bowlerStats.runs / (bowledBalls / 6)).toFixed(2) : '0.00';
    document.querySelector('.bow-eco').textContent = economy;

    // CRR (Current Run Rate)
    const totalBallsMatch = Math.floor(parseFloat(data.overs)) * 6 + (parseFloat(data.overs) % 1) * 10;
    const crr = totalBallsMatch > 0 ? (data.score / (totalBallsMatch / 6)).toFixed(2) : '0.00';
    document.querySelector('.runrate').textContent = crr;

    // Over Summary
    const summaryEl = document.getElementById('over-summary');
    summaryEl.innerHTML = '';
    data.balls.forEach((ball) => {
        const span = document.createElement('span');
        span.className = 'ball p-2 border rounded m-1';
        span.textContent = ball;
        summaryEl.appendChild(span);
    });
});
};
