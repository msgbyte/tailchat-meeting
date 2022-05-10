import React, { useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import * as roomActions from '../../store/actions/roomActions';
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
    dispatch(roomActions.setAboutOpen(false));
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
          Tailchat Meeting (Tailchat 视频会议)
        </DialogContentText>
        <DialogContentText paragraph>
          这是一个基于
          <Link
            href={eduMeetUrl}
            target="_blank"
            rel="noreferrer"
            color="secondary"
            // variant="h6"
          >
            edumeet
          </Link>
          制作的开源视频会议应用程序,
          在此基础上做了很多的改造以更加适应国内的使用人群。并增加了一些新特性以丰富用户体验。
        </DialogContentText>
        <DialogContentText paragraph>
          作为 Tailchat 生态中的一员的同时还能够单独作为一个独立单品使用。
        </DialogContentText>
        <DialogContentText align="center" paragraph>
          开源地址:{' '}
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
            <span>访问Tailchat官网以了解更多内容: </span>
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
