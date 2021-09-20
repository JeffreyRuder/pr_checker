import superagent from 'superagent';

const githubUrl = 'https://api.github.com';
interface PullRequest {
  number: number;
  html_url: string;
  commits?: number;
}

const githubFetch = async (url: string): Promise<superagent.Response> => {
  return superagent
    .get(url)
    .accept('application/vnd.github.v3+json')
    .set('User-Agent', 'PR Checker');
};

const getCommitsForPullRequest = async (props: {
  owner: string;
  name: string;
  pullNumber: number;
}): Promise<PullRequest> => {
  const {owner, name, pullNumber} = props;
  const url = `${githubUrl}/repos/${owner}/${name}/pulls/${pullNumber}`;
  const pullResponse = await githubFetch(url);
  const pullRequest: PullRequest = pullResponse.body;
  return {
    number: pullRequest.number,
    html_url: pullRequest.html_url,
    commits: pullRequest.commits,
  };
};

export const pullRequests = async (
  owner: string,
  name: string
): Promise<PullRequest[]> => {
  // get all open pull requests for given repo and owner
  const url = `${githubUrl}/repos/${owner}/${name}/pulls?state=open`;
  const pullsResponse = await githubFetch(url);
  const openPullRequests: PullRequest[] = pullsResponse.body;

  if (openPullRequests.length === 0) {
    return openPullRequests;
  }

  // get more complete data including number of commits for all open pull requests
  const pullRequestsWithCommits = await Promise.all(
    openPullRequests.map(pr =>
      getCommitsForPullRequest({
        owner: owner,
        name: name,
        pullNumber: pr.number,
      })
    )
  );

  return pullRequestsWithCommits;
};
