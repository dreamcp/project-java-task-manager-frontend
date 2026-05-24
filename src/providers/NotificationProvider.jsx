// @ts-check

import React, { useEffect, useMemo } from 'react';
import {
  useLocation,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import _ from 'lodash';

import { NotificationContext } from '../contexts/index.js';
import { actions as notifyActions } from '../slices/notificationSlice.js';

function NotificationProvider({ children }) {
  const location = useLocation();
  const dispatch = useDispatch();
  const clean = () => dispatch(notifyActions.clean());

  const messageMapping = useMemo(() => ({
    errors(currentErrors) {
      const errors = currentErrors.map((err) => ({ id: _.uniqueId(), ...err, type: 'danger' }));
      dispatch(notifyActions.addMessages(errors));
    },
    error(currentError) {
      const error = { id: _.uniqueId(), text: currentError, type: 'danger' };
      dispatch(notifyActions.addMessage(error));
    },
    info(text) {
      const messages = { id: _.uniqueId(), text, type: 'info' };
      dispatch(notifyActions.addMessage(messages));
    },
  }), [dispatch]);

  useEffect(() => {
    const { state } = location;
    if (!state) {
      dispatch(notifyActions.clean());
      return;
    }
    const { message, type } = state;
    if (!message) {
      dispatch(notifyActions.clean());
      return;
    }

    if (!type) {
      messageMapping.info(message);
      return;
    }

    messageMapping[type](message);
  }, [location, dispatch, messageMapping]);

  const contextValue = useMemo(() => ({
    addMessage: messageMapping.info,
    addErrors: messageMapping.errors,
    addError: messageMapping.error,
    clean,
  }), [messageMapping, clean]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}

export default NotificationProvider;
