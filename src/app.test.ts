import request from 'supertest';

import app from './app';
import {HttpException} from './exceptions/exceptions';
import {getPullRequests, PullRequest} from './pull_requests';

jest.mock('./pull_requests');
const mockGH = getPullRequests as jest.MockedFunction<typeof getPullRequests>;

describe('/pull_requests', () => {
  beforeEach(() => {
    mockGH.mockReset();
  });

  it('should respond 200 to GET with owner and name', async () => {
    const testData = [
      {
        number: 1,
        html_url: 'http://example.com/1',
        commits: 5,
      },
    ];
    mockGH.mockResolvedValueOnce(testData);
    const response = await request(app).get(
      '/pull_requests/owner/test_owner_name/name/cool_repo'
    );
    expect(mockGH).toHaveBeenCalledTimes(1);
    expect(mockGH).toHaveBeenCalledWith('test_owner_name', 'cool_repo');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(testData);
  });

  it('should respond 200 to GET with owner and name even when data is empty', async () => {
    const testData: PullRequest[] = [];
    mockGH.mockResolvedValueOnce(testData);
    const response = await request(app).get(
      '/pull_requests/owner/test_owner_name/name/cool_repo'
    );
    expect(mockGH).toHaveBeenCalledTimes(1);
    expect(mockGH).toHaveBeenCalledWith('test_owner_name', 'cool_repo');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(testData);
  });

  it('should respond 404 when calls to github result in a 404 error ', async () => {
    mockGH.mockImplementationOnce(() => {
      throw new HttpException(404, 'not found');
    });
    const response = await request(app).get(
      '/pull_requests/owner/test_owner_name/name/cool_repo'
    );
    expect(mockGH).toHaveBeenCalledTimes(1);
    expect(mockGH).toHaveBeenCalledWith('test_owner_name', 'cool_repo');
    expect(response.statusCode).toBe(404);
    expect(response.text).toEqual('not found');
  });

  it('should respond 400 to GET without owner or name', async () => {
    const response = await request(app).get('/pull_requests');
    expect(response.statusCode).toBe(400);
  });

  it('should respond 400 to GET without owner', async () => {
    const response = await request(app).get(
      '/pull_requests/owner/test_owner_name'
    );
    expect(response.statusCode).toBe(400);
  });

  it('should respond 400 to GET without name', async () => {
    const response = await request(app).get('/pull_requests/name/cool_repo');
    expect(response.statusCode).toBe(400);
  });

  it('should respond 200 to POST with a valid URL in the body', async () => {
    const testData = [
      {
        number: 1,
        html_url: 'http://example.com/1',
        commits: 5,
      },
    ];
    mockGH.mockResolvedValueOnce(testData);
    const payload = {
      url: 'https://github.com/test_owner_name/cool_repo',
    };
    const response = await request(app).post('/pull_requests').send(payload);
    expect(mockGH).toHaveBeenCalledTimes(1);
    expect(mockGH).toHaveBeenCalledWith('test_owner_name', 'cool_repo');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(testData);
  });

  it('should respond 400 to POST with no URL in the body', async () => {
    const payload = {
      name: 'https://github.com',
    };
    const response = await request(app).post('/pull_requests').send(payload);
    expect(response.statusCode).toBe(400);
    expect(response.text).toContain('request body must contain a url');
  });

  it('should respond 400 to POST with un-parseable URL in the body', async () => {
    const payload = {
      url: 'https://github.com',
    };
    const response = await request(app).post('/pull_requests').send(payload);
    expect(response.statusCode).toBe(400);
    expect(response.text).toContain('unable to read repository owner or name');
  });
});

describe('other paths', () => {
  it('should respond 404 to GET with unrecognized path', async () => {
    const response = await request(app).get('/secret_stuff');
    expect(response.statusCode).toBe(404);
    expect(response.text).toContain('not found');
  });

  it('should take accept header into account when responding with 404', async () => {
    const response = await request(app)
      .get('/secret_stuff')
      .set('Accept', 'application/json');
    expect(response.statusCode).toBe(404);
    expect(response.body.error).toBe('not found');
  });

  it('should respond 404 to POST with unrecognized path', async () => {
    const response = await request(app).post('/secret_stuff');
    expect(response.statusCode).toBe(404);
  });
});
