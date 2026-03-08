// ==================== GLOBAL STATE ====================
let currentUser = null;
let tradeHistory = [];
let position = 'buy';
let icCharts = [];

const ADMIN_CODE = 'Gob19*20';
const ADMIN_PHONE = '2250586214172';
const APP_KEY = 'FXPLC_';

const PAIRS_LIST = [
    'XAU/USD','XAU/EUR','EUR/USD','GBP/USD','USD/JPY','USD/CHF','AUD/USD','NZD/USD',
    'USD/CAD','EUR/GBP','EUR/JPY','GBP/JPY','AUD/JPY','CAD/JPY','CHF/JPY',
    'EUR/AUD','EUR/CAD','EUR/CHF','EUR/NZD','GBP/AUD','GBP/CAD','GBP/CHF','GBP/NZD',
    'US30/USD','NAS100/USD','SPX500/USD','US2000/USD','DE30/EUR','UK100/GBP','JP225/USD',
    'BTC/USD','ETH/USD','LTC/USD','XRP/USD','ADA/USD','SOL/USD',
    'AAPL','TSLA','GOOGL','AMZN','MSFT','META','NVDA'
];
const LOT_LIST = ['0.01','0.02','0.03','0.05','0.1','0.2','0.3','0.5','1.0','2.0','3.0','5.0','10.0'];

const PAGE_NAMES = {
    1: "Page d'accueil", 2: "Profit et Perte",
    3: "Suivi Budget - Bot Longterm N\u00b01", 4: "Suivi Budget - Bot Pivot",
    5: "Estimation Salaire", 6: "Volume Controle",
    7: "Interet Compose", 8: "Panel Parametrage",
    9: "Suivi Budget - Bot Longterm N\u00b02",
    10: "Suivi Budget - Bot Longterm N\u00b03",
    11: "Suivi Budget - Bot Longterm N\u00b04",
    12: "Suivi Budget - Bot Longterm N\u00b05",
    13: "Suivi Budget - Bot Longterm N\u00b06",
    14: "Suivi Budget - Bot Longterm N\u00b07",
    15: "Plan Lot Trading Forex",
    16: "Tableau de Bord"
};

const MENU_CONFIG = [
    { page:2, icon:'$', color:'icon-cyan', titleKey:'menu_pl', descKey:'menu_pl_desc', title:'Profit et Perte', desc:'Calculer gains et pertes forex' },
    { page:3, icon:'B1', color:'icon-green', titleKey:'menu_bot_long1', descKey:'menu_bot_long1_desc', title:'Bot Longterm Trading N\u00b01', desc:'Suivi budget longterm N\u00b01' },
    { page:9, icon:'B2', color:'icon-green', titleKey:'menu_bot_long2', descKey:'menu_bot_long2_desc', title:'Bot Longterm Trading N\u00b02', desc:'Suivi budget longterm N\u00b02' },
    { page:10, icon:'B3', color:'icon-green', titleKey:'menu_bot_long3', descKey:'menu_bot_long3_desc', title:'Bot Longterm Trading N\u00b03', desc:'Suivi budget longterm N\u00b03' },
    { page:11, icon:'B4', color:'icon-green', titleKey:'menu_bot_long4', descKey:'menu_bot_long4_desc', title:'Bot Longterm Trading N\u00b04', desc:'Suivi budget longterm N\u00b04' },
    { page:12, icon:'B5', color:'icon-green', titleKey:'menu_bot_long5', descKey:'menu_bot_long5_desc', title:'Bot Longterm Trading N\u00b05', desc:'Suivi budget longterm N\u00b05' },
    { page:13, icon:'B6', color:'icon-green', titleKey:'menu_bot_long6', descKey:'menu_bot_long6_desc', title:'Bot Longterm Trading N\u00b06', desc:'Suivi budget longterm N\u00b06' },
    { page:14, icon:'B7', color:'icon-green', titleKey:'menu_bot_long7', descKey:'menu_bot_long7_desc', title:'Bot Longterm Trading N\u00b07', desc:'Suivi budget longterm N\u00b07' },
    { page:4, icon:'P', color:'icon-purple', titleKey:'menu_bot_pivot', descKey:'menu_bot_pivot_desc', title:'Bot Pivot - Return Trend', desc:'Suivi budget pivot' },
    { page:15, icon:'\ud83d\udcca', color:'icon-orange', titleKey:'menu_plan_lot', descKey:'menu_plan_lot_desc', title:'Plan Lot Trading Forex', desc:'Plan du lot selon le budget' },
    { page:16, icon:'\ud83d\udcc8', color:'icon-cyan', titleKey:'menu_dashboard', descKey:'menu_dashboard_desc', title:'Tableau de Bord', desc:'Synthese performance globale' },
    { page:5, icon:'S', color:'icon-orange', titleKey:'menu_salary', descKey:'menu_salary_desc', title:'Estimation Salaire', desc:'Estimer revenu trading' },
    { page:6, icon:'V', color:'icon-purple', titleKey:'menu_volume', descKey:'menu_volume_desc', title:'Volume Controle', desc:'Calcul lot et volume' },
    { page:7, icon:'IC', color:'icon-green', titleKey:'menu_ic', descKey:'menu_ic_desc', title:'Interet Compose', desc:'Estimation sur 5 ans' }
];

// ==================== PDF HELPER ====================
function sanitize(str) {
    if (typeof str !== 'string') return String(str);
    return str.replace(/[^\x20-\x7E]/g, function(c) {
        const map = {
            '\u00e9':'e','\u00e8':'e','\u00ea':'e','\u00eb':'e',
            '\u00e0':'a','\u00e2':'a','\u00e4':'a',
            '\u00f4':'o','\u00f6':'o',
            '\u00f9':'u','\u00fb':'u','\u00fc':'u',
            '\u00ee':'i','\u00ef':'i',
            '\u00e7':'c',
            '\u00c9':'E','\u00c8':'E','\u00ca':'E','\u00cb':'E',
            '\u00c0':'A','\u00c2':'A','\u00c4':'A',
            '\u00d4':'O','\u00d6':'O',
            '\u00d9':'U','\u00db':'U','\u00dc':'U',
            '\u00ce':'I','\u00cf':'I',
            '\u00c7':'C',
            '\u2013':'-','\u2014':'-','\u2018':"'",'\u2019':"'",
            '\u201c':'"','\u201d':'"','\u2026':'...',
            '\u20ac':'EUR','\u00a0':' '
        };
        return map[c] || '';
    });
}

// ==================== STORAGE ====================
function getUsers() { try { return JSON.parse(localStorage.getItem(APP_KEY+'users') || '[]'); } catch(e) { return []; } }
function setUsers(u) { localStorage.setItem(APP_KEY+'users', JSON.stringify(u)); }
function getUserData(phone, key) { try { const d = JSON.parse(localStorage.getItem(APP_KEY+'data_'+phone) || '{}'); return d[key]; } catch(e) { return undefined; } }
function setUserData(phone, key, val) { try { const d = JSON.parse(localStorage.getItem(APP_KEY+'data_'+phone) || '{}'); d[key] = val; localStorage.setItem(APP_KEY+'data_'+phone, JSON.stringify(d)); } catch(e) {} }

// ==================== INIT ====================
function init() {
    let users = getUsers();
    if (!users.find(u => u.phone === ADMIN_PHONE)) {
        users.push({ name:'John Gobolo', phone:ADMIN_PHONE, access:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], expiration:'2099-12-31', startDate:'2024-01-01' });
        setUsers(users);
    }
    // Ensure all users have startDate
    let updated = false;
    users.forEach(u => { if (!u.startDate) { u.startDate = new Date().toISOString().split('T')[0]; updated = true; } });
    if (updated) setUsers(users);
    renderAccessCheckboxes();
}
init();

// ==================== AUTH ====================
function loginUser() {
    const phone = document.getElementById('loginPhone').value.replace(/\s+/g,'').trim();
    if (!phone) { alert('Veuillez entrer votre numero de telephone.'); return; }
    const users = getUsers();
    const user = users.find(u => u.phone === phone);
    if (!user) { alert('Utilisateur non trouve. Contactez l\'administrateur.'); return; }
    // Check expiration - only for non-admin users
    if (user.phone !== ADMIN_PHONE && new Date(user.expiration) < new Date()) {
        document.getElementById('expiredBlockPopup').classList.add('active');
        return;
    }
    currentUser = user;
    document.getElementById('userBadge').textContent = user.name;
    document.getElementById('userBadge').style.display = 'inline-block';
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('menuSection').style.display = 'block';
    updateExpirationBadge();
    renderMenuButtons();
    loadAllUserData();
}

function updateExpirationBadge() {
    if (!currentUser) return;
    const badge = document.getElementById('usageBadge');
    // Admin doesn't show expiration badge
    if (currentUser.phone === ADMIN_PHONE) {
        badge.style.display = 'inline-block';
        badge.textContent = '👑 Administrateur';
        badge.style.borderColor = 'rgba(0,255,136,0.3)';
        badge.style.color = 'var(--accent-green)';
        badge.style.background = 'rgba(0,255,136,0.1)';
        return;
    }
    const expDate = new Date(currentUser.expiration);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    badge.style.display = 'inline-block';
    if (daysRemaining <= 0) {
        badge.textContent = '⛔ Expire';
        badge.style.borderColor = 'rgba(255,68,102,0.3)';
        badge.style.color = 'var(--accent-red)';
        badge.style.background = 'rgba(255,68,102,0.1)';
    } else if (daysRemaining <= 7) {
        badge.textContent = '⚠️ ' + daysRemaining + 'j restant' + (daysRemaining > 1 ? 's' : '');
        badge.style.borderColor = 'rgba(255,170,0,0.3)';
        badge.style.color = 'var(--accent-orange)';
        badge.style.background = 'rgba(255,170,0,0.1)';
    } else {
        badge.textContent = '⏳ ' + daysRemaining + ' jours';
        badge.style.borderColor = 'rgba(0,212,255,0.2)';
        badge.style.color = 'var(--accent-cyan)';
        badge.style.background = 'rgba(0,212,255,0.1)';
    }
}

function showExpirationPopup() {
    if (!currentUser) return;
    const startDate = currentUser.startDate || '--';
    const endDate = currentUser.expiration || '--';
    const now = new Date();
    const expDate = new Date(endDate);
    const diffTime = expDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Format dates with time
    const startFormatted = startDate !== '--' ? new Date(startDate).toLocaleDateString('fr-FR') + ' 00:00' : '--';
    const endFormatted = endDate !== '--' ? new Date(endDate).toLocaleDateString('fr-FR') + ' 23:59' : '--';

    document.getElementById('expStartDisplay').textContent = startFormatted;
    document.getElementById('expEndDisplay').textContent = endFormatted;

    const daysEl = document.getElementById('expDaysDisplay');
    const statusEl = document.getElementById('expStatusDisplay');

    if (currentUser.phone === ADMIN_PHONE) {
        daysEl.textContent = '∞';
        daysEl.style.color = 'var(--accent-green)';
        statusEl.textContent = 'Administrateur';
        statusEl.style.color = 'var(--accent-green)';
    } else if (daysRemaining <= 0) {
        daysEl.textContent = '0';
        daysEl.style.color = 'var(--accent-red)';
        statusEl.textContent = 'EXPIRE';
        statusEl.style.color = 'var(--accent-red)';
    } else if (daysRemaining <= 7) {
        daysEl.textContent = daysRemaining + ' jour' + (daysRemaining > 1 ? 's' : '');
        daysEl.style.color = 'var(--accent-orange)';
        statusEl.textContent = 'Bientot expire';
        statusEl.style.color = 'var(--accent-orange)';
    } else {
        daysEl.textContent = daysRemaining + ' jours';
        daysEl.style.color = 'var(--accent-green)';
        statusEl.textContent = 'Actif';
        statusEl.style.color = 'var(--accent-green)';
    }
    document.getElementById('expirationPopup').classList.add('active');
}

