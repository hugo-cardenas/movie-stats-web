import React, { Component } from 'react';
import axios from 'axios';
import tippy from 'tippy.js';
import Graph from './Graph';
import 'bulma/css/bulma.css';
import 'tippy.js/dist/tippy.css';
import './App.css';

const
    API_URL = 'https://wt-64e56b26449d9068a9bf156935aa343d-0.run.webtask.io/movie-stats';

const
    STATUS_BLANK = 'blank',
    STATUS_LOADING = 'loading',
    STATUS_LOADED = 'loaded',
    STATUS_LOADED_EMPTY = 'loaded-empty',
    STATUS_NOT_FOUND = 'not-found',
    STATUS_ERROR = 'error';

class App extends Component {
    constructor() {
        super();
        this.state = {
            error: null,
            listId: '',
            movies: [],
            status: STATUS_BLANK
        };
    }

    render() {
        return <div id="root-container" className="container">
            <h1 className="title">IMDb movie stats</h1>
            <p className="subtitle">
                A graph visualization of your IMDb lists
            </p>
            {this.renderSearch()}
            {this.renderContent()}
        </div>;
    }

    renderSearch() {
        return <form id="search" onSubmit={this.handleSubmit.bind(this)}>
            <div className="control has-icons-right">
                <input 
                    className="input" 
                    type="text" placeholder="Input IMDb list id" onChange={this.handleChange.bind(this)}/>
                {this.renderQuestionIcon()}    
            </div>            
        </form>;
    }

    renderQuestionIcon() {
        const { listId } = this.state;
        if (listId !== '') {
            return '';
        }
        return <span 
            id="search-tooltip-icon" className="icon is-small is-right"
            title="This is my tooltip">
                <i className="fa fa-question"></i>
                <div id="search-tooltip-template">
                    <p>You can find the list id in your IMDb list url</p>
                    <p>e.g. http://www.imdb.com/list/<span className="has-text-weight-bold has-text-primary">ls123456</span>/</p>
                </div>
        </span>;
    }

    renderContent() {
        const { error, movies, status } = this.state;
        switch (status) {
            case STATUS_ERROR:
                return <div id="content" className="container">
                    <div className="error notification">
                        <p className="notification-title">Oops, this is embarrasing...</p>
                        <p className="notification-details">{error.message}</p>
                    </div>
                </div>;
            case STATUS_LOADING:
                return <div id="content" className="container">
                    <a className="button is-loading">Loading</a>
                    <p>Requesting data from IMDb, please be patient...</p>
                </div>;
            case STATUS_NOT_FOUND:
                return <div id="content" className="container">
                    <div className="notification">
                        <p className="notification-title">Sorry, no results</p>
                        <p className="notification-details">Could not find a list with the specified id</p>
                        <p className="notification-details">Please check that the id is correct and the list has public visibility</p>
                    </div>
                </div>;
            case STATUS_LOADED_EMPTY:
                return <div id="content" className="container">
                    <div className="notification">
                        <p className="notification-title">This list is empty</p>
                        <p className="notification-details">Add some movies to it or search a different list</p>
                    </div>
                </div>;
            case STATUS_LOADED:
                return <div id="content" className="container">
                    <Graph movies={movies}/>
                </div>;
            case STATUS_BLANK:
            default:
                return <div id="content" className="container"></div>;
        }
    }

    componentDidMount() {
        this.enableSearchTooltip();
    }

    componentDidUpdate(){
        this.enableSearchTooltip();
    }

    enableSearchTooltip() {
        tippy('#search-tooltip-icon', {
            html: '#search-tooltip-template',
            interactive: true,
            position: 'bottom'
        });
    }

    async handleSubmit(event) {
        const { listId } = this.state;
        event.preventDefault();
        if (!listId) return;

        this.setState({ status: STATUS_LOADING });
        try {
            const response = await fetchApiMovies(listId);
            const movies = response.data;
            if (movies.length > 0) {
                this.setState({ movies, status: STATUS_LOADED },
                    () => setTimeout(scrollToContent, 100)
                );
            } else {
                this.setState({ status: STATUS_LOADED_EMPTY });
            }
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 400) {
                    this.setState({ status: STATUS_NOT_FOUND });
                    return;
                }
            }
            this.setState({ error, status: STATUS_ERROR });
        }
    }

    handleChange(event) {
        this.setState({ listId: event.target.value.trim() });
    }
}

const scrollToContent = () => {
    document.querySelector('#content').scrollIntoView({
        behavior: 'smooth'
    });
};

const fetchApiMovies = listId =>
    axios.get(API_URL + '?listId=' + encodeURIComponent(listId), { responseType: 'json' });

export default App;
