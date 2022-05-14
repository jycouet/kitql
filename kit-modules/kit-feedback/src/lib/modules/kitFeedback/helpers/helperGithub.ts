import type { Comment, Comments, Issue, Milestone } from '$graphql/_kitql/graphqlTypes';
import type { KitFeedbackConfig } from '../utils/config';

export const resolveGithubMilestone = (
	milestone: Record<string, any>,
	config: KitFeedbackConfig
) => {
	const result: Milestone = {
		id: milestone.id,
		number: milestone.number,
		title: milestone.title
	};
	return result;
};

export const resolveGithubIssue = (issue: Record<string, any>, config: KitFeedbackConfig) => {
	const comments: Comments = {
		nodes: issue.comments.nodes.map((comment) => resolveGithubComment(comment, config)),
		next: issue.comments.pageInfo.endCursor
	};

	const result: Issue = {
		id: issue?.id,
		author: issue?.author?.login,
		createdAt: issue?.createdAt,
		titleHTML: issue?.titleHTML,
		bodyHTML: issue?.bodyHTML,
		comments: comments
	};

	return result;
};

export const resolveGithubIssuePreview = (
	issue: Record<string, any>,
	config: KitFeedbackConfig
) => {
	const comments = issue.comments.nodes;
	const result: Issue = {
		id: issue.id,
		number: issue.number,
		metadata: comments.length ? resolveGithubComment(comments[0], config) : null
	};
	return result;
};

export const resolveGithubComment = (comment: Record<string, any>, config: KitFeedbackConfig) => {
	const result: Comment = {
		id: comment?.id,
		isMinimized: comment?.isMinimized,
		isPublic: resolveGithubCommentIsPublic(comment, config),
		createdAt: comment?.createdAt,
		author: comment?.author?.login,
		bodyHTML: comment?.bodyHTML
	};
	return result;
};

export const resolveGithubCommentIsPublic = (
	comment: Record<string, any>,
	config: KitFeedbackConfig
) => {
	const reactionFilter = config.issues?.comments?.reactionFilter;
	const reactionGroup = comment.reactionGroups?.find((group) => group.content === reactionFilter);
	return (reactionGroup?.reactors?.totalCount ?? 0) > 0;
};
