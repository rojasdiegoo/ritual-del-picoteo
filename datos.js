/**
 * datos.js — Ritual del Picoteo
 * Lee los datos desde /datos/*.json y los aplica a la página.
 * No tocar este archivo — los datos se editan desde el panel /admin
 */

async function cargarDatos() {
  try {
    const [contacto, precios, talleresData] = await Promise.all([
      fetch('/datos/contacto.json').then(r => r.json()),
      fetch('/datos/precios.json').then(r => r.json()),
      fetch('/datos/talleres.json').then(r => r.json())
    ]);

    // ── WhatsApp ──────────────────────────────────────
    const waLink = `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(contacto.whatsapp_mensaje)}`;
    document.querySelectorAll('a[href*="wa.me"], a.wa-btn, a.wa-float').forEach(a => {
      a.href = waLink;
    });

    // ── Precios de tablas ──────────────────────────────
    document.querySelectorAll('.tbl-card').forEach(card => {
      const nombre = card.querySelector('.tbl-name')?.textContent?.trim();
      const precioEl = card.querySelector('.tbl-price');
      if (!precioEl) return;
      if (nombre === 'Tabla Clásica')     precioEl.textContent = precios.precio_clasica;
      if (nombre === 'Tabla Gourmet')     precioEl.textContent = precios.precio_gourmet;
      if (nombre === 'Tabla Corporativa') precioEl.textContent = precios.precio_corporativa;
    });

    // ── Precios corporativos ───────────────────────────
    const pcElems = document.querySelectorAll('.pc-price');
    if (pcElems[0]) pcElems[0].textContent = precios.precio_corp_starter;
    if (pcElems[1]) pcElems[1].textContent = precios.precio_corp_corporativo;
    if (pcElems[2]) pcElems[2].textContent = precios.precio_corp_enterprise;

    // ── Próximos talleres ──────────────────────────────
    const lista = document.getElementById('sched-lista');
    if (lista && talleresData.talleres?.length > 0) {
      lista.innerHTML = talleresData.talleres.map(t => `
        <div class="sched-row">
          <div class="sched-info">
            <h4>${t.fecha}</h4>
            <p>🕐 ${t.horario} &nbsp;·&nbsp; 📍 ${t.lugar}</p>
          </div>
          <div class="sched-right">
            <span class="sched-spots${t.completo ? ' full-tag' : ''}">${t.cupos}</span>
            <button class="sched-btn${t.completo ? ' full' : ''}" ${t.completo ? 'disabled' : ''}>
              ${t.completo ? 'Completo' : 'Reservar →'}
            </button>
          </div>
        </div>
      `).join('');

      lista.querySelectorAll('.sched-btn:not(.full)').forEach(btn => {
        btn.addEventListener('click', function () {
          const row = btn.closest('.sched-row');
          const title = row.querySelector('.sched-info h4').textContent;
          const info = '📅 ' + row.querySelector('.sched-info p').textContent;
          if (typeof openModal === 'function') openModal(title, info);
        });
      });
    }

  } catch (e) {
    console.warn('datos.js: no se pudieron cargar los datos JSON.', e);
  }
}

cargarDatos();
