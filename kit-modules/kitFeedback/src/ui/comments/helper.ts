import type { KitFeedbackConfig } from '../../utils/config';
import type { Comment } from '../../utils/types';

export const resolveAuthor = (comment: Comment, config: KitFeedbackConfig) => {
	if (comment.metadata) {
		const author = comment.metadata.author;
		return config?.staff?.members?.[author] ?? (author || 'Unknown author');
	} 
		const author = comment.author;
		return config?.staff?.members?.[author] ?? 'Unregistered author';
	
};
