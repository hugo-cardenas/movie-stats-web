import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import * as randomColor from 'randomcolor';
import _ from 'lodash';
import chroma from 'chroma-js';

const
    CHART_PIE = 'pie',
    CHART_TIMELINE = 'timeline',

    TIMELINE_ALL = 'all',
    TIMELINE_ACTOR = 'actor',
    TIMELINE_DIRECTOR = 'director',

    PIE_ACTOR = 'actor',
    PIE_DIRECTOR = 'director';

const DEFAULT_PIE_MIN_COUNT = 2;
const DEFAULT_TIMELINE_MIN_COUNT = 4;

class Graph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartType: CHART_TIMELINE,
            timelineType: TIMELINE_ALL,
            timelineMinCount: DEFAULT_TIMELINE_MIN_COUNT,
            pieType: PIE_DIRECTOR,
            pieMinCount: DEFAULT_PIE_MIN_COUNT
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
            case CHART_TIMELINE:
                return this.renderTimeline();
            case CHART_PIE:
            default:
                return this.renderPie();
        }
    }

    renderPie() {
        return <div id="chart-container">
            {this.renderPieForm()}
            {this.renderPieChart()}
            
        </div>;
    }

    renderTimeline() {
        return <div id="chart-container">
            {this.renderTimelineForm()}
            {this.renderTimelineChart()}
        </div>;
    }

    renderTabs() {
        const { chartType } = this.state;
        const tabs = [
            {
                type: CHART_PIE,
                text: 'Count'
            },
            {
                type: CHART_TIMELINE,
                text: 'Timeline'
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

    renderTimelineForm() {
        const { timelineType } = this.state;

        return <form id="graph-config">
            <div className="field is-horizontal">
                <div className="field-body">
                    <div className="field">
                        <div className="control">
                            <div className="select">
                                <select onChange={this.handleTimelineType.bind(this)}>
                                    <option value={TIMELINE_ALL}>All movies</option>
                                    <option value={TIMELINE_DIRECTOR}>By director</option>
                                    <option value={TIMELINE_ACTOR}>By actor</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {timelineType !== TIMELINE_ALL ? this.renderTimelineFormLimit() : ''}
                </div>
            </div>
        </form>;
    }

    renderTimelineFormLimit() {
        return <div className="field is-horizontal">
            <div className="field-label is-normal">
                <p>each with at least</p>
            </div>
            <div className="field-body">
                <div className="field">
                    <div className="control">
                        <div className="select">
                            <select onChange={this.handleTimelineMinCount.bind(this)} 
                                defaultValue={DEFAULT_TIMELINE_MIN_COUNT}>
                                <option value="1">1 movie</option>
                                <option value="2">2 movies</option>
                                <option value="3">3 movies</option>
                                <option value="4">4 movies</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }

    handleTimelineType(event) {
        const type = event.target.value;
        if ([TIMELINE_ALL, TIMELINE_DIRECTOR, TIMELINE_ACTOR].includes(type)) {
            this.setState({ timelineType: type });
        }
    }

    handleTimelineMinCount(event) {
        const value = parseInt(event.target.value, 10);
        this.setState({ timelineMinCount: value > 0 ? value : 1 });
    }

    renderPieForm() {
        return <form id="graph-config">
            <div className="field is-horizontal">
                <div className="field-body">
                    <div className="field">
                        <div className="control">
                            <div className="select">
                                <select onChange={this.handlePieType.bind(this)}>
                                    <option value={PIE_DIRECTOR}>Directors</option>
                                    <option value={PIE_ACTOR}>Actors</option>
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
                                        <select onChange={this.handlePieMinCount.bind(this)} 
                                            defaultValue={DEFAULT_PIE_MIN_COUNT}>
                                            <option value="1">once</option>
                                            <option value="2">twice</option>
                                            <option value="3">3 times</option>
                                            <option value="4">4 times</option>
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

    handlePieType(event) {
        const type = event.target.value;
        if ([PIE_ACTOR, PIE_DIRECTOR].includes(type)) {
            this.setState({ pieType: type });
        }
    }

    handlePieMinCount(event) {
        const value = parseInt(event.target.value, 10);
        this.setState({ pieMinCount: value > 0 ? value : 1 });
    }

    renderTimelineChart() {
        const { movies } = this.props;
        const { timelineType, timelineMinCount } = this.state;

        const monthCount = getMovieAttributeCount(movies, 'addedAtMonth');
        const labels = Object.keys(monthCount).map(value => parseInt(value, 10));
        
        let countGroups;
        if (timelineType === TIMELINE_ALL) {
            countGroups = {
                ['All movies']: monthCount
            };
        } else {
            countGroups = getGroupedCount(movies, 'addedAtMonth', 'director');
        }
        // TODO Support for actors
        const colors = randomColor({count: Object.keys(countGroups).length});
        
        const datasets = Object.keys(countGroups)
            .filter(groupBy => {
                return Object.values(countGroups[groupBy])
                    .reduce((sum, current) => sum + current) >= timelineMinCount;
            })
            .map((groupBy, i) => {
                const color = colors[i];
                return {
                    label: groupBy,
                    data: labels.map(label => countGroups[groupBy][label] ? countGroups[groupBy][label] : 0),
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
                onClick: (e, legendItem) => {

                }
            }
        };

        return <Bar data={data} options={options}/>;
    }

    renderPieChart() {
        const { movies } = this.props;
        const { pieType, pieMinCount } = this.state;

        const attribute = pieType === PIE_DIRECTOR ? 'director' : 'actors';
        const nameCount = getMovieAttributeCount(movies, attribute);
        const items = getChartItems(nameCount, pieMinCount);

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

        const ref = elem => pieChartRef(movies, pieType, elem);

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

const pieChartRef = (movies, pieType, elem) => {
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
            const movieNames = getFilteredMovies(movies, getFilter(pieType, name));
            console.log(movieNames);
        } catch (err) {}
    };
};

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

const getGroupedCount = (movies, attribute, groupBy) => {
    const groups = _.groupBy(movies, groupBy)
    Object
        .keys(groups)
        .forEach(key => groups[key] = getMovieAttributeCount(groups[key], attribute));
    return groups;
}

const getMovieAttributeCount = (movies, attribute) => {
    return movies.reduce((count, movie) => {
        const values = Array.isArray(movie[attribute]) ? movie[attribute] : [movie[attribute]];
        values.forEach(value => {
            if (!count[value]) {
                count[value] = 0;
            }
            count[value]++;
        });
        return count;
    }, {});
}

const getFilter = (pieType, name) => {
    if (pieType === PIE_ACTOR) {
        return getActorFilter(name);
    }
    return getDirectorFilter(name);
};

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
