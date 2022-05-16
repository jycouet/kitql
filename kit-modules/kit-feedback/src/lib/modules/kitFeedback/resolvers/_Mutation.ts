import type { Comment, Issue } from '$graphql/_kitql/graphqlTypes';
import { CreateIssueLabelIdIT, KitFeedbackConfigIT, RepositoryIdIT } from '..';
import { resolveGithubComment, resolveGithubIssuePreview } from '../helpers/helperGithub';
import { DbGithub } from '../providers/DbGithub';
import type { KitFeedbackModule } from '../_kitql/moduleTypes';

export const resolvers: KitFeedbackModule.Resolvers = {
	Mutation: {
		createComment: async (_root, args, ctx, _info) => {
			const Github = ctx.injector.get(DbGithub);
			const config = ctx.injector.get(KitFeedbackConfigIT);
			const data = await Github.createComment({
				subjectId: args.fields.issueID,
				body: args.fields.body
			});
			const comment: Comment = resolveGithubComment(data?.addComment?.commentEdge?.node, config);
			return comment;
		},
		addReaction: async (_root, args, ctx, _info) => {
			const Github = ctx.injector.get(DbGithub);
			const data = await Github.addReaction({
				subjectId: args.fields.subjectID,
				content: args.fields.content
			});
			return data?.addReaction ? 1 : 0;
		},
		createIssue: async (_root, args, ctx, _info) => {
			const Github = ctx.injector.get(DbGithub);
			const config = ctx.injector.get(KitFeedbackConfigIT);
			const repositoryId = ctx.injector.get(RepositoryIdIT);
			const createIssueLabelId = ctx.injector.get(CreateIssueLabelIdIT);
			const data = await Github.createIssue({
				repositoryId: repositoryId,
				milestoneId: args.fields.milestoneId,
				labelIds: [...args.fields.labelIDs, createIssueLabelId],
				title: args.fields.title,
				body: args.fields.body
			});
			const issue = data?.createIssue?.issue;
			const result: Issue = resolveGithubIssuePreview(issue, config);
			return result;
		},
		minimizeComment: async (_root, args, ctx, _info) => {
			const Github = ctx.injector.get(DbGithub);
			const config = ctx.injector.get(KitFeedbackConfigIT);
			const data = await Github.minimizeComment({
				subjectId: args.fields.commentID,
				classifier: 'OFF_TOPIC'
			});
			const comment = data?.minimizeComment?.minimizedComment;
			const result: Comment = resolveGithubComment(comment, config);
			return result;
		},
		updateComment: async (_root, args, ctx, _info) => {
			const Github = ctx.injector.get(DbGithub);
			const config = ctx.injector.get(KitFeedbackConfigIT);
			const data = await Github.updateComment({
				id: args.fields.commentID,
				body: args.fields.body
			});
			const comment = data?.updateIssueComment?.issueComment;
			const result: Comment = resolveGithubComment(comment, config);
			return result;
		}
	}
};
