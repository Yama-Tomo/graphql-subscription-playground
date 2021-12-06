import { gql } from 'urql';

const MyChannels = gql`
  query MyChannels {
    channels {
      id
      name
      isDM
      ownerId
    }
  }
`;

const CreateChannel = gql`
  mutation CreateChannel($name: String!, $description: String) {
    createChannel(data: { name: $name, description: $description }) {
      id
      isDM
      joinUsers
      description
      name
      ownerId
    }
  }
`;

export { MyChannels, CreateChannel };
