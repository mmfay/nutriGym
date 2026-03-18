export default function Spinner() {
	return (
		<div className="flex items-center justify-center gap-3">
			<div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700 dark:border-slate-600 dark:border-t-slate-200" />
			<span>Loading...</span>
		</div>
	);
}