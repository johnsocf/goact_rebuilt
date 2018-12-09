import Gooact, { render, Component } from '../gooact';

class TopContainer extends Component {
    componentDidMount() {
        console.log('menu component');
        console.log(document.getElementById('gooact-top-container'));
    }

    render() {
        // render children through props
        // react has no transclusion
        return (
            <div id="gooact-top-container">
                <h1>top container</h1>
                {this.props.children}
            </div>
        );
    }
}

class TopMenu extends Component {
    componentDidMount() {
        console.log('menu component');
        console.log(document.getElementById('gooact-top-menu'));
    }

    render() {
        // render children through props
        // react has no transclusion
        return (
            <div id="gooact-top-menu">
                <h1>my menu component</h1>
                {this.props.children}
            </div>
        );
    }
}

class Navigation extends Component {
    componentDidMount() {
        console.log('my nav');
        console.log(document.getElementById('gooact-navigation'));
    }

    render() {
        // render children through props
        // react has no transclusion
        return (
            <div id="gooact-navigation">
                <h1>my nav</h1>
                {this.props.children}
            </div>
        );
    }
}

class NavigationItem extends Component {
    constructor(props) {
        // super allows extended component to access all call functions on the parent
        // in this case, our component class in the gooact library
        super(props);
    }

    componentDidMount() {
        console.log('my nav item');
        console.log(document.getElementById('root'));
        console.log('props', this.props)
    }

    render() {
        // render children through props
        // react has no transclusion
        return (
            <li id="gooact-nav-item">
                {this.props.children}
            </li>
        );
    }
}

class App extends Component {
    constructor(props) {
        // super allows extended component to access all call functions on the parent
        // in this case, our component class in the gooact library
        super(props);
        this.state = {navOpen: false,}
        this.onOpen = this.onOpen.bind(this);
        this.onClose = this.onClose.bind(this);
        this.renderSomething = this.renderSomething.bind(this);
        this.navIsOpenMaybe = this.navIsOpenMaybe.bind(this);
    }

    componentDidMount() {
        console.log('this app');
    }

    onOpen() {
        console.log('this state', this.state)
        this.setState({navOpen: true})
    }

    onClose() {
        console.log('this state', this.state)
        this.setState({navOpen: false})
    }

    renderSomething = (navOpenState) => {
        console.log('nav open', navOpenState)
        const nav = (<Navigation>
            <NavigationItem title="one">Item 1</NavigationItem>
            <NavigationItem title="two">Item 2</NavigationItem>
            <NavigationItem title="three">Item 3</NavigationItem>
        </Navigation>);
        const nonNav = (<Navigation></Navigation>);
        // return nav;
        if (navOpenState) {
            console.log('here 1')
            return nav;
        } else {
            console.log('here 2')
            return nonNav;
        }
    }

    navIsOpenMaybe = (navStateOpen) => {
        const navIsOpen = (<p>nav is open</p>);
        if (navStateOpen) {
            return navIsOpen;
        } else {
            return (<p>nav is not open</p>)
        }
    }

    render() {
        const {navOpen} = this.state;
        console.log('re-render', this.state)
        return (
            <div class="container">
                {this.renderSomething(navOpen)}
                {this.navIsOpenMaybe(navOpen)}
                <button onClick={this.onOpen}>click to open</button>
                <button onClick={this.onClose}>close</button>
            </div>
    );
    }
    }

    render(
        <App/>
    , document.getElementById('root'));