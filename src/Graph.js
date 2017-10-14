import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Bar, Doughnut } from 'react-chartjs-2';
import * as randomColor from 'randomcolor';
import _ from 'lodash';
import chroma from 'chroma-js';

const
    CHART_BAR = 'bar',
    CHART_DOUGHNUT = 'doughnut',

    BAR_ALL = 'all',
    BAR_ACTOR = 'actor',
    BAR_DIRECTOR = 'director',

    DOUGHNUT_ACTOR = 'actor',
    DOUGHNUT_DIRECTOR = 'director';

const DEFAULT_DOUGHNUT_MIN_COUNT = 2;
const DEFAULT_BAR_MIN_COUNT = 4;

class Graph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartType: CHART_BAR,
            barType: BAR_ACTOR,
            barMinCount: DEFAULT_BAR_MIN_COUNT,
            doughnutType: DOUGHNUT_DIRECTOR,
            doughnutMinCount: DEFAULT_DOUGHNUT_MIN_COUNT
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props, nextProps) ||
            !_.isEqual(this.state, nextState);
    }

    render() {
        return <div id="graph-container">
            {this.renderTabs()}
            {this.renderChartContainer()}
        </div>;
    }

    renderChartContainer() {
        const { chartType } = this.state;
        switch (chartType) {
            case CHART_BAR:
                return this.renderBar();
            case CHART_DOUGHNUT:
            default:
                return this.renderDoughnut();
        }
    }

    renderDoughnut() {
        return <div id="chart-container">
            {this.renderDoughnutForm()}
            {this.renderDoughnutChart()}
            
        </div>;
    }

    renderBar() {
        return <div id="chart-container">
            {this.renderBarForm()}
            {this.renderBarChart()}
        </div>;
    }

    renderTabs() {
        const { chartType } = this.state;
        const tabs = [
            {
                type: CHART_DOUGHNUT,
                text: 'Count'
            },
            {
                type: CHART_BAR,
                text: 'Bar'
            },
        ]
        return <div className="tabs is-centered">
            <ul>
                {tabs.map(tab => 
                    <li 
                        key={tab.type}
                        className={tab.type === chartType ? 'is-active' : ''}
                        onClick={() => this.setState({chartType: tab.type})}>
                            <a>{tab.text}</a>
                    </li>
                )}
            </ul>
        </div>;
    }

    renderBarForm() {
        const { barType } = this.state;
        return <form id="graph-config">
            <div className="field is-horizontal">
                <div className="field-body">
                    <div className="field">
                        <div className="control">
                            <div className="select">
                                <select 
                                    onChange={this.handleBarType.bind(this)}
                                    value={barType}>
                                    <option key="doughnut-all" value={BAR_ALL}>All movies</option>
                                    <option key="doughnut-director" value={BAR_DIRECTOR}>By director</option>
                                    <option key="doughnut-actor" value={BAR_ACTOR}>By actor</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* {barType !== BAR_ALL ? this.renderBarFormNameFilter() : ''} */}
                    {barType !== BAR_ALL ? this.renderBarFormCountFilter() : ''}
                </div>
            </div>
        </form>;
    }

    renderBarFormNameFilter() {
        const { barMinCount } = this.state;
        const { movies } = this.props;
        const actors = getActorNames(movies);
        actors.sort();

        return <div className="field is-horizontal">
            <div className="field-label is-normal">
                <p>with the name</p>
            </div>
            <div className="field-body">
                <div className="field">
                    <div className="control">
                        <div className="select">
                            <select
                                >
                                <option key={"doughnut-actor-any"} value="any">any</option>
                                {actors.map(actor => 
                                    <option key={"doughnut-actor" + actor} value={actor}>{actor}</option>
                                )}
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }

    renderBarFormCountFilter() {
        const { barMinCount } = this.state;
        return <div className="field is-horizontal">
            <div className="field-label is-normal">
                <p>with at least</p>
            </div>
            <div className="field-body">
                <div className="field">
                    <div className="control">
                        <div className="select">
                            <select onChange={this.handleBarMinCount.bind(this)} 
                                value={barMinCount}>
                                <option key="doughnut-min-1" value="1">1 movie</option>
                                <option key="doughnut-min-2" value="2">2 movies</option>
                                <option key="doughnut-min-3" value="3">3 movies</option>
                                <option key="doughnut-min-4" value="4">4 movies</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }

    handleBarType(event) {
        const type = event.target.value;
        if ([BAR_ALL, BAR_DIRECTOR, BAR_ACTOR].includes(type)) {
            this.setState({ barType: type });
        }
    }

    handleBarMinCount(event) {
        const value = parseInt(event.target.value, 10);
        this.setState({ barMinCount: value > 0 ? value : 1 });
    }

    renderDoughnutForm() {
        const { doughnutType, doughnutMinCount } = this.state;
        return <form id="graph-config">
            <div className="field is-horizontal">
                <div className="field-body">
                    <div className="field">
                        <div className="control">
                            <div className="select">
                                <select 
                                    onChange={this.handleDoughnutType.bind(this)}
                                    value={doughnutType}>
                                    <option key="doughnut-director" value={DOUGHNUT_DIRECTOR}>Directors</option>
                                    <option key="doughnut-actor" value={DOUGHNUT_ACTOR}>Actors</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="field is-horizontal">
                        <div className="field-label is-normal">
                            <p>appearing at least</p>
                        </div>
                        <div className="field-body">
                            <div className="field">
                                <div className="control">
                                    <div className="select">
                                        <select onChange={this.handleDoughnutMinCount.bind(this)} 
                                            value={doughnutMinCount}>
                                            <option key="doughnut-min-1" value="1">once</option>
                                            <option key="doughnut-min-2" value="2">twice</option>
                                            <option key="doughnut-min-3" value="3">3 times</option>
                                            <option key="doughnut-min-4" value="4">4 times</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>;
    }

    handleDoughnutType(event) {
        const type = event.target.value;
        if ([DOUGHNUT_ACTOR, DOUGHNUT_DIRECTOR].includes(type)) {
            this.setState({ doughnutType: type });
        }
    }

    handleDoughnutMinCount(event) {
        const value = parseInt(event.target.value, 10);
        this.setState({ doughnutMinCount: value > 0 ? value : 1 });
    }

    renderBarChart() {
        const { movies } = this.props;
        const { barType, barMinCount } = this.state;

        const monthCount = getGroupedMovies(movies, 'addedAtMonth', true);
        const labels = Object.keys(monthCount).map(value => parseInt(value, 10));
        const groupedCount = getBarGroupedCount(movies, barType);
        const colors = randomColor({ count: Object.keys(groupedCount).length });

        const datasets = Object.keys(groupedCount)
            .filter(groupBy => {
                return Object.values(groupedCount[groupBy])
                    .reduce((sum, current) => sum + current) >= barMinCount;
            })
            .map((groupBy, i) => {
                const color = colors[i];
                return {
                    label: groupBy,
                    data: labels.map(label => groupedCount[groupBy][label] ? groupedCount[groupBy][label] : 0),
                    borderColor: chroma(color).css(),
                    backgroundColor: chroma(color).css()
                }
            });

        const data = {
            labels: labels.map(getMonthName),
            datasets
        };
        const options = {
            legend: {
                display: shouldDisplayLegend(datasets.length),
                onClick: (e, legendItem) => {}
            }
        };
        return <Bar data={data} options={options}/>;
    }

    renderDoughnutChart() {
        const { movies } = this.props;
        const { doughnutType, doughnutMinCount } = this.state;

        const attribute = doughnutType === DOUGHNUT_DIRECTOR ? 'director' : 'actors';
        const nameCount = getGroupedMovies(movies, attribute, true);
        const items = getChartItems(nameCount, doughnutMinCount);

        const data = {
            datasets: [{
                data: items.map(item => item.count),
                backgroundColor: items.map(item => randomColor({ luminosity: 'light', count: items.count }))
            }],
            labels: items.map(item => item.label)
        };

        const options = {
            legend: { display: shouldDisplayLegend(items.length) }
        };

        const ref = elem => doughnutChartRef(movies, doughnutType, elem);

        return <Doughnut data={data} options={options} ref={ref}/>;
    }
}

