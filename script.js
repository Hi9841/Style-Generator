const palettesContainer = document.getElementById('palettes-container');
const favoritesContainer = document.getElementById('favorites-container');
const fontSelect = document.getElementById('font-select');
const fontWeight = document.getElementById('font-weight');
const fontSize = document.getElementById('font-size');
const spacingInput = document.getElementById('spacing-input');
const buttonRadius = document.getElementById('button-radius');
const textColor = document.getElementById('text-color');
const backgroundColor = document.getElementById('background-color');
const gradientToggle = document.getElementById('gradient-toggle');
const copyBtn = document.getElementById('copy-css');
const downloadBtn = document.getElementById('download-css');
const saveFavorite = document.getElementById('save-favorite');
const exportJSON = document.getElementById('export-json');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const cssOutput = document.getElementById('css-output');
const previewBox = document.querySelector('.preview-box');

let darkMode = false;
let currentPalette = [];

const predefinedPalettes = [
  ['#0C2B4E','#1A3D64','#1D546C','#EEEEEE'],
  ['#E3FDFD','#CBF1F5','#A6E3E9','#71C9CE'],
  ['#F9F7F7','#DBE2EF','#3F72AF','#112D4E'],
  ['#FFF5E4','#FFE3E1','#FFD1D1','#FF9494'],
  ['#1B262C','#0F4C75','#3282B8','#1abc9c'],
  ['#EDF1D6','#9DC08B','#609966','#40513B']
];

function randomColor(){
    const r = Math.floor(Math.random()*256),
          g = Math.floor(Math.random()*256),
          b = Math.floor(Math.random()*256);
    return `rgb(${r},${g},${b})`;
}

function generateRandomPalette(){
    return [randomColor(), randomColor(), randomColor(), randomColor()];
}

function displayPalettes() {
    const allPalettes = [...predefinedPalettes];
    for(let i=0;i<6;i++) allPalettes.push(generateRandomPalette());
    palettesContainer.innerHTML='';
    allPalettes.forEach(palette=>{
        const div=document.createElement('div'); div.classList.add('palette');
        palette.forEach(c=>{
            const box=document.createElement('div'); 
            box.classList.add('color-box'); 
            box.style.backgroundColor=c; 
            div.appendChild(box); 
        });
        div.addEventListener('click',()=>{ currentPalette=[...palette]; updatePreview(); });
        palettesContainer.appendChild(div);
    });
}

function generateShades(color){
    let r, g, b;
    if(color.startsWith('rgb')){
        [r, g, b] = color.match(/\d+/g).map(Number);
    } else if(color.startsWith('#')){
        let hex = color.replace('#','');
        if(hex.length === 3){ hex = hex.split('').map(h=>h+h).join(''); }
        r = parseInt(hex.substr(0,2),16);
        g = parseInt(hex.substr(2,2),16);
        b = parseInt(hex.substr(4,2),16);
    } else { r = g = b = 128; }
    const lighten=c=>Math.min(c+40,255), darken=c=>Math.max(c-40,0);
    return { light:`rgb(${lighten(r)},${lighten(g)},${lighten(b)})`, dark:`rgb(${darken(r)},${darken(g)},${darken(b)})` };
}

function getContrastColor(color){
    let r,g,b;
    if(color.startsWith('rgb')){
        [r,g,b] = color.match(/\d+/g).map(Number);
    } else {
        let hex = color.replace('#','');
        if(hex.length === 3){ hex = hex.split('').map(h=>h+h).join(''); }
        r = parseInt(hex.substr(0,2),16);
        g = parseInt(hex.substr(2,2),16);
        b = parseInt(hex.substr(4,2),16);
    }
    const brightness = (r*299 + g*587 + b*114) / 1000;
    return brightness > 125 ? '#000' : '#fff';
}

