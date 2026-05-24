// @ts-check
import { createRoot } from 'react-dom/client';
import init from './init.jsx';
import './index.scss';

if (import.meta.env.DEV) {
  localStorage.debug = 'frontend:*';
}

const app = async () => {
  const vdom = await init();
  const root = createRoot(document.querySelector('#container'));
  root.render(vdom);
  return vdom;
};

app();
