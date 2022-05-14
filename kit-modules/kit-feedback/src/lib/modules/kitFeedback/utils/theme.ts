import { overridable, type KitFeedbackTheme, type Overridable } from './types';

export type Class =
	| 'wrapper'
	| 'title'
	| 'textarea'
	| 'button-primary'
	| 'button-neutral'
	| 'button-submit'
	| 'form-control'
	| 'input'
	| 'label'
	| 'label-text'
	| 'modal'
	| 'modal-box'
	| 'modal-header'
	| 'modal-title'
	| 'modal-exit'
	| 'modal-content'
	| 'new-issue'
	| 'issues'
	| 'issues-header'
	| 'issues-body'
	| 'issues-state-tabs'
	| 'issues-state-tab'
	| 'issues-state-tab-active'
	| 'issues-list'
	| 'issue-preview'
	| 'issue'
	| 'issue-details'
	| 'comments'
	| 'comments-list'
	| 'comment'
	| 'development-comment'
	| 'github-comment'
	| 'public-comment'
	| 'description-comment'
	| 'comment-header'
	| 'comment-author'
	| 'comment-date'
	| 'comment-body'
	| 'comment-content'
	| 'comment-votes'
	| 'comment-vote'
	| 'comment-vote-active'
	| 'comment-vote-up'
	| 'comment-vote-down'
	| 'create-comment'
	| 'previous-button'
	| 'refresh-button';

export const defaultTheme: KitFeedbackTheme = {
	default: {
		wrapper: '',
		'form-control': 'form-control w-full',
		title: 'pl-2',
		textarea: 'w-full textarea textarea-bordered',
		input: 'input input-bordered',
		label: 'label',
		'label-text': 'label-text',
		'button-primary': 'btn btn-sm btn-primary w-max',
		'button-neutral': 'btn btn-sm w-max ring-1 ring-white/20',
		'button-submit': 'justify-self-end',
		modal: 'modal modal-open bg-black/70',
		'modal-box': `
			modal-box relative ring-1 ring-white/10 drop-shadow-lg
			rounded-xl bg-base-200
			min-w-[90vw] min-h-[90vh] max-w-[90vw] max-h-[90vh] 
			p-0 flex flex-col
		`,
		'modal-header': 'flex items-center p-6 pb-3 gap-2',
		'modal-title': 'grow text-center text-xl',
		'modal-exit': 'btn btn-circle btn-sm btn-primary',
		'modal-content':
			'grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-neutral-focus scrollbar-track-neutral',
		'new-issue': 'flex flex-col gap-4',
		issues: 'flex flex-col gap-4',
		'issues-header': 'flex justify-between',
		'issues-body':
			'rounded-lg overflow-hidden drop-shadow flex flex-col divide-y divide-white/20 ring-1 ring-white/10',
		'issues-state-tabs': 'p-2 bg-neutral-focus',
		'issues-state-tab': 'tab font-medium text-md',
		'issues-state-tab-active': 'tab-active',
		'issues-list': 'flex flex-col divide-y divide-white/20',
		'issue-preview':
			'flex justify-between gap-4 px-3.5 py-2.5 bg-neutral hover:bg-neutral-focus cursor-pointer',
		issue: 'flex flex-col gap-4',
		'issue-details': 'flex flex-col gap-4',
		comments: 'flex flex-col gap-4',
		'comments-list': 'flex flex-col gap-4',
		comment: 'flex flex-col rounded-lg overflow-hidden ring-1 ring-white/20',
		'development-comment': 'opacity-60',
		'github-comment': 'bg-secondary/10 ring-secondary/30',
		'public-comment': 'bg-neutral  drop-shadow-md',
		'description-comment': 'ring-1 ring-white/70',
		'comment-header': 'p-4 bg-neutral-focus text-xs flex items-center justify-between',
		'comment-author': 'text-secondary font-medium',
		'comment-date': 'text-white/50',
		'comment-body': 'p-4 flex justify-between items-end gap-2',
		'comment-content': 'flex flex-col gap-2 text-sm',
		'comment-votes': 'flex items-center gap-4',
		'comment-vote':
			'flex items-center gap-2 pb-1 cursor-pointer text-sm hover:opacity-70 hover:scale-110 transition-all',
		'comment-vote-active': 'border-b-2',
		'comment-vote-up': 'text-success border-b-success',
		'comment-vote-down': 'text-accent border-b-accent',
		'create-comment': 'flex flex-col gap-4 items-end',
		'previous-button': 'btn btn-sm btn-circle btn-primary',
		'refresh-button': 'btn btn-sm btn-circle btn-primary'
	}
};

export const resolveTheme = (theme: KitFeedbackTheme, selector?: Class) => {
	if (theme && selector) {
		if (theme.override?.[selector]) return theme.override[selector];
		return theme.default[selector] + (theme.extend?.[selector] ?? '');
	}
	return '';
};

export const theme: Overridable<KitFeedbackTheme> = overridable<KitFeedbackTheme>(defaultTheme);
