import React, { useEffect, useState, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Chart } from 'react-google-charts';

import * as weatherActionCreators from './weatherActionCreators';
import LoadingIndicator from '../../components/LoadingIndicator';
import Carousel from '../../components/Carousel';
import EventTracker from '../../event-tracker';
import Events from '../../event-tracker/events';

import './HomePage.scss';

const HomePage = ({ weatherState, weatherActions }) => {
  const [unitValue, setUnitValue] = useState('C');
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const { loading, weathers } = weatherState;
  const chartColumnConfig = [{
    type: 'string',
    label: 'Time'
  }, {
    type: 'number',
    label: 'Temperature'
  }];
  const chartConfig = {
    hAxis: { title: 'Time' },
    vAxis: { title: 'Temperature' },
    legend: 'none'
  };

  const handleChange = ({ target: { value } }) => {
    setUnitValue(value);
    weatherActions.getWeeklyWeather(value);
  };

  const onSelectCard = (cardIndex) => {
    setSelectedCardIndex(cardIndex);
  };

  useEffect(() => {
    EventTracker.raise(Events.HOME_PAGE);
    weatherActions.getWeeklyWeather(unitValue);
  }, []);

  return (
    <div className="home-page container">
      <Helmet>
        <title>Weather Report</title>
        <meta name="description" content="Weather Report" />
      </Helmet>
      <div className="container">
        <FormControl component="fieldset">
          <RadioGroup aria-label="unit" name="unit" value={unitValue} onChange={handleChange}>
            <FormControlLabel value="C" control={<Radio />} label="Celcius" />
            <FormControlLabel value="F" control={<Radio />} label="Fahrenheit" />
          </RadioGroup>
        </FormControl>
        {loading && !weathers.length
          ? <LoadingIndicator />
          : (
            <Fragment>
              <Carousel onSelectCard={onSelectCard}>
                {
                  weathers.map(({ avgTemp, avgTempMin, avgTempMax, avgHumidity, date, id }) => (
                    <Card key={`card-${id}`}>
                      <CardContent>
                        <header className="card-header">{date}</header>
                        <h1 className="mt-1">
                          {avgTemp}
                          &deg;
                          {unitValue}
                        </h1>
                        <section className="min-max-section">
                          <span>{`Min ${avgTempMin}`}</span>
                          <span>{`Max ${avgTempMax}`}</span>
                        </section>
                        <section>{`Humidity ${avgHumidity}%`}</section>
                      </CardContent>
                    </Card>
                  ))
                }
              </Carousel>
              <Chart
                className="mt-2"
                chartType="ColumnChart"
                columns={chartColumnConfig}
                rows={weathers[selectedCardIndex].chartData}
                width="100%"
                height="400px"
                config={chartConfig}
              />
            </Fragment>
          )
        }
      </div>
    </div>
  );
};

HomePage.propTypes = {
  weatherState: PropTypes.object,
  weatherActions: PropTypes.object
};

const mapStateToProps = (state) => ({
  weatherState: state.weather
});

const mapDispatchToProps = (dispatch) => ({
  weatherActions: bindActionCreators(weatherActionCreators, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
