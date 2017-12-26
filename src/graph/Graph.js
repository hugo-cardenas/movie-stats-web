import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import Bar from './Bar';
import Doughnut from './Doughnut';
import { randomColor } from 'randomcolor';
import _ from 'lodash';

const
    CHART_BAR = 'bar',
    CHART_DOUGHNUT = 'doughnut';

class Graph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartType: CHART_BAR
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props, nextProps) ||
            !_.isEqual(this.state, nextState);
    }

    render() {
        return <div id="graph-container">
            <div id="movie-tooltip" className="hidden"></div>
            {this.renderTabs()}
            {this.renderChartContainer()}
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
                text: 'Timeline'
            },
        ]
        return <div className="tabs is-centered">
            <ul>
                {tabs.map(tab => 
                    <li 
                        key={tab.type}
                        className={tab.type === chartType ? 'is-active' : ''}
                        onClick={this.switchToTab.bind(this, tab.type)}>
                            <a>{tab.text}</a>
                    </li>
                )}
            </ul>
        </div>;
    }

    switchToTab(type) {
        this.setState({ chartType: type },
            () => document.querySelector('#content').scrollIntoView()
        );
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

    renderBar() {
        return <Bar movies={this.props.movies} />;
    }

    renderDoughnut() {
        return <Doughnut movies={this.props.movies} />;
    }   
}

export default Graph;
