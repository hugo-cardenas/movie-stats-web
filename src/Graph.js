import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { Line, Doughnut } from 'react-chartjs-2';
import * as randomColor from 'randomcolor';
import { isEqual } from 'lodash';

/*
    Each label 250px
    5 lines

    Num lines = num labels / (width / 250)
    width / (num labels * 250 / 5)
*/

const
    CHART_PIE = 'pie',
    CHART_TIMELINE = 'timeline';

const
    PIE_ACTOR = 'actor',
    PIE_DIRECTOR = 'director';

const DEFAULT_PIE_MIN_COUNT = 2;

class Graph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartType: CHART_PIE,
            pieType: PIE_DIRECTOR,
            pieMinCount: DEFAULT_PIE_MIN_COUNT
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !isEqual(this.props, nextProps) ||
            !isEqual(this.state, nextState);
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
        return <form id="graph-config">
            <div className="field is-horizontal">
            </div>
        </form>
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
                                        <select onChange={this.handlePieMinCount.bind(this)} defaultValue={DEFAULT_PIE_MIN_COUNT}>
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
        const data = {
            labels: ["January", "February", "March", "April", "May", "June", "July"],
            datasets: [{
                label: "My First dataset",
                // backgroundColor: 'rgb(255, 99, 132)',
                // borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45],
            }]
        };
        return <Line data={data}/>;
    }

    renderPieChart() {
        const { movies } = this.props;
        const { pieType, pieMinCount } = this.state;

        const nameCount = getNameCount(movies, pieType);
        const items = getPieItems(nameCount, pieMinCount);

        const data = {
            datasets: [{
                data: items.map(item => item.count),
                backgroundColor: items.map(item => randomColor({ luminosity: 'light', count: items.count }))
            }],
            labels: items.map(item => item.name)
        };

        const options = {
            legend: { display: shouldDisplayPieLegend(items) }
        };

        const ref = elem => pieChartRef(movies, pieType, elem);

        return <Doughnut data={data} options={options} ref={ref}/>;
    }
}

const shouldDisplayPieLegend = items => {
    // Hack to figure out whether to display legend based on screen size
    // Let's display the legend only if there are 5 or less label lines (label width is estimated)
    const labelWidth = 250;
    const screenWidth = window.screen.width;
    const numLabelLines = items.length / (screenWidth / labelWidth);
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

const getPieItems = (nameCount, minCount) => {
    const items = Object
        .keys(nameCount)
        .map(name => {
            return { count: nameCount[name], name }
        })
        .filter(item => item.count >= minCount);

    items.sort((a, b) => b.count - a.count);
    return items;
};

const getNameCount = (movies, pieType) => {
    if (pieType === PIE_ACTOR) {
        return getActorCount(movies);
    }
    return getDirectorCount(movies);
};

const getDirectorCount = movies =>
    movies.reduce((count, movie) => {
        const director = movie.director;
        if (!count[director]) {
            count[director] = 0;
        }
        count[director]++;
        return count;
    }, {});

const getActorCount = movies =>
    movies.reduce((count, movie) => {
        const actors = movie.actors;
        actors.forEach(actor => {
            if (!count[actor]) {
                count[actor] = 0;
            }
            count[actor]++;
        })
        return count;
    }, {});

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

export default Graph;
