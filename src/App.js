import React, { Component } from 'react';
import axios from 'axios';
import Graph from './Graph';
import 'bulma/css/bulma.css'
import './App.css';
import movies from './api-response';

const
    API_URL = 'https://wt-64e56b26449d9068a9bf156935aa343d-0.run.webtask.io/movie-stats';

const
    STATUS_NONE = 'none',
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
            status: STATUS_NONE
        };
    }

    render() {
        return <div id="root-container" className="container">
            <h1 className="title">IMDB movie stats</h1>
            <p className="subtitle">
                A graph visualization of your IMDB lists
            </p>
            {this.renderSearch()}
            {this.renderContent()}
        </div>;
    }

    renderSearch() {
        return <form id="search" onSubmit={this.handleSubmit.bind(this)}>
            <div className="control">
                <input 
                    className="input" 
                    type="text" placeholder="Input IMDB list id" onChange={this.handleChange.bind(this)}/>
            </div>
        </form>;
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
                    <p>Requesting data from IMDB, please be patient...</p>
                </div>;
            case STATUS_NOT_FOUND:
                return <div id="content" className="container">
                    <div className="notification">
                        <p className="notification-title">Sorry, no results</p>
                        <p className="notification-details">Could not find a list with the specified id</p>
                        <p className="notification-details">Please check that the id is correct and the list has public visibility</p>
                    </div>
                </div>;
            case STATUS_LOADED:
                return <div id="content" className="container">
                    <Graph movies={movies}/>
                </div>;
            case STATUS_NONE:
            default:
                return <div id="content" className="container"></div>;
        }
    }

    async handleSubmit(event) {
        const { listId } = this.state;
        event.preventDefault();
        if (!listId) return;

        this.setState({ status: STATUS_LOADING });
        try {
            const response = await fetchApiMovies(listId);
            this.setState({ movies: response.data, status: STATUS_LOADED },
                () => setTimeout(scrollToContent, 100)
            );
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                if (status === 400) {
                    this.setState({ status: STATUS_NOT_FOUND });
                    return;         
                }       
            }
            console.log(error.response);
            this.setState({ error, status: STATUS_ERROR });
        }

        // setTimeout(() => this.setState(
        //     { movies: movies, loading: false },
        //     () => setTimeout(scrollToContent, 100)
        // ), 2000);
    }

    handleChange(event) {
        this.setState({ listId: event.target.value });
    }
}

const scrollToContent = () => {
    document.querySelector('#content').scrollIntoView({
        behavior: 'smooth'
    });
};

const fetchApiMovies = listId =>
    axios.get(API_URL + '?listId=' + encodeURIComponent(listId), {responseType: 'json'});

export default App;
