import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { UseQueryArgs, UseQueryResponse } from 'urql';

type TypedUseQueryArgs<T> = T extends TypedDocumentNode<infer Data, infer Variables>
  ? Omit<UseQueryArgs<Variables, Data>, 'query'> & { query: T }
  : never;

type TypedUseQueryResponse<T> = T extends TypedDocumentNode<infer Data, infer Variables>
  ? UseQueryResponse<Data, Variables>
  : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TypedUseQueryResult<T> = T extends TypedDocumentNode<infer Data, any> ? Data : never;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTypedDocNode = TypedDocumentNode<any, any>;

export type { TypedUseQueryArgs, TypedUseQueryResponse, TypedUseQueryResult, AnyTypedDocNode };
