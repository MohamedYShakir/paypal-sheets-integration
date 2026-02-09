import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const syncTransactions = () => API.get('/sync');
export const getSheetData = () => API.get('/data');
