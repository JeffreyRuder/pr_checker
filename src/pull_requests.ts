import superagent, {Response} from 'superagent';

const githubUrl = 'https://api.github.com';
interface PullRequest {
  number: number;
  html_url: string;
  commits?: number;
}

type CommitCountProps = {
  owner: string;
  name: string;
  pullNumber: number;
};

export const githubFetch = async (url: string): Promise<Response> => {
  return superagent
    .get(url)
    .accept('application/vnd.github.v3+json')
    .set('User-Agent', 'PR Checker');
};

const getCommitCount = async (
  props: CommitCountProps
): Promise<PullRequest> => {
  const {owner, name, pullNumber} = props;
  const url = `${githubUrl}/repos/${owner}/${name}/pulls/${pullNumber}`;
  const response = await githubFetch(url);
  const pullRequest: PullRequest = response.body;
  return {
    number: pullRequest.number,
    html_url: pullRequest.html_url,
    commits: pullRequest.commits,
  };
};

export const getPullRequests = async (
  owner: string,
  name: string
): Promise<PullRequest[]> => {
  // get all open pull requests for given repo and owner
  const url = `${githubUrl}/repos/${owner}/${name}/pulls?state=open`;
  const response = await githubFetch(url);
  const openPullRequests: PullRequest[] = response.body;

  if (openPullRequests.length === 0) {
    return openPullRequests;
  }

  // get more complete data including number of commits for all open pull requests
  const pullRequestsWithCommits = await Promise.all(
    openPullRequests.map(pr =>
      getCommitCount({
        owner: owner,
        name: name,
        pullNumber: pr.number,
      })
    )
  );

  return pullRequestsWithCommits;
};
