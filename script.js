/* ========== DOM ELEMENTS ========== */
const elements = {
    palettes: document.getElementById('palettes-container'),
    harmonySelect: document.getElementById('harmony-select'),
    generateBtn: document.getElementById('generate-btn'),
    fontSelect: document.getElementById('font-select'),
    inputs: {
        weight: document.getElementById('font-weight'),
        size: document.getElementById('font-size'),
        spacing: document.getElementById('spacing-input'),
        radius: document.getElementById('button-radius'),
        text: document.getElementById('text-color'),
        bg: document.getElementById('background-color'),
        gradient: document.getElementById('gradient-toggle')
    },
    labels: {
        textHex: document.getElementById('text-color-hex'),
        bgHex: document.getElementById('bg-color-hex')
    },
    preview: {
        box: document.querySelector('.preview-box'),
        btnPrimary: document.querySelector('.primary-btn'),
        btnSecondary: document.querySelector('.secondary-btn'),
        card: document.querySelector('.card'),
        alert: document.querySelector('.alert-box'),
        badge: document.querySelector('.badge'),
        input: document.querySelector('.preview-input')
    },
    a11y: {
        box: document.getElementById('a11y-status'),
        ratio: document.getElementById('contrast-ratio'),
        grade: document.getElementById('wcag-grade'),
        icon: document.querySelector('.status-icon')
    },
    output: {
        css: document.getElementById('css-output'),
        format: document.getElementById('export-format'),
        copy: document.getElementById('copy-css')
    }
};

let currentPalette = [];
let isDarkMode = false;

/* ========== COLOR UTILITIES (HSL & HEX) ========== */

// Convert HSL to Hex
function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// Generate Harmony Palettes
function generatePalette(type) {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 40) + 60; // Vibrant saturation
    const l = Math.floor(Math.random() * 30) + 40; // Mid-range lightness

    let colors = [];

    switch (type) {
        case 'analogous':
            colors = [0, 30, 60, 90].map(offset => hslToHex((h + offset) % 360, s, l));
            break;
        case 'monochromatic':
            colors = [90, 70, 50, 30].map(light => hslToHex(h, s, light));
            break;
        case 'triadic':
            colors = [0, 120, 240, 0].map((offset, i) => hslToHex((h + offset) % 360, s, i === 3 ? 90 : l));
            break;
        case 'complementary':
            colors = [hslToHex(h, s, l), hslToHex((h + 180) % 360, s, l), hslToHex(h, s - 20, 90), hslToHex((h + 180) % 360, s - 20, 20)];
            break;
        default: // Random
            colors = Array(4).fill(0).map(() => hslToHex(Math.random() * 360, 70, 50));
    }
    return colors;
}

/* ========== ACCESSIBILITY LOGIC (WCAG) ========== */