const shouldDisplayLegend = numLabels => {
    // Hack to figure out whether to display legend based on screen size
    // Let's display the legend only if there are 5 or less label lines (label width is estimated)
    const labelWidth = 250;
    const screenWidth = window.screen.width;
    const numLabelLines = numLabels / (screenWidth / labelWidth);
    return numLabelLines <= 5;
};

const doughnutChartRef = (movies, doughnutType, elem) => {
    if (!elem)  {
        return;
    }

    const chart = elem.chart_instance;
    const canvas = ReactDOM.findDOMNode(elem);

    canvas.onclick = event => {
        const activePoints = chart.getElementsAtEvent(event);
        let name;
        try {
            name = activePoints[0]._model.label;
            const movieNames = getFilteredMovies(movies, getFilter(doughnutType, name));
            console.log(movieNames);
        } catch (err) {}
    };
};

const getBarGroupedCount = (movies, type) => {
    switch (type) {
        case BAR_DIRECTOR:
            return _.mapValues(getGroupedMovies(movies, 'director'), movies =>
                getGroupedMovies(movies, 'addedAtMonth', true)
            );
        case BAR_ACTOR:
            return _.mapValues(getGroupedMovies(movies, 'actors'), movies =>
                getGroupedMovies(movies, 'addedAtMonth', true)
            );
        case BAR_ALL:
        default:
            return {
                ['All movies']: getGroupedMovies(movies, 'addedAtMonth', true)
            };
    }
}

const getChartItems = (attributeCount, minCount = -1) => {
    const items = Object
        .keys(attributeCount)
        .map(attribute => {
            return { count: attributeCount[attribute], label: attribute }
        })
        .filter(item => minCount < 0 || item.count >= minCount);

    items.sort((a, b) => b.count - a.count);
    return items;
};

const getGroupedMovies = (movies, groupBy, getCount = false) => {
    const groupedMovies = {};
    movies.forEach(movie => {
        movie.groupBy
        const values = Array.isArray(movie[groupBy]) ? movie[groupBy] : [movie[groupBy]];
        values.forEach(value => {
            if (!groupedMovies[value]) {
                groupedMovies[value] = [];
            }
            groupedMovies[value].push(movie);
        })
    });

    if (getCount) {
        return _.mapValues(groupedMovies, subgroup => subgroup.length)
    }
    return groupedMovies;
};

const getFilter = (doughnutType, name) => {
    if (doughnutType === DOUGHNUT_ACTOR) {
        return getActorFilter(name);
    }
    return getDirectorFilter(name);
};

const getActorNames = movies => {
    return _.uniq([].concat(...movies.map(movie => movie.actors)));
}

const getActorFilter = actor =>
    movie => movie.actors.includes(actor);

const getDirectorFilter = director =>
    movie => movie.director === director;

const getFilteredMovies = (movies, filter) => {
    const filteredMovies = movies
        .filter(filter)
        .map(movie => movie.name);
    filteredMovies.sort();
    return filteredMovies;
};

const getMonthName = number => {
    const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ];
    return months[number - 1];
};

export default Graph;
