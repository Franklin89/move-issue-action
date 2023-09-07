import { graphql } from "@octokit/graphql";

const updateCardColumnMutation = `mutation($projectId: ID!, $cardId: ID!, $fieldId: ID!, $fieldValue: String) {
    updateProjectV2ItemFieldValue(
      input: {projectId: $projectId, itemId: $cardId, fieldId: $fieldId, value: {singleSelectOptionId: $fieldValue}}
    ) {
      clientMutationId
    }
  }`;

export async function moveCardToColumn(projectId: string, cardId: string, fieldId: string, fieldValue: string, accessToken: string) {
    return graphql(updateCardColumnMutation, {
        projectId: projectId,
        cardId: cardId,
        fieldId: fieldId,
        fieldValue: fieldValue,
        headers: {
            authorization: `bearer ${accessToken}`,
        }
    });
}