const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kahoot AI</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            background-color: #f5f5f7;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
            padding: 60px 24px;
            color: #1d1d1f;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            margin-bottom: 48px;
            text-align: center;
        }
        .badge {
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #e85d04;
            margin-bottom: 12px;
        }
        h1 {
            font-size: 48px;
            font-weight: 600;
            letter-spacing: -0.02em;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #1d1d1f 0%, #6e6e73 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .subhead {
            font-size: 18px;
            color: #6e6e73;
            max-width: 500px;
            margin: 0 auto;
        }
        .tabs {
            display: flex;
            gap: 12px;
            margin-bottom: 32px;
            justify-content: center;
        }
        .tab {
            background: white;
            border: none;
            padding: 12px 28px;
            border-radius: 40px;
            font-size: 16px;
            font-weight: 500;
            font-family: inherit;
            cursor: pointer;
            color: #6e6e73;
            transition: all 0.2s;
        }
        .tab.active {
            background: #e85d04;
            color: white;
        }
        .card {
            background: white;
            border-radius: 28px;
            padding: 40px;
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02);
        }
        .split {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
        }
        .input-group {
            margin-bottom: 28px;
        }
        label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            margin-bottom: 8px;
            color: #1d1d1f;
        }
        input {
            width: 100%;
            padding: 16px 20px;
            font-size: 17px;
            font-family: inherit;
            border: 1px solid #d2d2d6;
            border-radius: 14px;
            background: white;
            outline: none;
        }
        input:focus {
            border-color: #e85d04;
            box-shadow: 0 0 0 4px rgba(232, 93, 4, 0.1);
        }
        .btn {
            width: 100%;
            padding: 16px 24px;
            font-size: 17px;
            font-weight: 600;
            font-family: inherit;
            border: none;
            border-radius: 14px;
            cursor: pointer;
            margin-bottom: 12px;
        }
        .btn-primary {
            background: #e85d04;
            color: white;
        }
        .btn-primary:hover {
            background: #cc5200;
        }
        .btn-danger {
            background: #ff3b30;
            color: white;
        }
        .btn-danger:hover {
            background: #d70015;
        }
        .log {
            background: #f5f5f7;
            border-radius: 20px;
            padding: 20px;
            height: 350px;
            overflow-y: auto;
            font-family: 'SF Mono', Monaco, monospace;
            font-size: 13px;
        }
        .log-entry {
            padding: 8px 0;
            border-bottom: 1px solid #e5e5ea;
        }
        .log-success {
            color: #28a745;
        }
        .log-error {
            color: #ff3b30;
        }
        .status {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #28a745;
            margin-right: 8px;
        }
        .info-box {
            margin-top: 16px;
            padding: 12px;
            background: #f5f5f7;
            border-radius: 14px;
        }
        .bot-count {
            font-size: 24px;
            font-weight: 600;
            color: #e85d04;
        }
        @media (max-width: 768px) {
            .split { grid-template-columns: 1fr; }
            h1 { font-size: 32px; }
            body { padding: 24px; }
            .card { padding: 24px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="badge">⚡ ANTI-CHEAT RESEARCH</div>
            <h1>Kahoot AI</h1>
            <div class="subhead">Autonomous agent · Real-time answers</div>
        </div>

        <div class="tabs">
            <button class="tab active" onclick="switchTab('agent')">🎯 AI Agent</button>
            <button class="tab" onclick="switchTab('spammer')">💥 Bot Spammer</button>
        </div>

        <div id="agentTab" class="card">
            <div class="split">
                <div>
                    <div class="input-group">
                        <label>Game PIN</label>
                        <input type="text" id="pin" placeholder="Enter 6-digit code" maxlength="6">
                    </div>
                    <div class="input-group">
                        <label>Bot name</label>
                        <input type="text" id="username" placeholder="Your agent name" value="AIAgent">
                    </div>
                    <button class="btn btn-primary" onclick="startBot()">🚀 Deploy agent</button>
                    <button class="btn btn-danger" onclick="killAllBots()">🔴 Emergency stop all</button>
                    <div class="info-box">
                        <span class="status"></span>
                        <span style="font-size: 13px; color: #6e6e73;">AI answers every question correctly</span>
                    </div>
                </div>
                <div>
                    <div style="font-weight: 500; margin-bottom: 12px; font-size: 14px;">Live console</div>
                    <div class="log" id="log">
                        <div class="log-entry log-success">● System ready</div>
                        <div class="log-entry">Enter a game PIN and deploy</div>
                    </div>
                </div>
            </div>
        </div>

        <div id="spammerTab" class="card" style="display: none;">
            <div class="split">
                <div>
                    <div class="input-group">
                        <label>Game PIN</label>
                        <input type="text" id="spamPin" placeholder="Enter 6-digit code" maxlength="6">
                    </div>
                    <div class="input-group">
                        <label>Bot name prefix</label>
                        <input type="text" id="namePrefix" placeholder="e.g., james" value="bot">
                        <div style="font-size: 12px; color: #6e6e73; margin-top: 6px;">Names will be: bot1, bot2, bot3...</div>
                    </div>
                    <div class="input-group">
                        <label>Number of bots</label>
                        <input type="number" id="botCount" min="1" max="20" value="5">
                        <div style="font-size: 12px; color: #6e6e73; margin-top: 6px;">⚠️ Start with 5 bots on MacBook Air</div>
                    </div>
                    <div class="input-group">
                        <label>Join delay (ms)</label>
                        <input type="range" id="joinSpeed" min="500" max="3000" value="1500" style="width: 100%;">
                        <span id="delayValue" style="font-size: 13px;">1500ms</span>
                    </div>
                    <button class="btn btn-primary" onclick="startFlood()">🌊 Start flood</button>
                    <button class="btn btn-danger" onclick="killAllBots()">🔴 Emergency stop all</button>
                </div>
                <div>
                    <div style="font-weight: 500; margin-bottom: 12px; font-size: 14px;">
                        📊 Active bots: <span id="botCountDisplay" class="bot-count">0</span>
                    </div>
                    <div class="log" id="spamLog" style="height: 350px;">
                        <div class="log-entry log-success">● Spammer ready</div>
                        <div class="log-entry">Enter PIN, prefix, and number of bots</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let botRefreshInterval = null;

        function switchTab(tab) {
            const agentTab = document.getElementById('agentTab');
            const spammerTab = document.getElementById('spammerTab');
            const tabs = document.querySelectorAll('.tab');
            
            if (tab === 'agent') {
                agentTab.style.display = 'block';
                spammerTab.style.display = 'none';
                tabs[0].classList.add('active');
                tabs[1].classList.remove('active');
                if (botRefreshInterval) {
                    clearInterval(botRefreshInterval);
                    botRefreshInterval = null;
                }
            } else {
                agentTab.style.display = 'none';
                spammerTab.style.display = 'block';
                tabs[0].classList.remove('active');
                tabs[1].classList.add('active');
                refreshBotCount();
                if (!botRefreshInterval) {
                    botRefreshInterval = setInterval(refreshBotCount, 3000);
                }
            }
        }

        function addLog(logId, message, type) {
            const logDiv = document.getElementById(logId);
            const entry = document.createElement('div');
            entry.className = 'log-entry';
            if (type === 'success') entry.classList.add('log-success');
            if (type === 'error') entry.classList.add('log-error');
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            entry.innerHTML = '[' + time + '] ' + message;
            logDiv.appendChild(entry);
            logDiv.scrollTop = logDiv.scrollHeight;
            if (logDiv.children.length > 50) {
                logDiv.removeChild(logDiv.children[0]);
            }
        }

        async function startBot() {
            const pin = document.getElementById('pin').value.trim();
            const username = document.getElementById('username').value.trim();
            if (!pin) {
                addLog('log', 'Please enter a game PIN', 'error');
                return;
            }
            addLog('log', 'Deploying agent to game ' + pin + '...');
            try {
                const response = await fetch('/api/start', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pin: pin, username: username })
                });
                const data = await response.json();
                addLog('log', data.message, 'success');
            } catch (error) {
                addLog('log', 'Connection error: ' + error.message, 'error');
            }
        }

        async function startFlood() {
            const pin = document.getElementById('spamPin').value.trim();
            const prefix = document.getElementById('namePrefix').value.trim();
            const count = parseInt(document.getElementById('botCount').value);
            const delayMs = parseInt(document.getElementById('joinSpeed').value);
            
            if (!pin) {
                addLog('spamLog', 'Please enter a game PIN', 'error');
                return;
            }
            if (!prefix) {
                addLog('spamLog', 'Please enter a name prefix', 'error');
                return;
            }
            
            addLog('spamLog', '🌊 Flooding ' + pin + ' with ' + count + ' bots (' + prefix + '1, ' + prefix + '2...)');
            try {
                const response = await fetch('/api/flood', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pin: pin, prefix: prefix, count: count, delayMs: delayMs })
                });
                const data = await response.json();
                addLog('spamLog', data.message, 'success');
            } catch (error) {
                addLog('spamLog', 'Error: ' + error.message, 'error');
            }
        }

        async function killAllBots() {
            addLog('log', '🔴 Killing all bots...', 'error');
            addLog('spamLog', '🔴 Killing all bots...', 'error');
            try {
                const response = await fetch('/api/kill-all', { method: 'POST' });
                const data = await response.json();
                addLog('log', data.message, 'success');
                addLog('spamLog', data.message, 'success');
                refreshBotCount();
            } catch (error) {
                addLog('log', 'Error: ' + error.message, 'error');
            }
        }

        async function refreshBotCount() {
            try {
                const response = await fetch('/api/bots/count');
                const data = await response.json();
                document.getElementById('botCountDisplay').innerText = data.count;
            } catch (error) {
                console.error('Failed to get bot count');
            }
        }

        const speedSlider = document.getElementById('joinSpeed');
        if (speedSlider) {
            speedSlider.oninput = function() {
                document.getElementById('delayValue').innerText = this.value + 'ms';
            }
        }

        window.switchTab = switchTab;
        window.startBot = startBot;
        window.startFlood = startFlood;
        window.killAllBots = killAllBots;
    </script>
