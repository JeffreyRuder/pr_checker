import express, {json, NextFunction, Request, Response} from 'express';
import asyncHandler from 'express-async-handler';
import gitUrlParse from 'git-url-parse';

import {HttpException} from './exceptions/exceptions';
import {pullRequests} from './pull_requests';

const app = express();

app.use(json());

app.get(
  '/pull_requests/owner/:owner/name/:name',
  asyncHandler(async (req, res) => {
    console.log('in handler');
    const prData = await pullRequests(req.params.owner, req.params.name);
    res.status(200).json(prData);
  })
);

app.get('/pull_requests*', (req, res) => {
  res.status(400).send('owner and name are required');
});

app.post(
  '/pull_requests',
  asyncHandler(async (req, res) => {
    if (!req.body || !req.body.url) {
      throw new HttpException(400, 'request body must contain a url');
    }

    const {owner, name} = gitUrlParse(req.body.url);
    if (!owner || !name) {
      throw new HttpException(400, 'unable to read repository owner or name');
    }

    const prData = await pullRequests(owner, name);
    res.status(200).json(prData);
  })
);

// no routes matched, so respond 404
app.use((req, res) => {
  res.status(404);
  res.format({
    json: () => res.json({error: 'not found'}),
    default: () => res.type('txt').send('not found'),
  });
});

// error handler
app.use(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (err: HttpException, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status);
    res.send(err.message || 'internal server error');
  }
);

export default app;
