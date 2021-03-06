import React, { useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import { config } from '../../config';
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
  logo: {
    marginRight: 'auto',
  },
  link: {
    display: 'block',
    textAlign: 'center',
    marginBottom: theme.spacing(1),
  },
  divider: {
    marginBottom: theme.spacing(3),
  },
}));

const eduMeetUrl = 'https://edumeet.org';
const tailchatUrl = 'https://github.com/msgbyte/tailchat-meeting';

export const About: React.FC = React.memo(() => {
  const classes = useStyles();
  const aboutOpen = useAppSelector((state) => state.room.aboutOpen);
  const dispatch = useAppDispatch();
  const handleCloseAbout = useCallback(() => {
    dispatch(roomActions.set('aboutOpen', false));
  }, []);

  return (
    <Dialog
      open={aboutOpen}
      onClose={handleCloseAbout}
      classes={{
        paper: classes.dialogPaper,
      }}
    >
      <DialogTitle id="form-dialog-title">
        <FormattedMessage id="room.about" defaultMessage="About" />
      </DialogTitle>
      <DialogContent dividers>
        <DialogContentText paragraph>
          Tailchat Meeting (Tailchat ????????????)
        </DialogContentText>
        <DialogContentText paragraph>
          ??????????????????
          <Link
            href={eduMeetUrl}
            target="_blank"
            rel="noreferrer"
            color="secondary"
            // variant="h6"
          >
            edumeet
          </Link>
          ???????????????????????????????????????,
          ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
        </DialogContentText>
        <DialogContentText paragraph>
          ?????? Tailchat ???????????????????????????????????????????????????????????????????????????
        </DialogContentText>
        <DialogContentText align="center" paragraph>
          ????????????:{' '}
          <Link
            href={tailchatUrl}
            target="_blank"
            rel="noreferrer"
            color="secondary"
          >
            {tailchatUrl}
          </Link>
        </DialogContentText>
        <DialogContentText align="center" variant="body2">
          <FormattedMessage id="label.version" defaultMessage="Version" />:
          {` beta`}
        </DialogContentText>
        <Divider variant="middle" light className={classes.divider} />
        {config.supportUrl && (
          <DialogContentText align="center" paragraph>
            <span>??????Tailchat???????????????????????????: </span>
            <Link
              href={config.supportUrl}
              target="_blank"
              rel="noreferrer"
              color="secondary"
            >
              {config.supportUrl}
            </Link>
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        {config.logo && (
          <img alt="Logo" className={classes.logo} src={config.logo} />
        )}
        <Button onClick={handleCloseAbout} color="primary">
          <FormattedMessage id="label.close" defaultMessage="Close" />
        </Button>
      </DialogActions>
    </Dialog>
  );
});
About.displayName = 'About';
