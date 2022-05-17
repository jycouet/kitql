import type { IssueFilters, Reaction } from '$lib/graphql/_kitql/graphqlTypes';
import { Injectable, Scope } from 'graphql-modules';
import 'reflect-metadata';
import { GithubGraphQL } from '../graphql/github';
import { stry } from '@kitql/helper';

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql' as const;
const { operations, fragments } = GithubGraphQL;
const { queries, mutations } = operations;

@Injectable({ global: false, scope: Scope.Operation })
export class DbGithub {
	private fetch = async (query: string, variables?: Record<string, any>) => {
		try {
			const headers: Headers = new Headers({
				Authorization: 'Bearer ' + process.env.GITHUB_API_TOKEN,
				'Content-Type': 'application/json'
			});
			const body = stry({ query, variables }, 0);
			const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, { method: 'POST', headers, body });
			const result = await response.json();
			if (result.errors) {
				console.log(`result ERRORS`, body, stry(result));
			}
			return result.data;
		} catch (error) {
			console.log(`error`, error);
		}
		return null;
	};

	/**
	 * *** QUERIES ***
	 */

	public getRepositoryConstants = async (input: {
		repository: string;
		owner: string;
		createIssueLabelName: string;
	}) => {
		const graphql = queries.RepositoryConstants;
		return await this.fetch(graphql, input);
	};

	public getMilestones = async (input: {
		repository: string;
		owner: string;
		filter: string;
		take: number;
		cursor?: string;
	}) => {
		const graphql = queries.Milestones + '\n' + fragments.MilestonePreview;
		return await this.fetch(graphql, input);
	};

	public getIssueTemplates = async (input: { repository: string; owner: string }) => {
		const graphql = queries.IssueTemplates + '\n' + fragments.IssueTemplateDetail;
		return await this.fetch(graphql, input);
	};

	public getIssues = async (input: {
		repository: string;
		owner: string;
		take: number;
		cursor?: string;
		filters?: IssueFilters;
	}) => {
		const graphql = queries.Issues + '\n' + fragments.IssuePreview + '\n' + fragments.CommentDetail;
		return await this.fetch(graphql, input);
	};

	public getIssue = async (input: { repository: string; owner: string; number: number }) => {
		const graphql = queries.Issue + '\n' + fragments.IssueDetail + '\n' + fragments.CommentDetail;
		return await this.fetch(graphql, input);
	};

	/**
	 * *** MUTATIONS ***
	 */

	public createIssue = async (input: {
		repositoryId: string;
		milestoneId: string;
		labelIds: string[];
		title: string;
		body: string;
	}) => {
		const graphql =
			mutations.CreateIssue + '\n' + fragments.IssuePreview + '\n' + fragments.CommentDetail;
		return await this.fetch(graphql, { input });
	};

	public createComment = async (input: { subjectId: string; body: string }) => {
		const graphql = mutations.AddComment;
		return await this.fetch(graphql, { input });
	};

	public updateComment = async (input: { id: string; body: string }) => {
		const graphql = mutations.UpdateIssueComment;
		return await this.fetch(graphql, { input });
	};

	public minimizeComment = async (input: { subjectId: string; classifier: string }) => {
		const graphql = mutations.MinimizeComment;
		return await this.fetch(graphql, { input });
	};

	public addReaction = async (input: { subjectId: string; content: Reaction }) => {
		const graphql = mutations.AddReaction;
		return await this.fetch(graphql, { input });
	};
}
