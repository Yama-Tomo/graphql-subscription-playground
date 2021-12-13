import { gql } from 'urql';

gql`
  subscription ChangeNotification {
    changeNotification {
      ... on ChangeChannelSubscriptionPayload {
        mutation
        data {
          id
          description
          isDM
          joinUsers {
            id
            name
          }
          name
          ownerId
        }
      }

      ... on ChangeMessageSubscriptionPayload {
        mutation
        data {
          id
          channelId
          text
          user {
            id
            name
          }
        }
      }
    }
  }
`;
