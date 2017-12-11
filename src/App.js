import React, { Component } from 'react';
import axios from 'axios';
import tippy from 'tippy.js';
import parser from 'papaparse';
import chrono from 'chrono-node';
import Graph from './Graph';
import tooltipImage from './style/img/instructions.gif';
import avatarImage from './style/img/guybrush.png';
import 'bulma/css/bulma.css';
import 'tippy.js/dist/tippy.css';
import './style/App.styl';

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
        this.fileInput = null;

        this.fileInputRef = this.fileInputRef.bind(this);
        this.handleFileInput = this.handleFileInput.bind(this);
    }

    render() {
        return <div id="root-container" className="container">
            <h1 className="title">IMDb movie stats</h1>
            <p className="subtitle">
                A graph visualization of your IMDb lists
            </p>
            {this.renderFileInput()}
            {this.renderContent()}
            {/* {this.renderFooter()} */}
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

    fileInputRef (ref) {
        this.fileInput = ref;
    }

    renderFileInput() {
        return <div className="file file-form">
            <label className="file-label">
                <input 
                    className="file-input" 
                    type="file" 
                    onChange={this.handleFileInput}
                    ref={this.fileInputRef}
                    />
                <span className="file-cta">
                    <span className="file-icon">
                        <i className="fa fa-upload"></i>
                    </span>
                    <span className="file-label">Choose a file...</span>
                </span>
            </label>
            {this.renderQuestionIcon()}
        </div>;
    }

    renderQuestionIcon() {
        const { listId } = this.state;
        if (listId !== '') {
            return '';
        }
        return <span 
            id="search-tooltip-icon" className="icon is-small is-right has-text-grey-light"
            title="This is my tooltip">
                <i className="fa fa-question"></i>
                <div id="search-tooltip-template">
                    <p>
                        1. Export your IMDb list to a <span className="has-text-weight-bold has-text-primary">csv</span> file
                        <img src={tooltipImage} />
                    </p>
                    <p>2. Upload it here</p>
                </div>
        </span>;
    }

    renderContent() {
        const { error, movies, status } = this.state;
        switch (status) {
            case STATUS_ERROR:
                return <div id="content" className="container">
                    <div className="error notification">
                        <p className="notification-title">Something went wrong...</p>
                        <p className="notification-details">{error.message}</p>
                    </div>
                </div>;
            case STATUS_LOADING:
                return <div id="content" className="container">
                    <a className="button is-loading">Loading</a>
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

    renderFooter() {
        return <footer class="footer">
            <span className="">With 🖤 by</span>
            <a href="http://hugocardenas.me"><img src={avatarImage} /></a>
        </footer>;
    }

    componentDidMount() {
        this.enableSearchTooltip();
    }

    componentDidUpdate() {
        this.enableSearchTooltip();
    }

    enableSearchTooltip() {
        tippy('#search-tooltip-icon', {
            html: '#search-tooltip-template',
            interactive: true,
            position: 'bottom',
            arrow: true,
            distance: 15
        });
    }

    handleChange(event) {
        this.setState({ listId: event.target.value.trim() });
    }

    async handleFileInput(event) {
        this.setState({ status: STATUS_LOADING });
        try {
            const movies = await getMoviesFromCsv(this.fileInput.files[0]);
            this.setState({ movies, status: STATUS_LOADED },
                () => setTimeout(scrollToContent, 100)
            );
        } catch (error) {
            this.setState({ error, status: STATUS_ERROR });
        }
    }
}

const scrollToContent = () => {
    document.querySelector('#content').scrollIntoView({
        behavior: 'smooth'
    });
};

const getMoviesFromCsv = file => {
    return new Promise((resolve, reject) => {
        const handleComplete = results => {
            if (results.errors.length > 0) {
                const message = 'Unable to read CSV file \n'
                    + results.errors
                        .map(err => err.message)
                        .slice(0, 3)
                        .join('\n')
                    + '\n...';
                return reject(new Error(message));
            }

            try {
                return resolve(results.data.map(mapToMovie));
            } catch (err) {
                return reject(new Error('Unable to read CSV file'));
            }
        };
        
        parser.parse(file, {
            complete: handleComplete, 
            dynamicTyping: true,
            error: reject,
            header: true,
            skipEmptyLines: true
        })
    });
};

const mapToMovie = data => {
    return {
        actors: [],
        createdAt: toTimestamp(data.Created),
        director: data.Directors.split(', ')[0],
        genres: data.Genres.split(', '),
        id: data.Const,
        name: data.Title,
        timelineIndex: data.Position,
        userRating: data['IMDb Rating'],
        year: data.Year,
    };
};

const toTimestamp = dateString => Math.floor(chrono.parseDate(dateString).getTime() / 1000);

export default App;
