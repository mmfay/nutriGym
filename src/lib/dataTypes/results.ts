export type ApiResult<T> = { 
	ok: boolean; 
	message: string; 
	data?: T; 
	status: number; 
	statusText: string 
}
