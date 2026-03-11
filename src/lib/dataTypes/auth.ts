export type UserDTO = {
	id: string;
	name: string;
	email: string;
	is_sys_admin?: boolean;
};

export type User = {
	id: number;
	name: string;
	email: string;
}