function openRenewPopup() {
    document.getElementById('renewPhone').value = '';
    document.getElementById('renewDate').value = '';
    document.getElementById('renewPopup').classList.add('active');
}

function renewUserAccess() {
    const phone = document.getElementById('renewPhone').value.replace(/\s+/g,'').trim();
    const newDate = document.getElementById('renewDate').value;
    if (!phone || !newDate) { alert('Veuillez remplir tous les champs.'); return; }
    let users = getUsers();
    const user = users.find(u => u.phone === phone);
    if (!user) { alert('Utilisateur non trouve.'); return; }
    if (user.phone === ADMIN_PHONE) { alert('L\'administrateur n\'a pas besoin de renouvellement.'); return; }
    user.expiration = newDate;
    user.startDate = new Date().toISOString().split('T')[0];
    setUsers(users);
    closePopup('renewPopup');
    renderUserList();
    alert('Acces renouvele avec succes pour ' + user.name + ' !\nNouvelle date d\'expiration : ' + newDate);
}

function renderMenuButtons() {
    const grid = document.getElementById('menuGrid');
    grid.innerHTML = '';
    const dict = I18N[currentLang] || I18N.fr;
    MENU_CONFIG.forEach(m => {
        if (currentUser.access.includes(m.page)) {
            const div = document.createElement('div');
            div.className = 'menu-btn';
            div.onclick = () => showPage(m.page);
            const title = dict[m.titleKey] || m.title;
            const desc = dict[m.descKey] || m.desc;
            div.innerHTML = '<div class="m-icon '+m.color+'">'+m.icon+'</div><div class="m-text"><div class="m-title">'+title+'</div><div class="m-desc">'+desc+'</div></div>';
            grid.appendChild(div);
        }
    });
}

// ==================== NAVIGATION ====================
function showPage(num) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById('page' + num);
    if (page) page.classList.add('active');
    if (num === 8) { renderUserList(); renderAccessCheckboxes(); }
    if ([3,4,9,10,11,12,13,14].includes(num)) loadSessions(num);
    if (num === 2) { renderHistory(); updatePipInfo(); }
    if (num === 16) refreshDashboardGlobal();
}
function goHome() {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page1').classList.add('active');
}

// ==================== ADMIN ====================
function openAdminPopup() { document.getElementById('adminCodeInput').value = ''; document.getElementById('adminPopup').classList.add('active'); }
function closePopup(id) { document.getElementById(id).classList.remove('active'); }
function checkAdminCode() {
    if (document.getElementById('adminCodeInput').value === ADMIN_CODE) {
        closePopup('adminPopup');
        if (!currentUser) {
            const users = getUsers();
            currentUser = users.find(u => u.phone === ADMIN_PHONE);
            if (currentUser) {
                document.getElementById('userBadge').textContent = currentUser.name;
                document.getElementById('userBadge').style.display = 'inline-block';
                document.getElementById('loginSection').style.display = 'none';
                document.getElementById('menuSection').style.display = 'block';
                updateExpirationBadge();
                renderMenuButtons(); loadAllUserData();
            }
        }
        showPage(8);
    } else { alert('Code incorrect'); }
}

function renderAccessCheckboxes() {
    const div = document.getElementById('accessCheckboxes');
    if (!div) return;
    div.innerHTML = '';
    for (let i = 2; i <= 16; i++) { if (i === 8) continue;
        const lbl = document.createElement('label');
        lbl.style.cssText = 'display:flex;align-items:center;gap:5px;font-size:0.82rem;color:var(--text-secondary);cursor:pointer;';
        const cb = document.createElement('input');
        cb.type = 'checkbox'; cb.value = i;
        cb.style.cssText = 'accent-color:var(--accent-cyan);';
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(PAGE_NAMES[i]));
        div.appendChild(lbl);
    }
}

function addUser() {
    const name = document.getElementById('newUserName').value.trim();
    const phone = document.getElementById('newUserPhone').value.replace(/\s+/g,'').trim();
    const exp = document.getElementById('newUserExp').value;
    const access = [1];
    document.querySelectorAll('#accessCheckboxes input:checked').forEach(cb => access.push(parseInt(cb.value)));
    if (!name || !phone || !exp) { alert('Veuillez remplir tous les champs.'); return; }
    let users = getUsers();
    if (users.find(u => u.phone === phone)) { alert('Ce numero existe deja.'); return; }
    users.push({ name, phone, access, expiration:exp, startDate: new Date().toISOString().split('T')[0] });
    setUsers(users);
    renderUserList();
    alert('Utilisateur "' + name + '" ajoute avec succes !');
    document.getElementById('newUserName').value = '';
    document.getElementById('newUserPhone').value = '';
    document.getElementById('newUserExp').value = '';
    document.querySelectorAll('#accessCheckboxes input').forEach(cb => cb.checked = false);
}

function deleteUserUI() {
    const phone = prompt('Entrez le numero de telephone a supprimer:');
    if (!phone) return;
    const cleaned = phone.replace(/\s+/g,'').trim();
    if (cleaned === ADMIN_PHONE) { alert('Impossible de supprimer l\'administrateur.'); return; }
    let users = getUsers();
    const prev = users.length;
    users = users.filter(u => u.phone !== cleaned);
    setUsers(users);
    renderUserList();
    if (users.length < prev) { localStorage.removeItem(APP_KEY+'data_'+cleaned); alert('Utilisateur supprime.'); }
    else { alert('Utilisateur non trouve.'); }
}

