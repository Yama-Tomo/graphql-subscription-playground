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
    readMessages(data: [ReadMessageInput!]!): [ReadMessage!]!
  }

  input CreateMessageInput {
    channelId: ID!
    text: String!
  }

  input UpdateMessageInput {
    id: ID!
    text: String!
  }

  input ReadMessageInput {
    id: ID!
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

  type ReadMessage {
    id: ID!
  }

  type ReadMessageUsers {
    id: ID!
    readUsers: [User!]!
  }

  type ChangeMessageSubscriptionPayload {
    mutation: MutationType!
    data: Message!
  }

  type ChangeMessageReadStateSubscriptionPayload {
    mutation: MutationType!
    data: ReadMessageUsers!
  }
`;

export { message };
