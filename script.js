// Estado salvo no navegador
let estado = JSON.parse(localStorage.getItem('cuidados_v2')) || {
  agua: 0, alongamento: 0, remedios: [], refeicoes: {}, historico: [], data: new Date().toDateString()
};

// Reseta se for outro dia
if (estado.data !== new Date().toDateString()) {
  estado = { agua: 0, alongamento: 0, remedios: estado.remedios, refeicoes: {}, historico: [], data: new Date().toDateString() };
}

const refeicoesPadrao = [
  { id: 'cafe', nome: 'Cafe da manha', hora: '08:00' },
  { id: 'almoco', nome: 'Almoco', hora: '12:00' },
  { id: 'lanche', nome: 'Lanche da tarde', hora: '15:30' },
  { id: 'jantar', nome: 'Jantar', hora: '19:30' }
];

function salvar() { localStorage.setItem('cuidados_v2', JSON.stringify(estado)); render(); }

function render() {
  document.getElementById('agua-hoje').innerText = `${estado.agua} / 8 copos`;
  document.getElementById('barra-agua').style.width = (estado.agua / 8 * 100) + '%';
  document.getElementById('alongamento-hoje').innerText = `${estado.alongamento} hoje`;
  
  const ul = document.getElementById('listaRemedios');
  ul.innerHTML = estado.remedios.map((r,i) => `<li>${r.hora} - ${r.nome} <button onclick="removerRemedio(${i})">x</button></li>`).join('') || '<li style="color:#999">Nenhum remedio cadastrado</li>';

  const refDiv = document.getElementById('listaRefeicoes');
  refDiv.innerHTML = refeicoesPadrao.map(r => {
    const feita = estado.refeicoes[r.id];
    return `<div class="refeicao ${feita?'feita':''}"><span>${r.hora} - ${r.nome}</span><button onclick="toggleRefeicao('${r.id}')">${feita?'Desfazer':'Feito'}</button></div>`;
  }).join('');

  document.getElementById('historico').innerHTML = estado.historico.slice().reverse().slice(0,20).map(h=>`<div>${h}</div>`).join('') || 'Sem registros hoje';
}

function log(texto) {
  const hora = new Date().toLocaleTimeString();
  estado.historico.push(`[${hora}] ${texto}`);
  salvar();
  document.getElementById('som').play().catch(()=>{});
  if (Notification.permission === 'granted') new Notification('Cuidados Humanos', { body: texto });
}

function beberAgua() { estado.agua++; log('Bebeu agua'); }
function fazerAlongamento() { estado.alongamento++; log('Fez alongamento'); resetTimer('along'); }
function addRemedio() {
  const nome = document.getElementById('nomeRemedio').value;
  const hora = document.getElementById('horaRemedio').value;
  if (!nome || !hora) return alert('Preencha nome e hora');
  estado.remedios.push({ nome, hora }); salvar(); log(`Remedio cadastrado: ${nome} as ${hora}`);
  document.getElementById('nomeRemedio').value = '';
}
function removerRemedio(i) { estado.remedios.splice(i,1); salvar(); }
function toggleRefeicao(id) { estado.refeicoes[id] = !estado.refeicoes[id]; if (estado.refeicoes[id]) log(`Refeicao feita: ${id}`); salvar(); }
function limparHistorico() { estado.historico=[]; estado.agua=0; estado.alongamento=0; estado.refeicoes={}; salvar(); }

// Timers e notificacoes
let segAgua = 40*60, segAlong = 60*60;
function resetTimer(t) { if(t==='agua') segAgua=40*60; if(t==='along') segAlong=60*60; }

setInterval(() => {
  segAgua--; segAlong--;
  document.getElementById('timer-agua').innerText = `${Math.floor(segAgua/60)}:${(segAgua%60).toString().padStart(2,'0')}`;
  document.getElementById('timer-along').innerText = `${Math.floor(segAlong/60)}:${(segAlong%60).toString().padStart(2,'0')}`;
  if (segAgua <= 0) { log('Hora de beber agua'); segAgua = 40*60; }
  if (segAlong <= 0) { log('Hora de se alongar'); segAlong = 60*60; }
  
  const agora = new Date().toTimeString().slice(0,5);
  estado.remedios.forEach(r => { if (r.hora === agora) log(`TOMAR REMEDIO: ${r.nome}`); });
  refeicoesPadrao.forEach(r => { if (r.hora === agora && !estado.refeicoes[r.id]) log(`ALIMENTACAO: Hora do ${r.nome}`); });
}, 1000);

setInterval(() => { document.getElementById('relogio').innerText = new Date().toLocaleString(); }, 1000);

Notification.requestPermission();
render();