function renderUserList() {
    const container = document.getElementById('userListContainer');
    if (!container) return;
    const users = getUsers();
    if (users.length === 0) { container.innerHTML = '<div class="empty-state">Aucun utilisateur.</div>'; return; }
    let html = '<div class="scroll-table"><table class="user-list-table"><thead><tr><th>Nom</th><th>Telephone</th><th>Debut Acces</th><th>Fin Acces</th><th>Jours Restants</th><th>Pages Acces</th><th>Statut</th></tr></thead><tbody>';
    users.forEach(u => {
        const expired = new Date(u.expiration) < new Date();
        const daysRem = Math.ceil((new Date(u.expiration).getTime() - new Date().getTime()) / (1000*60*60*24));
        const daysText = u.phone === ADMIN_PHONE ? '∞' : (daysRem <= 0 ? '0' : daysRem);
        const daysColor = u.phone === ADMIN_PHONE ? 'var(--accent-green)' : (daysRem <= 0 ? 'var(--accent-red)' : daysRem <= 7 ? 'var(--accent-orange)' : 'var(--accent-green)');
        html += '<tr><td>'+u.name+'</td><td style="font-family:monospace;font-size:0.8rem;">'+u.phone+'</td>';
        html += '<td>'+(u.startDate || '--')+'</td>';
        html += '<td>'+u.expiration+'</td>';
        html += '<td style="color:'+daysColor+';font-weight:700;">'+daysText+'</td>';
        html += '<td style="font-size:0.75rem;">'+u.access.map(a => PAGE_NAMES[a]||'P'+a).join(', ')+'</td>';
        html += '<td style="color:'+(expired && u.phone !== ADMIN_PHONE?'var(--accent-red)':'var(--accent-green)')+';font-weight:600;">'+(expired && u.phone !== ADMIN_PHONE?'Expire':'Actif')+'</td></tr>';
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function downloadUserList() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l','mm','a4');
    doc.setFontSize(18);
    doc.text(sanitize('Listing Utilisateurs - FOREX P&L Calculator'), 14, 18);
    doc.setFontSize(11);
    doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 14, 26);
    const users = getUsers();
    const rows = users.map(u => [sanitize(u.name), u.phone, u.expiration, u.access.map(a => sanitize(PAGE_NAMES[a]||'P'+a)).join(', '), new Date(u.expiration) < new Date() ? 'Expire' : 'Actif']);
    doc.autoTable({ startY:32, head:[['Nom','Telephone','Expiration','Pages Acces','Statut']], body:rows, styles:{fontSize:10}, headStyles:{fillColor:[0,136,255]} });
    doc.save('listing_utilisateurs.pdf');
}

function printUserList() {
    const users = getUsers();
    let html = '<html><head><title>Listing Utilisateurs</title><style>body{font-family:Arial;margin:20px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #ccc;padding:8px;font-size:12px;}th{background:#0088ff;color:#fff;}</style></head><body>';
    html += '<h2>Listing Utilisateurs - FOREX P&L Calculator</h2><p>Date: '+new Date().toLocaleDateString('fr-FR')+'</p>';
    html += '<table><tr><th>Nom</th><th>Telephone</th><th>Expiration</th><th>Acces</th><th>Statut</th></tr>';
    users.forEach(u => { const expired = new Date(u.expiration) < new Date(); html += '<tr><td>'+u.name+'</td><td>'+u.phone+'</td><td>'+u.expiration+'</td><td>'+u.access.map(a=>PAGE_NAMES[a]).join(', ')+'</td><td>'+(expired?'Expire':'Actif')+'</td></tr>'; });
    html += '</table></body></html>';
    const w = window.open('','','width=800,height=600'); w.document.write(html); w.document.close(); w.print();
}

// ==================== USER DATA ====================
function loadAllUserData() { if (!currentUser) return; tradeHistory = getUserData(currentUser.phone, 'tradeHistory') || []; }
function savePageData(page) { if (!currentUser) return; if ([3,4,9,10,11,12,13,14].includes(page)) { const b = document.getElementById('budgetTrading'+page); if(b) setUserData(currentUser.phone, 'budgetTrading'+page, b.value); } }

// ==================== PAGE 2: PROFIT & LOSS ====================
function setPosition(pos) { position = pos; document.getElementById('btnBuy').classList.toggle('active', pos==='buy'); document.getElementById('btnSell').classList.toggle('active', pos==='sell'); }
function updatePipInfo() { const sel = document.getElementById('pair'); if(!sel) return; const dict = I18N[currentLang] || I18N.fr; document.getElementById('pipInfo').textContent = (dict.pip_info_prefix||'1 pip = $') + sel.selectedOptions[0].getAttribute('data-pipval') + (dict.pip_info_suffix||' par lot standard'); }

function calculate() {
    const capital = parseFloat(document.getElementById('capital').value) || 0;
    const entry = parseFloat(document.getElementById('entryPrice').value);
    const exit = parseFloat(document.getElementById('exitPrice').value);
    if (!entry || !exit) { alert('Veuillez remplir les prix d\'entree et de sortie.'); return; }
    const sl = parseFloat(document.getElementById('stopLoss').value) || null;
    const tp = parseFloat(document.getElementById('takeProfit').value) || null;
    const spread = parseFloat(document.getElementById('spread').value) || 0;
    const commission = parseFloat(document.getElementById('commission').value) || 0;
    const swap = parseFloat(document.getElementById('swap').value) || 0;
    const leverage = parseFloat(document.getElementById('leverage').value) || 100;
    const lotSize = parseFloat(document.getElementById('lotSize').value) || 1;
    const sel = document.getElementById('pair');
    const pair = sel.value;
    const pipValuePerLot = parseFloat(sel.selectedOptions[0].getAttribute('data-pipval')) || 10;
    const dec = parseInt(sel.selectedOptions[0].getAttribute('data-dec')) || 4;
    const pipSize = dec >= 3 ? 0.0001 : (dec === 2 ? 0.01 : 1);
    const diff = exit - entry;
    let pipsRaw = position === 'buy' ? diff / pipSize : -diff / pipSize;
    let pipsNet = pipsRaw - spread;
    const pipValue = pipValuePerLot * lotSize;
    const grossPL = pipsRaw * pipValue;
    const spreadCostVal = spread * pipValue;
    const totalFeesVal = commission * lotSize + Math.abs(swap);
    const netPL = grossPL - spreadCostVal - totalFeesVal;
    const roi = capital > 0 ? (netPL / capital) * 100 : 0;
    let unitSize = (pair === 'XAU/USD' || pair === 'XAU/EUR') ? 100 : 100000;
    const positionSizeVal = lotSize * unitSize * entry;
    const marginRequired = positionSizeVal / leverage;
    const marginPct = capital > 0 ? (marginRequired / capital) * 100 : 0;
    let riskSLVal = null, riskSLPct = null;
    if (sl) { const slDiff = position === 'buy' ? (entry - sl) : (sl - entry); const slPips = slDiff / pipSize; riskSLVal = (slPips + spread) * pipValue + totalFeesVal; riskSLPct = capital > 0 ? (riskSLVal / capital) * 100 : 0; }
    let rrRatioVal = null;
    if (sl && tp) { const slDist = Math.abs(entry - sl); const tpDist = Math.abs(tp - entry); rrRatioVal = slDist > 0 ? (tpDist / slDist) : null; }
    const section = document.getElementById('resultsSection');
    section.classList.add('visible');
    section.scrollIntoView({ behavior:'smooth', block:'start' });
    document.getElementById('resultMain').className = 'result-main ' + (netPL >= 0 ? 'profit' : 'loss');
    document.getElementById('resultAmount').textContent = (netPL >= 0 ? '+' : '') + '$' + netPL.toFixed(2);
    document.getElementById('resultRoi').textContent = (roi >= 0 ? '+' : '') + roi.toFixed(2) + '% ROI';
    document.getElementById('grossPL').textContent = (grossPL >= 0 ? '+' : '') + '$' + grossPL.toFixed(2);
    document.getElementById('grossPL').style.color = grossPL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('spreadCost').textContent = '-$' + spreadCostVal.toFixed(2);
    document.getElementById('spreadCost').style.color = 'var(--accent-orange)';
    document.getElementById('spreadPips').textContent = spread + ' pips';
    document.getElementById('totalFees').textContent = '-$' + totalFeesVal.toFixed(2);
    document.getElementById('totalFees').style.color = 'var(--accent-orange)';
    document.getElementById('pipsResult').textContent = (pipsRaw >= 0 ? '+' : '') + pipsRaw.toFixed(1);
    document.getElementById('pipsResult').style.color = pipsRaw >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('pipsNet').textContent = 'Net: ' + (pipsNet >= 0 ? '+' : '') + pipsNet.toFixed(1) + ' pips';
    document.getElementById('positionSize').textContent = '$' + positionSizeVal.toLocaleString('en-US',{maximumFractionDigits:0});
    document.getElementById('marginReq').textContent = '$' + marginRequired.toLocaleString('en-US',{maximumFractionDigits:2});
    document.getElementById('marginPct').textContent = marginPct.toFixed(1) + '% du capital';
    if (riskSLVal !== null) { document.getElementById('riskSL').textContent = '-$' + riskSLVal.toFixed(2); document.getElementById('riskSL').style.color = 'var(--accent-red)'; document.getElementById('riskPctSL').textContent = riskSLPct.toFixed(2) + '% du capital'; }
    else { document.getElementById('riskSL').textContent = '--'; document.getElementById('riskSL').style.color = '#fff'; document.getElementById('riskPctSL').textContent = 'Definir un SL'; }
    if (rrRatioVal !== null) { document.getElementById('rrRatio').textContent = '1:' + rrRatioVal.toFixed(2); document.getElementById('rrRatio').style.color = rrRatioVal >= 2 ? 'var(--accent-green)' : rrRatioVal >= 1 ? 'var(--accent-orange)' : 'var(--accent-red)'; document.getElementById('rrLabel').textContent = rrRatioVal >= 2 ? 'Excellent' : rrRatioVal >= 1 ? 'Correct' : 'Risque eleve'; }
    else { document.getElementById('rrRatio').textContent = '--'; document.getElementById('rrRatio').style.color = '#fff'; document.getElementById('rrLabel').textContent = 'Definir SL & TP'; }
    const record = { id:Date.now(), date:new Date().toLocaleDateString('fr-FR')+ ' '+new Date().toLocaleTimeString('fr-FR'), pair, position, entry, exit, lots:lotSize, leverage, pips:pipsRaw.toFixed(1), netPL:netPL.toFixed(2), roi:roi.toFixed(2), capital };
    tradeHistory.unshift(record); if (tradeHistory.length > 100) tradeHistory.pop();
    if (currentUser) setUserData(currentUser.phone, 'tradeHistory', tradeHistory);
    renderHistory();
}

function calcBudgetDiff() {
    const before = parseFloat(document.getElementById('budgetBefore').value) || 0;
    const after = parseFloat(document.getElementById('budgetAfter').value) || 0;
    if (before === 0) { alert('Veuillez entrer le budget avant trading.'); return; }
    const diff = after - before;
    const rate = (100 * diff / before);
    const isProfit = diff >= 0;
    document.getElementById('diffResult').style.display = 'block';
    document.getElementById('diffAmount').textContent = (isProfit ? '+' : '') + '$' + diff.toFixed(2);
    document.getElementById('diffAmount').style.color = isProfit ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('diffRate').textContent = (isProfit ? '+' : '') + rate.toFixed(2) + '%';
    document.getElementById('diffRate').style.color = isProfit ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('diffStatus').textContent = isProfit ? 'PROFIT' : 'PERTE';
    document.getElementById('diffStatus').style.color = isProfit ? 'var(--accent-green)' : 'var(--accent-red)';
}

function renderHistory() {
    const container = document.getElementById('historyContent');
    const bar = document.getElementById('summaryBar');
    if (!container) return;
    if (tradeHistory.length === 0) { container.innerHTML = '<div class="empty-state">Aucun calcul effectue.</div>'; if(bar) bar.style.display='none'; return; }
    if (bar) bar.style.display = 'grid';
    let totalPL = 0, wins = 0, losses = 0;
    tradeHistory.forEach(h => { const pl = parseFloat(h.netPL); totalPL += pl; pl >= 0 ? wins++ : losses++; });
    document.getElementById('totalTrades').textContent = tradeHistory.length;
    document.getElementById('totalPL').textContent = (totalPL >= 0 ? '+' : '') + '$' + totalPL.toFixed(2);
    document.getElementById('totalPL').style.color = totalPL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('winCount').textContent = wins;
    document.getElementById('lossCount').textContent = losses;
    let html = '<div class="scroll-table"><table class="history-table"><thead><tr><th>Date</th><th>Paire</th><th>Type</th><th>Entree</th><th>Sortie</th><th>Lots</th><th>Pips</th><th>P&L Net</th><th>ROI</th></tr></thead><tbody>';
    tradeHistory.forEach(h => { const pl = parseFloat(h.netPL); html += '<tr><td>'+h.date+'</td><td style="font-weight:600;">'+h.pair+'</td><td><span class="'+(h.position==='buy'?'badge-buy':'badge-sell')+'">'+h.position.toUpperCase()+'</span></td><td>'+h.entry+'</td><td>'+h.exit+'</td><td>'+h.lots+'</td><td style="color:'+(parseFloat(h.pips)>=0?'var(--accent-green)':'var(--accent-red)')+'">'+h.pips+'</td><td><span class="'+(pl>=0?'badge-profit':'badge-loss')+'">'+(pl>=0?'+':'')+'$'+h.netPL+'</span></td><td style="color:'+(parseFloat(h.roi)>=0?'var(--accent-green)':'var(--accent-red')+'">'+(parseFloat(h.roi)>=0?'+':'')+h.roi+'%</td></tr>'; });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function clearHistory() { if (confirm('Effacer tout l\'historique ?')) { tradeHistory = []; if(currentUser) setUserData(currentUser.phone, 'tradeHistory', []); renderHistory(); } }

function resetFormP2() {
    ['capital','entryPrice','exitPrice','stopLoss','takeProfit'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('spread').value = '1.5'; document.getElementById('commission').value = '0'; document.getElementById('swap').value = '0';
    document.getElementById('pair').selectedIndex = 0; document.getElementById('leverage').value = '100'; document.getElementById('lotSize').value = '1';
    setPosition('buy'); document.getElementById('resultsSection').classList.remove('visible'); updatePipInfo();
}

function downloadPLPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(sanitize('Estimation Profit / Perte - FOREX P&L Calculator'), 14, 18);
    doc.setFontSize(11);
    doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 14, 27);
    if (tradeHistory.length > 0) {
        const rows = tradeHistory.map(h => [h.date, h.pair, h.position.toUpperCase(), String(h.entry), String(h.exit), String(h.lots), h.pips, '$'+h.netPL, h.roi+'%']);
        doc.autoTable({ startY:34, head:[['Date','Paire','Type','Entree','Sortie','Lots','Pips','P&L Net','ROI']], body:rows, styles:{fontSize:9}, headStyles:{fillColor:[0,136,255]} });
    }
    doc.save('estimation_profit_perte.pdf');
}

// ==================== PAGES 3 & 4: SESSIONS (12 columns, 2 rows) ====================
function buildPairOpts() { return PAIRS_LIST.map(p => '<option value="'+p+'">'+p+'</option>').join(''); }
function buildLotOpts() { return LOT_LIST.map(l => '<option value="'+l+'">'+l+'</option>').join(''); }

let _isLoadingSessions = false;

function addRow(page) {
    const container = document.getElementById('sessions' + page);
    const block = document.createElement('div');
    block.className = 'session-block';
    block.setAttribute('data-page', page);
    const dict = I18N[currentLang] || I18N.fr;
    block.innerHTML =
        '<div class="session-row-line line1">' +
            '<div><div class="row-label" data-i18n="col_datetime">'+(dict.col_datetime||'Date/Heure')+'</div><input type="datetime-local" data-col="dt" onchange="calcSessionRow(this,'+page+')"></div>' +
            '<div><div class="row-label" data-i18n="col_before_b1">'+(dict.col_before_b1||'Avant Broker 1')+'</div><input type="number" data-col="ab1" placeholder="0" step="any" oninput="calcSessionRow(this,'+page+')"></div>' +
            '<div><div class="row-label" data-i18n="col_before_b2">'+(dict.col_before_b2||'Avant Broker 2')+'</div><input type="number" data-col="ab2" placeholder="0" step="any" oninput="calcSessionRow(this,'+page+')"></div>' +
            '<div><div class="row-label" data-i18n="col_cumul_before">'+(dict.col_cumul_before||'Cumul N1 (Avant)')+'</div><input type="number" data-col="cumul1" disabled></div>' +
            '<div><div class="row-label" data-i18n="col_after_b1">'+(dict.col_after_b1||'Apres Broker 1')+'</div><input type="number" data-col="pb1" placeholder="0" step="any" oninput="calcSessionRow(this,'+page+')"></div>' +
            '<div><div class="row-label" data-i18n="col_after_b2">'+(dict.col_after_b2||'Apres Broker 2')+'</div><input type="number" data-col="pb2" placeholder="0" step="any" oninput="calcSessionRow(this,'+page+')"></div>' +
            '<div><div class="row-label" data-i18n="col_cumul_after">'+(dict.col_cumul_after||'Cumul N2 (Apres)')+'</div><input type="number" data-col="cumul2" disabled></div>' +
        '</div>' +
        '<div class="session-row-line line2">' +
            '<div class="profit-cell"><div class="row-label" data-i18n="col_pl_net">'+(dict.col_pl_net||'Profit/Perte Net')+'</div><input type="number" data-col="plnet" disabled></div>' +
            '<div><div class="row-label" data-i18n="col_pair">'+(dict.col_pair||'Paire')+'</div><select data-col="pair" onchange="saveSessionsAll('+page+')">'+buildPairOpts()+'</select></div>' +
            '<div><div class="row-label" data-i18n="col_lot">'+(dict.col_lot||'Lot')+'</div><select data-col="lot" onchange="saveSessionsAll('+page+')">'+buildLotOpts()+'</select></div>' +
            '<div><div class="row-label" data-i18n="col_roi">'+(dict.col_roi||'Taux / ROI %')+'</div><input type="number" data-col="roi" disabled></div>' +
            '<div><div class="row-label" data-i18n="col_dd">'+(dict.col_dd||'Drawdown %')+'</div><input type="number" data-col="dd" disabled></div>' +
            '<div class="session-actions"><button class="sa-del" onclick="deleteSessionBlock(this,'+page+')" data-i18n="btn_delete_row">'+(dict.btn_delete_row||'Suppr.')+'</button><button class="sa-pdf" onclick="dlSessionBlockPDF(this,'+page+')" data-i18n="btn_pdf_row">'+(dict.btn_pdf_row||'PDF')+'</button></div>' +
        '</div>';
    container.appendChild(block);
    if (!_isLoadingSessions) saveSessionsAll(page);
}

function translateSessionBlock(block) {
    const dict = I18N[currentLang] || I18N.fr;
    block.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });
}