</body>
</html>`;

let activeBrowsers = [];
let isKilling = false;

// IMPORTANT: API key must be set as environment variable OPENROUTER_KEY
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;

async function getAnswer(question, options) {
    if (!OPENROUTER_KEY) {
        console.log("⚠️ No API key set. Please set OPENROUTER_KEY environment variable");
        return options[0];
    }
    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "openrouter/free",
                messages: [{role: "user", content: `Question: ${question}\nOptions: ${options.join(', ')}\nReply with ONLY the correct answer text.`}],
                temperature: 0,
                max_tokens: 30
            })
        });
        const data = await res.json();
        if(data.choices) {
            let answer = data.choices[0].message.content.trim();
            return options.find(o => o.toLowerCase() === answer.toLowerCase()) || options[0];
        }
        return options[0];
    } catch(e) {
        return options[0];
    }
}

async function runSingleBot(pin, username, botId) {
    if(isKilling) return;
    const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox']});
    activeBrowsers.push({ browser, botId, username });
    const page = await browser.newPage();
    
    try {
        await page.goto('https://kahoot.it/');
        await page.type('#game-input', pin);
        await page.click('[data-functional-selector="join-game-confirm"]');
        await page.waitForTimeout(2000);
        await page.type('#nickname', username);
        await page.click('[data-functional-selector="join-game-nickname-submit"]');
        console.log(`✅ Bot ${username} joined!`);
        
        while(!isKilling) {
            try {
                const questionElem = await page.waitForSelector('[data-functional-selector="question-text"]', {timeout: 5000}).catch(() => null);
                if(questionElem) {
                    const question = await page.$eval('[data-functional-selector="question-text"]', el => el.innerText);
                    const answerBlocks = await page.$$('[data-functional-selector="answer-block"]');
                    const options = [];
                    for(let block of answerBlocks) {
                        const text = await block.$eval('.answer-text', el => el.innerText);
                        options.push(text);
                    }
                    const correct = await getAnswer(question, options);
                    const blocks = await page.$$('[data-functional-selector="answer-block"]');
                    for(let i=0; i<blocks.length; i++) {
                        const text = await blocks[i].$eval('.answer-text', el => el.innerText);
                        if(text === correct) {
                            await blocks[i].click();
                            break;
                        }
                    }
                    await page.waitForTimeout(3000);
                }
            } catch(e) {
                break;
            }
        }
    } catch(e) {
        console.log(`Bot ${username} error:`, e.message);
    }
    await browser.close();
    activeBrowsers = activeBrowsers.filter(b => b.botId !== botId);
}

async function runBot(pin, username) {
    const botId = Date.now();
    await runSingleBot(pin, username, botId);
}

async function runFloodBot(pin, prefix, index, delayMs) {
    setTimeout(async () => {
        if(isKilling) return;
        const username = `${prefix}${index}`;
        const botId = Date.now() + index;
        await runSingleBot(pin, username, botId);
    }, index * delayMs);
}

app.post('/api/start', async (req, res) => {
    const {pin, username} = req.body;
    if(activeBrowsers.length > 0) {
        return res.json({message: 'Bot already running! Press kill first.'});
    }
    isKilling = false;
    runBot(pin, username);
    res.json({message: `Bot ${username} starting...`});
});

app.post('/api/flood', async (req, res) => {
    const {pin, prefix, count, delayMs} = req.body;
    if(isKilling) {
        return res.json({message: 'Kill switch active, wait a moment'});
    }
    isKilling = false;
    for(let i = 1; i <= count; i++) {
        runFloodBot(pin, prefix, i, delayMs || 1000);
    }
    res.json({message: `Starting ${count} bots with prefix "${prefix}"`});
});

app.post('/api/kill-all', async (req, res) => {
    isKilling = true;
    console.log(`🛑 Killing ${activeBrowsers.length} bots...`);
    for(let instance of activeBrowsers) {
        try {
            await instance.browser.close();
        } catch(e) {}
    }
    activeBrowsers = [];
    res.json({message: `All bots killed`});
});

app.get('/api/bots/count', (req, res) => {
    res.json({count: activeBrowsers.length});
});

app.get('/', (req, res) => {
    res.send(HTML);
});

app.listen(3000, () => {
    console.log('✅ Server on http://localhost:3000');
    console.log('🎯 AI Agent + Bot Spammer ready');
});
