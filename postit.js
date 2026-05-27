// Versión con tirador a la izquierda del título y soporte móvil unificado
(() => {
    const postit = document.createElement('div');
    postit.id = 'sticky-postit';
    postit.className = 'postit-container';
    
    postit.innerHTML = `
        <div class="postit-header" id="postit-header">
            <div class="postit-drag-handle"></div> <div class="postit-title-area">NOTA</div>
            <button class="postit-btn" id="postit-min-btn" title="Minimizar / Maximizar">—</button>
            <button class="postit-btn" id="postit-close-btn" title="Borrar contenido">×</button>
        </div>
        <div class="postit-body" id="postit-body">
            <textarea id="postit-input" placeholder="Escribe una nota... Se guardará en tu caché."></textarea>
        </div>
        <div class="postit-footer" id="postit-footer">
            <div class="postit-colors">
                <span class="color-dot color-yellow active" data-color="#FDFFF4"></span>
                <span class="color-dot color-blue" data-color="#EBF3FF"></span>
                <span class="color-dot color-pink" data-color="#FDEBFF"></span>
            </div>
        </div>
    `;

    if (document.body) {
        document.body.appendChild(postit);
    } else {
        window.addEventListener('DOMContentLoaded', () => document.body.appendChild(postit));
    }

    const header = document.getElementById('postit-header');
    const textarea = document.getElementById('postit-input');
    const closeBtn = document.getElementById('postit-close-btn');
    const minBtn = document.getElementById('postit-min-btn');
    const colorDots = document.querySelectorAll('.color-dot');

    // Cargar Estado Inicial
    const savedState = JSON.parse(localStorage.getItem('web-postit-state')) || {
        text: '',
        x: 20,
        y: 120,
        width: 240,
        height: 240,
        color: 'rgb(253, 255, 244)', 
        minimized: false
    };

    let initialX = savedState.x;
    let initialY = savedState.y;
    if (window.innerWidth < 600) {
        if (initialX > window.innerWidth - 100) initialX = 16;
        if (initialY > window.innerHeight - 100) initialY = window.innerHeight - 280;
    }

    textarea.value = savedState.text || '';
    postit.style.left = (initialX !== undefined ? initialX : 20) + 'px';
    postit.style.top = (initialY !== undefined ? initialY : 120) + 'px';
    postit.style.width = (window.innerWidth < 600 ? Math.min(savedState.width || 240, window.innerWidth - 32) : (savedState.width || 240)) + 'px';
    postit.style.height = savedState.minimized ? '36px' : (savedState.height || 240) + 'px';
    postit.style.backgroundColor = savedState.color || 'rgb(253, 255, 244)';
    
    if (savedState.minimized) {
        postit.classList.add('minimized');
        minBtn.textContent = '+';
    }

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

    function saveState() {
        const isMin = postit.classList.contains('minimized');
        const state = {
            text: textarea.value,
            x: parseInt(postit.style.left) || 20,
            y: parseInt(postit.style.top) || 120,
            width: parseInt(postit.style.width) || 240,
            height: isMin ? (savedState.height || 240) : parseInt(postit.style.height) || 240,
            color: window.getComputedStyle(postit).backgroundColor,
            minimized: isMin
        };
        localStorage.setItem('web-postit-state', JSON.stringify(state));
    }

    textarea.addEventListener('input', saveState);
    window.addEventListener('mouseup', () => { if (!postit.classList.contains('minimized')) saveState(); });
    window.addEventListener('touchend', () => { if (!postit.classList.contains('minimized')) saveState(); });

    // Lógica de Arrastre
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    function startDrag(clientX, clientY) {
        isDragging = true;
        startX = clientX;
        startY = clientY;
        initialLeft = postit.offsetLeft;
        initialTop = postit.offsetTop;
        postit.style.transition = 'none';
    }

    function moveDrag(clientX, clientY) {
        if (!isDragging) return;
        let newX = initialLeft + (clientX - startX);
        let newY = initialTop + (clientY - startY);

        const maxW = window.innerWidth;
        const maxH = window.innerHeight;
        if (newX < -100) newX = -100;
        if (newX > maxW - 50) newX = maxW - 50;
        if (newY < 0) newY = 0;
        if (newY > maxH - 36) newY = maxH - 36;

        postit.style.left = `${newX}px`;
        postit.style.top = `${newY}px`;
    }

    function endDrag() {
        if (isDragging) {
            isDragging = false;
            saveState();
        }
    }

    header.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('postit-btn')) return;
        startDrag(e.clientX, e.clientY);
        const mouseMoveHandler = (ev) => moveDrag(ev.clientX, ev.clientY);
        const mouseUpHandler = () => {
            endDrag();
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    });

    header.addEventListener('touchstart', (e) => {
        if (e.target.classList.contains('postit-btn')) return;
        e.preventDefault();
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
    }, { passive: false });

    header.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        moveDrag(touch.clientX, touch.clientY);
    }, { passive: false });

    header.addEventListener('touchend', endDrag);

    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            colorDots.forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            postit.style.backgroundColor = dot.getAttribute('data-color');
            saveState();
        });
    });

    minBtn.addEventListener('click', () => {
        const isMin = postit.classList.toggle('minimized');
        if (isMin) {
            savedState.height = parseInt(postit.style.height) || 240; 
            postit.style.height = '36px';
            minBtn.textContent = '+';
        } else {
            postit.style.height = (savedState.height || 240) + 'px';
            minBtn.textContent = '—';
        }
        saveState();
    });

    closeBtn.addEventListener('click', () => {
        if (confirm("¿Quieres borrar las notas guardadas en este post-it?")) {
            textarea.value = '';
            saveState();
        }
    });
})();
