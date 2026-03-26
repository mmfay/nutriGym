import Image from "next/image";

type VerifiedBadgeProps = {
	verified?: boolean;
	size?: "sm" | "md" | "lg";
};

export default function VerifiedBadge({
	verified = true,
	size = "sm",
}: VerifiedBadgeProps) {
	if (!verified) return null;

	const imageSize =
		size === "lg" ? 24 : size === "md" ? 20 : 16;

	return (
		<span className="inline-flex items-center justify-center">
			<Image
				src="/icons/verifiedBadge.png"
				alt="Verified"
				width={imageSize}
				height={imageSize}
				className="shrink-0 object-contain"
			/>
		</span>
	);
}