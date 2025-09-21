/* app.js — comportamiento básico: catalog render, age-gate, modales y búsqueda.

IMPORTANTE: Esto es puramente frontend. Implementa validación en servidor para todo.

*/


const data = Array.from({length:18}).map((_,i)=>({

id: i+1,

title: `Contenido Premium #${i+1}`,

desc: `Duración: ${(i%10)+1} min · Modelo: Modelo ${i+1}`,

thumb: `https://picsum.photos/seed/premium${i+1}/800/600`

}));


const grid = document.getElementById('grid');

function render(items){

grid.innerHTML = '';

items.forEach(it=>{

const article = document.createElement('div'); article.className='card';

article.innerHTML = `

<div class="thumb">

<img src="${it.thumb}" alt="${it.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover">

</div>

<div class="meta">

<h3>${it.title}</h3>

<p class="muted">${it.desc}</p>

</div>

`;

// Click opens preview/paywall

article.querySelector('.thumb').addEventListener('click',()=>{

// In production: check subscription server-side then serve signed URL

alert('Vista previa bloqueada. Suscríbete para ver el contenido completo.');

});

grid.appendChild(article);

})

}


// Initial render (first 9 items)

render(data.slice(0,9));


// Load more

document.getElementById('loadMore').addEventListener('click',()=>{

const current = grid.children.length;

render(data.slice(0, Math.min(data.length, current+6)));

});


// Search

document.getElementById('doSearch').addEventListener('click',()=>{

const q = document.getElementById('searchInput').value.trim().toLowerCase();

if(!q){ render(data.slice(0,9)); return }

const filtered = data.filter(d => (d.title+d.desc).toLowerCase().includes(q));

render(filtered.length?filtered:[{id:0,title:'Sin resultados',desc:'Intenta otra búsqueda',thumb:'https://picsum.photos/seed/empty/800/600'}]);

});


// Age gate

const ageGate = document.getElementById('ageGate');

if(sessionStorage.getItem('isAdult') === 'true'){

ageGate.setAttribute('aria-hidden','true');

}


document.getElementById('confirmAge').addEventListener('click',()=>{

sessionStorage.setItem('isAdult','true');

ageGate.setAttribute('aria-hidden','true');

});

document.getElementById('leaveSite').addEventListener('click',()=>{

window.location.href = 'about:blank';

});


// Subscribe modal

const subscribeModal = document.getElementById('subscribeModal');

document.getElementById('openSubscribe').addEventListener('click',()=>{

subscribeModal.removeAttribute('aria-hidden');

document.addEventListener('keydown'

