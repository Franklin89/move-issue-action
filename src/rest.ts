import { Octokit } from '@octokit/rest'

export async function getCommitsSinceTag(
  octokit: Octokit,
  owner: string,
  repo: string,
  sinceTag: string
) {
  // Get the commit SHA for the tag
  const tagRef = await octokit.git.getRef({
    owner,
    repo,
    ref: `tags/${sinceTag}`
  })

  const tagCommitSha = tagRef.data.object.sha

  let commitsAfterTag: Array<any> = []
  let page = 1

  while (true) {
    const commits = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 100,
      page: page
    })

    if (!commits.data.length) {
      break
    }

    for (let commit of commits.data) {
      if (commit.sha === tagCommitSha) {
        // If the current commit SHA matches the tag's commit SHA, stop the process
        return commitsAfterTag
      }

      commitsAfterTag.push(commit)
    }

    page++
  }

  return commitsAfterTag
}
