import supertest from 'supertest';
import { Express } from 'express';

// Same shape as supertest's default export, but every request carries the
// header the CSRF middleware requires. A fresh agent per call keeps cookies
// from leaking between requests.
const request = (app: Express) =>
  supertest.agent(app).set('X-Requested-With', 'XMLHttpRequest');

export default request;
