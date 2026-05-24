import _ from 'lodash';
import { http, HttpResponse } from 'msw';

import getUsers from '../__fixtures__/executors.js';
import getLabels from '../__fixtures__/labels.js';
import getStatuses from '../__fixtures__/statuses.js';
import getTasks from '../__fixtures__/tasks.js';

const mockSingin = () => HttpResponse.json({ token: 'token' }, { status: 201 });

const mockSignup = () => HttpResponse.json({ token: 'token' });

const mockServer = (server) => {
  const tasks = getTasks();
  const users = getUsers();
  const labels = getLabels();
  const taskStatuses = getStatuses();

  server.use(
    http.post('/api/login', mockSingin),

    http.post('/api/statuses', async ({ request }) => {
      const body = await request.json();
      const result = {
        ...body,
        id: _.uniqueId('test_'),
        createdAt: Date.now(),
      };
      return HttpResponse.json(result);
    }),
    http.get('/api/statuses', () => HttpResponse.json(taskStatuses)),
    http.get('/api/statuses/:taskStatusId', ({ params }) => {
      const { taskStatusId } = params;
      const result = taskStatuses.find((status) => status.id.toString() === taskStatusId);
      return HttpResponse.json(result);
    }),
    http.put('/api/statuses/:taskStatusId', async ({ params, request }) => {
      const { taskStatusId } = params;
      const currentItem = taskStatuses.find((status) => status.id.toString() === taskStatusId);
      const body = await request.json();
      const result = { ...currentItem, ...body };
      return HttpResponse.json(result);
    }),
    http.delete('/api/statuses/:taskStatusId', () => new HttpResponse(null, { status: 200 })),

    http.post('/api/labels', async ({ request }) => {
      const body = await request.json();
      const result = {
        ...body,
        id: _.uniqueId('test_'),
        createdAt: Date.now(),
      };
      return HttpResponse.json(result);
    }),
    http.get('/api/labels', () => HttpResponse.json(labels)),
    http.get('/api/labels/:taskLabelId', ({ params }) => {
      const { taskLabelId } = params;
      const result = labels.find((label) => label.id.toString() === taskLabelId);
      return HttpResponse.json(result);
    }),
    http.put('/api/labels/:taskLabelId', async ({ params, request }) => {
      const { taskLabelId } = params;
      const currentItem = labels.find((label) => label.id.toString() === taskLabelId);
      const body = await request.json();
      const result = { ...currentItem, ...body };
      return HttpResponse.json(result);
    }),
    http.delete('/api/labels/:id', () => new HttpResponse(null, { status: 200 })),

    http.post('/api/tasks', async ({ request }) => {
      const body = await request.json();
      const result = {
        ...body,
        id: _.uniqueId('test_'),
        createdAt: Date.now(),
        author: { id: users[0].id },
        taskStatus: { id: body.taskStatusId },
      };
      return HttpResponse.json(result);
    }),
    http.get('/api/tasks', () => HttpResponse.json(tasks)),
    http.get('/api/tasks/:taskId', ({ params }) => {
      const { taskId } = params;
      const result = tasks.find((task) => task.id.toString() === taskId);
      return HttpResponse.json(result);
    }),
    http.put('/api/tasks/:taskId', async ({ params, request }) => {
      const { taskId } = params;
      const currentItem = tasks.find((task) => task.id.toString() === taskId);
      const body = await request.json();
      const result = {
        ...currentItem,
        ...body,
        taskStatus: { check: 'hello', id: body.taskStatusId },
      };
      return HttpResponse.json(result);
    }),
    http.delete('/api/tasks/:id', () => new HttpResponse(null, { status: 200 })),

    http.post('/api/users', async ({ request }) => {
      const body = await request.json();
      const result = {
        ...body,
        id: _.uniqueId('test_'),
        createdAt: Date.now(),
      };
      return HttpResponse.json(result);
    }),
    http.get('/api/users', () => HttpResponse.json(users)),
    http.get('/api/users/:userId', ({ params }) => {
      const { userId } = params;
      const result = users.find((u) => u.id.toString() === userId);
      return HttpResponse.json(result);
    }),
    http.put('/api/users/:userId', async ({ params, request }) => {
      const { userId } = params;
      const currentItem = users.find((u) => u.id.toString() === userId);
      const body = await request.json();
      const result = { ...currentItem, ...body };
      return HttpResponse.json(result);
    }),
    http.delete('/api/users/:id', () => new HttpResponse(null, { status: 200 })),
  );
  server.listen({
    onUnhandledRequest: 'warn',
  });
};

export default {
  mockServer,
};
