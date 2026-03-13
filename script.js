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
    const dbList = [];
    const btnDbAdd = document.getElementById('btn-db-add');
    const dbName = document.getElementById('db-name');
    const dbSku = document.getElementById('db-sku');
    const dbQty = document.getElementById('db-qty');
    const dbTableBody = document.querySelector('#db-table tbody');
    const dbSizeEl = document.getElementById('db-size');

    function renderDbTable() {
        dbTableBody.innerHTML = '';
        dbList.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.name}</td>
                <td>${item.sku}</td>
                <td>${item.qty}</td>
            `;
            dbTableBody.appendChild(tr);
        });

        const bytesTotal = dbList.length * 150; // Approximated size in real life
        if (bytesTotal >= 1024) {
            dbSizeEl.textContent = (bytesTotal / 1024).toFixed(2) + ' KB';
        } else {
            dbSizeEl.textContent = bytesTotal + ' Bytes';
        }
    }

    btnDbAdd.addEventListener('click', () => {
        const name = dbName.value.trim();
        const sku = dbSku.value.trim();
        const qty = parseInt(dbQty.value);

        if (!name || !sku || isNaN(qty)) {
            alert('Preencha os campos corretamente antes de cadastrar.');
            return;
        }

        dbList.push({ name, sku, qty });

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
});
