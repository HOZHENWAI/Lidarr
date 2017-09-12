import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { icons } from 'Helpers/Props';
import IconButton from 'Components/Link/IconButton';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import VirtualTableRowCell from 'Components/Table/Cells/VirtualTableRowCell';
import EditArtistModalConnector from 'Artist/Edit/EditArtistModalConnector';
import DeleteArtistModal from 'Artist/Delete/DeleteArtistModal';

class ArtistIndexActionsCell extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isEditArtistModalOpen: false,
      isDeleteArtistModalOpen: false
    };
  }

  //
  // Listeners

  onEditSeriesPress = () => {
    this.setState({ isEditArtistModalOpen: true });
  }

  onEditSeriesModalClose = () => {
    this.setState({ isEditArtistModalOpen: false });
  }

  onDeleteSeriesPress = () => {
    this.setState({
      isEditArtistModalOpen: false,
      isDeleteArtistModalOpen: true
    });
  }

  onDeleteArtistModalClose = () => {
    this.setState({ isDeleteArtistModalOpen: false });
  }

  //
  // Render

  render() {
    const {
      id,
      isRefreshingSeries,
      onRefreshArtistPress,
      ...otherProps
    } = this.props;

    const {
      isEditArtistModalOpen,
      isDeleteArtistModalOpen
    } = this.state;

    return (
      <VirtualTableRowCell
        {...otherProps}
      >
        <SpinnerIconButton
          name={icons.REFRESH}
          title="Refresh Artist"
          isSpinning={isRefreshingSeries}
          onPress={onRefreshArtistPress}
        />

        <IconButton
          name={icons.EDIT}
          title="Edit Artist"
          onPress={this.onEditSeriesPress}
        />

        <EditArtistModalConnector
          isOpen={isEditArtistModalOpen}
          artistId={id}
          onModalClose={this.onEditSeriesModalClose}
          onDeleteSeriesPress={this.onDeleteSeriesPress}
        />

        <DeleteArtistModal
          isOpen={isDeleteArtistModalOpen}
          artistId={id}
          onModalClose={this.onDeleteArtistModalClose}
        />
      </VirtualTableRowCell>
    );
  }
}

ArtistIndexActionsCell.propTypes = {
  id: PropTypes.number.isRequired,
  isRefreshingSeries: PropTypes.bool.isRequired,
  onRefreshArtistPress: PropTypes.func.isRequired
};

export default ArtistIndexActionsCell;
