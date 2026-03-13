document.addEventListener('DOMContentLoaded', () => {
    // --- Navigation System ---
    const navLinks = document.querySelectorAll('.nav-links li');
    const screens = document.querySelectorAll('.screen');
    const pageTitle = document.getElementById('page-title');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            pageTitle.textContent = link.textContent.trim();

            const targetId = link.getAttribute('data-target');
            screens.forEach(s => {
                if (s.id === targetId) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // --- Screen 1: Ecossistema ---
    const flowButtons = document.querySelectorAll('.flow-controls button');
    const nodes = {
        'collector': { id: 'node-collector', arrow: null },
        'wms': { id: 'node-wms', arrow: 'arrow-1' },
        'db': { id: 'node-db', arrow: 'arrow-2' },
        'warehouse': { id: 'node-warehouse', arrow: 'arrow-3' },
        'transport': { id: 'node-transport', arrow: 'arrow-4' }
    };

    flowButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const step = e.target.getAttribute('data-step');

            // Reset state
            Object.values(nodes).forEach(n => document.getElementById(n.id).classList.remove('active'));
            document.querySelectorAll('.arrow').forEach(a => a.classList.remove('active'));
            flowButtons.forEach(b => b.classList.remove('active-btn'));

            e.target.classList.add('active-btn');

            const keys = Object.keys(nodes);
            const index = keys.indexOf(step);

            for (let i = 0; i <= index; i++) {
                const key = keys[i];
                document.getElementById(nodes[key].id).classList.add('active');
                if (nodes[key].arrow) {
                    document.getElementById(nodes[key].arrow).classList.add('active');
                }
            }
        });
    });

    // --- Screen 2: Conversão Binária ---
    const btnConvertBin = document.getElementById('btn-convert-bin');
    const decInput = document.getElementById('dec-input');
    const binResultBox = document.getElementById('bin-result');
    const resultNumber = document.querySelector('.result-number');
    const resultMath = document.querySelector('.result-math');

    btnConvertBin.addEventListener('click', () => {
        const num = parseInt(decInput.value);
        if (isNaN(num) || num < 0) {
            alert('Por favor, digite um número inteiro positivo válido.');
            return;
        }

        const binStr = num.toString(2);
        resultNumber.textContent = binStr;

        const bits = binStr.split('').reverse();
        const steps = bits.map((bit, idx) => {
            return bit === '1' ? Math.pow(2, idx) : 0;
        }).reverse();

        resultMath.textContent = steps.join(' + ') + ' = ' + num;
        binResultBox.classList.remove('hidden');
    });

    // --- Screen 3: Rede WMS ---
    const btnSimNet = document.getElementById('btn-sim-net');
    const netSpeedInput = document.getElementById('net-speed');
    const netSizeInput = document.getElementById('net-size');
    const netResult = document.getElementById('net-result');
    const transferTimeEl = document.getElementById('transfer-time');
    const transferPercentEl = document.getElementById('transfer-percentages');
    const transferFill = document.getElementById('transfer-fill');

    let transferInterval;

    btnSimNet.addEventListener('click', () => {
        const mbps = parseFloat(netSpeedInput.value);
        const sizeMB = parseFloat(netSizeInput.value);

        if (isNaN(mbps) || isNaN(sizeMB) || mbps <= 0 || sizeMB <= 0) {
            alert('Por favor, insira valores válidos acima de zero.');
            return;
        }

        const timeSeconds = (sizeMB * 8) / mbps;

        netResult.classList.remove('hidden');
        transferTimeEl.textContent = `Tempo estimado: ${timeSeconds.toFixed(2)}s`;

        clearInterval(transferInterval);
        transferFill.style.width = '0%';
        transferPercentEl.textContent = '0%';

        let currentProgress = 0;
        const stepDuration = 50;
        const totalSteps = (timeSeconds * 1000) / stepDuration;
        const progressPerStep = 100 / totalSteps;

        transferInterval = setInterval(() => {
            currentProgress += progressPerStep;
            if (currentProgress >= 100) {
                currentProgress = 100;
                clearInterval(transferInterval);
            }
            transferFill.style.width = currentProgress + '%';
            transferPercentEl.textContent = Math.floor(currentProgress) + '%';
        }, stepDuration);
    });

    // --- Screen 4: Banco de Dados ---
    let dbList = [
        { id: 1, name: 'Monitor Dell 27"', sku: 'MON-DEL-027', qty: 15 },
        { id: 2, name: 'Teclado Mecânico', sku: 'TEC-MEC-001', qty: 42 },
        { id: 3, name: 'Mouse Wireless', sku: 'MOU-WRL-005', qty: 89 }
    ];
    let nextId = 4;

    const btnDbAdd = document.getElementById('btn-db-add');
    const btnGenSku = document.getElementById('btn-gen-sku');
    const dbName = document.getElementById('db-name');
    const dbSku = document.getElementById('db-sku');
    const dbQty = document.getElementById('db-qty');
    const dbTableBody = document.querySelector('#db-table tbody');
    const dbSizeEl = document.getElementById('db-size');

    function renderDbTable() {
        dbTableBody.innerHTML = '';

        if (dbList.length === 0) {
            dbTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 24px;">Nenhum produto cadastrado</td></tr>';
            dbSizeEl.textContent = '0 Bytes';
            return;
        }

        dbList.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight: 500;">${item.name}</td>
                <td><span style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 13px;">${item.sku}</span></td>
                <td>${item.qty}</td>
                <td>
                    <button class="btn-danger btn-delete" data-id="${item.id}" title="Excluir">
                        <i class="ph ph-trash"></i>
                    </button>
                </td>
            `;
            dbTableBody.appendChild(tr);
        });

        // Attach event listeners for delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idToDelete = parseInt(e.currentTarget.getAttribute('data-id'));
                dbList = dbList.filter(item => item.id !== idToDelete);
                renderDbTable();
            });
        });

        const bytesTotal = dbList.length * 150; // Approximated size for demonstration
        if (bytesTotal >= 1024) {
            dbSizeEl.textContent = (bytesTotal / 1024).toFixed(2) + ' KB';
        } else {
            dbSizeEl.textContent = bytesTotal + ' Bytes';
        }
    }

    // SKU Generator logic
    btnGenSku.addEventListener('click', () => {
        const nameVal = dbName.value.trim().toUpperCase();
        let prefix = 'PRD';

        if (nameVal.length >= 3) {
            prefix = nameVal.substring(0, 3);
        }

        const randomNum = Math.floor(Math.random() * 999).toString().padStart(3, '0');
        const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();

        dbSku.value = `${prefix}-${randomStr}-${randomNum}`;
    });

    btnDbAdd.addEventListener('click', () => {
        const name = dbName.value.trim();
        const sku = dbSku.value.trim();
        const qty = parseInt(dbQty.value);

        if (!name || !sku || isNaN(qty)) {
            alert('Preencha os campos corretamente antes de cadastrar.');
            return;
        }

        dbList.push({ id: nextId++, name, sku, qty });

        dbName.value = '';
        dbSku.value = '';
        dbQty.value = '';
        dbName.focus();

        renderDbTable();
    });

    renderDbTable();

    // --- Screen 5: Rastreamento ---
    const btnTrackCalc = document.getElementById('btn-track-calc');
    const trkCount = document.getElementById('trk-count');
    const trkResult = document.getElementById('trk-result');
    const trkVolume = document.getElementById('trk-volume');

    btnTrackCalc.addEventListener('click', () => {
        const trucks = parseInt(trkCount.value);
        if (isNaN(trucks) || trucks <= 0) {
            alert('Insira uma quantidade válida de caminhões na frota.');
            return;
        }

        // Calculation: 1 KB per truck per cycle. 1440 cycles/day.
        const kbPerDay = trucks * 1440;
        const mbPerDay = kbPerDay / 1024;

        trkVolume.textContent = mbPerDay.toFixed(2) + ' MB';
        trkResult.classList.remove('hidden');
    });

    // --- Screen 6: Quiz ---
    const quizQuestions = [
        {
            q: "Para formar um único caractere de texto, quantos bits são necessários?",
            options: [
                "1.024 bits formam 1 KB",
                "8 bits formam 1 Byte",
                "1.024 gotas formam um Byte",
                "Cada bit é um copo cheio"
            ],
            ans: 1
        },
        {
            q: "Como o computador interpreta a informação básica?",
            options: [
                "Sistema hexadecimal",
                "Correntes elétricas representadas por 0 e 1",
                "Base 10",
                "Pulsos variáveis"
            ],
            ans: 1
        },
        {
            q: "Qual unidade é adequada para armazenar um filme em alta definição?",
            options: [
                "Byte",
                "Kilobyte",
                "Megabyte",
                "Gigabyte"
            ],
            ans: 3
        },
        {
            q: "Qual é a unidade base usada para medir velocidade de rede?",
            options: [
                "Bytes por segundo",
                "Bits por segundo",
                "Megabytes por metro",
                "Hertz"
            ],
            ans: 1
        },
        {
            q: "Como converter velocidade de Mbps para MB/s?",
            options: [
                "Multiplicar por 8",
                "Dividir por 1.024",
                "Dividir por 8",
                "Somar 8"
            ],
            ans: 2
        }
    ];

    let currentQuestionIndex = 0;
    let currentScore = 0;
    let currentPlayerName = "";

    const quizStartPanel = document.getElementById('quiz-start-panel');
    const quizQuestionPanel = document.getElementById('quiz-question-panel');
    const quizRankingPanel = document.getElementById('quiz-ranking-panel');

    const inputPlayerName = document.getElementById('quiz-player-name');
    const btnStartQuiz = document.getElementById('btn-start-quiz');

    const questionTitle = document.getElementById('quiz-question-title');
    const optionsContainer = document.getElementById('quiz-options-container');
    const progressText = document.getElementById('quiz-progress-text');
    const scoreText = document.getElementById('quiz-score-text');
    const progressBar = document.getElementById('quiz-progress-bar');

    const finalName = document.getElementById('quiz-final-name');
    const finalScore = document.getElementById('quiz-final-score');
    const btnQuizRetry = document.getElementById('btn-quiz-retry');
    const btnQuizRanking = document.getElementById('btn-quiz-ranking');
    const rankingContainer = document.getElementById('ranking-container');
    const rankingBody = document.getElementById('quiz-ranking-body');

    function showPanel(panelId) {
        document.querySelectorAll('.quiz-panel').forEach(p => p.classList.remove('active-panel'));
        document.getElementById(panelId).classList.add('active-panel');
    }

    btnStartQuiz.addEventListener('click', () => {
        const name = inputPlayerName.value.trim();
        if (!name) {
            alert('Por favor, digite seu nome para começar.');
            return;
        }
        currentPlayerName = name;
        currentQuestionIndex = 0;
        currentScore = 0;

        document.body.classList.add('quiz-fullscreen');

        loadQuestion();
        showPanel('quiz-question-panel');
    });

    function loadQuestion() {
        optionsContainer.innerHTML = '';
        const qData = quizQuestions[currentQuestionIndex];

        questionTitle.textContent = qData.q;
        progressText.textContent = `Pergunta ${currentQuestionIndex + 1} de ${quizQuestions.length}`;
        scoreText.textContent = `Pontos: ${currentScore}`;

        const progPct = ((currentQuestionIndex) / quizQuestions.length) * 100;
        progressBar.style.width = progPct + '%';

        qData.options.forEach((opt, idx) => {
            const btn = document.createElement('button');
            btn.className = 'quiz-option-btn';

            const letters = ['A', 'B', 'C', 'D'];
            btn.innerHTML = `<strong style="color: var(--primary); font-size: 18px; width: 24px;">${letters[idx]}</strong> <span>${opt}</span>`;

            btn.addEventListener('click', () => handleAnswer(idx, btn, qData.ans));
            optionsContainer.appendChild(btn);
        });
    }

    function handleAnswer(selectedIndex, btnElement, correctIndex) {
        const allBtns = optionsContainer.querySelectorAll('.quiz-option-btn');
        allBtns.forEach(b => b.disabled = true);

        if (selectedIndex === correctIndex) {
            btnElement.classList.add('correct');
            currentScore++;
            scoreText.textContent = `Pontos: ${currentScore}`;
        } else {
            btnElement.classList.add('wrong');
            allBtns[correctIndex].classList.add('correct');
        }

        setTimeout(() => {
            currentQuestionIndex++;
            if (currentQuestionIndex < quizQuestions.length) {
                loadQuestion();
            } else {
                finishQuiz();
            }
        }, 1500);
    }

    function finishQuiz() {
        progressBar.style.width = '100%';
        setTimeout(() => {
            document.body.classList.remove('quiz-fullscreen');
            showPanel('quiz-ranking-panel');

            finalName.textContent = currentPlayerName;
            finalScore.textContent = `Acertos: ${currentScore} de ${quizQuestions.length}`;
            rankingContainer.classList.add('hidden');

            saveScore(currentPlayerName, currentScore);
        }, 500);
    }

    function saveScore(name, score) {
        let rankings = JSON.parse(localStorage.getItem('logistics_quiz_ranking')) || [];
        rankings.push({
            id: Date.now(),
            name: name,
            score: score,
            date: new Date().toLocaleDateString('pt-BR')
        });

        rankings.sort((a, b) => b.score - a.score);
        localStorage.setItem('logistics_quiz_ranking', JSON.stringify(rankings));
    }

    function loadRanking() {
        let rankings = JSON.parse(localStorage.getItem('logistics_quiz_ranking')) || [];
        rankingBody.innerHTML = '';

        if (rankings.length === 0) {
            rankingBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum registro ainda.</td></tr>';
            return;
        }

        rankings.slice(0, 10).forEach((r, idx) => {
            const tr = document.createElement('tr');
            let rankIcon = `<span style="color: var(--text-muted); font-weight: bold;">${idx + 1}</span>`;
            if (idx === 0) rankIcon = '🥇';
            if (idx === 1) rankIcon = '🥈';
            if (idx === 2) rankIcon = '🥉';

            tr.innerHTML = `
                <td>${rankIcon}</td>
                <td style="font-weight: 500;">${r.name}</td>
                <td style="text-align: right; color: var(--success); font-weight: 600;">${r.score} pts</td>
                <td style="text-align: right; color: var(--text-muted); font-size: 13px;">${r.date}</td>
            `;
            rankingBody.appendChild(tr);
        });
    }

    btnQuizRanking.addEventListener('click', () => {
        loadRanking();
        rankingContainer.classList.remove('hidden');
        btnQuizRanking.style.display = 'none';
    });

    btnQuizRetry.addEventListener('click', () => {
        inputPlayerName.value = '';
        showPanel('quiz-start-panel');
        btnQuizRanking.style.display = 'inline-block';
        rankingContainer.classList.add('hidden');
    });
});
