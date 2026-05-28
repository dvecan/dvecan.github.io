/**
 * note.js — Sticky note widget
 *
 * Renders a draggable, resizable, color-themeable sticky note on desktop.
 * Disabled automatically on mobile devices and narrow viewports (≤ 600 px).
 *
 * Depends on: i18n.js (must be loaded before this script).
 * State is persisted in localStorage under "note-state".
 */

(() => {
    /* -----------------------------------------------------------------------
       CONSTANTS
    ----------------------------------------------------------------------- */
    const MOBILE_BREAKPOINT = 600;         /* px — mirrors CSS breakpoint     */
    const STORAGE_KEY       = "note-state";
    const MOBILE_UA_PATTERN =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

    const DEFAULT_STATE = {
        text:      "",
        x:         20,
        y:         120,
        width:     240,
        height:    240,
        color:     "rgb(253, 255, 244)",   /* --color-yellow */
        minimized: false
    };

    /* Color options: value is the CSS background-color to apply */
    const SWATCH_COLORS = [
        { name: "yellow", hex: "#FDFFF4", cssClass: "color-swatch--yellow" },
        { name: "blue",   hex: "#EBF3FF", cssClass: "color-swatch--blue"   },
        { name: "pink",   hex: "#FDEBFF", cssClass: "color-swatch--pink"   }
    ];

    /* -----------------------------------------------------------------------
       GUARD: abort on mobile
    ----------------------------------------------------------------------- */
    const isMobileUA      = MOBILE_UA_PATTERN.test(navigator.userAgent);
    const isNarrowScreen  = window.innerWidth <= MOBILE_BREAKPOINT;

    if (isMobileUA || isNarrowScreen) {
        return;
    }

    /* -----------------------------------------------------------------------
       BUILD DOM
    ----------------------------------------------------------------------- */

    /**
     * Creates and returns a color swatch <span> element.
     *
     * @param {{ name: string, hex: string, cssClass: string }} swatchConfig
     * @returns {HTMLElement}
     */
    function createSwatch(swatchConfig) {
        const swatch = document.createElement("span");
        swatch.className   = `color-swatch ${swatchConfig.cssClass}`;
        swatch.dataset.hex = swatchConfig.hex;
        return swatch;
    }

    /**
     * Builds the full widget DOM tree and appends it to <body>.
     *
     * @returns {{ widget, header, textarea, minBtn, clearBtn, swatches }}
     */
    function buildWidget() {
        /* Wrapper */
        const widget = document.createElement("div");
        widget.id        = "note-widget";
        widget.className = "note-widget";

        /* Header */
        const header = document.createElement("div");
        header.className = "note-header";
        header.id        = "note-header";

        const dragHandle = document.createElement("div");
        dragHandle.className = "note-drag-handle";

        const label = document.createElement("div");
        label.className    = "note-label";
        label.dataset.i18n = "note.label";

        const minBtn = document.createElement("button");
        minBtn.className = "note-btn note-btn--minimize";
        minBtn.id        = "note-min-btn";
        minBtn.title     = "Minimize / Maximize";
        minBtn.textContent = "—";

        const clearBtn = document.createElement("button");
        clearBtn.className = "note-btn note-btn--clear";
        clearBtn.id        = "note-clear-btn";
        clearBtn.title     = "Clear content";
        clearBtn.textContent = "×";

        header.append(dragHandle, label, minBtn, clearBtn);

        /* Body */
        const body = document.createElement("div");
        body.className = "note-body";
        body.id        = "note-body";

        const textarea = document.createElement("textarea");
        textarea.id                      = "note-textarea";
        textarea.className               = "note-textarea";
        textarea.dataset.i18nPlaceholder = "note.placeholder";

        body.appendChild(textarea);

        /* Footer — color swatches */
        const footer = document.createElement("div");
        footer.className = "note-footer";
        footer.id        = "note-footer";

        const colorRow = document.createElement("div");
        colorRow.className = "note-colors";

        const swatches = SWATCH_COLORS.map(createSwatch);
        swatches.forEach((s) => colorRow.appendChild(s));
        footer.appendChild(colorRow);

        widget.append(header, body, footer);
        document.body.appendChild(widget);

        return { widget, header, textarea, minBtn, clearBtn, swatches };
    }

    /* -----------------------------------------------------------------------
       STATE
    ----------------------------------------------------------------------- */

    /**
     * Loads persisted state from localStorage, merging with DEFAULT_STATE
     * so new keys are always present even after schema changes.
     *
     * @returns {object}
     */
    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
        } catch {
            return { ...DEFAULT_STATE };
        }
    }

    /**
     * Serializes and persists the current widget state.
     *
     * @param {HTMLElement} widget
     * @param {HTMLTextAreaElement} textarea
     */
    function saveState(widget, textarea) {
        const isMinimized = widget.classList.contains("is-minimized");

        const state = {
            text:      textarea.value,
            x:         parseInt(widget.style.left,  10) || DEFAULT_STATE.x,
            y:         parseInt(widget.style.top,   10) || DEFAULT_STATE.y,
            width:     parseInt(widget.style.width, 10) || DEFAULT_STATE.width,
            /* Preserve full height when minimized so it restores correctly */
            height:    isMinimized
                           ? (loadState().height || DEFAULT_STATE.height)
                           : parseInt(widget.style.height, 10) || DEFAULT_STATE.height,
            color:     window.getComputedStyle(widget).backgroundColor,
            minimized: isMinimized
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    /* -----------------------------------------------------------------------
       APPLY SAVED STATE TO DOM
    ----------------------------------------------------------------------- */

    /**
     * Positions, sizes, and colors the widget from a state object.
     *
     * @param {HTMLElement} widget
     * @param {HTMLTextAreaElement} textarea
     * @param {HTMLButtonElement} minBtn
     * @param {HTMLElement[]} swatches
     * @param {object} state
     */
    function applyState(widget, textarea, minBtn, swatches, state) {
        textarea.value       = state.text;
        widget.style.left    = `${state.x}px`;
        widget.style.top     = `${state.y}px`;
        widget.style.width   = `${state.width}px`;
        widget.style.height  = state.minimized ? "36px" : `${state.height}px`;
        widget.style.backgroundColor = state.color;

        if (state.minimized) {
            widget.classList.add("is-minimized");
            minBtn.textContent = "+";
        }

        /* Mark the active swatch by comparing computed colors */
        swatches.forEach((swatch) => {
            const tempEl = document.createElement("div");
            tempEl.style.color = swatch.dataset.hex;
            document.body.appendChild(tempEl);
            const computed = window.getComputedStyle(tempEl).color;
            document.body.removeChild(tempEl);

            const isActive = computed === state.color
                          || swatch.dataset.hex === state.color;
            swatch.classList.toggle("is-active", isActive);
        });
    }

    /* -----------------------------------------------------------------------
       DRAG BEHAVIOUR
    ----------------------------------------------------------------------- */

    /**
     * Attaches mouse-drag logic to the widget header.
     * Constrains movement within the viewport boundaries.
     *
     * @param {HTMLElement} header
     * @param {HTMLElement} widget
     * @param {Function} onDragEnd — called after each drag with (widget, textarea)
     * @param {HTMLTextAreaElement} textarea
     */
    function attachDrag(header, widget, textarea, onDragEnd) {
        header.addEventListener("mousedown", (downEvent) => {
            /* Ignore clicks on the action buttons */
            if (downEvent.target.classList.contains("note-btn")) { return; }

            const startMouseX  = downEvent.clientX;
            const startMouseY  = downEvent.clientY;
            const startLeft    = widget.offsetLeft;
            const startTop     = widget.offsetTop;

            widget.style.transition = "none";

            function onMouseMove(moveEvent) {
                let nextX = startLeft + (moveEvent.clientX - startMouseX);
                let nextY = startTop  + (moveEvent.clientY - startMouseY);

                /* Clamp within viewport */
                const maxX = window.innerWidth  - 50;
                const maxY = window.innerHeight - 36;
                nextX = Math.max(-100, Math.min(nextX, maxX));
                nextY = Math.max(0,    Math.min(nextY, maxY));

                widget.style.left = `${nextX}px`;
                widget.style.top  = `${nextY}px`;
            }

            function onMouseUp() {
                document.removeEventListener("mousemove", onMouseMove);
                document.removeEventListener("mouseup",  onMouseUp);
                onDragEnd(widget, textarea);
            }

            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup",   onMouseUp);
        });
    }

    /* -----------------------------------------------------------------------
       MINIMIZE / RESTORE
    ----------------------------------------------------------------------- */

    /**
     * Toggles the minimized state of the widget.
     *
     * @param {HTMLElement} widget
     * @param {HTMLButtonElement} minBtn
     * @param {object} stateRef — mutable reference to persist expanded height
     * @param {HTMLTextAreaElement} textarea
     */
    function toggleMinimize(widget, minBtn, stateRef, textarea) {
        const willMinimize = !widget.classList.contains("is-minimized");

        if (willMinimize) {
            /* Save the current expanded height before collapsing */
            stateRef.height = parseInt(widget.style.height, 10) || DEFAULT_STATE.height;
            widget.style.height = "36px";
            minBtn.textContent  = "+";
        } else {
            widget.style.height = `${stateRef.height}px`;
            minBtn.textContent  = "—";
        }

        widget.classList.toggle("is-minimized", willMinimize);
        saveState(widget, textarea);
    }

    /* -----------------------------------------------------------------------
       COLOR SWATCHES
    ----------------------------------------------------------------------- */

    /**
     * Wires up swatch click events to re-color the widget.
     *
     * @param {HTMLElement[]} swatches
     * @param {HTMLElement} widget
     * @param {HTMLTextAreaElement} textarea
     */
    function attachSwatchEvents(swatches, widget, textarea) {
        swatches.forEach((swatch) => {
            swatch.addEventListener("click", () => {
                swatches.forEach((s) => s.classList.remove("is-active"));
                swatch.classList.add("is-active");
                widget.style.backgroundColor = swatch.dataset.hex;
                saveState(widget, textarea);
            });
        });
    }

    /* -----------------------------------------------------------------------
       CLEAR BUTTON
    ----------------------------------------------------------------------- */

    /**
     * Prompts the user and clears the textarea on confirmation.
     *
     * @param {HTMLButtonElement} clearBtn
     * @param {HTMLTextAreaElement} textarea
     * @param {HTMLElement} widget
     */
    function attachClearEvent(clearBtn, textarea, widget) {
        clearBtn.addEventListener("click", () => {
            /* i18n.t() provides the confirm message in the active language */
            const message = (typeof i18n !== "undefined")
                ? i18n.t("note.clear.confirm")
                : "Do you want to delete the notes saved in this sticky note?";

            if (window.confirm(message)) {
                textarea.value = "";
                saveState(widget, textarea);
            }
        });
    }

    /* -----------------------------------------------------------------------
       ENTRY POINT
    ----------------------------------------------------------------------- */

    function init() {
        const { widget, header, textarea, minBtn, clearBtn, swatches } = buildWidget();

        /* Load persisted state (mutable so toggleMinimize can update height) */
        const state = loadState();
        applyState(widget, textarea, minBtn, swatches, state);

        /* Apply i18n translations to the widget's data-i18n elements */
        if (typeof i18n !== "undefined") {
            i18n.init();
        }

        /* Wire up all interactions */
        attachDrag(header, widget, textarea, saveState);
        attachSwatchEvents(swatches, widget, textarea);
        attachClearEvent(clearBtn, textarea, widget);

        minBtn.addEventListener("click", () => {
            toggleMinimize(widget, minBtn, state, textarea);
        });

        /* Persist after every keystroke */
        textarea.addEventListener("input", () => saveState(widget, textarea));

        /* Persist after resize (pointer released anywhere) */
        window.addEventListener("mouseup", () => {
            if (!widget.classList.contains("is-minimized")) {
                saveState(widget, textarea);
            }
        });
    }

    /* Run after the DOM is ready */
    if (document.body) {
        init();
    } else {
        window.addEventListener("DOMContentLoaded", init);
    }
})();
