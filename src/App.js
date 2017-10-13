import React, { Component } from 'react';
import Graph from './Graph';
import 'bulma/css/bulma.css'
import './App.css';
import movies from './api-response';

class App extends Component {
    constructor() {
        super();
        this.state = {
            listId: '',
            loading: false,
            movies: []
        };
    }

    render() {
        return <div id="root-container" className="container">
            <h1 className="title">IMDB movie stats</h1>
            <p className="subtitle">
                A graph visualisation of your IMDB lists
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
        const { loading, movies } = this.state;
        if (loading) {
            return <div id="content" className="container">
                <a className="button is-loading">Loading</a>
                <p>Requesting data from IMDB, please be patient...</p>
            </div>;
        } else if (movies.length > 0) {
            return <div id="content" className="container">
                <Graph movies={movies}/>
            </div>
        } else {
            return <div id="content" className="container"></div>;
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState({ loading: true });
        setTimeout(() => this.setState(
            { movies: movies, loading: false },
            () => setTimeout(scrollToContent, 100)
        ), 2000);
    }

    handleChange(event) {
        this.setState({ listId: event.target.value });
    }
}

const scrollToContent = () => {
    console.log('SCROLL');
    document.querySelector('#content').scrollIntoView({ 
        behavior: 'smooth' 
    });
};

export default App;
