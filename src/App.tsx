import React, { useState } from 'react';
import { Box, Button, Container, FormControlLabel, Link, Switch, TextField, Typography } from '@mui/material';
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
	const [resize, setResize] = useState<boolean>(false);

	const handleOutputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setOutputFile(event.target.value);
	};

	const onClick = async () => {
		await embedZipIntoPng(inputPng, inputFiles, outputFile);
	};

	return (
		<Container component="form" sx={{ m: 5, display: 'flex', flexDirection: 'column', gap: 3, mx: 'auto' }} maxWidth="md">
			<Typography variant="h3" align="center" gutterBottom>
				Embed ZIP into PNG
			</Typography>
			<Typography>
				Embed ZIP file into image file. Image file will be automatically converted to PNG format.<br />
				Source code: <Link href="https://github.com/u-haru/embed-files-to-png" target="_blank" rel="noopener noreferrer">github.com/u-haru/embed-files-to-png</Link>
			</Typography>
				<Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center' }}>
					<PngSelecter blob={inputPng} setBlob={setInputPng} resize={resize} />
					<FileSelecter files={inputFiles} setFiles={setInputFiles} />
				</Box>
				<TextField
					label="Output File Name"
					variant="outlined"
					value={outputFile}
					onChange={handleOutputChange}
					fullWidth
				/>
				<FormControlLabel
					control={
						<Switch
							color="primary"
							checked={resize}
							onChange={() => setResize(!resize)}
						/>}
					label="Resize when bigger than 1024x1024 pixels" />
				<Button
					variant="contained"
					color="success"
					startIcon={<FileDownloadIcon />}
					onClick={onClick}
					sx={{ mt: 2 }}
				>Embed ZIP into PNG</Button>
				<ThemeSwitch />
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