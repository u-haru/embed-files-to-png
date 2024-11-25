import React, { useState } from 'react';
import { Box, Button, Container, TextField, Typography } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import embedZipIntoPng from './utils/embedZipIntoPng';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ThemeSwitch from './components/ThemeSwich';
import PngSelecter from './components/PngSelecter';
import FileSelecter from './components/FileSelector';

const App: React.FC = () => {
	const [inputPng, setInputPng] = useState<Blob | null>(null);
	const [inputFiles, setInputFiles] = useState<File[]>([]);
	const [outputFile, setOutputFile] = useState<string>('output.zip.png');

	const handleOutputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setOutputFile(event.target.value);
	};

	const onClick = async () => {
		await embedZipIntoPng(inputPng, inputFiles, outputFile);
	};

	return (
		<Container maxWidth="lg" sx={{ my: 5, display: 'flex', flexDirection: 'column', gap: 3, width: '100%', mx: 'auto' }}>
			<Typography variant="h3" align="center" gutterBottom>
				Embed ZIP into PNG
			</Typography>
			<Typography variant="body2" align="center" color="text.secondary">
				Embed ZIP file into PNG file. The PNG file is created by converting the input image to PNG format.
			</Typography>
			<Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, mx: 'auto' }}>
				<Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center' }}>
					<PngSelecter blob={inputPng} setBlob={setInputPng} />
					<FileSelecter files={inputFiles} setFiles={setInputFiles} />
				</Box>
				<TextField
					label="Output File Name"
					variant="outlined"
					value={outputFile}
					onChange={handleOutputChange}
					fullWidth
				/>
				<Button
					variant="contained"
					color="success"
					startIcon={<FileDownloadIcon />}
					onClick={onClick}
					sx={{ mt: 2 }}
				>Embed ZIP into PNG</Button>
				<ThemeSwitch />
			</Box>
		</Container>
	);
};

export default function Root() {
	const theme = createTheme({
		colorSchemes: {
			dark: true,
		},
	});
	return (
		<ThemeProvider theme={theme} defaultMode="system">
			<CssBaseline />
			<App />
		</ThemeProvider>
	);
}