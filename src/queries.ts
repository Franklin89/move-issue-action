import { graphql } from '@octokit/graphql'

const issueIdsForIssue = `query($issueNumber: Int!) {
  repository(owner:"franklin89", name:"cicd-automation") {
    issue (number: $issueNumber) {
      id
    }
  }
}`

const cardIdsForIssue = `query($issueId: ID!) {
  node(id: $issueId) {
      ... on Issue {
        projectItems(first: 100) {
          edges {
            node {
              id
              fieldValueByName(name: "Status") {
                __typename
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  description
                }
              }
              project {
                id
                title
              }
            }
          }
        }
      }
    }
  }`

const columnsForProject = `query($projectId: ID!) {
  node(id: $projectId) {
    ... on ProjectV2 {
      fields(first: 20) {
        nodes {
          ... on ProjectV2SingleSelectField  {
            id
            name
            options {
              id
              name
            }
          }
        }
      }
    }
  }
}`

export async function getCardsForIssue(issueId: string, accessToken: string) {
  return graphql(cardIdsForIssue, {
    issueId: issueId,
    headers: {
      authorization: `bearer ${accessToken}`
    }
  })
}

export async function getIssueId(issueNumber: number, accessToken: string) {
  return graphql(issueIdsForIssue, {
    issueNumber: issueNumber,
    headers: {
      authorization: `bearer ${accessToken}`
    }
  })
}

export async function getColumnsForProject(
  projectId: string,
  accessToken: string
) {
  return graphql(columnsForProject, {
    projectId: projectId,
    headers: {
      authorization: `bearer ${accessToken}`
    }
  })
}
