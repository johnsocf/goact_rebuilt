/* Gooact by SweetPalma, 2018. All rights reserved. */
(() => { 'use strict';

    /**
     * element is a lightweight object representation of the real dom.
     * much like a node attribute
     * creates a function for rendering
     * called at runtime
     * @param type
     * @param props
     * @param children
     * @returns {{type: *, props: *, children: *}}
     */
    const createElement = (type, props, ...children) => {
        if (props === null) props = {};
        return {type, props, children};
    };


    /**
     * dom is given event listeners
     * this begins as an object that then holds the event listeners
     * each are passed in based  prop
     * render function calls this and iterates through for each prop
     * in the vdom object
     * style attr gets the value in each property if prop is style
     * other attrs like in react are a checked, key, value, classname, or anything
     * they are conditionally listened for
     * react nodes can have any props so new ones are added
     * based on key/value pairs
     * @param dom
     * @param key
     * @param value
     */
    const setAttribute = (dom, key, value) => {
        if (typeof value == 'function' && key.startsWith('on')) {
            const eventType = key.slice(2).toLowerCase();
            dom.__gooactHandlers = dom.__gooactHandlers || {};
            dom.removeEventListener(eventType, dom.__gooactHandlers[eventType]);
            dom.__gooactHandlers[eventType] = value;
            dom.addEventListener(eventType, dom.__gooactHandlers[eventType]);
        } else if (key == 'checked' || key == 'value' || key == 'className') {
            dom[key] = value;
        } else if (key == 'style' && typeof value == 'object') {
            Object.assign(dom.style, value);
        } else if (key == 'ref' && typeof value == 'function') {
            value(dom);
        } else if (key == 'key') {
            dom.__gooactKey = value;
        } else if (typeof value != 'object' && typeof value != 'function') {
            dom.setAttribute(key, value);
        }
    };

    /**
     * given vdom and parent with default null if empty
     * recursive function for building nodes within nodes
     * traverses down dom tree
     * mount appends child to the dom
     * elements are created based on type of vdom
     * calls setAttribute for each prop on each vdom node
     * primitives become plain text nodes
     *
     *
     *
     * @param vdom
     * @param parent
     */
    const render = (vdom, parent=null) => {
        const mount = parent ? (el => parent.appendChild(el)) : (el => el);
        if (typeof vdom == 'string' || typeof vdom == 'number') {
            return mount(document.createTextNode(vdom));
        } else if (typeof vdom == 'boolean' || vdom === null) {
            return mount(document.createTextNode(''));
        } else if (typeof vdom == 'object' && typeof vdom.type == 'function') {
            return Component.render(vdom, parent);
        } else if (typeof vdom == 'object' && typeof vdom.type == 'string') {
            const dom = mount(document.createElement(vdom.type));
            for (const child of [].concat(...vdom.children)) render(child, dom);
            for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
            return dom;
        } else {
            throw new Error(`Invalid VDOM: ${vdom}.`);
        }
    };

    /**
     * patchin is the brilliance of react
     * it efficiently updates only what it needs to
     * it uses a special type of tree and based on node changes
     * it patches the new nodes in or removes nodes
     * based on a difference between trees.
     * optimizing, it removes to need to fully re-render all nodes
     * this would be O(n^3) except efficiently react assumes differenet elements will produce different trees.
     * the key props shows stability or nonstability between instances
     * this is a tree recursion that iterates down the dom tree
     * it checks for obvious differences first
     * if vdom is an object and the nodename on the existing dom is equal to the vdom type
     * it flattens the child node tree into one array
     * and creates a pool which maps keys for those that need re-rendering
     * it iterates through the vdom flat map of children and recursively calls patch to possibly re-renders those with keys
     * it fires a lifecycle hook component will unmount on any instance it is removing
     * it returns focus to the active element as if nothing happened.
     *
     * @param dom
     * @param vdom
     * @param parent
     */
    const patch = (dom, vdom, parent=dom.parentNode) => {
        // replaceChild is a lambda method on the dom that replaces
        // param in position 1 with that in position 2
        const replace = parent ? el => (parent.replaceChild(el, dom) && el) : (el => el);
        if (typeof vdom == 'object' && typeof vdom.type == 'function') {
            return Component.patch(dom, vdom, parent);
        } else if (typeof vdom != 'object' && dom instanceof Text) {
            return dom.textContent != vdom ? replace(render(vdom, parent)) : dom;
        } else if (typeof vdom == 'object' && dom instanceof Text) {
            return replace(render(vdom, parent));
        } else if (typeof vdom == 'object' && dom.nodeName != vdom.type.toUpperCase()) {
            return replace(render(vdom, parent));
        } else if (typeof vdom == 'object' && dom.nodeName == vdom.type.toUpperCase()) {
            const pool = {};
            const active = document.activeElement;
            // ... is a nifty ES6 feature for bringing in each item in an array.
            [].concat(...dom.childNodes).map((child, index) => {
                // this is the magic
                // dom elements are appended if they have matching keys
                // between dom and vdom
                // using object structure pool as interim for comparison
                // if vdom child has a key that shows it changes because it matches a key in dom, it is patched.
                // patch is called recursively
                // otherwise non matching keys cause a render from scratch
                // then key is deleted so that item doesn't have to be removed in next step
                // patch just kind of moves it on and looks at it's children and replaces it if it needs to
                const key = child.__gooactKey || `__index_${index}`;
                pool[key] = child;
            });
            [].concat(...vdom.children).map((child, index) => {
                const key = child.props && child.props.key || `__index_${index}`;
                dom.appendChild(pool[key] ? patch(pool[key], child) : render(child, dom));
                delete pool[key];
            });
            for (const key in pool) {
                // this gooactInstance shows it's a component rendered
                // this key is added in the component class when the component
                // instantiates it
                const instance = pool[key].__gooactInstance;
                // test if this key has been rendered yet
                // by default if it hasn't been deleted from the pool it is removed
                // basically because it had a key in the pool setup in dom map
                // but not in vdom map
                // so it's left over
                if (instance) instance.componentWillUnmount();
                // now we can remove it from the pool.
                // it acted as a flag and served it's purpose.
                pool[key].remove();
            }
            // dom attrs are removed
            for (const attr of dom.attributes) dom.removeAttribute(attr.name);
            // vdom attributes are set
            for (const prop in vdom.props) setAttribute(dom, prop, vdom.props[prop]);
            // focus is returned after memoization
            active.focus();
            // finally recursive function starts returning patched or new dom nodes.
            // we can finally render again.
            return dom;
        }
    };


    /**
     * classes in JS are like functions
     * we can create new instances of this and use it to describe what will be shown on the screen
     * components in react can be stateless (dumb) or have state, or have state and even connect with redux (containers)
     * they 'come with' lifecycle hooks and methods
     * not all of those are implemented here
     * lifecycle hooks are fired when components will mount, have mounted, have changes and need to re-render, etc
     * react is basically a rendering engine so they can be queued in the processes patch and, render and such.
     * this is where we implement our rendering as an instance for each node that is a component
     * react should be build so that each component is as simple as possible and serves one purpose
     * unlike object oriented programming where a function would 'reach out' and assemble factories, services,
     * directives and the like into one container
     * react is super simple it just renders up all the components since each simple component can call another
     * component.  it more closely reflects the dom tree so that each node isn't tightly coupled as in oo programing
     * and each has a type, monoidic!
     */
    class Component {
        // define key component props and state
        // props can be passed from within the app like when redux is hooked up.
        // state is specific to the component.
        constructor(props) {
            this.props = props || {};
            this.state = null;
        }

        // if this is a node in the new tree, a clas component
        // and it is a prototype of an existing type
        // create an instance,
        // assign to instance prop on itself
        // assign instance a key
        // attach to dom
        // fire off lifecycle hooks right before render and right after render and prop assignment.

        static render(vdom, parent=null) {
            const props = Object.assign({}, vdom.props, {children: vdom.children});
            if (Component.isPrototypeOf(vdom.type)) {
                const instance = new (vdom.type)(props);
                instance.componentWillMount();
                instance.base = render(instance.render(), parent);
                instance.base.__gooactInstance = instance;
                instance.base.__gooactKey = vdom.props.key;
                instance.componentDidMount();
                return instance.base;
            } else {
                return render(vdom.type(props), parent);
            }
        }

        static patch(dom, vdom, parent=dom.parentNode) {
            const props = Object.assign({}, vdom.props, {children: vdom.children});
            if (dom.__gooactInstance && dom.__gooactInstance.constructor == vdom.type) {
                dom.__gooactInstance.componentWillReceiveProps(props);
                dom.__gooactInstance.props = props;
                // dom node might already have an instance
                // if so just pass new properties to it and patch difference
                return patch(dom, dom.__gooactInstance.render(), parent);
            } else if (Component.isPrototypeOf(vdom.type)) {
                // otherwise it's old news... same 'ol, same 'ol, and can just be rendered with no new
                const ndom = Component.render(vdom, parent);
                return parent ? (parent.replaceChild(ndom, dom) && ndom) : (ndom);
            } else if (!Component.isPrototypeOf(vdom.type)) {
                return patch(dom, vdom.type(props), parent);
            }
        }


        // constructor is called then this set state when we update state from component
        setState(next) {
            const compat = (a) => typeof this.state == 'object' && typeof a == 'object';
            // check and see if component should update
            // compares prev props with these new props passed in via next
            // if it should, we update it
            // if it has previously rendered it already has a base prop
            if (this.base && this.shouldComponentUpdate(this.props, next)) {
                // store existing state as previous state
                const prevState = this.state;
                this.componentWillUpdate(this.props, next);
                // compile object into a shallow copy if state is an object
                // reduce state to now have initial state plus whatever's new
                this.state = compat(next) ? Object.assign({}, this.state, next) : next;
                // patch this instance with a new render
                patch(this.base, this.render());
                // fire off a lifecycle hook showing new props and the prev state
                this.componentDidUpdate(this.props, prevState);
            } else {
                this.state = compat(next) ? Object.assign({}, this.state, next) : next;
            }
        }

        // lifecycle hooks.  these aren't really set up but are all pretty similar.
        // they just get fired off at different places on phases of render
        // helpful if you're connecting state to props
        // but usually should do that in connect functions anyway.
        // still can be helpful for seeing what props you have if debugging... seeing what's new.
        shouldComponentUpdate(nextProps, nextState) {
            return nextProps != this.props || nextState != this.state;
        }

        componentWillReceiveProps(nextProps) {
            return undefined;
        }

        componentWillUpdate(nextProps, nextState) {
            return undefined;
        }

        componentDidUpdate(prevProps, prevState) {
            return undefined;
        }

        componentWillMount() {
            return undefined;
        }

        componentDidMount() {
            return undefined;
        }

        componentWillUnmount() {
            return undefined;
        }
    };

    // export functions for tests for tests if doesn't exist
    if (typeof module != 'undefined') module.exports = {createElement, render, Component};
    // put module functions on the window object which contains all of Gooact to make them available
    // in scope via window object (if in the browser)
    if (typeof module == 'undefined') window.Gooact  = {createElement, render, Component};
})();