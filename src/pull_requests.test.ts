import nock from 'nock';

import testPull from '../test_data/gh_get_pull.json';
import testPulls from '../test_data/gh_list_pulls.json';
import {HttpException} from './exceptions/exceptions';
import {getPullRequests, githubUrl} from './pull_requests';

describe('getPullRequests', () => {
  beforeEach(() => {
    nock.cleanAll();
  });

  it('returns an empty array when github returns no pull requests', async () => {
    nock(githubUrl)
      .get('/repos/test_owner/test_name/pulls?state=open')
      .reply(200, []);
    const response = await getPullRequests('test_owner', 'test_name');
    expect(response).toEqual([]);
    expect(response.length).toEqual(0);
  });

  it('returns combined and simplified data when github returns data', async () => {
    nock(githubUrl)
      .get('/repos/test_owner/test_name/pulls?state=open')
      .reply(200, testPulls);
    nock(githubUrl)
      .persist()
      .get(uri => uri.includes('/repos/test_owner/test_name/pulls'))
      .reply(200, testPull);

    const response = await getPullRequests('test_owner', 'test_name');
    expect(response.length).toEqual(testPulls.length);
    response.forEach(pr => {
      expect(pr).toEqual({
        number: 657,
        html_url: 'https://github.com/google/gts/pull/657',
        commits: 1,
      });
    });
  });

  it('results in an error when github cannot find the repo', async () => {
    nock(githubUrl)
      .get('/repos/test_owner/test_name/pulls?state=open')
      .reply(404, {message: 'Not Found'});

    await expect(
      getPullRequests('test_owner', 'test_name')
    ).rejects.toThrowError(new HttpException(404, 'Not Found'));
  });

  it('results in an error when github finds the repo, but not one of the PRs', async () => {
    nock(githubUrl)
      .get('/repos/test_owner/test_name/pulls?state=open')
      .reply(200, testPulls);
    nock(githubUrl)
      .get(uri => uri.includes('/repos/test_owner/test_name/pulls'))
      .reply(200, testPull);
    nock(githubUrl)
      .persist()
      .get(uri => uri.includes('/repos/test_owner/test_name/pulls'))
      .reply(404, 'Not Found');

    await expect(
      getPullRequests('test_owner', 'test_name')
    ).rejects.toThrowError(new HttpException(404, 'Not Found'));
  });

  it('results in an error when github indicates user is unauthorized', async () => {
    nock(githubUrl)
      .get('/repos/test_owner/test_name/pulls?state=open')
      .reply(403, {message: 'Forbidden'});

    await expect(
      getPullRequests('test_owner', 'test_name')
    ).rejects.toThrowError(new HttpException(403, 'Forbidden'));
  });
});
