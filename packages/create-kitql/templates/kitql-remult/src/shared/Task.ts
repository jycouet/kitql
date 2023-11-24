import { Entity, Fields } from 'remult';

@Entity('tasks', {
	allowApiCrud: true
})
export class Task {
	@Fields.cuid()
	id!: string;

	@Fields.string()
	title: string = '';

	@Fields.boolean()
	completed: boolean = false;

	@Fields.createdAt()
	createdAt?: Date;
}
