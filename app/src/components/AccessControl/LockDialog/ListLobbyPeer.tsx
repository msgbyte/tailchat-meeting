import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import classnames from 'classnames';
import { useRoomClient } from '../../../RoomContext';
import { useIntl } from 'react-intl';
import {
  makePermissionSelector,
  useAppSelector,
} from '../../../store/selectors';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import EmptyAvatar from '../../../images/avatar-empty.jpeg';
import PromoteIcon from '@material-ui/icons/OpenInBrowser';
import Tooltip from '@material-ui/core/Tooltip';
import { PermissionList } from 'tailchat-meeting-sdk';

const useStyles = makeStyles(() => ({
  root: {
    alignItems: 'center',
  },
}));

const hasPermission = makePermissionSelector(PermissionList.PROMOTE_PEER);

export const ListLobbyPeer: React.FC<{ id: string }> = React.memo((props) => {
  const classes = useStyles();
  const roomClient = useRoomClient();
  const { peer, promotionInProgress, canPromote } = useAppSelector((state) => ({
    peer: state.lobbyPeers[props.id],
    promotionInProgress: state.room.lobbyPeersPromotionInProgress,
    canPromote: hasPermission(state),
  }));

  const intl = useIntl();

  const picture = peer.picture || EmptyAvatar;

  return (
    <ListItem
      className={classnames(classes.root)}
      key={peer.id}
      button
      alignItems="flex-start"
    >
      <ListItemAvatar>
        <Avatar alt="Peer avatar" src={picture} />
      </ListItemAvatar>
      <ListItemText primary={peer.displayName} />
      <Tooltip
        title={intl.formatMessage({
          id: 'tooltip.admitFromLobby',
          defaultMessage: 'Admit from lobby',
        })}
      >
        <IconButton
          disabled={
            !canPromote || peer.promotionInProgress || promotionInProgress
          }
          color="primary"
          onClick={(e) => {
            e.stopPropagation();
            roomClient.promoteLobbyPeer(peer.id);
          }}
        >
          <PromoteIcon />
        </IconButton>
      </Tooltip>
    </ListItem>
  );
});
ListLobbyPeer.displayName = 'ListLobbyPeer';
