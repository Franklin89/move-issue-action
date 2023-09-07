import { Octokit } from "@octokit/rest";

export async function getCommitsSinceTag(octokit: Octokit, owner: string, repo: string, sinceTag: string) {
    // First get the commit sha for the tag
    const { data: tag } = await octokit.git.getRef({
        owner,
        repo,
        ref: `tags/${sinceTag}`
    });

    const tagSha = tag.object.sha;

    // Now fetch the commits since that tag
    const commits: any[] = [];
    let page = 1;

    while (true) {
        const { data: currentCommits } = await octokit.repos.listCommits({
            owner,
            repo,
            since: tagSha,
            per_page: 100,
            page: page
        });

        if (currentCommits.length === 0) break;

        commits.push(...currentCommits);

        if (currentCommits.length < 100) break;

        page++;
    }

    return commits;
}