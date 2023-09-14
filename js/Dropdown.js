export default class Dropdown
{
    #target;
    #options;
    #elm = null;

    constructor(target, options = {})
    {
        this.#target = target;
        this.#options = Object.assign({}, {
            content: '',
            className: 'dropdown',
            centered: false,
            closeOnClickInside: true,
            closeOnScroll: true,
            event: null,
        }, options);

        if (event !== null) {
            event.stopPropagation();
        }

        if (Dropdown.isOpen()) {
            let openedDropdownTarget = Dropdown.get().#target;
            Dropdown.close();
            if (openedDropdownTarget === target) {
                return;
            }
        }

        this.open();

        addEventListener('resize', Dropdown.windowResized, {capture: true});
        document.addEventListener('keydown', Dropdown.closeEvent, {capture: true});
        document.addEventListener('click', Dropdown.closeEvent);
        if (this.#options.closeOnScroll) {
            document.addEventListener('scroll', Dropdown.closeEvent, {capture: true});
        }
    }

    setContent(content)
    {
        if (content instanceof HTMLElement) {
            if ('content' in content) {
                this.#elm.replaceChildren(content.content);
            } else {
                this.#elm.replaceChildren(content);
            }
        } else {
            this.#elm.innerHTML = content;
        }

        this.#position();
    }

    open()
    {
        this.#elm = document.createElement('div');
        this.#elm.classList.add(...this.#options.className.split(' '));

        let parent = this.#target.closest('dialog') ?? document.body;
        parent.append(this.#elm);
        this.setContent(this.#options.content);

        this.#target.classList.add('active')
        window.openedDropdown = this;
    }

    element()
    {
        return this.#elm;
    }

    #position()
    {
        // Reset positioning so we can calculate sizes correctly
        this.#elm.style.maxHeight = 'initial';
        this.#elm.style.top = 'initial';
        this.#elm.style.bottom = 'initial';
        this.#elm.style.left = 'initial';
        this.#elm.style.right = 'initial';
        this.#elm.classList.remove('above', 'below');

        let targetRect = this.#target.getBoundingClientRect();
        let elmRect = this.#elm.getBoundingClientRect();

        let spaceAvailable = {
            'top': targetRect.top,
            'right': document.documentElement.clientWidth - targetRect.right,
            'bottom': innerHeight - targetRect.bottom,
            'left': targetRect.left,
        };

        this.#elm.classList.add('below');
        if (spaceAvailable.bottom > elmRect.height + this.#elmMargins().vertical
            || spaceAvailable.bottom > spaceAvailable.top) {
            this.#elm.style.top = targetRect.top + targetRect.height + 'px';
            this.#elm.style.maxHeight = (spaceAvailable.bottom - this.#elmMargins().vertical) + 'px';
        } else {
            this.#elm.classList.remove('below');
            this.#elm.classList.add('above');
            this.#elm.style.bottom = (spaceAvailable.bottom + targetRect.height) + 'px';
            this.#elm.style.maxHeight = (spaceAvailable.top - this.#elmMargins().vertical) + 'px';
        }

        if (this.#options.centered) {
            let targetCenter = targetRect.left + targetRect.width / 2;
            let elmCenter = elmRect.width / 2;

            let leftOffset = targetCenter - elmCenter;

            if (leftOffset + elmRect.width > document.documentElement.clientWidth) {
                leftOffset = document.documentElement.clientWidth - elmRect.width - this.#elmMargins().horizontal;
            }

            if (leftOffset < 0) {
                leftOffset = 0;
            }

            this.#elm.style.left = leftOffset + 'px';
        } else {
            if (spaceAvailable.left > spaceAvailable.right) {
                this.#elm.style.right = spaceAvailable.right + 'px';
            } else {
                this.#elm.style.left = spaceAvailable.left + 'px';
            }
        }
    }

    #elmMargins()
    {
        let computedStyle = getComputedStyle(this.#elm);

        return {
            'vertical':
                parseInt(computedStyle.marginTop.replace('px', ''))
                + parseInt(computedStyle.marginBottom.replace('px', '')),
            'horizontal':
                parseInt(computedStyle.marginLeft.replace('px', ''))
                + parseInt(computedStyle.marginRight.replace('px', ''))
        };
    }

    static closeEvent(e)
    {
        if (!Dropdown.isOpen()) {
            return;
        }

        if (e.type === 'scroll' && Dropdown.get().element().contains(e.target)) {
            return;
        }

        if (e.type === 'keydown' && e.key !== 'Escape') {
            return;
        }

        if (e.type === 'click') {
            if (Dropdown.get().#options.closeOnClickInside || !Dropdown.get().#elm.contains(e.target)) {
                Dropdown.close();
            }

            return;
        }

        Dropdown.close();
    }

    static windowResized()
    {
        if (!Dropdown.isOpen()) {
            return;
        }

        Dropdown.get().#position();
    }

    static isOpen()
    {
        return typeof window.openedDropdown !== 'undefined';
    }

    static get()
    {
        if (!Dropdown.isOpen()) {
            throw new Error('Dropdown is not open');
        }

        return window.openedDropdown;
    }

    static close()
    {
        if (!this.isOpen()) {
            return;
        }

        document.removeEventListener('click', Dropdown.closeEvent);
        document.removeEventListener('keydown', Dropdown.closeEvent);
        document.removeEventListener('scroll', Dropdown.closeEvent, {capture: true});
        window.removeEventListener('resize', Dropdown.windowResized);

        Dropdown.get().#elm.remove();
        Dropdown.get().#target.classList.remove('active');
        delete window.openedDropdown;
    }
}

Object.freeze(Dropdown.prototype);