// @ts-check

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';

import getUsers from '../__fixtures__/executors.js';
import getLabels from '../__fixtures__/labels.js';
import getStatuses from '../__fixtures__/statuses.js';

import mocks from '../mocks/mocks.js';

import init from '../src/init.jsx';

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

beforeEach(async () => {
  mocks.mockServer(server);
  global.localStorage.clear();
  const vdom = await init();
  render(vdom);
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

const user = {
  email: 'ivan@google.com',
  password: 'some-password',
};

const users = getUsers();
const labels = getLabels();
const taskStatuses = getStatuses();

describe('auth', () => {
  test('successful login', async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByRole('link', { name: /Вход/i }));
    expect(window.location.pathname).toBe('/login');
    expect(await screen.findByLabelText(/Email/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Пароль/i)).toBeInTheDocument();
    await u.type(await screen.findByLabelText(/Email/i), user.email);
    await u.type(await screen.findByLabelText(/Пароль/i), user.password);
    await u.click(await screen.findByRole('button', { name: /Войти/i }));
    await waitFor(() => {
      expect(window.location.pathname).toBe('/');
    });
  });
});

describe('work', () => {
  beforeEach(async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByRole('link', { name: /Вход/i }));
    await u.type(await screen.findByLabelText(/Email/i), user.email);
    await u.type(await screen.findByLabelText(/Пароль/i), user.password);
    await u.click(await screen.findByRole('button', { name: /Войти/i }));
  });

  test('create task status', async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByText(/Статусы/i));
    await u.click(await screen.findByText(/создать статус/i));
    await u.type(await screen.findByLabelText(/Наименование/i), 'новый статус');
    await u.click(await screen.findByRole('button', { name: /Создать/i }));
    expect(await screen.findByText('новый статус')).toBeInTheDocument();
    expect(await screen.findByText('Статус успешно создан')).toBeInTheDocument();
  });

  test('edit task status', async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByText(/Статусы/i));
    await u.click(screen.getAllByText('Изменить')[0]);
    expect(await screen.findByText('Изменение статуса')).toBeInTheDocument();
    await u.clear(await screen.findByLabelText(/Наименование/i));
    await u.type(await screen.findByLabelText(/Наименование/i), 'измененный статус');
    await u.click(await screen.findByRole('button', { name: /изменить/i }));
    expect(await screen.findByText('измененный статус')).toBeInTheDocument();
    expect(await screen.findByText('Статус успешно изменён')).toBeInTheDocument();
  });

  test('delete task status', async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByText(/Статусы/i));
    await u.click(screen.getAllByText('Удалить')[0]);
    await waitFor(() => {
      expect(screen.queryByText(taskStatuses[0].name)).not.toBeInTheDocument();
    });
  });

  test('create label', async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByText(/Метки/i));
    await u.click(await screen.findByText(/создать метку/i));
    await u.type(await screen.findByLabelText(/Наименование/i), 'новая метка');
    await u.click(await screen.findByRole('button', { name: /Создать/i }));
    expect(await screen.findByText('новая метка')).toBeInTheDocument();
    expect(await screen.findByText('Метка успешно создана')).toBeInTheDocument();
  });

  test('edit label', async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByText(/Метки/i));
    await u.click(screen.getAllByText('Изменить')[0]);
    expect(await screen.findByText('Изменение метки')).toBeInTheDocument();
    await u.clear(await screen.findByLabelText(/Наименование/i));
    await u.type(await screen.findByLabelText(/Наименование/i), 'измененная метка');
    await u.click(await screen.findByRole('button', { name: /изменить/i }));
    expect(await screen.findByText('измененная метка')).toBeInTheDocument();
    expect(await screen.findByText('Метка успешно изменена')).toBeInTheDocument();
  });

  test('delete label', async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByText(/Метки/i));
    await u.click(screen.getAllByText('Удалить')[0]);
    await waitFor(() => {
      expect(screen.queryByText(labels[0].name)).not.toBeInTheDocument();
    });
  });

  test('create task', async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByText(/Задачи/i));
    expect(await screen.findByText(/создать задачу/i)).toBeInTheDocument();
    await u.click(await screen.findByText(/создать задачу/i));
    await u.type(await screen.findByLabelText(/Наименование/i), 'новая задача1');
    await u.type(await screen.findByLabelText(/Описание/i), 'описание задачи');
    await u.selectOptions(screen.getByLabelText('Статус'), [taskStatuses[0].name]);
    await u.selectOptions(screen.getByRole('listbox', { name: 'Метки' }), [labels[0].name, labels[1].name]);
    await u.selectOptions(screen.getByLabelText('Исполнитель'), `${users[0].firstName} ${users[0].lastName}`);
    await u.click(await screen.findByRole('button', { name: /Создать/i }));
    expect(await screen.findByText('новая задача1')).toBeInTheDocument();
    expect(await screen.findAllByText(taskStatuses[0].name)).toHaveLength(3);
    expect(await screen.findAllByText(`${users[0].firstName} ${users[0].lastName}`)).toHaveLength(4);
    expect(await screen.findByText('Задача успешно создана')).toBeInTheDocument();
  });

  test('edit task', async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByText(/Задачи/i));
    await u.click(screen.getAllByText('Изменить')[0]);

    await u.clear(await screen.findByLabelText(/Наименование/i));
    await u.type(await screen.findByLabelText(/Наименование/i), 'новая задача 1');
    await u.clear(await screen.findByLabelText(/Описание/i));
    await u.type(await screen.findByLabelText(/Описание/i), 'описание задачи 1');
    await u.selectOptions(screen.getByLabelText('Статус'), [taskStatuses[1].name]);
    await u.selectOptions(screen.getByRole('listbox', { name: 'Метки' }), [labels[2].name]);
    await u.selectOptions(screen.getByLabelText('Исполнитель'), `${users[1].firstName} ${users[1].lastName}`);
    await u.click(await screen.findByRole('button', { name: /Изменить/i }));

    expect(await screen.findByText('новая задача 1')).toBeInTheDocument();
    expect(await screen.findAllByText(taskStatuses[1].name)).toHaveLength(2);
    expect(await screen.findByText(`${users[1].firstName} ${users[1].lastName}`)).toBeInTheDocument();
    expect(await screen.findByText('Задача успешно отредактирована')).toBeInTheDocument();
  });

  test('delete task', async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByText(/Задачи/i));
    await u.click(await screen.findByText(/создать задачу/i));
    await u.type(await screen.findByLabelText(/Наименование/i), 'новая задача remove');
    await u.type(await screen.findByLabelText(/Описание/i), 'описание задачи remove');
    await u.selectOptions(screen.getByLabelText('Статус'), [taskStatuses[0].name]);
    await u.selectOptions(screen.getByRole('listbox', { name: 'Метки' }), [labels[0].name, labels[1].name]);
    await u.selectOptions(screen.getByLabelText('Исполнитель'), `${users[0].firstName} ${users[0].lastName}`);
    await u.click(await screen.findByRole('button', { name: /Создать/i }));
    expect(await screen.findByText('новая задача remove')).toBeInTheDocument();

    const removeButtons = screen.getAllByText('Удалить');
    await u.click(removeButtons[removeButtons.length - 1]);
    await waitFor(() => {
      expect(screen.queryByText('новая задача remove')).not.toBeInTheDocument();
    });
  });
});

