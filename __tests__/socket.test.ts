import {io} from 'socket.io-client';
import {connectSocket, disconnectSocket} from '../src/halabsaudi/chat/socket';
jest.mock('../src/config/api', () => ({BASE_URL: 'https://example.test'}));
jest.mock('socket.io-client', () => ({io: jest.fn(() => ({connected: false, connect: jest.fn(), disconnect: jest.fn(), removeAllListeners: jest.fn(), on: jest.fn()}))}));
afterEach(() => {disconnectSocket(); jest.clearAllMocks();});
test('reconnect retains the socket and active screen listeners', () => {
  const first = connectSocket('token-a');
  const second = connectSocket('token-a');
  expect(first).toBe(second);
  expect(io).toHaveBeenCalledTimes(1);
  expect(first.removeAllListeners).not.toHaveBeenCalled();
  expect(first.connect).toHaveBeenCalled();
});
test('switching account creates a fresh authenticated socket', () => {
  const first = connectSocket('token-a');
  expect(connectSocket('token-b')).not.toBe(first);
  expect(first.disconnect).toHaveBeenCalled();
  expect(io).toHaveBeenCalledTimes(2);
});
