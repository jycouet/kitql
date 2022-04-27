import type { KitFeedbackConfig } from '$lib/config';
import type { Comment } from '$lib/types';

export const resolveAuthor = (comment: Comment, config: KitFeedbackConfig) => {
	if (comment.metadata) {
		const author = comment.metadata.author;
		return config?.staff?.members?.[author] ?? (author || 'Unknown author');
	} else {
		const author = comment.author.login;
		return config?.staff?.members?.[author] ?? 'Unregistered author';
	}
};
