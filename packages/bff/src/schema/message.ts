const message = `
  type Mutation {
    createMessage(data: CreateMessageInput!): Message!
    deleteMessage(id: ID!): Message!
    updateMessage(data: UpdateMessageInput!): Message!
  }

  type Subscription {
    changeMessage: ChangeMessageSubscriptionPayload!
  }

  input CreateMessageInput {
    channelId: ID!
    userId: String!
    text: String!
  }

  input UpdateMessageInput {
    id: ID!
    userId: String!
    text: String!
  }

  type Message {
    id: ID!
    channelId: ID!
    userId: String!
    text: String!
  }

  type ChangeMessageSubscriptionPayload {
    mutation: MutationType!
    data: Message!
  }
`;

export { message };
