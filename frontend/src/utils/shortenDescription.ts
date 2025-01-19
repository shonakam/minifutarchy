export const shortenDescription = (description: string, maxLines: number = 3): string => {
	const lines = description.split('\n');
	if (lines.length <= maxLines) {
	  return description;
	}

	return [...lines.slice(0, maxLines - 1), lines[maxLines - 1] + ' ...'].join('\n');
};
