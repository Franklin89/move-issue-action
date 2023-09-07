import * as core from '@actions/core'
import { Octokit } from '@octokit/rest'
import * as queries from './queries'
import * as mutations from './mutations'
import * as restApi from './rest'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const owner: string = core.getInput('owner')
    const repo: string = core.getInput('repo')
    const since_tag: string = core.getInput('since_tag')
    const github_token: string = core.getInput('github_token')

    const octokit = new Octokit({
      auth: github_token
    })

    // Fetch commits from the main branch
    const commits = await restApi.getCommitsSinceTag(
      octokit,
      owner,
      repo,
      since_tag
    )
    core.info(`Found ${commits.length} commits since tag ${since_tag}`)

    // Filter and extract PR numbers
    const prNumbers: number[] = []
    for (const commit of commits) {
      const prMatch = commit.commit.message.match(/\(#(\d+)\)$/)
      if (prMatch) {
        prNumbers.push(parseInt(prMatch[1], 10))
      }
    }
    core.info(
      `Found ${
        prNumbers.length
      } PRs in main since tag ${since_tag}: [${prNumbers.join(', ')}]`
    )

    // Fetch PRs and list associated issues (assuming the PR description has "Fixes #issue_number")
    const issues: number[] = []
    for (const prNumber of prNumbers) {
      const pr = await octokit.pulls.get({
        owner,
        repo,
        pull_number: prNumber
      })

      if (pr.data.body) {
        const issueMatch = pr.data.body!.match(
          /(?:closes|fixes|resolved) #(\d+)/i
        )
        if (issueMatch) {
          issues.push(parseInt(issueMatch[1], 10))
        }
      }
    }
    core.info(
      `Found ${
        issues.length
      } issues associated with PRs in main since tag ${since_tag}: [${issues.join(
        ', '
      )}]`
    )

    for (const issue of issues) {
      const issueId: any = await queries.getIssueId(issue, github_token)
      const cards: any = await queries.getCardsForIssue(
        issueId.repository.issue.id,
        github_token
      )

      for (const node of cards.node.projectItems.edges) {
        const columns: any = await queries.getColumnsForProject(
          node.node.project.id,
          github_token
        )
        const statusField: any = columns.node.fields.nodes.find(
          (node: any) => node.name === 'Status'
        ) // TODO: Make this configurable
        const statusFieldValue: any = statusField.options.find(
          (node: any) => node.name === 'Released'
        ) // TODO: Make this configurable

        await mutations.moveCardToColumn(
          node.node.project.id,
          node.node.id,
          statusField.id,
          statusFieldValue.id,
          github_token
        )

        core.info(
          `Moved issue #${issue} to column: ${statusFieldValue.name} in project ${node.node.project.title} (${node.node.project.id})`
        )
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run()
