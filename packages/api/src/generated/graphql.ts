import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { AuthorRow, IssueRow, LinkRow, LinkSubmissionRow, SubscriberRow, TopicRow } from '../db/types';
import { GraphQLContext } from '../worker';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: Date; output: Date; }
};

export type Author = {
  __typename?: 'Author';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  issues?: Maybe<Array<Issue>>;
  name?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Issue = {
  __typename?: 'Issue';
  author?: Maybe<Author>;
  authorId?: Maybe<Scalars['String']['output']>;
  comment?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['Int']['output']>;
  previewImage?: Maybe<Scalars['String']['output']>;
  published?: Maybe<Scalars['Boolean']['output']>;
  specialPerk?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  topics?: Maybe<Array<Topic>>;
  versionCount?: Maybe<Scalars['Int']['output']>;
};

export type Link = {
  __typename?: 'Link';
  id?: Maybe<Scalars['String']['output']>;
  position?: Maybe<Scalars['Int']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  topic?: Maybe<Topic>;
  topicId?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type LinkSubmission = {
  __typename?: 'LinkSubmission';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type Me = {
  __typename?: 'Me';
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  image?: Maybe<Scalars['String']['output']>;
  isCollaborator: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  repositoryUrl: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addLinksToTopic?: Maybe<Topic>;
  createIssue?: Maybe<Issue>;
  createLink?: Maybe<Link>;
  createSubmissionLink?: Maybe<LinkSubmission>;
  createSubscriber?: Maybe<Subscriber>;
  createTopic?: Maybe<Topic>;
  deleteIssue?: Maybe<Issue>;
  deleteLink?: Maybe<Link>;
  publishEmailDraft?: Maybe<Issue>;
  updateIssue?: Maybe<Issue>;
  updateLink?: Maybe<Link>;
  updateTopic?: Maybe<Topic>;
  updateTopicWhenIssueDeleted?: Maybe<Topic>;
};


export type MutationAddLinksToTopicArgs = {
  linkId: Scalars['String']['input'];
  topicId: Scalars['String']['input'];
};


export type MutationCreateIssueArgs = {
  date?: InputMaybe<Scalars['DateTime']['input']>;
  number: Scalars['Int']['input'];
  published: Scalars['Boolean']['input'];
  title: Scalars['String']['input'];
};


export type MutationCreateLinkArgs = {
  url: Scalars['String']['input'];
};


export type MutationCreateSubmissionLinkArgs = {
  description: Scalars['String']['input'];
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  title: Scalars['String']['input'];
  url: Scalars['String']['input'];
};


export type MutationCreateSubscriberArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreateTopicArgs = {
  issueId: Scalars['String']['input'];
  issue_comment: Scalars['String']['input'];
  title: Scalars['String']['input'];
};


export type MutationDeleteIssueArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteLinkArgs = {
  id: Scalars['String']['input'];
};


export type MutationPublishEmailDraftArgs = {
  id: Scalars['String']['input'];
  isFoundation?: InputMaybe<Scalars['Boolean']['input']>;
  versionCount?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationUpdateIssueArgs = {
  id: Scalars['String']['input'];
  previewImage?: InputMaybe<Scalars['String']['input']>;
  published?: InputMaybe<Scalars['Boolean']['input']>;
  versionCount?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationUpdateLinkArgs = {
  id: Scalars['String']['input'];
  text?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
  url?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateTopicArgs = {
  id: Scalars['String']['input'];
  position?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationUpdateTopicWhenIssueDeletedArgs = {
  id: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  allAuthors?: Maybe<Array<Author>>;
  allIssues?: Maybe<Array<Issue>>;
  allLinkSubmissions?: Maybe<Array<LinkSubmission>>;
  allLinks?: Maybe<Array<Link>>;
  allSubscribers?: Maybe<Array<Subscriber>>;
  allTopics?: Maybe<Array<Topic>>;
  issue?: Maybe<Issue>;
  me?: Maybe<Me>;
};


export type QueryIssueArgs = {
  id: Scalars['String']['input'];
};

export type Subscriber = {
  __typename?: 'Subscriber';
  email?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type Topic = {
  __typename?: 'Topic';
  id?: Maybe<Scalars['String']['output']>;
  issue?: Maybe<Issue>;
  issueId?: Maybe<Scalars['String']['output']>;
  issue_comment?: Maybe<Scalars['String']['output']>;
  links?: Maybe<Array<Link>>;
  position?: Maybe<Scalars['Int']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = Record<PropertyKey, never>, TParent = Record<PropertyKey, never>, TContext = Record<PropertyKey, never>, TArgs = Record<PropertyKey, never>> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;





/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Author: ResolverTypeWrapper<AuthorRow>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Issue: ResolverTypeWrapper<IssueRow>;
  Link: ResolverTypeWrapper<LinkRow>;
  LinkSubmission: ResolverTypeWrapper<LinkSubmissionRow>;
  Me: ResolverTypeWrapper<Me>;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Subscriber: ResolverTypeWrapper<SubscriberRow>;
  Topic: ResolverTypeWrapper<TopicRow>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Author: AuthorRow;
  Boolean: Scalars['Boolean']['output'];
  DateTime: Scalars['DateTime']['output'];
  Int: Scalars['Int']['output'];
  Issue: IssueRow;
  Link: LinkRow;
  LinkSubmission: LinkSubmissionRow;
  Me: Me;
  Mutation: Record<PropertyKey, never>;
  Query: Record<PropertyKey, never>;
  String: Scalars['String']['output'];
  Subscriber: SubscriberRow;
  Topic: TopicRow;
};

export type AuthorResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Author'] = ResolversParentTypes['Author']> = {
  avatarUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  issues?: Resolver<Maybe<Array<ResolversTypes['Issue']>>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type IssueResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Issue'] = ResolversParentTypes['Issue']> = {
  author?: Resolver<Maybe<ResolversTypes['Author']>, ParentType, ContextType>;
  authorId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  number?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  previewImage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  published?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  specialPerk?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  topics?: Resolver<Maybe<Array<ResolversTypes['Topic']>>, ParentType, ContextType>;
  versionCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
};

export type LinkResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Link'] = ResolversParentTypes['Link']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  position?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  topic?: Resolver<Maybe<ResolversTypes['Topic']>, ParentType, ContextType>;
  topicId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type LinkSubmissionResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['LinkSubmission'] = ResolversParentTypes['LinkSubmission']> = {
  createdAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type MeResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Me'] = ResolversParentTypes['Me']> = {
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isCollaborator?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  repositoryUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  addLinksToTopic?: Resolver<Maybe<ResolversTypes['Topic']>, ParentType, ContextType, RequireFields<MutationAddLinksToTopicArgs, 'linkId' | 'topicId'>>;
  createIssue?: Resolver<Maybe<ResolversTypes['Issue']>, ParentType, ContextType, RequireFields<MutationCreateIssueArgs, 'number' | 'published' | 'title'>>;
  createLink?: Resolver<Maybe<ResolversTypes['Link']>, ParentType, ContextType, RequireFields<MutationCreateLinkArgs, 'url'>>;
  createSubmissionLink?: Resolver<Maybe<ResolversTypes['LinkSubmission']>, ParentType, ContextType, RequireFields<MutationCreateSubmissionLinkArgs, 'description' | 'email' | 'name' | 'title' | 'url'>>;
  createSubscriber?: Resolver<Maybe<ResolversTypes['Subscriber']>, ParentType, ContextType, RequireFields<MutationCreateSubscriberArgs, 'email' | 'name'>>;
  createTopic?: Resolver<Maybe<ResolversTypes['Topic']>, ParentType, ContextType, RequireFields<MutationCreateTopicArgs, 'issueId' | 'issue_comment' | 'title'>>;
  deleteIssue?: Resolver<Maybe<ResolversTypes['Issue']>, ParentType, ContextType, RequireFields<MutationDeleteIssueArgs, 'id'>>;
  deleteLink?: Resolver<Maybe<ResolversTypes['Link']>, ParentType, ContextType, RequireFields<MutationDeleteLinkArgs, 'id'>>;
  publishEmailDraft?: Resolver<Maybe<ResolversTypes['Issue']>, ParentType, ContextType, RequireFields<MutationPublishEmailDraftArgs, 'id'>>;
  updateIssue?: Resolver<Maybe<ResolversTypes['Issue']>, ParentType, ContextType, RequireFields<MutationUpdateIssueArgs, 'id'>>;
  updateLink?: Resolver<Maybe<ResolversTypes['Link']>, ParentType, ContextType, RequireFields<MutationUpdateLinkArgs, 'id' | 'title'>>;
  updateTopic?: Resolver<Maybe<ResolversTypes['Topic']>, ParentType, ContextType, RequireFields<MutationUpdateTopicArgs, 'id'>>;
  updateTopicWhenIssueDeleted?: Resolver<Maybe<ResolversTypes['Topic']>, ParentType, ContextType, RequireFields<MutationUpdateTopicWhenIssueDeletedArgs, 'id'>>;
};

export type QueryResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  allAuthors?: Resolver<Maybe<Array<ResolversTypes['Author']>>, ParentType, ContextType>;
  allIssues?: Resolver<Maybe<Array<ResolversTypes['Issue']>>, ParentType, ContextType>;
  allLinkSubmissions?: Resolver<Maybe<Array<ResolversTypes['LinkSubmission']>>, ParentType, ContextType>;
  allLinks?: Resolver<Maybe<Array<ResolversTypes['Link']>>, ParentType, ContextType>;
  allSubscribers?: Resolver<Maybe<Array<ResolversTypes['Subscriber']>>, ParentType, ContextType>;
  allTopics?: Resolver<Maybe<Array<ResolversTypes['Topic']>>, ParentType, ContextType>;
  issue?: Resolver<Maybe<ResolversTypes['Issue']>, ParentType, ContextType, RequireFields<QueryIssueArgs, 'id'>>;
  me?: Resolver<Maybe<ResolversTypes['Me']>, ParentType, ContextType>;
};

export type SubscriberResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Subscriber'] = ResolversParentTypes['Subscriber']> = {
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type TopicResolvers<ContextType = GraphQLContext, ParentType extends ResolversParentTypes['Topic'] = ResolversParentTypes['Topic']> = {
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  issue?: Resolver<Maybe<ResolversTypes['Issue']>, ParentType, ContextType>;
  issueId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  issue_comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  links?: Resolver<Maybe<Array<ResolversTypes['Link']>>, ParentType, ContextType>;
  position?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type Resolvers<ContextType = GraphQLContext> = {
  Author?: AuthorResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Issue?: IssueResolvers<ContextType>;
  Link?: LinkResolvers<ContextType>;
  LinkSubmission?: LinkSubmissionResolvers<ContextType>;
  Me?: MeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Subscriber?: SubscriberResolvers<ContextType>;
  Topic?: TopicResolvers<ContextType>;
};

