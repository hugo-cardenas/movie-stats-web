import React, { Component } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import * as randomColor from 'randomcolor';

const
    PIE_ACTOR = 'actor',
    PIE_DIRECTOR = 'director';

class Graph extends Component {
    constructor(props) {
        super(props);
        this.state = {
            chartType: 'pie',
            pieType: PIE_DIRECTOR,
            pieMinCount: 3
        };
    }

    render() {
        return <div id="graph-container">
            {this.renderForm()}
            {this.renderPie()}
        </div>;
    }

    renderForm() {
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
                    <div className="field">
                        <div className="control">
                            <div className="select">
                                <select onChange={this.handlePieMinCount.bind(this)} defaultValue="2">
                                    <option value="1">At least 1</option>
                                    <option value="2">At least 2</option>
                                    <option value="3">At least 3</option>
                                    <option value="4">At least 4</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </form>;
    }

    renderPieForm() {

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

    renderChart() {
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

    renderPie() {
        const { movies } = this.props;
        const { pieType, pieMinCount } = this.state;

        let nameCount;
        if (pieType === PIE_ACTOR) {
            nameCount = getActorCount(movies);
        } else {
            nameCount = getDirectorCount(movies);
        }

        const items = Object
            .keys(nameCount)
            .map(name => {
                return { count: nameCount[name], name }
            })
            .filter(item => item.count >= pieMinCount);

        items.sort((a, b) => b.count - a.count);

        const data = {
            datasets: [{
                data: items.map(director => director.count),
                backgroundColor: items.map(item =>
                    randomColor({ luminosity: 'light', count: items.count })
                )
            }],
            labels: items.map(director => director.name)
        };
        const options = {};

        return <Doughnut data={data} options={options}/>;
    }
}

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

export default Graph;
