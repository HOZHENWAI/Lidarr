import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { findCommand } from 'Utilities/Command';
import createAllArtistSelector from 'Store/Selectors/createAllArtistSelector';
import createCommandsSelector from 'Store/Selectors/createCommandsSelector';
import { fetchEpisodes, clearEpisodes } from 'Store/Actions/episodeActions';
import { fetchEpisodeFiles, clearEpisodeFiles } from 'Store/Actions/episodeFileActions';
import { fetchQueueDetails, clearQueueDetails } from 'Store/Actions/queueActions';
import { executeCommand } from 'Store/Actions/commandActions';
import * as commandNames from 'Commands/commandNames';
import SeriesDetails from './SeriesDetails';

function createMapStateToProps() {
  return createSelector(
    (state, { nameSlug }) => nameSlug,
    (state) => state.episodes,
    (state) => state.episodeFiles,
    createAllArtistSelector(),
    createCommandsSelector(),
    (nameSlug, episodes, episodeFiles, allSeries, commands) => {
      const sortedArtist = _.orderBy(allSeries, 'sortTitle');
      const seriesIndex = _.findIndex(sortedArtist, { nameSlug });
      const series = sortedArtist[seriesIndex];

      if (!series) {
        return {};
      }

      const previousSeries = sortedArtist[seriesIndex - 1] || _.last(sortedArtist);
      const nextSeries = sortedArtist[seriesIndex + 1] || _.first(sortedArtist);
      const isSeriesRefreshing = !!findCommand(commands, { name: commandNames.REFRESH_ARTIST, artistId: series.id });
      const allSeriesRefreshing = _.some(commands, (command) => command.name === commandNames.REFRESH_ARTIST && !command.body.artistId);
      const isRefreshing = isSeriesRefreshing || allSeriesRefreshing;
      const isSearching = !!findCommand(commands, { name: commandNames.ARTIST_SEARCH, artistId: series.id });
      const isRenamingFiles = !!findCommand(commands, { name: commandNames.RENAME_FILES, artistId: series.id });
      const isRenamingSeriesCommand = findCommand(commands, { name: commandNames.RENAME_ARTIST });
      const isRenamingSeries = !!(isRenamingSeriesCommand && isRenamingSeriesCommand.body.artistId.indexOf(series.id) > -1);

      const isFetching = episodes.isFetching || episodeFiles.isFetching;
      const isPopulated = episodes.isPopulated && episodeFiles.isPopulated;
      const episodesError = episodes.error;
      const episodeFilesError = episodeFiles.error;
      const alternateTitles = _.reduce(series.alternateTitles, (acc, alternateTitle) => {
        if ((alternateTitle.seasonNumber === -1 || alternateTitle.seasonNumber === undefined) &&
            (alternateTitle.sceneSeasonNumber === -1 || alternateTitle.sceneSeasonNumber === undefined)) {
          acc.push(alternateTitle.title);
        }

        return acc;
      }, []);

      return {
        ...series,
        alternateTitles,
        isRefreshing,
        isSearching,
        isRenamingFiles,
        isRenamingSeries,
        isFetching,
        isPopulated,
        episodesError,
        episodeFilesError,
        previousSeries,
        nextSeries
      };
    }
  );
}

const mapDispatchToProps = {
  fetchEpisodes,
  clearEpisodes,
  fetchEpisodeFiles,
  clearEpisodeFiles,
  fetchQueueDetails,
  clearQueueDetails,
  executeCommand
};

class SeriesDetailsConnector extends Component {

  //
  // Lifecycle

  componentDidMount() {
    this._populate();
  }

  componentDidUpdate(prevProps) {
    const {
      id,
      isRefreshing,
      isRenamingFiles,
      isRenamingSeries
    } = this.props;

    if (
      (prevProps.isRefreshing && !isRefreshing) ||
      (prevProps.isRenamingFiles && !isRenamingFiles) ||
      (prevProps.isRenamingSeries && !isRenamingSeries)
    ) {
      this._populate();
    }

    // If the id has changed we need to clear the episodes/episode
    // files and fetch from the server.

    if (prevProps.id !== id) {
      this._unpopulate();
      this._populate();
    }
  }

  componentWillUnmount() {
    this._unpopulate();
  }

  //
  // Control

  _populate() {
    const artistId = this.props.id;

    this.props.fetchEpisodes({ artistId });
    this.props.fetchEpisodeFiles({ artistId });
    this.props.fetchQueueDetails({ artistId });
  }

  _unpopulate() {
    this.props.clearEpisodes();
    this.props.clearEpisodeFiles();
    this.props.clearQueueDetails();
  }

  //
  // Listeners

  onRefreshPress = () => {
    this.props.executeCommand({
      name: commandNames.REFRESH_ARTIST,
      artistId: this.props.id
    });
  }

  onSearchPress = () => {
    this.props.executeCommand({
      name: commandNames.ARTIST_SEARCH,
      artistId: this.props.id
    });
  }

  //
  // Render

  render() {
    return (
      <SeriesDetails
        {...this.props}
        onRefreshPress={this.onRefreshPress}
        onSearchPress={this.onSearchPress}
      />
    );
  }
}

SeriesDetailsConnector.propTypes = {
  id: PropTypes.number.isRequired,
  nameSlug: PropTypes.string.isRequired,
  isRefreshing: PropTypes.bool.isRequired,
  isRenamingFiles: PropTypes.bool.isRequired,
  isRenamingSeries: PropTypes.bool.isRequired,
  fetchEpisodes: PropTypes.func.isRequired,
  clearEpisodes: PropTypes.func.isRequired,
  fetchEpisodeFiles: PropTypes.func.isRequired,
  clearEpisodeFiles: PropTypes.func.isRequired,
  fetchQueueDetails: PropTypes.func.isRequired,
  clearQueueDetails: PropTypes.func.isRequired,
  executeCommand: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(SeriesDetailsConnector);
