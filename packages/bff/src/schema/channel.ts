const channel = `
  type Mutation {
    createChannel(data: CreateChannelInput!): Channel!
    deleteChannel(id: ID!): Channel!
    inviteChannel(data: InviteChannelInput!): Channel!
    updateChannel(data: UpdateChannelInput!): Channel!
  }

  input CreateChannelInput {
    name: String!
    description: String
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
    id: ID!
    name: String!
    description: String
    joinUsers: [ID!]!
    ownerId: ID!
    isDM: Boolean!
  }

  type ChangeChannelSubscriptionPayload {
    mutation: MutationType!
    data: Channel!
  }
`;

export { channel };
