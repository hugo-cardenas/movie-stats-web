import React, { Component } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';

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
        const { movies } = this.props;
        return <div id="graph-container">
            {this.renderForm()}
            {this.renderPie()}
        </div>;
    }

    renderForm() {
        return <form id="graph-config">
            <div className="field is-horizontal">
                <div class="field-body">
                    <div class="field">
                        <div class="control">
                            <div class="select">
                                <select onChange={this.handlePieType.bind(this)}>
                                    <option value={PIE_DIRECTOR}>Directors</option>
                                    <option value={PIE_ACTOR}>Actors</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <div class="select">
                                <select onChange={this.handlePieMinCount.bind(this)}>
                                    <option value="1">At least 1</option>
                                    <option value="2" selected>At least 2</option>
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
        const value = parseInt(event.target.value);
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
        const options = {};
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
                data: items.map(director => director.count)
            }],
            labels: items.map(director => director.name)
        };

        return <Doughnut data={data}/>;
    }

    getPieActorData() {
        const { movies } = this.props;

    }

    getPieDirectorData() {
        const { movies } = this.props;

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