function getBlockData(block) {
    const d = {};
    block.querySelectorAll('[data-col]').forEach(el => { d[el.getAttribute('data-col')] = el.value; });
    return d;
}

function setBlockData(block, d) {
    block.querySelectorAll('[data-col]').forEach(el => {
        const key = el.getAttribute('data-col');
        if (d[key] !== undefined) el.value = d[key];
    });
}

function calcSessionRow(el, page) {
    const block = el.closest('.session-block');
    const get = col => parseFloat(block.querySelector('[data-col="'+col+'"]').value) || 0;
    const set = (col, val) => { block.querySelector('[data-col="'+col+'"]').value = val; };

    // Cumul N1 = Avant Broker 1 + Avant Broker 2
    const ab1 = get('ab1'), ab2 = get('ab2');
    const cumul1 = ab1 + ab2;
    set('cumul1', cumul1.toFixed(2));

    // Cumul N2 = Apres Broker 1 + Apres Broker 2
    const pb1 = get('pb1'), pb2 = get('pb2');
    const cumul2 = pb1 + pb2;
    set('cumul2', cumul2.toFixed(2));

    // P/L Net = Cumul N2 - Cumul N1
    const plnet = cumul2 - cumul1;
    set('plnet', plnet.toFixed(2));

    // Color the P/L cell
    const plInput = block.querySelector('[data-col="plnet"]');
    const plCell = plInput.closest('div');
    plCell.className = plnet >= 0 ? 'profit-cell' : 'loss-cell';

    // ROI = (P/L Net * 100) / Cumul N1
    const roiVal = cumul1 > 0 ? (plnet * 100 / cumul1) : 0;
    set('roi', roiVal.toFixed(2));

    // Drawdown = (Cumul N2 - Cumul N1) / Cumul N2 * 100
    const ddVal = cumul2 > 0 ? ((cumul2 - cumul1) / cumul2 * 100) : 0;
    set('dd', ddVal.toFixed(2));

    saveSessionsAll(page);
    updateDashboard(page);
}

function deleteSessionBlock(btn, page) {
    btn.closest('.session-block').remove();
    saveSessionsAll(page);
    updateDashboard(page);
}

function deleteAllRows(page) {
    if (!confirm('Supprimer toutes les lignes de saisie ?')) return;
    document.getElementById('sessions' + page).innerHTML = '';
    saveSessionsAll(page);
    updateDashboard(page);
}

function updateDashboard(page) {
    const blocks = document.getElementById('sessions' + page).querySelectorAll('.session-block');
    let totalPL = 0, totalROI = 0;
    blocks.forEach(block => {
        const pl = parseFloat(block.querySelector('[data-col="plnet"]').value) || 0;
        totalPL += pl;
        totalROI += parseFloat(block.querySelector('[data-col="roi"]').value) || 0;
    });
    const count = blocks.length || 1;
    document.getElementById('cumulPL' + page).textContent = totalPL.toFixed(2);
    document.getElementById('cumulPL' + page).style.color = totalPL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('cumulRate' + page).textContent = (totalROI / count).toFixed(2) + '%';
}

function saveSessionsAll(page) {
    if (!currentUser) return;
    const blocks = document.getElementById('sessions' + page).querySelectorAll('.session-block');
    const data = [];
    blocks.forEach(block => data.push(getBlockData(block)));
    setUserData(currentUser.phone, 'sessions' + page, data);
}

function loadSessions(page) {
    if (!currentUser) return;
    const data = getUserData(currentUser.phone, 'sessions' + page);
    const budgetVal = getUserData(currentUser.phone, 'budgetTrading' + page);
    const budgetInput = document.getElementById('budgetTrading' + page);
    if (budgetInput && budgetVal) budgetInput.value = budgetVal;
    const container = document.getElementById('sessions' + page);
    container.innerHTML = '';
    if (data && data.length > 0) {
        _isLoadingSessions = true;
        data.forEach(d => {
            addRow(page);
            const blocks = container.querySelectorAll('.session-block');
            const block = blocks[blocks.length - 1];
            setBlockData(block, d);
            // Restore P/L coloring
            const plVal = parseFloat(d.plnet) || 0;
            const plInput = block.querySelector('[data-col="plnet"]');
            if (plInput) {
                const plCell = plInput.closest('div');
                plCell.className = plVal >= 0 ? 'profit-cell' : 'loss-cell';
            }
        });
        _isLoadingSessions = false;
    }
    updateDashboard(page);
}

function downloadBilanPDF(page) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l','mm','a4');
    const pageTitles = {3:'Bilan - Bot Longterm Trading N1',4:'Bilan - Bot Point Pivot Return Trend',9:'Bilan - Bot Longterm Trading N2',10:'Bilan - Bot Longterm Trading N3',11:'Bilan - Bot Longterm Trading N4',12:'Bilan - Bot Longterm Trading N5',13:'Bilan - Bot Longterm Trading N6',14:'Bilan - Bot Longterm Trading N7'};
    const title = pageTitles[page] || 'Bilan Trading';
    doc.setFontSize(18);
    doc.text(sanitize(title), 14, 18);
    doc.setFontSize(11);
    doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 14, 27);
    doc.text('Cumul P/L: ' + document.getElementById('cumulPL'+page).textContent, 14, 35);
    doc.text('Cumul Taux: ' + document.getElementById('cumulRate'+page).textContent, 80, 35);
    const data = getUserData(currentUser?.phone, 'sessions'+page) || [];
    if (data.length > 0) {
        const rows = data.map(d => [d.dt||'', d.ab1||'0', d.ab2||'0', d.cumul1||'0', d.pb1||'0', d.pb2||'0', d.cumul2||'0', d.plnet||'0', d.pair||'', d.lot||'', (d.roi||'0')+'%', (d.dd||'0')+'%']);
        doc.autoTable({ startY:42, head:[['Date','Av.B1','Av.B2','Cumul Av.','Ap.B1','Ap.B2','Cumul Ap.','P/L Net','Paire','Lot','ROI','DD']], body:rows, styles:{fontSize:8}, headStyles:{fillColor:[0,180,100]} });
    }
    doc.save('bilan_seances_page'+page+'.pdf');
}

function dlSessionBlockPDF(btn, page) {
    const block = btn.closest('.session-block');
    const d = getBlockData(block);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(sanitize('Seance du Jour - Page ' + page), 14, 18);
    doc.setFontSize(12);
    doc.text('Date: ' + (d.dt || 'N/A'), 14, 30);
    doc.text('Avant Broker 1: ' + (d.ab1 || '0'), 14, 40);
    doc.text('Avant Broker 2: ' + (d.ab2 || '0'), 100, 40);
    doc.text('Cumul Avant: ' + (d.cumul1 || '0'), 14, 50);
    doc.text('Apres Broker 1: ' + (d.pb1 || '0'), 14, 60);
    doc.text('Apres Broker 2: ' + (d.pb2 || '0'), 100, 60);
    doc.text('Cumul Apres: ' + (d.cumul2 || '0'), 14, 70);
    doc.text('Profit/Perte Net: ' + (d.plnet || '0'), 14, 82);
    doc.text('Paire: ' + (d.pair || ''), 100, 82);
    doc.text('Lot: ' + (d.lot || ''), 14, 92);
    doc.text('ROI: ' + (d.roi || '0') + '%', 70, 92);
    doc.text('Drawdown: ' + (d.dd || '0') + '%', 130, 92);
    doc.save('seance_jour_p'+page+'.pdf');
}

// ==================== PAGE 5: ESTIMATION SALAIRE ====================
function calcSalaryEst() {
    const salary = parseFloat(document.getElementById('salaryEst').value) || 0;
    const rate = parseFloat(document.getElementById('ratePerf').value) || 0;
    const budget = rate > 0 ? salary / (rate / 100) : 0;
    document.getElementById('salaryDisplay').textContent = salary.toLocaleString() + ' USD';
    document.getElementById('rateDisplay').textContent = rate + '%';
    document.getElementById('budgetInvest').textContent = budget.toFixed(0) + ' USD';
}

// ==================== PAGE 6: VOLUME CONTROLE ====================
function calcVolumeControl() {
    const budget = parseFloat(document.getElementById('budgetVC').value) || 0;
    const baremeLot = (100 * 0.01) / 500;
    document.getElementById('baremeLot').textContent = baremeLot.toFixed(4);
    let lotSpecial = (budget * baremeLot) / 100;
    if (lotSpecial > 6) { alert('Limite du LOT atteinte ! Veuillez prendre un lot en dessous de 7.'); lotSpecial = 6; }
    document.getElementById('lotSpecial').textContent = lotSpecial.toFixed(2);
    document.getElementById('pretBroker').textContent = (lotSpecial * 100000).toLocaleString('en-US', {maximumFractionDigits:0});
}

function downloadVCPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Volume Controle', 14, 20);
    doc.setFontSize(14);
    doc.text('FOREX P&L Calculator', 14, 30);
    doc.setFontSize(11);
    doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 14, 40);
    doc.setFontSize(14);
    const budget = document.getElementById('budgetVC').value || '0';
    doc.text('Budget de Trading: ' + budget, 14, 56);
    doc.text('Bareme Debut LOT: 0.01', 14, 68);
    doc.text('Budget Bareme: 500', 14, 80);
    doc.text('Bareme Calcul LOT: ' + document.getElementById('baremeLot').textContent, 14, 92);
    doc.setFontSize(16);
    doc.text('LOT Special: ' + document.getElementById('lotSpecial').textContent, 14, 108);
    doc.text('Pret Broker: ' + document.getElementById('pretBroker').textContent, 14, 122);
    doc.save('volume_control.pdf');
}

// ==================== PAGE 7: INTERET COMPOSE ====================
function calcCompoundInterest() {
    const budget = parseFloat(document.getElementById('budgetIC').value) || 0;
    const rate = parseFloat(document.getElementById('rateIC').value) / 100 || 0;
    if (budget <= 0 || rate <= 0) { alert('Veuillez entrer un budget et un taux valides.'); return; }
    let current = budget, totalCA = 0, totalProfit = 0;
    const yearlyData = [];
    for (let year = 1; year <= 5; year++) {
        const monthlyData = [];
        for (let month = 1; month <= 12; month++) {
            const startBudget = current;
            const profit = current * rate;
            current += profit;
            totalProfit += profit;
            totalCA = current;
            monthlyData.push({ month, budget:startBudget, rate:rate*100, profit, total:current });
        }
        yearlyData.push(monthlyData);
    }
    document.getElementById('cumulCA').textContent = totalCA.toLocaleString('en-US',{maximumFractionDigits:2}) + ' USD';
    document.getElementById('cumulProfit').textContent = totalProfit.toLocaleString('en-US',{maximumFractionDigits:2}) + ' USD';
    document.getElementById('cumulTaux').textContent = ((totalProfit / budget) * 100).toFixed(2) + '%';
    renderICGraphs(yearlyData);
}

