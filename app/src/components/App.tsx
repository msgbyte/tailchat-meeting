import React, { useEffect, Suspense } from 'react';
import JoinDialog from './JoinDialog';
import LoadingView from './Loader/LoadingView';
import { LazyPreload } from './Loader/LazyPreload';
import { useAppSelector } from '../store/selectors';
import { useHistory } from 'react-router';

const Room = LazyPreload(() => import(/* webpackChunkName: "room" */ './Room'));

const App = () => {
  const history = useHistory();
  const joined = useAppSelector((state) => state.room.joined);

  useEffect(() => {
    Room.preload();
  }, []);

  if (!joined) {
    return <JoinDialog />;
  } else {
    return (
      <Suspense fallback={<LoadingView />}>
        <Room />
      </Suspense>
    );
  }
};

export default App;
