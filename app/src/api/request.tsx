import axios from 'axios';
import { getHost } from '../urlFactory';

export const request = axios.create({
  baseURL: `${location.protocol}//${getHost()}`,
});
