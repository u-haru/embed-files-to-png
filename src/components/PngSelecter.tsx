import React, { useEffect } from 'react';
import { Box, Button } from '@mui/material';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
const PngSelecter: React.FC<{
	blob: Blob | null;
	setBlob: (blob: Blob) => void;
	resize: boolean;
}> = ({ blob, setBlob, resize }) => {
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const [rawFile, setRawFile] = React.useState<File | null>(null);

	useEffect(() => {
		const ctx = canvasRef.current?.getContext('2d');
		console.log("changed")
		if (ctx && rawFile) {
			const image = new Image();
			image.onload = () => {
				let width = image.width;
				let height = image.height;

				if (resize && width * height > 1024 * 1024) {
					const ratio = Math.sqrt((1024 * 1024) / (width * height));
					width = Math.floor(width * ratio);
					height = Math.floor(height * ratio);
				}

				ctx.canvas.width = width;
				ctx.canvas.height = height;
				ctx.clearRect(0, 0, width, height);
				ctx.drawImage(image, 0, 0, width, height);

				// 画像の右下1pxを透過させる
				const pix = ctx.getImageData(width - 1, height - 1, 1, 1);
				pix.data[3] = 0;
				ctx.putImageData(pix, width - 1, height - 1);

				const imageData = ctx.canvas.toDataURL('image/png');
				fetch(imageData)
					.then((res) => res.blob())
					.then((blob) => {
						setBlob(blob);
					});
			};
			image.src = URL.createObjectURL(rawFile);
		}
	}, [resize, rawFile]);

	const handlePngChange = (file: File) => {
		setRawFile(file);
	};

	const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			handlePngChange(event.target.files[0]);
		}
	};

	const handleDragOver = (event: React.DragEvent) => {
		event.preventDefault();
	};


	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault();
		if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
			handlePngChange(event.dataTransfer.files[0]);
		}
	};

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				flex: '1 1 auto',
			}}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			<Box sx={{
				textAlign: 'center',
				border: '2px dashed',
				objectFit: 'contain',
				maxWidth: '100%',
				minHeight: '10em',
				borderRadius: 1,
				borderColor: 'text.secondary',
				color: 'text.secondary',
				position: 'relative',
			}}>
				<canvas
					ref={canvasRef}
					style={{
						maxHeight: '30em',
						maxWidth: '100%',
					}}
				/>
				{!blob && 
				<Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
					<InsertPhotoIcon />
					<Box>Drop a Image file here</Box>
				</Box>}
			</Box>
			<Button component="label" variant="contained">
				Select PNG
				<input
					type="file"
					accept="image/*"
					hidden
					onChange={handleFileInput}
				/>
			</Button>
		</Box>
	);
};

export default PngSelecter;
