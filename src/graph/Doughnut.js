import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Doughnut as DoughnutChart } from 'react-chartjs-2';
import _ from 'lodash';
import { randomColor } from 'randomcolor';
import { chartRef, getChartItems, getGroupedMovies, shouldDisplayLegend } from './selectors';
import { FIELD_ACTOR, FIELD_DIRECTOR, FIELD_GENRE } from './types';

const DEFAULT_MIN_COUNT = 2;

class Doughnut extends Component {
    constructor(props) {
        super(props);
        this.state = {
            type: FIELD_DIRECTOR,
            minCount: DEFAULT_MIN_COUNT
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState);
    }

    render() {
        return (
            <div id="chart-container">
                {this.renderDoughnutForm()}
                {this.renderDoughnutChart()}
            </div>
        );
    }

    renderDoughnutForm() {
        const { type, minCount } = this.state;
        return (
            <form id="graph-config">
                <div className="field is-horizontal">
                    <div className="field-body">
                        <div className="field">
                            <div className="control">
                                <div className="select">
                                    <select
                                        onChange={this.handleDoughnutType.bind(this)}
                                        value={type}>
                                        <option key="doughnut-director" value={FIELD_DIRECTOR}>
                                            Directors
                                        </option>
                                        {/* <option key="doughnut-actor" value={FIELD_ACTOR}>Actors</option> */}
                                        <option key="doughnut-genre" value={FIELD_GENRE}>
                                            Genres
                                        </option>
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
                                            <select
                                                onChange={this.handleDoughnutMinCount.bind(this)}
                                                value={minCount}>
                                                <option key="doughnut-min-1" value="1">
                                                    once
                                                </option>
                                                <option key="doughnut-min-2" value="2">
                                                    twice
                                                </option>
                                                <option key="doughnut-min-3" value="3">
                                                    3 times
                                                </option>
                                                <option key="doughnut-min-4" value="4">
                                                    4 times
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        );
    }

    handleDoughnutType(event) {
        const type = event.target.value;
        if ([FIELD_ACTOR, FIELD_DIRECTOR, FIELD_GENRE].includes(type)) {
            this.setState({ type });
        }
    }

    handleDoughnutMinCount(event) {
        const value = parseInt(event.target.value, 10);
        this.setState({ minCount: value > 0 ? value : 1 });
    }

    renderDoughnutChart() {
        const { movies } = this.props;
        const { type, minCount } = this.state;

        const attribute = getDataAttribute(type);
        const count = getGroupedMovies(movies, attribute, true);
        const items = getChartItems(count, minCount);

        const data = {
            datasets: [
                {
                    data: items.map(item => item.count),
                    backgroundColor: items.map(item =>
                        randomColor({ luminosity: 'light', count: items.count })
                    )
                }
            ],
            labels: items.map(item => item.label)
        };

        const options = {
            legend: { display: shouldDisplayLegend(items.length) }
        };

        // TODO REMOVE TYPE
        const ref = elem => chartRef(movies, 'doughnut', type, elem);

        return <DoughnutChart data={data} options={options} ref={ref} />;
    }
}

export default Doughnut;

const getDataAttribute = chartType => {
    switch (chartType) {
        case FIELD_ACTOR:
            return 'actors';
        case FIELD_DIRECTOR:
            return 'director';
        case FIELD_GENRE:
        default:
            return 'genres';
    }
};