function renderICGraphs(data) {
    const container = document.getElementById('icGraphs');
    container.innerHTML = '';
    icCharts.forEach(c => c.destroy());
    icCharts = [];
    const colors = [
        { bg:'rgba(0,212,255,0.15)', border:'#00d4ff', label:'Annee 1' },
        { bg:'rgba(0,255,136,0.15)', border:'#00ff88', label:'Annee 2' },
        { bg:'rgba(160,100,255,0.15)', border:'#a064ff', label:'Annee 3' },
        { bg:'rgba(255,170,0,0.15)', border:'#ffaa00', label:'Annee 4' },
        { bg:'rgba(255,68,102,0.15)', border:'#ff4466', label:'Annee 5' }
    ];
    data.forEach((yearData, i) => {
        const card = document.createElement('div');
        card.className = 'graph-card';
        card.innerHTML = '<h3>'+colors[i].label+' - Interet Compose</h3>';
        let t = '<div class="scroll-table"><table class="ci-table"><thead><tr><th>Mois</th><th>Budget Depart</th><th>Taux</th><th>Profit Net</th><th>Nouveau Budget</th></tr></thead><tbody>';
        yearData.forEach(d => {
            t += '<tr><td style="color:'+colors[i].border+';font-weight:600;">Mois '+d.month+'</td>';
            t += '<td>'+d.budget.toLocaleString('en-US',{maximumFractionDigits:2})+'</td>';
            t += '<td style="color:var(--accent-orange);">'+d.rate.toFixed(1)+'%</td>';
            t += '<td style="color:var(--accent-green);">+'+d.profit.toLocaleString('en-US',{maximumFractionDigits:2})+'</td>';
            t += '<td style="color:'+colors[i].border+';font-weight:700;">'+d.total.toLocaleString('en-US',{maximumFractionDigits:2})+'</td></tr>';
        });
        t += '</tbody></table></div>';
        card.innerHTML += t;
        const canvas = document.createElement('canvas');
        canvas.style.marginTop = '14px';
        card.appendChild(canvas);
        container.appendChild(card);
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, {
            type: 'bar',
            data: { labels: yearData.map(d => 'Mois ' + d.month), datasets: [{label: 'Budget Total', data: yearData.map(d => d.total), backgroundColor: colors[i].bg, borderColor: colors[i].border, borderWidth: 2, borderRadius: 6}, {label: 'Profit Mensuel', data: yearData.map(d => d.profit), backgroundColor: 'rgba(0,255,136,0.3)', borderColor: '#00ff88', borderWidth: 1, borderRadius: 4}] },
            options: { responsive: true, plugins: { legend: { labels: { color:'#8a9bb5', font:{family:'Outfit'} } } }, scales: { y: { beginAtZero: false, ticks:{color:'#5a6b85'}, grid:{color:'rgba(255,255,255,0.04)'} }, x: { ticks:{color:'#5a6b85', font:{size:10}}, grid:{display:false} } } }
        });
        icCharts.push(chart);
    });
}

function downloadICPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Estimation Interet Compose - 5 Ans', 14, 20);
    doc.setFontSize(12);
    doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 14, 30);
    doc.text('Budget initial: ' + (document.getElementById('budgetIC').value||'0') + ' USD', 14, 40);
    doc.text('Taux Mensuel: ' + (document.getElementById('rateIC').value||'0') + '%', 14, 50);
    doc.text('Cumul CA: ' + sanitize(document.getElementById('cumulCA').textContent), 14, 60);
    doc.text('Cumul Profit Net: ' + sanitize(document.getElementById('cumulProfit').textContent), 14, 70);
    doc.text('Cumul Taux Profit: ' + document.getElementById('cumulTaux').textContent, 14, 80);

    const budget = parseFloat(document.getElementById('budgetIC').value) || 0;
    const rate = parseFloat(document.getElementById('rateIC').value) / 100 || 0;
    if (budget > 0 && rate > 0) {
        let current = budget;
        let startY = 94;
        for (let y = 1; y <= 5; y++) {
            if (startY > 250) { doc.addPage(); startY = 20; }
            doc.setFontSize(14);
            doc.text('Annee ' + y, 14, startY);
            const rows = [];
            for (let m = 1; m <= 12; m++) {
                const profit = current * rate;
                const start = current;
                current += profit;
                rows.push(['Mois '+m, start.toFixed(2), (rate*100).toFixed(1)+'%', '+'+profit.toFixed(2), current.toFixed(2)]);
            }
            doc.autoTable({
                startY: startY + 4,
                head: [['Mois','Budget Depart','Taux','Profit Net','Nouveau Budget']],
                body: rows,
                styles: { fontSize: 10 },
                headStyles: { fillColor: [0,180,100] },
                margin: { left:14 }
            });
            startY = doc.lastAutoTable.finalY + 14;
        }
    }
    doc.save('interet_compose_5ans.pdf');
}

function toggleShareIC() {
    const el = document.getElementById('shareICBtns');
    el.style.display = el.style.display === 'none' ? 'flex' : 'none';
}

function shareVia(platform) {
    const budgetVal = document.getElementById('budgetIC').value || '0';
    const rateVal = document.getElementById('rateIC').value || '0';
    const caText = document.getElementById('cumulCA').textContent;
    const profitText = document.getElementById('cumulProfit').textContent;

    const subject = 'Estimation Interet Compose - FOREX P&L Calculator';
    const body = 'Estimation Interet Compose:\n' +
        'Budget: ' + budgetVal + ' USD\n' +
        'Taux Mensuel: ' + rateVal + '%\n' +
        'CA Total: ' + caText + '\n' +
        'Profit Net: ' + profitText;

    if (platform === 'whatsapp') {
        window.open('https://wa.me/?text=' + encodeURIComponent(body), '_blank');
    } else if (platform === 'facebook') {
        window.open('https://www.facebook.com/sharer/sharer.php?quote=' + encodeURIComponent(body), '_blank');
    } else if (platform === 'gmail') {
        // Opens Gmail compose directly
        window.open('https://mail.google.com/mail/?view=cm&fs=1&su=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body), '_blank');
    } else if (platform === 'telegram') {
        window.open('https://t.me/share/url?text=' + encodeURIComponent(body), '_blank');
    } else if (platform === 'copy') {
        navigator.clipboard.writeText(body).then(() => alert('Copie dans le presse-papier !'));
    }
}


// ==================== PAGE 15: PLAN LOT TRADING FOREX ====================
function downloadPlanLotPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('PLAN LOT TRADING FOREX', 14, 18);
    doc.setFontSize(11);
    doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 14, 27);
    doc.text('Bareme Maxi Fond Broker : 100 000 USD', 14, 35);
    const lotData = [
        [1,'0.01','100 000','1 000','100'],[2,'0.02','100 000','2 000','200'],
        [3,'0.03','100 000','3 000','300'],[4,'0.04','100 000','4 000','400'],
        [5,'0.05','100 000','5 000','500'],[6,'0.06','100 000','6 000','600'],
        [7,'0.07','100 000','7 000','700'],[8,'0.08','100 000','8 000','800'],
        [9,'0.09','100 000','9 000','900'],[10,'0.10','100 000','10 000','1 000'],
        [11,'0.20','100 000','20 000','2 000'],[12,'0.30','100 000','30 000','3 000'],
        [13,'0.40','100 000','40 000','4 000'],[14,'0.50','100 000','50 000','5 000'],
        [15,'0.60','100 000','60 000','6 000'],[16,'0.70','100 000','70 000','7 000'],
        [17,'0.80','100 000','80 000','8 000'],[18,'0.90','100 000','90 000','9 000'],
        [19,'1.00','100 000','100 000','10 000']
    ];
    doc.autoTable({
        startY: 42,
        head: [['N','LOT','Bareme Maxi Fond Broker','MACRO FOND A INVESTIR','MICRO FOND A INVESTIR']],
        body: lotData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [255,170,0] }
    });
    doc.save('plan_lot_trading_forex.pdf');
}

// ==================== PAGE 16: TABLEAU DE BORD ====================
let dbChart = null;

function refreshDashboardGlobal() {
    if (!currentUser) return;
    const sessionPages = [3,9,10,11,12,13,14,4];
    const pageLabels = {
        3:'Bot Longterm N1',9:'Bot Longterm N2',10:'Bot Longterm N3',
        11:'Bot Longterm N4',12:'Bot Longterm N5',13:'Bot Longterm N6',
        14:'Bot Longterm N7',4:'Bot Pivot Return Trend'
    };
    
    let grandTotalPL = 0, grandTotalCapital = 0, grandTotalSessions = 0;
    let grandWins = 0, grandLosses = 0, grandTotalROI = 0, grandTotalDD = 0;
    const details = [];
    
    sessionPages.forEach(pg => {
        const data = getUserData(currentUser.phone, 'sessions' + pg) || [];
        const budget = parseFloat(getUserData(currentUser.phone, 'budgetTrading' + pg)) || 0;
        let totalPL = 0, totalROI = 0, wins = 0, losses = 0, totalDD = 0;
        
        data.forEach(d => {
            const pl = parseFloat(d.plnet) || 0;
            totalPL += pl;
            totalROI += parseFloat(d.roi) || 0;
            totalDD += parseFloat(d.dd) || 0;
            if (pl >= 0) wins++; else losses++;
        });
        
        const count = data.length;
        grandTotalPL += totalPL;
        grandTotalCapital += budget;
        grandTotalSessions += count;
        grandWins += wins;
        grandLosses += losses;
        grandTotalROI += totalROI;
        grandTotalDD += totalDD;
        
        details.push({
            label: pageLabels[pg] || 'Page ' + pg,
            budget: budget,
            sessions: count,
            pl: totalPL,
            avgRate: count > 0 ? (totalROI / count) : 0,
            wins: wins,
            losses: losses,
            winRate: count > 0 ? ((wins / count) * 100) : 0
        });
    });
    
    const grandTotalProgression = grandTotalCapital + grandTotalPL;
    const globalRate = grandTotalCapital > 0 ? ((grandTotalPL / grandTotalCapital) * 100) : 0;
    const globalWinRate = grandTotalSessions > 0 ? ((grandWins / grandTotalSessions) * 100) : 0;
    const avgDD = grandTotalSessions > 0 ? (grandTotalDD / grandTotalSessions) : 0;
    const avgROI = grandTotalSessions > 0 ? (grandTotalROI / grandTotalSessions) : 0;
    
    // Update KPIs
    const elPL = document.getElementById('dbTotalPL');
    elPL.textContent = (grandTotalPL >= 0 ? '+' : '') + grandTotalPL.toFixed(2) + ' USD';
    elPL.style.color = grandTotalPL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    
    document.getElementById('dbTotalRate').textContent = (globalRate >= 0 ? '+' : '') + globalRate.toFixed(2) + '%';
    document.getElementById('dbTotalRate').style.color = globalRate >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    
    document.getElementById('dbTotalCapital').textContent = grandTotalCapital.toLocaleString('en-US',{maximumFractionDigits:2}) + ' USD';
    document.getElementById('dbTotalProgression').textContent = grandTotalProgression.toLocaleString('en-US',{maximumFractionDigits:2}) + ' USD';
    document.getElementById('dbTotalProgression').style.color = grandTotalProgression >= grandTotalCapital ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('dbTotalSessions').textContent = grandTotalSessions;
    document.getElementById('dbWinSessions').textContent = grandWins;
    document.getElementById('dbLossSessions').textContent = grandLosses;
    document.getElementById('dbWinRate').textContent = globalWinRate.toFixed(1) + '%';
    document.getElementById('dbAvgDD').textContent = avgDD.toFixed(2) + '%';
    document.getElementById('dbAvgROI').textContent = avgROI.toFixed(2) + '%';
    
    // Update detail table
    const tbody = document.getElementById('dbDetailBody');
    tbody.innerHTML = '';
    details.forEach(d => {
        const plColor = d.pl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
        tbody.innerHTML += '<tr>' +
            '<td style="color:var(--accent-cyan);font-weight:600;">' + d.label + '</td>' +
            '<td>' + d.budget.toLocaleString('en-US',{maximumFractionDigits:2}) + '</td>' +
            '<td>' + d.sessions + '</td>' +
            '<td style="color:' + plColor + ';font-weight:700;">' + (d.pl >= 0 ? '+' : '') + d.pl.toFixed(2) + '</td>' +
            '<td>' + d.avgRate.toFixed(2) + '%</td>' +
            '<td style="color:var(--accent-green);">' + d.wins + '</td>' +
            '<td style="color:var(--accent-red);">' + d.losses + '</td>' +
            '<td style="color:var(--accent-orange);font-weight:600;">' + d.winRate.toFixed(1) + '%</td>' +
            '</tr>';
    });
    
    // Chart
    if (dbChart) dbChart.destroy();
    const ctx = document.getElementById('dbChart').getContext('2d');
    dbChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: details.map(d => d.label),
            datasets: [
                {
                    label: 'Profit/Perte',
                    data: details.map(d => d.pl),
                    backgroundColor: details.map(d => d.pl >= 0 ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,102,0.3)'),
                    borderColor: details.map(d => d.pl >= 0 ? '#00ff88' : '#ff4466'),
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Budget',
                    data: details.map(d => d.budget),
                    backgroundColor: 'rgba(0,212,255,0.15)',
                    borderColor: '#00d4ff',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color:'#8a9bb5', font:{family:'Outfit'} } } },
            scales: {
                y: { ticks:{color:'#5a6b85'}, grid:{color:'rgba(255,255,255,0.04)'} },
                x: { ticks:{color:'#5a6b85', font:{size:9}}, grid:{display:false} }
            }
        }
    });
}

function downloadDashboardPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l','mm','a4');
    doc.setFontSize(18);
    doc.text(sanitize('Tableau de Bord - Performance Globale'), 14, 18);
    doc.setFontSize(11);
    doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 14, 27);
    doc.text('Total P/L: ' + document.getElementById('dbTotalPL').textContent, 14, 35);
    doc.text('Taux Global: ' + document.getElementById('dbTotalRate').textContent, 100, 35);
    doc.text('Capital Engage: ' + document.getElementById('dbTotalCapital').textContent, 14, 43);
    doc.text('Capital Progression: ' + document.getElementById('dbTotalProgression').textContent, 100, 43);
    doc.text('Sessions: ' + document.getElementById('dbTotalSessions').textContent + ' | Gagnants: ' + document.getElementById('dbWinSessions').textContent + ' | Perdants: ' + document.getElementById('dbLossSessions').textContent, 14, 51);
    
    const rows = [];
    document.querySelectorAll('#dbDetailBody tr').forEach(tr => {
        const cells = tr.querySelectorAll('td');
        rows.push(Array.from(cells).map(c => sanitize(c.textContent)));
    });
    if (rows.length > 0) {
        doc.autoTable({
            startY: 58,
            head: [['Strategie','Budget','Sessions','Cumul P/L','Taux Moyen','Gagnants','Perdants','Taux Reussite']],
            body: rows,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [0,136,255] }
        });
    }
    doc.save('tableau_de_bord.pdf');
}

