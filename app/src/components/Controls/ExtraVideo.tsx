import React from 'react';
import { connect } from 'react-redux';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import { useRoomClient, withRoomContext } from '../../RoomContext';
import PropTypes from 'prop-types';
import { useIntl, FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { useAppDispatch, useAppSelector } from '../../store/selectors';
import { roomActions } from '../../store/slices/room';

const useStyles = makeStyles((theme) => ({
  dialogPaper: {
    width: '30vw',
    [theme.breakpoints.down('lg')]: {
      width: '40vw',
    },
    [theme.breakpoints.down('md')]: {
      width: '50vw',
    },
    [theme.breakpoints.down('sm')]: {
      width: '70vw',
    },
    [theme.breakpoints.down('xs')]: {
      width: '90vw',
    },
  },
  setting: {
    padding: theme.spacing(2),
  },
  formControl: {
    display: 'flex',
  },
}));

export const ExtraVideo: React.FC = React.memo(() => {
  const intl = useIntl();

  const [videoDevice, setVideoDevice] = React.useState('');

  const handleChange = (event) => {
    setVideoDevice(event.target.value);
  };

  const roomClient = useRoomClient();
  const classes = useStyles();

  const { webcamDevices, extraVideoOpen } = useAppSelector((state) => ({
    webcamDevices: state.me.webcamDevices,
    extraVideoOpen: state.room.extraVideoOpen,
  }));

  const dispatch = useAppDispatch();

  let videoDevices;

  if (webcamDevices) videoDevices = Object.values(webcamDevices);
  else videoDevices = [];

  return (
    <Dialog
      open={extraVideoOpen}
      onClose={() => dispatch(roomActions.set('extraVideoOpen', false))}
      classes={{
        paper: classes.dialogPaper,
      }}
    >
      <DialogTitle id="form-dialog-title">
        <FormattedMessage id="room.extraVideo" defaultMessage="Extra video" />
      </DialogTitle>
      <form className={classes.setting} autoComplete="off">
        <FormControl className={classes.formControl}>
          <Select
            value={videoDevice}
            displayEmpty
            name={intl.formatMessage({
              id: 'settings.camera',
              defaultMessage: 'Camera',
            })}
            autoWidth
            disabled={videoDevices.length === 0}
            onChange={handleChange}
          >
            {videoDevices.map((webcam, index) => {
              return (
                <MenuItem key={index} value={webcam.deviceId}>
                  {webcam.label}
                </MenuItem>
              );
            })}
          </Select>
          <FormHelperText>
            {videoDevices.length > 0
              ? intl.formatMessage({
                  id: 'settings.selectCamera',
                  defaultMessage: 'Select video device',
                })
              : intl.formatMessage({
                  id: 'settings.cantSelectCamera',
                  defaultMessage: 'Unable to select video device',
                })}
          </FormHelperText>
        </FormControl>
      </form>
      <DialogActions>
        <Button
          onClick={() => roomClient.addExtraVideo(videoDevice)}
          color="primary"
        >
          <FormattedMessage
            id="label.addVideo"
            defaultMessage="Add new video input"
          />
        </Button>
      </DialogActions>
    </Dialog>
  );
});
ExtraVideo.displayName = 'ExtraVideo';
