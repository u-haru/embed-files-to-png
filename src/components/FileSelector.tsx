import { Box, Button, Typography, List,ListItem, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderZipIcon from '@mui/icons-material/FolderZip';

const FileSelecter: React.FC<{
	files: File[];
	setFiles: (files: File[]) => void;
}> = ({ files, setFiles }) => {
	const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			setFiles([...files, ...Array.from(event.target.files)]);
		}
	};

	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault();
		if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
			setFiles([...files, ...Array.from(event.dataTransfer.files)]);
		}
	};

	const handleFileRemove = (index: number) => {
		const updatedFiles = files.filter((_, i) => i !== index);
		setFiles(updatedFiles);
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				flex: '1 1 auto',
			}}
			onDrop={handleDrop}
			onDragOver={(e) => e.preventDefault()}
		>
			<Box
				sx={{
					display: 'flex',
					flexDirection: 'column',
					maxHeight: '30em',
					overflowY: 'auto',
					minHeight: '10em',
					justifyContent: 'center',
					alignItems: 'center',
					width: '100%',
					border: '2px dashed',
					borderRadius: 1,
					borderColor: 'text.secondary',
					color: 'text.secondary',
				}}
			>
				{files.length > 0 ? (
					<List sx={{ width: '100%', textAlign : 'center' }}>
						{files.map((file, index) => (
							<ListItem
								key={index}
								style={{
									width: '100%',
								}}
								secondaryAction={
								<IconButton
								edge="end"
								color="error"
								aria-label="delete"
								onClick={() => handleFileRemove(index)}
								>
								  <DeleteIcon />
								</IconButton>
							  }
							>
								<Typography variant="body1">{file.name}</Typography>
							</ListItem>
						))}
						{files.length > 1 && (
							<Button
								variant="text"
								color="error"
								onClick={() => setFiles([])}
							>
								Remove All
							</Button>
						)}
					</List>
				) : (
					<Box sx={{ textAlign: 'center' }}>
						<FolderZipIcon />
						<Typography>Drop files here</Typography>
					</Box>
				)}
			</Box>
			<Button component="label" variant="contained" color="secondary">
				Select Files to Embed
				<input type="file" multiple hidden onChange={handleFilesChange} />
			</Button>
		</Box>
	);
};

export default FileSelecter;