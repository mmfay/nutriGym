export type UserDTO = {
	id: string;
	name: string;
	email: string;
	is_sys_admin?: boolean;
};

export type User = {
	id: string;
	name: string;
	email: string;
	timezone: string;
	is_sys_admin: boolean;
}

export type PasswordResetToken = {
	id: string;
	user_id: string;
	token_hash: string;
	expires_at: Date;
	used_at: Date | null;
	created_at: Date;
};