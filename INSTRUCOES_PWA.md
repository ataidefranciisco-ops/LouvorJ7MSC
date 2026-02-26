# 📲 Guia de Integração PWA — Louvor J7MSC

## Estrutura de ficheiros necessária

```
/                        ← raiz do teu servidor / Vercel
├── index.html           ← o teu LouvorJ7MSC.html (renomear)
├── manifest.json        ← ✅ já gerado
├── sw.js                ← ✅ já gerado
└── icons/               ← ⚠️ criar esta pasta com os ícones
    ├── icon-72.png
    ├── icon-96.png
    ├── icon-128.png
    ├── icon-144.png
    ├── icon-152.png
    ├── icon-192.png
    ├── icon-384.png
    └── icon-512.png
```

---

## 1 · Adicionar ao <head> do HTML


Cola este bloco ANTES de </head>:

```html
<!-- PWA Manifest -->
<link rel="manifest" href="/manifest.json">

<!-- iOS splash / ícone -->
<link rel="apple-touch-icon" href="/icons/icon-192.png">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

---

## 2 · Registar o Service Worker

Cola este bloco ANTES de </body>:

```html
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[SW] Registado:', reg.scope))
        .catch(err => console.warn('[SW] Erro:', err));
    });
  }
</script>
```

---

## 3 · Ícones (importante!)

O manifest referencia ícones em /icons/*.png.
Podes gerar todos os tamanhos a partir de uma imagem 512×512 em:
  → https://maskable.app/editor
  → https://realfavicongenerator.net

O ícone base deve ter fundo escuro (#060e1f) com o logótipo centrado.

---

## 4 · Testar localmente

```bash
npx serve .          # ou qualquer servidor local HTTPS
# Abre Chrome → F12 → Application → Manifest / Service Workers
```

## 5 · Deploy no Vercel

Bastará fazer push/upload normal — o Vercel serve os ficheiros
estáticos automaticamente com HTTPS (obrigatório para PWA).

---

## ✅ Checklist final

- [ ] index.html tem <link rel="manifest">
- [ ] index.html regista /sw.js no <script> antes de </body>
- [ ] Pasta icons/ com pelo menos icon-192.png e icon-512.png
- [ ] Site servido em HTTPS
- [ ] Chrome DevTools → Application → Manifest → sem erros
- [ ] Botão "Instalar" aparece na barra do Chrome
