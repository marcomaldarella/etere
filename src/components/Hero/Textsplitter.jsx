/**
 * Piccolo helper per dividere il testo di un elemento in <span class="char">…</span>
 * e restituire l’array dei singoli caratteri per animarli con GSAP.
 *
 * Uso:
 *   const splitter = new TextSplitter(element, {
 *     split: 'words, chars',       // (accettiamo sempre chars)
 *     resize: () => ScrollTrigger.refresh()   // callback opzionale
 *   });
 *   splitter.chars  ->  [span, span, …]
 */
export class TextSplitter {
  constructor(root, { split = 'chars', resize = null } = {}) {
    if (!root) throw new Error('TextSplitter: elemento mancante');
    this.root = root;
    this.resizeCb = resize;
    this.split();
    if (this.resizeCb) window.addEventListener('resize', this.resizeCb);
  }

  split() {
    const text = this.root.textContent;
    // pulizia
    this.root.innerHTML = '';
    // crea uno span per ogni char (manteniamo gli spazi)
    this.chars = [...text].map(ch => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      this.root.appendChild(span);
      return span;
    });
  }

  /** Ritorna array <span> per GSAP */
  getChars() { return this.chars; }

  /** In caso di destroy */
  destroy() {
    if (this.resizeCb) window.removeEventListener('resize', this.resizeCb);
    this.root.textContent = this.chars.map(s => s.textContent).join('');
  }
}
