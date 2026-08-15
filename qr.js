// Branded QR generator — all client-side, no network calls.
const $ = id => document.getElementById(id);
const RAM_LOGO = 'assets/logo.png';

let color = { type: 'grad', a: '#7E1618', b: '#B8862B' }; // brand gradient default
let logoData = RAM_LOGO; // default RAM logo; replaced if client uploads one

function dotsOptions() {
  const type = $('style').value;
  if (color.type === 'grad' || color.type === 'grad-gold') {
    return { type, gradient: { type: 'linear', rotation: 0.79,
      colorStops: [{ offset: 0, color: color.a }, { offset: 1, color: color.b }] } };
  }
  return { type, color: color.a };
}
function cornerColor() {
  // corners a touch darker/solid for scan reliability
  return color.type.startsWith('grad') ? color.b : color.a;
}

const qr = new QRCodeStyling({
  width: 320, height: 320, type: 'canvas',
  data: $('data').value,
  image: $('useLogo').checked ? logoData : undefined,
  dotsOptions: dotsOptions(),
  cornersSquareOptions: { type: $('corner').value, color: cornerColor() },
  cornersDotOptions: { color: cornerColor() },
  backgroundOptions: { color: '#ffffff' },
  imageOptions: { crossOrigin: 'anonymous', margin: 6, imageSize: 0.38, hideBackgroundDots: true },
  qrOptions: { errorCorrectionLevel: 'H' } // high, so the center logo never breaks the scan
});
qr.append($('preview'));

function render() {
  const transparent = $('transparent').checked;
  $('stage').classList.toggle('transparent', transparent);
  qr.update({
    data: $('data').value || ' ',
    image: $('useLogo').checked ? logoData : undefined,
    dotsOptions: dotsOptions(),
    cornersSquareOptions: { type: $('corner').value, color: cornerColor() },
    cornersDotOptions: { color: cornerColor() },
    backgroundOptions: { color: transparent ? 'rgba(0,0,0,0)' : '#ffffff' }
  });
}

// live updates
['data', 'style', 'corner', 'useLogo', 'transparent'].forEach(id =>
  $(id).addEventListener('input', render));

// color swatches
$('swatches').addEventListener('click', e => {
  const s = e.target.closest('.swatch');
  if (!s) return;
  document.querySelectorAll('.swatch').forEach(x => x.classList.remove('active'));
  s.classList.add('active');
  if (s.dataset.type === 'grad')        color = { type: 'grad', a: '#7E1618', b: '#B8862B' };
  else if (s.dataset.type === 'grad-gold') color = { type: 'grad-gold', a: '#F0D48A', b: '#B8862B' };
  else                                   color = { type: 'solid', a: s.dataset.solid, b: s.dataset.solid };
  render();
});

// custom color picker
$('customColor').addEventListener('input', e => {
  document.querySelectorAll('.swatch').forEach(x => x.classList.remove('active'));
  color = { type: 'solid', a: e.target.value, b: e.target.value };
  render();
});

// client logo upload
$('logoUpload').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { logoData = reader.result; $('useLogo').checked = true; render(); };
  reader.readAsDataURL(file);
});

// downloads
const fname = () => ($('fname').value.trim() || 'qr-code').replace(/[^a-z0-9-_]+/gi, '-');
$('dlPng').addEventListener('click', () => qr.download({ name: fname(), extension: 'png' }));
$('dlSvg').addEventListener('click', () => qr.download({ name: fname(), extension: 'svg' }));
