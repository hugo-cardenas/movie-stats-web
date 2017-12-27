import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Bar as BarChart } from 'react-chartjs-2';
import _ from 'lodash';
import { randomColor } from 'randomcolor';
import chroma from 'chroma-js';
import {
    chartRef,
    getChartItems,
    getGroupedMovies,
    getLabelDate,
    getMoviesWithDateInfo,
    shouldDisplayLegend
} from './selectors';
import { FIELD_ALL, FIELD_ACTOR, FIELD_DIRECTOR, FIELD_GENRE } from './types';

const DEFAULT_MIN_COUNT = 4;

class Bar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: FIELD_ALL,
            minCount: DEFAULT_MIN_COUNT
        };
    }

    render() {
        return (
            <div id="chart-container">
                {this.renderBarForm()}
                {this.renderBarChart()}
            </div>
        );
    }

    renderBarForm() {
        const { type } = this.state;
        return (
            <form id="graph-config">
                <div className="field is-horizontal">
                    <div className="field-body">
                        <div className="field">
                            <div className="control">
                                <div className="select">
                                    <select onChange={this.handleType.bind(this)} value={type}>
                                        <option key="doughnut-all" value={FIELD_ALL}>
                                            All movies
                                        </option>
                                        {/* <option key="doughnut-actor" value={FIELD_ACTOR}>By actor</option> */}
                                        <option key="doughnut-director" value={FIELD_DIRECTOR}>
                                            By director
                                        </option>
                                        <option key="doughnut-genre" value={FIELD_GENRE}>
                                            By genre
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        {type !== FIELD_ALL ? this.renderBarFormCountFilter() : null}
                    </div>
                </div>
            </form>
        );
    }

    renderBarFormCountFilter() {
        const { minCount } = this.state;
        return (
            <div className="field is-horizontal">
                <div className="field-label is-normal">
                    <p>with at least</p>
                </div>
                <div className="field-body">
                    <div className="field">
                        <div className="control">
                            <div className="select">
                                <select onChange={this.handleMinCount.bind(this)} value={minCount}>
                                    <option key="doughnut-min-1" value="1">
                                        1 movie
                                    </option>
                                    <option key="doughnut-min-2" value="2">
                                        2 movies
                                    </option>
                                    <option key="doughnut-min-3" value="3">
                                        3 movies
                                    </option>
                                    <option key="doughnut-min-4" value="4">
                                        4 movies
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderBarChart() {
        const movies = getMoviesWithDateInfo(this.props.movies);
        const { type, minCount } = this.state;

        const monthCount = getGroupedMovies(movies, 'createdAtYearMonth', true);
        const yearMonthValues = Object.keys(monthCount);
        yearMonthValues.sort();

        const groupedCount = getBarGroupedCount(movies, type);
        const colors = randomColor({ count: Object.keys(groupedCount).length });

        const datasets = Object.keys(groupedCount)
            .filter(yearMonth => {
                return (
                    Object.values(groupedCount[yearMonth]).reduce(
                        (sum, current) => sum + current
                    ) >= minCount
                );
            })
            .map((groupBy, i) => {
                const color = colors[i];
                return {
                    label: groupBy,
                    data: yearMonthValues.map(
                        label => (groupedCount[groupBy][label] ? groupedCount[groupBy][label] : 0)
                    ),
                    borderColor: chroma(color).css(),
                    borderWidth: 1,
                    backgroundColor: chroma(color)
                        .alpha(0.7)
                        .css()
                };
            });

        const data = {
            labels: yearMonthValues.map(getLabelDate),
            datasets
        };

        const options = {
            legend: {
                display: shouldDisplayLegend(datasets.length),
                onClick: (e, legendItem) => {}
            },
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true
                        }
                    }
                ]
            }
        };

        // TODO REMOVE TYPES
        const ref = elem => chartRef(movies, 'bar', type, elem);

        return <BarChart data={data} options={options} ref={ref} />;
    }

    handleType(event) {
        const type = event.target.value;
        if ([FIELD_ALL, FIELD_ACTOR, FIELD_DIRECTOR, FIELD_GENRE].includes(type)) {
            this.setState({ type });
        }
    }

    handleMinCount(event) {
        const value = parseInt(event.target.value, 10);
        this.setState({ minCount: value > 0 ? value : 1 });
    }
}

export default Bar;

const getBarGroupedCount = (movies, type) => {
    switch (type) {
        case FIELD_ACTOR:
            return _.mapValues(getGroupedMovies(movies, 'actors'), movies =>
                getGroupedMovies(movies, 'createdAtYearMonth', true)
            );
        case FIELD_DIRECTOR:
            return _.mapValues(getGroupedMovies(movies, 'director'), movies =>
                getGroupedMovies(movies, 'createdAtYearMonth', true)
            );
        case FIELD_GENRE:
            return _.mapValues(getGroupedMovies(movies, 'genres'), movies =>
                getGroupedMovies(movies, 'createdAtYearMonth', true)
            );
        case FIELD_ALL:
        default:
            return {
                'All movies': getGroupedMovies(movies, 'createdAtYearMonth', true)
            };
    }
};
