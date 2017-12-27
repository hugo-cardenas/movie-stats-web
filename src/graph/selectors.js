import ReactDOM from 'react-dom';
import {
    CHART_BAR,
    CHART_DOUGHNUT,
    FIELD_ACTOR,
    FIELD_DIRECTOR,
    FIELD_ALL,
    FIELD_GENRE
} from './types';

const getGroupedMovies = (movies, groupBy, getCount = false) => {
    const groupedMovies = {};
    movies.forEach(movie => {
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

const getFilter = (field, name) => {
    // TODO Throw error if invalid
    switch (field) {
        case FIELD_ACTOR:
            return getActorFilter(name);
        case FIELD_DIRECTOR:
            return getDirectorFilter(name);
        case FIELD_GENRE:
        default:
            return getGenreFilter(name);
    }
};

const getActorFilter = actor =>
    movie => movie.actors.includes(actor);

const getDirectorFilter = director =>
    movie => movie.director === director;

const getGenreFilter = genre =>
    movie => movie.genres.includes(genre);

const getFilteredMovieNames = (movies, filter) => {
    const filteredMovies = movies
        .filter(filter)
        .map(movie => movie.name);
    filteredMovies.sort();
    return filteredMovies;
};

const getMoviesWithDateInfo = movies => {
    return movies.map(movie => {
        const date = new Date(movie.createdAt * 1000);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        return {
            ...movie,
            createdAtYearMonth: `${year} - ${monthNumberToString(month)}`
        };
    });
};

const monthNumberToString = month =>
    month < 10 ? `0${month}` : month;

const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
];

const getMonthNumber = monthName => months.indexOf(monthName) + 1;

const getMonthName = monthNumber => months[monthNumber - 1];

const getLabelDate = yearMonthDate => {
    const parts = yearMonthDate.split(' - ');
    return `${getMonthName(parts[1])} ${parts[0]}`;
};

const getYearMonthDate = labelDate => {
    const parts = labelDate.split(' ');
    return `${parts[1]} - ${monthNumberToString(getMonthNumber(parts[0]))}`;
};

const shouldDisplayLegend = numLabels => {
    // Hack to figure out whether to display legend based on screen size
    // Let's display the legend only if there are 5 or less label lines (label width is estimated)
    const labelWidth = 250;
    const screenWidth = window.screen.width;
    const numLabelLines = numLabels / (screenWidth / labelWidth);
    return numLabelLines <= 5;
};

const chartRef = (movies, chartType, dataType, elem) => {
    if (!elem)  return;
    const chart = elem.chart_instance;
    const canvas = ReactDOM.findDOMNode(elem);

    canvas.onmousemove = event => {
        try {
            const element = chart.getElementAtEvent(event)[0];
            if (!element) throw new Error('Not an element under mouse');

            let filter;
            if (chartType === CHART_BAR) {
                const labelDate = chart.data.labels[element._index];
                const name = chart.data.datasets[element._datasetIndex].label;
                const dateFilter = movie => movie.createdAtYearMonth === getYearMonthDate(labelDate);

                if (dataType === FIELD_ALL) {
                    filter = dateFilter;
                } else {
                    filter = movie => dateFilter(movie) && getFilter(dataType, name)(movie);
                }
            } else if (chartType === CHART_DOUGHNUT) {
                const name = chart.data.labels[element._index];
                filter = getFilter(dataType, name);
            }

            let movieNames = getFilteredMovieNames(movies, filter);
            if (movieNames.length < 1) throw new Error('No movies found with the current filter');

            if (movieNames.length > 15) {
                movieNames = movieNames.slice(0, 15);
                movieNames.push('...');
            }
            const tooltip = document.getElementById('movie-tooltip');
            tooltip.innerHTML = '';
            movieNames
                .map(name => createHtmlElement('p', name))
                .forEach(elem => document.getElementById('movie-tooltip').appendChild(elem));
            tooltip.classList.remove('hidden');

        } catch (err) {
            document.getElementById('movie-tooltip').classList.add('hidden');
        }
    };
};

const createHtmlElement = (tag, text) => {
    const element = document.createElement(tag);
    element.innerHTML = text;
    return element;
};

export {
    chartRef,
    getChartItems,
    getGroupedMovies,
    getLabelDate,
    getMoviesWithDateInfo,
    shouldDisplayLegend
};
