export const nameGenerator = (
	basename: string,
	possibleOptions: Record<string, boolean>,
) => {
	const dotIndex = basename.lastIndexOf(".");
	const filename = dotIndex === -1 ? basename : basename.substring(0, dotIndex);
	const extension = dotIndex === -1 ? "" : basename.substring(dotIndex + 1);

	const selectedOptions = Object.keys(possibleOptions)
		.filter((opt) => possibleOptions[opt])
		.map((opt) => opt.toLowerCase())
		.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

	if (selectedOptions.length > 0) {
		const suffix = ["-with", ...selectedOptions].join("-");
		return extension
			? `${filename}${suffix}.${extension}`
			: `${filename}${suffix}`;
	}
	return basename;
};