describe('user', () => {
  test('create user', async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByText(/Регистрация/i));
    await u.type(await screen.findByLabelText(/Имя/i), 'FirstName');
    await u.type(await screen.findByLabelText(/Фамилия/i), 'LastName');
    await u.type(await screen.findByLabelText(/Email/i), 'test_email@google.com');
    await u.type(await screen.findByLabelText(/Пароль/i), 'password');
    await u.click(await screen.findByText(/Сохранить/i));
    expect(await screen.findByText('Успешная регистрация')).toBeInTheDocument();

    await u.click(await screen.findByText(/Пользователи/i));

    expect(await screen.findByText('FirstName LastName')).toBeInTheDocument();
    expect(await screen.findByText('test_email@google.com')).toBeInTheDocument();
  });

  test('edit user', async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByRole('link', { name: /Вход/i }));
    await u.type(await screen.findByLabelText(/Email/i), user.email);
    await u.type(await screen.findByLabelText(/Пароль/i), user.password);
    await u.click(await screen.findByRole('button', { name: /Войти/i }));
    expect(await screen.findByText('Вы авторизованы')).toBeInTheDocument();

    await u.click(await screen.findByRole('link', { name: /Пользователи/i }));

    expect(await screen.findByText('Полное имя')).toBeInTheDocument();

    await u.click(screen.getAllByText('Изменить')[0]);

    await u.clear(await screen.findByLabelText(/Имя/i));
    await u.type(await screen.findByLabelText(/Имя/i), 'FirstName edit');
    await u.clear(await screen.findByLabelText(/Фамилия/i));
    await u.type(await screen.findByLabelText(/Фамилия/i), 'LastName edit');
    await u.clear(await screen.findByLabelText(/Email/i));
    await u.type(await screen.findByLabelText(/Email/i), 'test_email_edit@google.com');
    await u.clear(await screen.findByLabelText(/Пароль/i));
    await u.type(await screen.findByLabelText(/Пароль/i), 'password');
    await u.click(await screen.findByText(/Изменить/i));

    expect(await screen.findByText('Пользователь успешно изменён')).toBeInTheDocument();
    expect(await screen.findByText('FirstName edit LastName edit')).toBeInTheDocument();
    expect(await screen.findByText('test_email_edit@google.com')).toBeInTheDocument();
  });

  test('delete user', async () => {
    const u = userEvent.setup();
    await u.click(await screen.findByText(/Пользователи/i));
    const removeButtons = screen.getAllByText('Удалить');
    await u.click(removeButtons[0]);
    await waitFor(() => {
      expect(screen.queryByText(`${users[0].firstName} ${users[0].lastName}`)).not.toBeInTheDocument();
    });
  });
});
