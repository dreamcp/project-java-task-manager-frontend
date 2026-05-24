// @ts-check

import React, { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';

import Notification from './Notification.jsx';

import Navbar from './Navbar.jsx';
import Welcome from './Welcome.jsx';
import Login from './Login.jsx';
import Registration from './Registration.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import UsersComponent from './Users/Users.jsx';
import EditUser from './Users/EditUser.jsx';

import Statuses from './Statuses/Statuses.jsx';
import EditStatus from './Statuses/EditStatus.jsx';
import NewStatus from './Statuses/NewStatus.jsx';

import Labels from './Labels/Labels.jsx';
import EditLabel from './Labels/EditLabel.jsx';
import NewLabel from './Labels/NewLabel.jsx';

import Task from './Tasks/Task.jsx';
import Tasks from './Tasks/Tasks.jsx';
import NewTask from './Tasks/NewTask.jsx';
import EditTask from './Tasks/EditTask.jsx';

import routes from '../routes.js';

import { actions as usersActions } from '../slices/usersSlice.js';
import { actions as labelsActions } from '../slices/labelsSlice.js';
import { actions as taskStatusesActions } from '../slices/taskStatusesSlice.js';
import { actions as tasksActions } from '../slices/tasksSlice.js';

import { useNotify, useAuth } from '../hooks/index.js';
import handleError from '../utils.js';

import getLogger from '../lib/logger.js';

const log = getLogger('App');
log.enabled = true;

const App = () => {
  const notify = useNotify();
  const navigate = useNavigate();
  const auth = useAuth();
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const dataRoutes = [
      {
        name: 'users',
        getData: async () => {
          const { data } = await axios.get(routes.apiUsers());
          if (!Array.isArray(data)) {
            notify.addError('Сервер не вернул список пользователей');
            dispatch(usersActions.addUsers([]));
            return;
          }
          dispatch(usersActions.addUsers(data));
        },
        isSecurity: false,
      },
      {
        name: 'labels',
        getData: async () => {
          const { data } = await axios.get(routes.apiLabels(), { headers: auth.getAuthHeader() });
          if (!Array.isArray(data)) {
            notify.addError('Сервер не вернул список меток');
            dispatch(labelsActions.addLabels([]));
            return;
          }
          dispatch(labelsActions.addLabels(data));
        },
        isSecurity: true,
      },
      {
        name: 'taskStatuses',
        getData: async () => {
          const { data } = await axios
            .get(routes.apiStatuses(), { headers: auth.getAuthHeader() });
          if (!Array.isArray(data)) {
            notify.addError('Сервер не вернул список статусов');
            dispatch(taskStatusesActions.addTaskStatuses([]));
            return;
          }
          dispatch(taskStatusesActions.addTaskStatuses(data));
        },
        isSecurity: true,
      },
      {
        name: 'tasks',
        getData: async () => {
          const { data } = await axios.get(routes.apiTasks(), { headers: auth.getAuthHeader() });
          if (!Array.isArray(data)) {
            notify.addError('Сервер не вернул список задач');
            dispatch(tasksActions.addTasks([]));
            return;
          }
          dispatch(tasksActions.addTasks(data));
        },
        isSecurity: true,
      },
    ];
    const promises = dataRoutes.filter(({ isSecurity }) => (isSecurity ? auth.user : true))
      .map(({ getData }) => getData());
    Promise.all(promises)
      .catch((error) => handleError(error, notify, navigate, auth))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user]);

  const PrivateRoute = ({ children }) => {
    if (!auth.user) {
      return <Navigate to={routes.homePagePath()} state={{ message: 'accessDenied', type: 'error' }} />;
    }
    return children;
  };

  if (isLoading) {
    return null;
  }

  return (
    <>
      <Navbar />
      <div className="container wrapper flex-grow-1">
        <Notification />
        <h1 className="my-4">{null}</h1>
        <Routes>
          <Route path={routes.homePagePath()} element={<Welcome />} />
          <Route path={routes.loginPagePath()} element={<Login />} />
          <Route path={routes.signupPagePath()} element={<Registration />} />

          <Route path={routes.usersPagePath()} element={<UsersComponent />} />
          <Route path={routes.userEditPagePath(':userId')} element={<PrivateRoute><EditUser /></PrivateRoute>} />

          <Route path={routes.statusesPagePath()} element={<PrivateRoute><Statuses /></PrivateRoute>} />
          <Route path={routes.newStatusPagePath()} element={<PrivateRoute><NewStatus /></PrivateRoute>} />
          <Route path={routes.statusEditPagePath(':taskStatusId')} element={<PrivateRoute><EditStatus /></PrivateRoute>} />

          <Route path={routes.labelsPagePath()} element={<PrivateRoute><Labels /></PrivateRoute>} />
          <Route path={routes.labelEditPagePath(':labelId')} element={<PrivateRoute><EditLabel /></PrivateRoute>} />
          <Route path={routes.newLabelPagePath()} element={<PrivateRoute><NewLabel /></PrivateRoute>} />

          <Route path={routes.tasksPagePath()} element={<PrivateRoute><Tasks /></PrivateRoute>} />
          <Route path={routes.newTaskPagePath()} element={<PrivateRoute><NewTask /></PrivateRoute>} />
          <Route path={routes.taskEditPagePath(':taskId')} element={<PrivateRoute><EditTask /></PrivateRoute>} />
          <Route path={routes.taskPagePath(':taskId')} element={<PrivateRoute><Task /></PrivateRoute>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <footer>
        <div className="container my-5 pt-4 border-top">
          <a rel="noreferrer" href="https://ru.hexlet.io">Hexlet</a>
        </div>
      </footer>
    </>
  );
};

export default App;
