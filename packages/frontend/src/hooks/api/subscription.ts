import { gql } from 'urql';

gql`
  subscription ChangeNotification {
    changeNotification {
      ... on ChangeChannelSubscriptionPayload {
        mutation
        data {
          ...ChannelFragment
        }
      }

      ... on ChangeMessageSubscriptionPayload {
        mutation
        data {
          ...MessageFragment
        }
      }
    }
  }
`;
