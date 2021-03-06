import { gql } from 'apollo-server-fastify';

const baseChannelProps = `
  id: ID!
  name: String!
  description: String
  joinUsers: [User!]!
  ownerId: ID!
  isDM: Boolean!
`;

const channel = gql`
  type Query {
    channels: [ChannelWithPersonalizedData!]!
  }

  type Mutation {
    createChannel(data: CreateChannelInput!): Channel!
    deleteChannel(id: ID!): Channel!
    inviteChannel(data: InviteChannelInput!): Channel!
    updateChannel(data: UpdateChannelInput!): Channel!
  }

  input CreateChannelInput {
    name: String!
    description: String
    isDM: Boolean!
    joinUsers: [ID!]
  }

  input InviteChannelInput {
    id: ID!
    userId: ID!
  }

  input UpdateChannelInput {
    id: ID!
    name: String!
    description: String
  }

  type Channel {
    ${baseChannelProps}
  }

  type ChannelWithPersonalizedData {
    ${baseChannelProps}
    unReadMessageCount: Int!
  }

  type ChangeChannelSubscriptionPayload {
    mutation: MutationType!
    data: Channel!
  }
`;

export { channel };
