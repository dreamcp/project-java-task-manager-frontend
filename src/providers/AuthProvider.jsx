// @ts-check

import React, { useMemo, useState } from 'react';

import { AuthContext } from '../contexts/index.js';

function AuthProvider({ children }) {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const [user, setUser] = useState(currentUser || null);

  const logIn = (userData) => {
    const userAuth = {
      ...userData,
      username: userData.name,
    };
    localStorage.setItem('user', JSON.stringify(userAuth));
    setUser(userAuth);
  };

  const update = (userData) => {
    const userAuth = {
      ...user,
      username: userData.email,
    };
    localStorage.setItem('user', JSON.stringify(userAuth));
    setUser(userAuth);
  };

  const logOut = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const getAuthHeader = () => {
    const userData = JSON.parse(localStorage.getItem('user')) ?? {};

    return userData.token ? { Authorization: `Bearer ${userData.token}` } : {};
  };

  const contextValue = useMemo(() => ({
    logIn,
    logOut,
    getAuthHeader,
    user,
    update,
  }), [user, logIn, logOut, getAuthHeader, update]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
