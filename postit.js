document.addEventListener('DOMContentLoaded', () => {
    // 1. Crear la estructura HTML del Post-it dinámicamente
    const postit = document.createElement('div');
    postit.id = 'sticky-postit';
    postit.className = 'postit-container';
    
    postit.innerHTML = `
        <div class="postit-header" id="postit-header">
            <div class="postit-dots-orange"></div>
            <button class="postit-btn" id="postit-min-btn" title="Minimizar">—</button>
            <button class="postit-btn" id="postit-close-btn" title="Borrar contenido">×</button>
        </div>
        <div class="postit-body" id="postit-body">
            <textarea id="postit-input" placeholder="Escribe una nota personal... El contenido se guardará en tu caché."></textarea>
        </div>
        <div class="postit-footer" id="postit-footer">
            <div class="postit-colors">
                <span class="color-dot color-yellow active" data-color="#FDFFF4"></span>
                <span class="color-dot color-blue" data-color="#EBF3FF"></span>
                <span class="color-dot color-pink" data-color="#FDEBFF"></span>
            </div>
            <div class="postit-status-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            </div>
        </div>
    `;

    document.body.appendChild(postit);

    const header = document.getElementById('postit-header');
    const textarea = document.getElementById('postit-input');
    const closeBtn = document.getElementById('postit-close-btn');
    const minBtn = document.getElementById('postit-min-btn');
    const colorDots = document.querySelectorAll('.color-dot');

    // 2. Cargar Estado Inicial desde localStorage
    const savedState = JSON.parse(localStorage.getItem('web-postit-state')) || {
        text: '',
        x: 40,
        y: 140,
        width: 240,
        height: 240,
        color: 'rgb(253, 255, 244)', 
        minimized: false
    };

    // Aplicar estado guardado con consistencia matemática
    textarea.value = savedState.text || '';
    postit.style.left = (savedState.x !== undefined ? savedState.x : 40) + 'px';
    postit.style.top = (savedState.y !== undefined ? savedState.y : 140) + 'px';
    postit.style.width = (savedState.width || 240) + 'px';
    postit.style.height = savedState.minimized ? '36px' : (savedState.height || 240) + 'px';
    postit.style.backgroundColor = savedState.color || 'rgb(253, 255, 244)';
    
    if (savedState.minimized) {
        postit.classList.add('minimized');
    }

    // Identificar y activar visualmente el color guardado
    colorDots.forEach(dot => {
        const tempDiv = document.createElement('div');
        tempDiv.style.color = dot.getAttribute('data-color');
        document.body.appendChild(tempDiv);
        const dotStyleColor = window.getComputedStyle(tempDiv).color;
        document.body.removeChild(tempDiv);

        if (dotStyleColor === savedState.color || dot.getAttribute('data-color') === savedState.color) {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        }
    });

    // 3. Función unificada para persistir cambios en localStorage
    function saveState() {
        const isMin = postit.classList.contains('minimized');
        const state = {
            text: textarea.value,
            x: parseInt(postit.style.left) || 40,
            y: parseInt(postit.style.top) || 140,
            width: parseInt(postit.style.width) || 240,
            height: isMin ? (savedState.height || 240) : parseInt(postit.style.height) || 240,
            color: window.getComputedStyle(postit).backgroundColor,
            minimized: isMin
        };
        localStorage.setItem('web-postit-state', JSON.stringify(state));
    }

    // Guardar texto de forma reactiva al teclear
    textarea.addEventListener('input', saveState);

    // Guardar dimensiones definitivas al soltar el ratón tras redimensionar
    window.addEventListener('mouseup', () => {
        if (!postit.classList.contains('minimized')) {
            saveState();
        }
    });

    // 4. Lógica nativa de Arrastre (Drag and Drop)
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    header.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('postit-btn')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = postit.offsetLeft;
        initialTop = postit.offsetTop;
        postit.style.transition = 'none'; 
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDrag);
    });

    function drag(e) {
        if (!isDragging) return;
        postit.style.left = `${initialLeft + (e.clientX - startX)}px`;
        postit.style.top = `${initialTop + (e.clientY - startY)}px`;
    }

    function stopDrag() {
        if (isDragging) {
            isDragging = false;
            saveState();
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
        }
    }

    // 5. Conmutador de Colores
    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            postit.style.backgroundColor = dot.getAttribute('data-color');
            saveState();
        });
    });

    // 6. Colapsar / Expandir (Minimizar)
    minBtn.addEventListener('click', () => {
        const isMin = postit.classList.toggle('minimized');
        if (isMin) {
            savedState.height = parseInt(postit.style.height) || 240; 
            postit.style.height = '36px';
        } else {
            postit.style.height = (savedState.height || 240) + 'px';
        }
        saveState();
    });

    // 7. Resetear Contenido
    closeBtn.addEventListener('click', () => {
        if (confirm("¿Quieres borrar las notas guardadas en este post-it?")) {
            textarea.value = '';
            saveState();
        }
    });
});
