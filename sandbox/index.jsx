import Gooact, { render, Component } from '../gooact';

class Navigation extends Component {
    componentDidMount() {
        console.log('my nav');
        console.log(document.getElementById('gooact-navigation'));
    }

    render() {
        // render children through props
        // react has no transclusion
        return(
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
        return(
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
    }

    componentDidMount() {
        console.log('this app');
    }

    onOpen() {
        this.setState({navOpen: true})
    }

    onClose() {
        this.setState({navOpen: false})
    }

    render() {
        const {navOpen} = this.state;
        return (
            <div class="container">
                <Navigation>
                    <NavigationItem title="one">Item 1</NavigationItem>
                    <NavigationItem title="two">Item 2</NavigationItem>
                    <NavigationItem title="three">Item 3</NavigationItem>
                </Navigation>
            </div>
        );
    }
}

render(<App/>, document.getElementById('root'));