function updatePreview(){
    if(!currentPalette.length) currentPalette=['#3498db','#2ecc71','#e74c3c','#f1c40f'];
    const [primary, secondary, accent, extra] = currentPalette;
    const shades={primary:generateShades(primary), secondary:generateShades(secondary), accent:generateShades(accent), extra:generateShades(extra)};
    const font=fontSelect.value;
    const weight = fontWeight ? fontWeight.value : '400';
    const size = fontSize ? fontSize.value+'px' : '16px';
    const spacing = spacingInput.value+'px';
    const radius = buttonRadius.value+'px';
    const text = textColor.value || '#000000';
    const bg = backgroundColor.value || '#ffffff';

    previewBox.style.fontFamily = font;
    previewBox.style.fontWeight = weight;
    previewBox.style.fontSize = size;
    previewBox.style.color = text;
    previewBox.style.padding = spacing;

    // make all children inherit font
    previewBox.querySelectorAll('*').forEach(el=>{
        el.style.fontFamily = font;
        el.style.fontWeight = weight;
        el.style.fontSize = size;
    });

    if(gradientToggle.checked){
        previewBox.style.background = `linear-gradient(135deg, ${primary}, ${secondary}, ${accent}, ${extra})`;
    } else {
        previewBox.style.background = '';
        previewBox.style.backgroundColor = bg;
    }

    const button = previewBox.querySelector('button');
    button.style.borderRadius = radius;
    button.style.padding = spacing;
    button.style.backgroundColor = primary;
    button.style.color = getContrastColor(primary);

    const card = previewBox.querySelector('.card');
    if(card){
        card.style.backgroundColor = accent;
        card.style.color = getContrastColor(accent);
        card.style.padding = spacing;
        card.style.borderRadius = radius;
    }

    cssOutput.value=`:root {
  --primary-color: ${primary};
  --secondary-color: ${secondary};
  --accent-color: ${accent};
  --extra-color: ${extra};
  --font-family: ${font};
  --font-weight: ${weight};
  --font-size: ${size};
  --base-spacing: ${spacing};
  --button-radius: ${radius};
  --text-color: ${text};
  --background-color: ${bg};
  --gradient: ${gradientToggle.checked?'linear-gradient(135deg,'+primary+','+secondary+','+accent+','+extra+')':'none'};
}`;
}


[fontSelect,fontWeight,fontSize,spacingInput,buttonRadius,textColor,backgroundColor,gradientToggle].forEach(el=>{
    el.addEventListener('input',updatePreview);
    el.addEventListener('change',updatePreview);
});

copyBtn.addEventListener('click', ()=>navigator.clipboard.writeText(cssOutput.value));
downloadBtn.addEventListener('click', ()=>{
    const blob = new Blob([cssOutput.value],{type:'text/css'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download='style.css';
    link.click();
    URL.revokeObjectURL(link.href);
});

darkModeToggle.addEventListener('click', ()=>{
    darkMode = !darkMode;
    const bg = darkMode?'#2c3e50':'#f5f5f5';
    const text = darkMode?'#ecf0f1':'#333333';
    backgroundColor.value = bg; textColor.value = text;
    updatePreview();
});

saveFavorite.addEventListener('click', ()=>{
    const favorites = JSON.parse(localStorage.getItem('favorites')||'[]');
    favorites.push([...currentPalette]);
    localStorage.setItem('favorites',JSON.stringify(favorites));
    loadFavorites();
});

exportJSON.addEventListener('click', ()=>{
    const data={
        palette: currentPalette,
        font: fontSelect.value,
        fontWeight: fontWeight.value,
        fontSize: fontSize.value,
        spacing: spacingInput.value,
        buttonRadius: buttonRadius.value,
        textColor: textColor.value,
        bgColor: backgroundColor.value,
        gradient: gradientToggle.checked
    };
    const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const link=document.createElement('a');
    link.href=URL.createObjectURL(blob);
    link.download='theme.json';
    link.click();
    URL.revokeObjectURL(link.href);
});

function loadFavorites(){
    favoritesContainer.innerHTML='';
    const favorites = JSON.parse(localStorage.getItem('favorites')||'[]');
    favorites.forEach((palette,index)=>{
        const div = document.createElement('div'); div.classList.add('palette');
        palette.forEach(c=>{ const box=document.createElement('div'); box.classList.add('color-box'); box.style.backgroundColor=c; div.appendChild(box); });
        const removeBtn = document.createElement('button'); removeBtn.textContent='✕';
        removeBtn.addEventListener('click', e=>{
            e.stopPropagation();
            favorites.splice(index,1);
            localStorage.setItem('favorites',JSON.stringify(favorites));
            loadFavorites();
        });
        div.appendChild(removeBtn);
        div.addEventListener('click',()=>{ currentPalette=[...palette]; updatePreview(); });
        favoritesContainer.appendChild(div);
    });
}

displayPalettes();
loadFavorites();
updatePreview();
