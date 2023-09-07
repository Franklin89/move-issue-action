import * as core from "@actions/core";
import { Octokit } from "@octokit/rest";
import * as queries from "./queries"
import * as mutations from "./mutations"
import * as restApi from "./rest"

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const owner: string = core.getInput('owner');
    const repo: string = core.getInput('repo');
    const since_tag: string = core.getInput('since_tag');

    const octokit = new Octokit({
      auth: core.getInput('github_token'),
    });

    // Fetch commits from the main branch
    const commits = await restApi.getCommitsSinceTag(octokit, owner, repo, since_tag);
    core.info(`Found ${commits.length} commits since tag ${since_tag}`);


    // Filter and extract PR numbers
    const prNumbers: number[] = [];
    for (const commit of commits) {
      const prMatch = commit.commit.message.match(/\(#(\d+)\)$/);
      if (prMatch) {
        prNumbers.push(parseInt(prMatch[1], 10));
      }
    }
    core.info(`Found ${prNumbers.length} PRs in main since tag ${since_tag}: [${prNumbers.join(", ")}]`);

  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
