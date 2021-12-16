import { gql } from 'apollo-server-fastify';

const message = gql`
  type Query {
    messages(channelId: ID!, last: Int!, before: String): MessageConnection!
  }

  type MessageEdge {
    node: Message!
    cursor: String!
  }

  type MessageConnection {
    edges: [MessageEdge!]!
    pageInfo: PageInfo!
  }

  type Mutation {
    createMessage(data: CreateMessageInput!): Message!
    deleteMessage(id: ID!): Message!
    updateMessage(data: UpdateMessageInput!): Message!
  }

  input CreateMessageInput {
    channelId: ID!
    text: String!
  }

  input UpdateMessageInput {
    id: ID!
    text: String!
  }

  type Message {
    id: ID!
    channelId: ID!
    user: User!
    text: String!
    date: DateTime!
    isRead: Boolean!
    readUsers: [User!]!
  }

  type ChangeMessageSubscriptionPayload {
    mutation: MutationType!
    data: Message!
  }
`;

export { message };
