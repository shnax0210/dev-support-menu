const React = require('react');
const ReactDOM = require('react-dom');

const Router = require('react-router-dom').Router;
const Link = require('react-router-dom').Link;
const Switch = require('react-router-dom').Switch;
const Route = require('react-router-dom').Route;
const Redirect = require('react-router-dom').Redirect;

const createBrowserHistory = require('history').createBrowserHistory;

const styled = require('styled-components').default;

const CONTENT_CONTAINER_ID = "contentContainer";

function fetchConfig() {
    return fetch(`${menuScriptHost}/config/env-setup.json`)
        .then(response => {
            if (!response.ok) {
                console.log("Env configuration is not present, local one will be used instead");
                return fetch(`${menuScriptHost}/config/local-setup.json`);
            }

            return new Promise(resolve => resolve(response));
        })
        .then(response => response.json());
}

const MenuDiv = styled.div`
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: flex-end;
`

const MenuLink = styled(Link)`
    text-decoration: none;
    margin: auto 10px;
    color: black;
    $:visited, $:hover, $:active {
        color: inherit;
    }
`

class Menu extends React.Component {
    render() {
        const menuItems = this.props.config.menuItems.map(menuItem => {
            return <MenuLink to={menuItem.path} key={menuItem.path}>{menuItem.name}</MenuLink>
        })
        return <MenuDiv>{menuItems}</MenuDiv>
    }
}

class MicroFrontendContent extends React.Component {
    componentDidMount() {
        this.renderMicroFrontend();
    }

    componentDidUpdate() {
        this.renderMicroFrontend();
    }

    renderMicroFrontend = () => {
        window.renderMicroFrontend(CONTENT_CONTAINER_ID, this.props.microFrontend.host, 
            this.props.microFrontend.name, this.props.history, this.props.microFrontend.path);
    }

    render() {
        return <div id={CONTENT_CONTAINER_ID}/>
    }
}

class Content extends React.Component {
    render() {
        const contentRoutes = this.props.config.menuItems.map(menuItem => {
            return (<Route path={menuItem.path} key={menuItem.path}>
                    <MicroFrontendContent microFrontend={menuItem.microFrontend} history={this.props.history}/>
                </Route>
            )
        });
        
        const defaultMenuItem = this.props.config.menuItems.find(menuItem => menuItem.isDefault);
        return (<Switch>
            {contentRoutes}
            <Route>
                <Redirect to={defaultMenuItem.path} />
            </Route>
        </Switch>)
    }
}

const ApplicationDiv = styled.div`
    width: 95%;
    margin: 0 auto;
`

class Application extends React.Component {
    render() {
        return (
            <Router history={this.props.history}>
                <ApplicationDiv>
                    <Menu config={this.props.config}/>
                    <Content config={this.props.config} history={this.props.history}/>
                </ApplicationDiv>
            </Router>
        )
    }
}

function printMicroFrontendInfo(containerId, host, name, history) {
    ReactDOM.render(<div>host={host}, name={name}</div>, document.getElementById(containerId));
}


window.menuScriptHost = (new URL(document.currentScript.src)).origin;
window.renderMicroFrontend = window.renderMicroFrontend || printMicroFrontendInfo;

window.renderMenu = function (containerId, history) {
    history = history || createBrowserHistory();
    fetchConfig().then(config => ReactDOM.render(<Application history={history}
                                                              config={config}/>, document.getElementById(containerId)));
}

window.unmountMenu = function (containerId) {
    ReactDOM.unmountComponentAtNode(document.getElementById(containerId));
}