// ==================== TRANSLATION ====================
const I18N = {
    fr: {
        // General
        subtitle:'Calculez vos gains et pertes sur le marche des changes',
        home:"Page d'accueil",
        // Login
        phone_label:'Numero de telephone',
        login_btn:'Connexion',
        login_placeholder:'Ex: 225 0586214172',
        // Page 2 - P&L
        p2_title:'Profit et Perte',
        capital:"Budget d'investissement (USD)",
        pair:'Paire de devises',
        position_type:'Type de position',
        leverage:'Levier (Leverage)',
        lot_size:'Taille du lot',
        price_risk:'Prix & Gestion du Risque',
        entry_price:"Prix d'entree",
        exit_price:'Prix de sortie',
        stop_loss:'Stop Loss (optionnel)',
        take_profit:'Take Profit (optionnel)',
        spread_label:'Spread (pips)',
        commission_label:'Commission par lot (USD)',
        swap_label:'Swap / Nuit (USD, optionnel)',
        btn_calculate:'CALCULER LE PROFIT / PERTE',
        btn_reset:'Reinitialiser',
        budget_diff_title:'Taux Differentiel du Budget',
        budget_before:'Budget AVANT trading (USD)',
        budget_after:'Budget APRES trading (USD)',
        btn_calc_diff:'Calculer le Differentiel',
        lbl_margin_loss:'Marge / Perte',
        lbl_diff_rate:'Taux Differentiel',
        lbl_status:'Statut',
        lbl_net_result:'Resultat Net',
        lbl_roi:'ROI',
        lbl_gross_pl:'Profit/Perte Brut',
        lbl_before_fees:'Avant frais',
        lbl_spread_cost:'Cout du Spread',
        lbl_commission_swap:'Commission + Swap',
        lbl_total_fees:'Frais totaux',
        lbl_pips_result:'Pips Gagnes/Perdus',
        lbl_net_after_spread:'Net apres spread',
        lbl_position_size:'Taille de Position',
        lbl_notional:'Volume notionnel',
        lbl_margin_req:'Marge Requise',
        lbl_of_capital:'du capital',
        lbl_risk_sl:'Risque si Stop Loss',
        lbl_rr_ratio:'Ratio Risque/Gain',
        lbl_risk_reward:'Risk:Reward',
        btn_download_pl_pdf:'Telecharger PDF Estimation Profit/Perte',
        history_title:'Historique des Calculs',
        btn_clear:'Effacer',
        lbl_total_trades:'Total Trades',
        lbl_total_pl:'P&L Total',
        lbl_winners:'Gagnants',
        lbl_losers:'Perdants',
        empty_history:'Aucun calcul effectue.',
        btn_back:'RETOUR',
        buy_label:'BUY (Achat)',
        sell_label:'SELL (Vente)',
        pip_info_prefix:'1 pip = $',
        pip_info_suffix:' par lot standard',
        // Page 3
        p3_title:'Suivi Budget - Bot Longterm Trading N\u00b01',
        p9_title:'Suivi Budget - Bot Longterm Trading N\u00b02',
        p10_title:'Suivi Budget - Bot Longterm Trading N\u00b03',
        p11_title:'Suivi Budget - Bot Longterm Trading N\u00b04',
        p12_title:'Suivi Budget - Bot Longterm Trading N\u00b05',
        p13_title:'Suivi Budget - Bot Longterm Trading N\u00b06',
        p14_title:'Suivi Budget - Bot Longterm Trading N\u00b07',
        p15_title:'PLAN LOT TRADING FOREX',
        p15_desc:'Plan du lot a choisir selon le budget minimum d\'investissement.',
        p16_title:'Tableau de Bord - Performance Globale',
        p16_desc:'Synthese de la performance des bilans de trading.',
        menu_plan_lot:'Plan Lot Trading Forex',
        menu_plan_lot_desc:'Plan du lot selon le budget',
        menu_dashboard:'Tableau de Bord',
        menu_dashboard_desc:'Synthese performance globale',
        btn_download_plan_lot:'Telecharger PDF Plan Lot',
        lbl_cumul_pl:'Cumul P/L',
        lbl_cumul_rate:'Cumul Taux',
        lbl_budget_trading:'Budget Trading',
        btn_download_bilan:'Telecharger PDF Bilan',
        btn_delete_all:'Supprimer Toutes les Lignes',
        btn_add_row:'+ Ajouter Ligne',
        // Page 4
        p4_title:'Suivi Budget - Bot Point Pivot - Return Trend',
        // Session columns
        col_datetime:'Date/Heure',
        col_before_b1:'Avant Broker 1',
        col_before_b2:'Avant Broker 2',
        col_cumul_before:'Cumul N1 (Avant)',
        col_after_b1:'Apres Broker 1',
        col_after_b2:'Apres Broker 2',
        col_cumul_after:'Cumul N2 (Apres)',
        col_pl_net:'Profit/Perte Net',
        col_pair:'Paire',
        col_lot:'Lot',
        col_roi:'Taux / ROI %',
        col_dd:'Drawdown %',
        btn_delete_row:'Suppr.',
        btn_pdf_row:'PDF',
        // Page 5
        p5_title:'Estimation Salaire',
        salary_amount:'Montant Salariale Estime (USD)',
        rate_perf:'Taux Performance Trading (%)',
        btn_calc_salary:'Calculer le Budget a Investir',
        lbl_salary_est:'Salaire Estime',
        lbl_rate_perf:'Taux Performance',
        lbl_budget_invest:'Budget a Investir',
        // Page 6
        p6_title:'Volume Controle',
        budget_vc:'Budget de Trading',
        lbl_bareme_lot:'Bareme Debut LOT',
        lbl_budget_bareme:'Budget Bareme',
        lbl_bareme_calc:'Bareme Calcul LOT',
        lbl_lot_special:'LOT Special a Utiliser',
        lbl_pret_broker:'Pret Broker',
        btn_download_vc:'Telecharger PDF Volume Control',
        // Page 7
        p7_title:'Interet Compose (5 ans)',
        budget_ic:'Budget de Trading (USD)',
        rate_ic:'Taux Performance Minimum Mensuel (%)',
        btn_calc_ic:'Calculer l\'Interet Compose',
        lbl_cumul_ca:'Cumul CA',
        lbl_cumul_profit:'Cumul Profit Net',
        lbl_cumul_taux:'Cumul Taux Profit',
        btn_download_ic:'Telecharger PDF Interet Compose',
        btn_share:'Partager',
        // Page 8 - Admin
        p8_title:'Panel Parametrage - Administrateur',
        admin_name:'Nom Utilisateur',
        admin_phone:'Numero Telephone',
        admin_exp:'Date de Peremption',
        admin_access:'Acces aux Pages',
        btn_add_user:'Ajouter Utilisateur',
        btn_delete_user:'Supprimer Utilisateur',
        btn_renew_access:'Renouveler Acces',
        btn_download_users:'Telecharger Listing Utilisateurs',
        btn_print_users:'Imprimer Listing Utilisateurs',
        // Expiration
        exp_start_label:"Debut d'acces :",
        exp_end_label:"Fin d'acces :",
        exp_remaining_label:'Jours restants :',
        exp_status_label:'Statut :',
        expired_title:'Acces Expire',
        expired_msg:"Veuillez renouveler votre acces a l'application. Contactez l'administrateur pour obtenir un renouvellement.",
        // Menu items
        menu_pl:'Profit et Perte',
        menu_pl_desc:'Calculer gains et pertes forex',
        menu_bot_long1:'Bot Longterm Trading N\u00b01',
        menu_bot_long1_desc:'Suivi budget longterm N\u00b01',
        menu_bot_long2:'Bot Longterm Trading N\u00b02',
        menu_bot_long2_desc:'Suivi budget longterm N\u00b02',
        menu_bot_long3:'Bot Longterm Trading N\u00b03',
        menu_bot_long3_desc:'Suivi budget longterm N\u00b03',
        menu_bot_long4:'Bot Longterm Trading N\u00b04',
        menu_bot_long4_desc:'Suivi budget longterm N\u00b04',
        menu_bot_long5:'Bot Longterm Trading N\u00b05',
        menu_bot_long5_desc:'Suivi budget longterm N\u00b05',
        menu_bot_long6:'Bot Longterm Trading N\u00b06',
        menu_bot_long6_desc:'Suivi budget longterm N\u00b06',
        menu_bot_long7:'Bot Longterm Trading N\u00b07',
        menu_bot_long7_desc:'Suivi budget longterm N\u00b07',
        menu_bot_pivot:'Bot Pivot - Return Trend',
        menu_bot_pivot_desc:'Suivi budget pivot',
        menu_salary:'Estimation Salaire',
        menu_salary_desc:'Estimer revenu trading',
        menu_volume:'Volume Controle',
        menu_volume_desc:'Calcul lot et volume',
        menu_ic:'Interet Compose',
        menu_ic_desc:'Estimation sur 5 ans',
        // Admin popup
        admin_popup_title:'Acces Administrateur',
        admin_code_placeholder:'Code secret administrateur',
        btn_validate:'Valider',
        btn_cancel:'Annuler'
    },
    en: {
        subtitle:'Calculate your gains and losses on the forex market',
        home:'Home Page',
        phone_label:'Phone Number',
        login_btn:'Login',
        login_placeholder:'Ex: 225 0586214172',
        p2_title:'Profit and Loss',
        capital:'Investment Budget (USD)',
        pair:'Currency Pair',
        position_type:'Position Type',
        leverage:'Leverage',
        lot_size:'Lot Size',
        price_risk:'Price & Risk Management',
        entry_price:'Entry Price',
        exit_price:'Exit Price',
        stop_loss:'Stop Loss (optional)',
        take_profit:'Take Profit (optional)',
        spread_label:'Spread (pips)',
        commission_label:'Commission per lot (USD)',
        swap_label:'Swap / Overnight (USD, optional)',
        btn_calculate:'CALCULATE PROFIT / LOSS',
        btn_reset:'Reset',
        budget_diff_title:'Budget Differential Rate',
        budget_before:'Budget BEFORE trading (USD)',
        budget_after:'Budget AFTER trading (USD)',
        btn_calc_diff:'Calculate Differential',
        lbl_margin_loss:'Margin / Loss',
        lbl_diff_rate:'Differential Rate',
        lbl_status:'Status',
        lbl_net_result:'Net Result',
        lbl_roi:'ROI',
        lbl_gross_pl:'Gross Profit/Loss',
        lbl_before_fees:'Before fees',
        lbl_spread_cost:'Spread Cost',
        lbl_commission_swap:'Commission + Swap',
        lbl_total_fees:'Total fees',
        lbl_pips_result:'Pips Won/Lost',
        lbl_net_after_spread:'Net after spread',
        lbl_position_size:'Position Size',
        lbl_notional:'Notional volume',
        lbl_margin_req:'Margin Required',
        lbl_of_capital:'of capital',
        lbl_risk_sl:'Risk if Stop Loss',
        lbl_rr_ratio:'Risk/Reward Ratio',
        lbl_risk_reward:'Risk:Reward',
        btn_download_pl_pdf:'Download P&L Estimation PDF',
        history_title:'Calculation History',
        btn_clear:'Clear',
        lbl_total_trades:'Total Trades',
        lbl_total_pl:'Total P&L',
        lbl_winners:'Winners',
        lbl_losers:'Losers',
        empty_history:'No calculations yet.',
        btn_back:'BACK',
        buy_label:'BUY',
        sell_label:'SELL',
        pip_info_prefix:'1 pip = $',
        pip_info_suffix:' per standard lot',
        p3_title:'Budget Tracking - Longterm Bot Trading N\u00b01',
        p9_title:'Budget Tracking - Longterm Bot Trading N\u00b02',
        p10_title:'Budget Tracking - Longterm Bot Trading N\u00b03',
        p11_title:'Budget Tracking - Longterm Bot Trading N\u00b04',
        p12_title:'Budget Tracking - Longterm Bot Trading N\u00b05',
        p13_title:'Budget Tracking - Longterm Bot Trading N\u00b06',
        p14_title:'Budget Tracking - Longterm Bot Trading N\u00b07',
        p15_title:'FOREX LOT TRADING PLAN',
        p15_desc:'Lot plan to choose based on minimum investment budget.',
        p16_title:'Dashboard - Global Performance',
        p16_desc:'Performance summary of all trading tracking pages.',
        menu_plan_lot:'Lot Trading Plan',
        menu_plan_lot_desc:'Lot plan by budget',
        menu_dashboard:'Dashboard',
        menu_dashboard_desc:'Global performance summary',
        btn_download_plan_lot:'Download Lot Plan PDF',
        lbl_cumul_pl:'Cumul P/L',
        lbl_cumul_rate:'Cumul Rate',
        lbl_budget_trading:'Trading Budget',
        btn_download_bilan:'Download Report PDF',
        btn_delete_all:'Delete All Rows',
        btn_add_row:'+ Add Row',
        p4_title:'Budget Tracking - Pivot Bot - Return Trend',
        col_datetime:'Date/Time',
        col_before_b1:'Before Broker 1',
        col_before_b2:'Before Broker 2',
        col_cumul_before:'Cumul N1 (Before)',
        col_after_b1:'After Broker 1',
        col_after_b2:'After Broker 2',
        col_cumul_after:'Cumul N2 (After)',
        col_pl_net:'Net Profit/Loss',
        col_pair:'Pair',
        col_lot:'Lot',
        col_roi:'Rate / ROI %',
        col_dd:'Drawdown %',
        btn_delete_row:'Del.',
        btn_pdf_row:'PDF',
        p5_title:'Salary Estimation',
        salary_amount:'Estimated Salary Amount (USD)',
        rate_perf:'Trading Performance Rate (%)',
        btn_calc_salary:'Calculate Investment Budget',
        lbl_salary_est:'Estimated Salary',
        lbl_rate_perf:'Performance Rate',
        lbl_budget_invest:'Investment Budget',
        p6_title:'Volume Control',
        budget_vc:'Trading Budget',
        lbl_bareme_lot:'Starting LOT Scale',
        lbl_budget_bareme:'Scale Budget',
        lbl_bareme_calc:'LOT Calculation Scale',
        lbl_lot_special:'Special LOT to Use',
        lbl_pret_broker:'Broker Loan',
        btn_download_vc:'Download Volume Control PDF',
        p7_title:'Compound Interest (5 years)',
        budget_ic:'Trading Budget (USD)',
        rate_ic:'Minimum Monthly Performance Rate (%)',
        btn_calc_ic:'Calculate Compound Interest',
        lbl_cumul_ca:'Cumul Revenue',
        lbl_cumul_profit:'Cumul Net Profit',
        lbl_cumul_taux:'Cumul Profit Rate',
        btn_download_ic:'Download Compound Interest PDF',
        btn_share:'Share',
        p8_title:'Admin Settings Panel',
        admin_name:'User Name',
        admin_phone:'Phone Number',
        admin_exp:'Expiration Date',
        admin_access:'Page Access',
        btn_add_user:'Add User',
        btn_delete_user:'Delete User',
        btn_renew_access:'Renew Access',
        btn_download_users:'Download User List',
        btn_print_users:'Print User List',
        exp_start_label:'Access start:',
        exp_end_label:'Access end:',
        exp_remaining_label:'Days remaining:',
        exp_status_label:'Status:',
        expired_title:'Access Expired',
        expired_msg:'Please renew your access to the application. Contact the administrator for a renewal.',
        menu_pl:'Profit and Loss',
        menu_pl_desc:'Calculate forex gains and losses',
        menu_bot_long1:'Longterm Bot Trading N\u00b01',
        menu_bot_long1_desc:'Longterm budget tracking N\u00b01',
        menu_bot_long2:'Longterm Bot Trading N\u00b02',
        menu_bot_long2_desc:'Longterm budget tracking N\u00b02',
        menu_bot_long3:'Longterm Bot Trading N\u00b03',
        menu_bot_long3_desc:'Longterm budget tracking N\u00b03',
        menu_bot_long4:'Longterm Bot Trading N\u00b04',
        menu_bot_long4_desc:'Longterm budget tracking N\u00b04',
        menu_bot_long5:'Longterm Bot Trading N\u00b05',
        menu_bot_long5_desc:'Longterm budget tracking N\u00b05',
        menu_bot_long6:'Longterm Bot Trading N\u00b06',
        menu_bot_long6_desc:'Longterm budget tracking N\u00b06',
        menu_bot_long7:'Longterm Bot Trading N\u00b07',
        menu_bot_long7_desc:'Longterm budget tracking N\u00b07',
        menu_bot_pivot:'Pivot Bot - Return Trend',
        menu_bot_pivot_desc:'Pivot budget tracking',
        menu_salary:'Salary Estimation',
        menu_salary_desc:'Estimate trading income',
        menu_volume:'Volume Control',
        menu_volume_desc:'Lot and volume calculation',
        menu_ic:'Compound Interest',
        menu_ic_desc:'5-year estimation',
        admin_popup_title:'Administrator Access',
        admin_code_placeholder:'Secret administrator code',
        btn_validate:'Validate',
        btn_cancel:'Cancel'
    },
    es: {
        subtitle:'Calcule tus ganancias y perdidas en el mercado forex',
        home:'Pagina de Inicio',
        phone_label:'Numero de telefono',
        login_btn:'Conexion',
        login_placeholder:'Ej: 225 0586214172',
        p2_title:'Ganancia y Perdida',
        capital:'Presupuesto de inversion (USD)',
        pair:'Par de divisas',
        position_type:'Tipo de posicion',
        leverage:'Apalancamiento',
        lot_size:'Tamano del lote',
        price_risk:'Precio y Gestion del Riesgo',
        entry_price:'Precio de entrada',
        exit_price:'Precio de salida',
        stop_loss:'Stop Loss (opcional)',
        take_profit:'Take Profit (opcional)',
        spread_label:'Spread (pips)',
        commission_label:'Comision por lote (USD)',
        swap_label:'Swap / Noche (USD, opcional)',
        btn_calculate:'CALCULAR GANANCIA / PERDIDA',
        btn_reset:'Reiniciar',
        budget_diff_title:'Tasa Diferencial del Presupuesto',
        budget_before:'Presupuesto ANTES del trading (USD)',
        budget_after:'Presupuesto DESPUES del trading (USD)',
        btn_calc_diff:'Calcular Diferencial',
        lbl_margin_loss:'Margen / Perdida',
        lbl_diff_rate:'Tasa Diferencial',
        lbl_status:'Estado',
        lbl_net_result:'Resultado Neto',
        lbl_roi:'ROI',
        lbl_gross_pl:'Ganancia/Perdida Bruta',
        lbl_before_fees:'Antes de comisiones',
        lbl_spread_cost:'Costo del Spread',
        lbl_commission_swap:'Comision + Swap',
        lbl_total_fees:'Comisiones totales',
        lbl_pips_result:'Pips Ganados/Perdidos',
        lbl_net_after_spread:'Neto despues del spread',
        lbl_position_size:'Tamano de Posicion',
        lbl_notional:'Volumen nocional',
        lbl_margin_req:'Margen Requerido',
        lbl_of_capital:'del capital',
        lbl_risk_sl:'Riesgo si Stop Loss',
        lbl_rr_ratio:'Ratio Riesgo/Ganancia',
        lbl_risk_reward:'Riesgo:Ganancia',
        btn_download_pl_pdf:'Descargar PDF Estimacion G/P',
        history_title:'Historial de Calculos',
        btn_clear:'Borrar',
        lbl_total_trades:'Total Operaciones',
        lbl_total_pl:'G/P Total',
        lbl_winners:'Ganadores',
        lbl_losers:'Perdedores',
        empty_history:'Ningun calculo realizado.',
        btn_back:'VOLVER',
        buy_label:'COMPRA',
        sell_label:'VENTA',
        pip_info_prefix:'1 pip = $',
        pip_info_suffix:' por lote estandar',
        p3_title:'Seguimiento - Bot Longterm Trading',
        lbl_cumul_pl:'Acumulado G/P',
        lbl_cumul_rate:'Acumulado Tasa',
        lbl_budget_trading:'Presupuesto Trading',
        btn_download_bilan:'Descargar PDF Informe',
        btn_delete_all:'Eliminar Todas las Filas',
        btn_add_row:'+ Agregar Fila',
        p4_title:'Seguimiento - Bot Pivot - Return Trend',
        col_datetime:'Fecha/Hora',
        col_before_b1:'Antes Broker 1',
        col_before_b2:'Antes Broker 2',
        col_cumul_before:'Acumulado N1 (Antes)',
        col_after_b1:'Despues Broker 1',
        col_after_b2:'Despues Broker 2',
        col_cumul_after:'Acumulado N2 (Despues)',
        col_pl_net:'Ganancia/Perdida Neta',
        col_pair:'Par',
        col_lot:'Lote',
        col_roi:'Tasa / ROI %',
        col_dd:'Drawdown %',
        btn_delete_row:'Elim.',
        btn_pdf_row:'PDF',
        p5_title:'Estimacion de Salario',
        salary_amount:'Monto Salarial Estimado (USD)',
        rate_perf:'Tasa de Rendimiento Trading (%)',
        btn_calc_salary:'Calcular Presupuesto a Invertir',
        lbl_salary_est:'Salario Estimado',
        lbl_rate_perf:'Tasa de Rendimiento',
        lbl_budget_invest:'Presupuesto a Invertir',
        p6_title:'Control de Volumen',
        budget_vc:'Presupuesto de Trading',
        lbl_bareme_lot:'Escala Inicio LOT',
        lbl_budget_bareme:'Presupuesto Escala',
        lbl_bareme_calc:'Escala Calculo LOT',
        lbl_lot_special:'LOT Especial a Usar',
        lbl_pret_broker:'Prestamo Broker',
        btn_download_vc:'Descargar PDF Control Volumen',
        p7_title:'Interes Compuesto (5 anos)',
        budget_ic:'Presupuesto de Trading (USD)',
        rate_ic:'Tasa Rendimiento Minimo Mensual (%)',
        btn_calc_ic:'Calcular Interes Compuesto',
        lbl_cumul_ca:'Acumulado Ingresos',
        lbl_cumul_profit:'Acumulado Ganancia Neta',
        lbl_cumul_taux:'Acumulado Tasa Ganancia',
        btn_download_ic:'Descargar PDF Interes Compuesto',
        btn_share:'Compartir',
        p8_title:'Panel de Configuracion - Administrador',
        admin_name:'Nombre de Usuario',
        admin_phone:'Numero de Telefono',
        admin_exp:'Fecha de Vencimiento',
        admin_access:'Acceso a Paginas',
        btn_add_user:'Agregar Usuario',
        btn_delete_user:'Eliminar Usuario',
        btn_renew_access:'Renovar Acceso',
        btn_download_users:'Descargar Lista de Usuarios',
        btn_print_users:'Imprimir Lista de Usuarios',
        exp_start_label:'Inicio de acceso:',
        exp_end_label:'Fin de acceso:',
        exp_remaining_label:'Dias restantes:',
        exp_status_label:'Estado:',
        expired_title:'Acceso Vencido',
        expired_msg:'Por favor renueve su acceso a la aplicacion. Contacte al administrador para una renovacion.',
        menu_pl:'Ganancia y Perdida',
        menu_pl_desc:'Calcular ganancias y perdidas forex',
        
        menu_bot_pivot:'Bot Pivot - Return Trend',
        menu_bot_pivot_desc:'Seguimiento presupuesto pivot',
        menu_salary:'Estimacion de Salario',
        menu_salary_desc:'Estimar ingresos trading',
        menu_volume:'Control de Volumen',
        menu_volume_desc:'Calculo de lote y volumen',
        menu_ic:'Interes Compuesto',
        menu_ic_desc:'Estimacion a 5 anos',
        admin_popup_title:'Acceso Administrador',
        admin_code_placeholder:'Codigo secreto administrador',
        btn_validate:'Validar',
        btn_cancel:'Cancelar'
    },
    ru: {
        subtitle:'Рассчитайте прибыль и убытки на рынке форекс',
        home:'Главная',
        phone_label:'Номер телефона',
        login_btn:'Войти',
        login_placeholder:'Пр: 225 0586214172',
        p2_title:'Прибыль и Убытки',
        capital:'Инвестиционный бюджет (USD)',
        pair:'Валютная пара',
        position_type:'Тип позиции',
        leverage:'Кредитное плечо',
        lot_size:'Размер лота',
        price_risk:'Цена и Управление рисками',
        entry_price:'Цена входа',
        exit_price:'Цена выхода',
        stop_loss:'Stop Loss (опционально)',
        take_profit:'Take Profit (опционально)',
        spread_label:'Спред (пипсы)',
        commission_label:'Комиссия за лот (USD)',
        swap_label:'Своп / ночь (USD, опционально)',
        btn_calculate:'РАССЧИТАТЬ ПРИБЫЛЬ / УБЫТОК',
        btn_reset:'Сбросить',
        budget_diff_title:'Дифференциальная ставка бюджета',
        budget_before:'Бюджет ДО торговли (USD)',
        budget_after:'Бюджет ПОСЛЕ торговли (USD)',
        btn_calc_diff:'Рассчитать дифференциал',
        lbl_margin_loss:'Маржа / Убыток',
        lbl_diff_rate:'Дифференциальная ставка',
        lbl_status:'Статус',
        lbl_net_result:'Чистый результат',
        lbl_roi:'ROI',
        lbl_gross_pl:'Валовая Прибыль/Убыток',
        lbl_before_fees:'До комиссий',
        lbl_spread_cost:'Стоимость спреда',
        lbl_commission_swap:'Комиссия + Своп',
        lbl_total_fees:'Общие комиссии',
        lbl_pips_result:'Выигранных/Потерянных пипсов',
        lbl_net_after_spread:'Нетто после спреда',
        lbl_position_size:'Размер позиции',
        lbl_notional:'Номинальный объем',
        lbl_margin_req:'Необходимая маржа',
        lbl_of_capital:'от капитала',
        lbl_risk_sl:'Риск при Stop Loss',
        lbl_rr_ratio:'Соотношение Риск/Прибыль',
        lbl_risk_reward:'Риск:Прибыль',
        btn_download_pl_pdf:'Скачать PDF оценки П/У',
        history_title:'История расчетов',
        btn_clear:'Очистить',
        lbl_total_trades:'Всего сделок',
        lbl_total_pl:'Общая П/У',
        lbl_winners:'Прибыльных',
        lbl_losers:'Убыточных',
        empty_history:'Расчеты не проводились.',
        btn_back:'НАЗАД',
        buy_label:'ПОКУПКА',
        sell_label:'ПРОДАЖА',
        pip_info_prefix:'1 пипс = $',
        pip_info_suffix:' за стандартный лот',
        p3_title:'\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435 - Bot Longterm N\u00b01',
        p9_title:'\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435 - Bot Longterm N\u00b02',
        p10_title:'\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435 - Bot Longterm N\u00b03',
        p11_title:'\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435 - Bot Longterm N\u00b04',
        p12_title:'\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435 - Bot Longterm N\u00b05',
        p13_title:'\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435 - Bot Longterm N\u00b06',
        p14_title:'\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435 - Bot Longterm N\u00b07',
        p15_title:'PLAN LOT TRADING FOREX',
        p15_desc:'Plan du lot a choisir selon le budget minimum.',
        p16_title:'Dashboard',
        p16_desc:'Performance summary.',
        menu_plan_lot:'Plan Lot Trading',
        menu_plan_lot_desc:'Plan lot',
        menu_dashboard:'Dashboard',
        menu_dashboard_desc:'Performance',
        btn_download_plan_lot:'PDF Plan Lot',
        lbl_cumul_pl:'Общая П/У',
        lbl_cumul_rate:'Общая ставка',
        lbl_budget_trading:'Торговый бюджет',
        btn_download_bilan:'Скачать PDF отчет',
        btn_delete_all:'Удалить все строки',
        btn_add_row:'+ Добавить строку',
        p4_title:'Отслеживание - Pivot бот - Return Trend',
        col_datetime:'Дата/Время',
        col_before_b1:'До Брокер 1',
        col_before_b2:'До Брокер 2',
        col_cumul_before:'Итого N1 (До)',
        col_after_b1:'После Брокер 1',
        col_after_b2:'После Брокер 2',
        col_cumul_after:'Итого N2 (После)',
        col_pl_net:'Чистая П/У',
        col_pair:'Пара',
        col_lot:'Лот',
        col_roi:'Ставка / ROI %',
        col_dd:'Просадка %',
        btn_delete_row:'Удал.',
        btn_pdf_row:'PDF',
        p5_title:'Оценка зарплаты',
        salary_amount:'Ожидаемая зарплата (USD)',
        rate_perf:'Ставка эффективности торговли (%)',
        btn_calc_salary:'Рассчитать инвестиционный бюджет',
        lbl_salary_est:'Ожидаемая зарплата',
        lbl_rate_perf:'Ставка эффективности',
        lbl_budget_invest:'Инвестиционный бюджет',
        p6_title:'Контроль объема',
        budget_vc:'Торговый бюджет',
        lbl_bareme_lot:'Начальная шкала LOT',
        lbl_budget_bareme:'Бюджет шкалы',
        lbl_bareme_calc:'Расчетная шкала LOT',
        lbl_lot_special:'Специальный LOT',
        lbl_pret_broker:'Кредит брокера',
        btn_download_vc:'Скачать PDF Контроль объема',
        p7_title:'Сложный процент (5 лет)',
        budget_ic:'Торговый бюджет (USD)',
        rate_ic:'Мин. месячная ставка эффективности (%)',
        btn_calc_ic:'Рассчитать сложный процент',
        lbl_cumul_ca:'Общий доход',
        lbl_cumul_profit:'Общая чистая прибыль',
        lbl_cumul_taux:'Общая ставка прибыли',
        btn_download_ic:'Скачать PDF Сложный процент',
        btn_share:'Поделиться',
        p8_title:'Панель настроек - Администратор',
        admin_name:'Имя пользователя',
        admin_phone:'Номер телефона',
        admin_exp:'Дата истечения',
        admin_access:'Доступ к страницам',
        btn_add_user:'Добавить пользователя',
        btn_delete_user:'Удалить пользователя',
        btn_renew_access:'Продлить доступ',
        btn_download_users:'Скачать список пользователей',
        btn_print_users:'Печать списка пользователей',
        exp_start_label:'Начало доступа:',
        exp_end_label:'Конец доступа:',
        exp_remaining_label:'Дней осталось:',
        exp_status_label:'Статус:',
        expired_title:'Доступ истек',
        expired_msg:'Пожалуйста, обновите доступ к приложению. Свяжитесь с администратором для продления.',
        menu_pl:'Прибыль и Убытки',
        menu_pl_desc:'Расчет прибыли и убытков форекс',
        menu_bot_long1:'Bot Longterm N\u00b01',
        menu_bot_long1_desc:'N\u00b01',
        menu_bot_long2:'Bot Longterm N\u00b02',
        menu_bot_long2_desc:'N\u00b02',
        menu_bot_long3:'Bot Longterm N\u00b03',
        menu_bot_long3_desc:'N\u00b03',
        menu_bot_long4:'Bot Longterm N\u00b04',
        menu_bot_long4_desc:'N\u00b04',
        menu_bot_long5:'Bot Longterm N\u00b05',
        menu_bot_long5_desc:'N\u00b05',
        menu_bot_long6:'Bot Longterm N\u00b06',
        menu_bot_long6_desc:'N\u00b06',
        menu_bot_long7:'Bot Longterm N\u00b07',
        menu_bot_long7_desc:'N\u00b07',
        
        menu_bot_pivot:'Pivot бот - Return Trend',
        menu_bot_pivot_desc:'Отслеживание pivot бюджета',
        menu_salary:'Оценка зарплаты',
        menu_salary_desc:'Оценка дохода от торговли',
        menu_volume:'Контроль объема',
        menu_volume_desc:'Расчет лота и объема',
        menu_ic:'Сложный процент',
        menu_ic_desc:'Оценка на 5 лет',
        admin_popup_title:'Доступ администратора',
        admin_code_placeholder:'Секретный код администратора',
        btn_validate:'Подтвердить',
        btn_cancel:'Отмена'
    }
};

let currentLang = 'fr';

function changeLanguage(lang) {
    currentLang = lang;
    const dict = I18N[lang] || I18N.fr;

    // Translate all data-i18n text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });

    // Translate all data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) el.placeholder = dict[key];
    });

    // Re-render menu buttons with translated text
    if (currentUser) renderMenuButtons();

    // Update pip info
    updatePipInfo();

    // Re-render session column labels for pages 3 and 4
    [3, 4, 9, 10, 11, 12, 13, 14].forEach(page => {
        const container = document.getElementById('sessions' + page);
        if (container) {
            container.querySelectorAll('.session-block').forEach(block => {
                translateSessionBlock(block);
            });
        }
    });
}

// ==================== INIT PAGE ====================
updatePipInfo();
