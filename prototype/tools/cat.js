// Original flat illustration; export the body as PNG and overlay live pupils.
const canvas = document.createElement('canvas');
canvas.width = canvas.height = 800;
document.body.append(canvas);
const ink = '#73543c';
const fur = '#e9bc72';
const shade = '#cf9b53';
const light = '#ffebc5';

const artwork = `
  <g stroke="${ink}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M197 232 C245 242 264 211 246 181 C238 168 224 170 226 184
      C233 202 228 211 208 207" fill="${fur}"/>
    <path d="M245 180 Q239 168 230 176 L228 187 Q241 189 250 194" fill="${shade}" stroke="none"/>
    <path d="M104 163 C90 181 86 213 93 241 Q145 269 198 241
      C204 211 197 177 181 163" fill="${fur}"/>
    <path d="M121 184 Q147 171 173 184 Q190 213 177 243 L113 243
      Q103 213 121 184" fill="${light}" stroke="none"/>
    <path d="M110 211 L106 244 M181 211 L185 244" fill="none"/>
    <path d="M111 237 C88 230 81 244 88 254 Q101 263 121 255
      Q129 242 111 237Z" fill="${light}"/>
    <path d="M180 237 C160 234 157 248 168 256 Q187 263 200 254
      C208 241 195 235 180 237Z" fill="${light}"/>
    <path d="M99 250 L99 255 M110 250 L110 256 M176 250 L176 257 M187 250 L187 257"
      stroke-width="2.3" fill="none"/>
    <path d="M70 104 Q59 81 64 42 Q65 34 73 40 L104 62
      Q144 51 185 62 L217 40 Q226 34 226 44 L222 104
      C245 130 235 158 217 174 Q205 187 183 187
      Q145 199 107 187 Q81 186 67 169 C49 147 51 124 70 104Z" fill="${fur}"/>
    <path d="M70 78 L71 49 L94 66Z M196 66 L218 49 L216 79Z" fill="#d99a83" stroke="none"/>
    <path d="M65 139 Q74 165 106 167 Q145 158 182 167 Q215 165 227 141
      Q234 163 212 179 Q200 187 180 186 Q144 197 109 186 Q76 188 65 164Z"
      fill="${light}" stroke="none"/>
    <path d="M128 63 L133 76 M145 60 L146 76 M163 63 L159 76" stroke="${shade}" stroke-width="5"/>
    <path d="M70 118 L82 122 M64 133 L77 135 M211 122 L223 117 M216 135 L229 132"
      stroke="${shade}" stroke-width="4"/>
    <ellipse cx="105" cy="126" rx="11" ry="14" fill="#596b47" stroke-width="2.5"/>
    <ellipse cx="184" cy="126" rx="11" ry="14" fill="#596b47" stroke-width="2.5"/>
    <ellipse cx="85" cy="148" rx="10" ry="5" fill="#e7a185" opacity=".65" stroke="none"/>
    <ellipse cx="203" cy="148" rx="10" ry="5" fill="#e7a185" opacity=".65" stroke="none"/>
    <path d="M138 145 Q144 141 151 145 L145 151Z" fill="#b97f6d" stroke-width="2"/>
    <path d="M145 151 L145 156 Q139 163 134 156 M145 156 Q151 163 156 156"
      stroke-width="2.3" fill="none"/>
    <path d="M84 155 L59 151 M84 161 L58 164 M206 155 L231 151 M206 161 L232 164"
      stroke-width="2" fill="none" opacity=".8"/>
  </g>
  <g fill="none" stroke="#9cddc7" stroke-width="2.5" stroke-linecap="round">
    <path d="M251 79 L251 93 M244 86 L258 86"/>
    <path d="M44 204 L44 214 M39 209 L49 209"/>
  </g>`;

window.renderCat = async () => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">${artwork}</svg>`;
  const image = new Image();
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  image.src = url;
  await image.decode();
  canvas.getContext('2d').clearRect(0, 0, 800, 800);
  canvas.getContext('2d').drawImage(image, 0, 0, 800, 800);
  URL.revokeObjectURL(url);
  return canvas.toDataURL('image/png');
};
await window.renderCat();
