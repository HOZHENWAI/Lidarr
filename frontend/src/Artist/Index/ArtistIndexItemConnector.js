import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import createCommandsSelector from 'Store/Selectors/createCommandsSelector';
import createQualityProfileSelector from 'Store/Selectors/createQualityProfileSelector';
import createLanguageProfileSelector from 'Store/Selectors/createLanguageProfileSelector';
import { executeCommand } from 'Store/Actions/commandActions';
import * as commandNames from 'Commands/commandNames';

function createMapStateToProps() {
  return createSelector(
    (state, { id }) => id,
    (state, { seasons }) => seasons,
    createQualityProfileSelector(),
    createLanguageProfileSelector(),
    createCommandsSelector(),
    (artistId, seasons, qualityProfile, languageProfile, commands) => {
      const isRefreshingSeries = _.some(commands, (command) => {
        return command.name === commandNames.REFRESH_ARTIST &&
          command.body.artistId === artistId;
      });

      const latestSeason = _.maxBy(seasons, (season) => season.seasonNumber);

      return {
        qualityProfile,
        languageProfile,
        latestSeason,
        isRefreshingSeries
      };
    }
  );
}

const mapDispatchToProps = {
  executeCommand
};

class ArtistIndexItemConnector extends Component {

  //
  // Listeners

  onRefreshArtistPress = () => {
    this.props.executeCommand({
      name: commandNames.REFRESH_ARTIST,
      artistId: this.props.id
    });
  }

  //
  // Render

  render() {
    const {
      component: ItemComponent,
      ...otherProps
    } = this.props;

    return (
      <ItemComponent
        {...otherProps}
        onRefreshArtistPress={this.onRefreshArtistPress}
      />
    );
  }
}

ArtistIndexItemConnector.propTypes = {
  id: PropTypes.number.isRequired,
  component: PropTypes.func.isRequired,
  executeCommand: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(ArtistIndexItemConnector);
