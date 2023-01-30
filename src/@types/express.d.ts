import { User } from '../routes/user/user.service'

declare global {
	namespace Express {
		export interface Request {
			user: Partial<User>
		}
	}
}