const { contextBridge, ipcRenderer } = require('electron');

const call = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('api', {
  getRepo: () => call('repo:get'),
  chooseRepo: () => call('repo:choose'),
  listFiles: () => call('files:list'),
  loadConfig: (file) => call('config:load', file),
  resolveDouyin: (text) => call('douyin:resolve', text),
  createFile: (payload) => call('file:create', payload),
  addPage: (payload) => call('page:add', payload),
  updatePage: (payload) => call('page:update', payload),
  deletePage: (payload) => call('page:delete', payload),
  addItem: (payload) => call('item:add', payload),
  updateItem: (payload) => call('item:update', payload),
  deleteItem: (payload) => call('item:delete', payload),
  push: (message) => call('git:push', message),
});
