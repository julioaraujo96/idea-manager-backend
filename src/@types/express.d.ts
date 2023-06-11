import { User } from '../services/user.service'

declare global {
	namespace Express {
		export interface Request {
			user: Partial<User>
		}
	}
}