function getLuminance(hex) {
    const rgb = parseInt(hex.slice(1), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = ((rgb >> 0) & 0xff) / 255;
    const a = [r, g, b].map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function checkContrast(c1, c2) {
    const l1 = getLuminance(c1);
    const l2 = getLuminance(c2);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return ratio.toFixed(2);
}

function updateAccessibilityInfo(text, bg) {
    const ratio = checkContrast(text, bg);
    elements.a11y.ratio.innerText = ratio;

    if (ratio >= 4.5) {
        elements.a11y.box.className = 'a11y-box pass';
        elements.a11y.grade.innerText = "Pass (AA)";
        elements.a11y.icon.innerText = "check_circle";
    } else {
        elements.a11y.box.className = 'a11y-box fail';
        elements.a11y.grade.innerText = "Fail (Too Low)";
        elements.a11y.icon.innerText = "warning";
    }
}

/* ========== CORE FUNCTIONS ========== */

function renderPalettes() {
    elements.palettes.innerHTML = '';
    const type = elements.harmonySelect.value;
    
    for (let i = 0; i < 8; i++) {
        const colors = generatePalette(type);
        const div = document.createElement('div');
        div.className = 'palette';
        colors.forEach(c => {
            const box = document.createElement('div');
            box.className = 'color-box';
            box.style.backgroundColor = c;
            div.appendChild(box);
        });
        div.onclick = () => applyPalette(colors);
        elements.palettes.appendChild(div);
    }
}

function applyPalette(colors) {
    currentPalette = colors;
    // Auto-assign logical colors
    elements.preview.btnPrimary.style.backgroundColor = colors[0];
    elements.preview.btnPrimary.style.color = parseInt(checkContrast('#ffffff', colors[0])) > 3 ? '#ffffff' : '#000000';
    
    elements.preview.btnSecondary.style.backgroundColor = colors[1];
    elements.preview.btnSecondary.style.color = parseInt(checkContrast('#ffffff', colors[1])) > 3 ? '#ffffff' : '#000000';

    const card = elements.preview.card;
    card.style.borderTop = `4px solid ${colors[2]}`;
    elements.preview.badge.style.backgroundColor = colors[2];
    elements.preview.badge.style.color = parseInt(checkContrast('#ffffff', colors[2])) > 3 ? '#ffffff' : '#000000';
    
    updatePreview();
}

function updatePreview() {
    const styles = {
        font: elements.fontSelect.value,
        weight: elements.inputs.weight.value,
        size: elements.inputs.size.value + 'px',
        spacing: elements.inputs.spacing.value + 'px',
        radius: elements.inputs.radius.value + 'px',
        text: elements.inputs.text.value,
        bg: elements.inputs.bg.value
    };

    // Update Text Labels
    elements.labels.textHex.innerText = styles.text;
    elements.labels.bgHex.innerText = styles.bg;

    // Apply to Preview Box
    const box = elements.preview.box;
    box.style.fontFamily = styles.font;
    box.style.color = styles.text;
    
    if(elements.inputs.gradient.checked && currentPalette.length > 0) {
        box.style.background = `linear-gradient(135deg, ${currentPalette[0]}22, ${currentPalette[1]}22)`;
    } else {
        box.style.background = styles.bg;
    }

    // Apply Shared Styles
    box.querySelectorAll('button, input, .card, .alert-box').forEach(el => {
        el.style.borderRadius = styles.radius;
    });

    box.style.gap = styles.spacing;
    elements.preview.card.style.padding = styles.spacing;
    elements.preview.alert.style.padding = styles.spacing;

    // Accessibility Check
    updateAccessibilityInfo(styles.text, styles.bg);

    // Generate Code
    generateCode(styles);
}

function generateCode(s) {
    const format = elements.output.format.value;
    let code = '';

    if (format === 'css') {
        code = `:root {
  --primary: ${currentPalette[0] || '#000'};
  --secondary: ${currentPalette[1] || '#333'};
  --accent: ${currentPalette[2] || '#555'};
  --bg-color: ${s.bg};
  --text-color: ${s.text};
  --font-main: ${s.font};
  --spacing: ${s.spacing};
  --radius: ${s.radius};
}`;
    } else if (format === 'scss') {
        code = `$primary: ${currentPalette[0] || '#000'};
$secondary: ${currentPalette[1] || '#333'};
$accent: ${currentPalette[2] || '#555'};
$bg-color: ${s.bg};
$text-color: ${s.text};
$font-stack: ${s.font};
$base-spacing: ${s.spacing};
$border-radius: ${s.radius};`;
    } else if (format === 'tailwind') {
        code = `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${currentPalette[0] || '#000'}',
        secondary: '${currentPalette[1] || '#333'}',
        accent: '${currentPalette[2] || '#555'}',
        background: '${s.bg}',
        text: '${s.text}',
      },
      fontFamily: {
        main: ['${s.font.split(',')[0].replace(/'/g, "")}'],
      },
      borderRadius: {
        DEFAULT: '${s.radius}',
      }
    }
  }
}`;
    }

    elements.output.css.value = code;
}

/* ========== EVENT LISTENERS ========== */

// Inputs
Object.values(elements.inputs).forEach(input => {
    input.addEventListener('input', updatePreview);
});
elements.fontSelect.addEventListener('change', updatePreview);
elements.output.format.addEventListener('change', updatePreview);

// Palette Generation
elements.generateBtn.addEventListener('click', renderPalettes);
elements.harmonySelect.addEventListener('change', renderPalettes);

// Copy Button
elements.output.copy.addEventListener('click', () => {
    elements.output.css.select();
    document.execCommand('copy');
    elements.output.copy.textContent = 'Copied!';
    setTimeout(() => elements.output.copy.textContent = 'Copy Code', 1500);
});

/* ========== INITIALIZATION ========== */
renderPalettes();
// Select the first generated palette by default
setTimeout(() => {
    const firstPalette = elements.palettes.firstChild;
    if(firstPalette) firstPalette.click();
}, 100);
