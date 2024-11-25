import React from 'react';
import { Box, Button } from '@mui/material';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
const PngSelecter: React.FC<{
	blob: Blob | null;
	setBlob: (blob: Blob) => void;
}> = ({ blob, setBlob }) => {
	const canvasRef = React.useRef<HTMLCanvasElement>(null);

	const handlePngChange = (file: File) => {
		const ctx = canvasRef.current?.getContext('2d');
		if (ctx) {
			const image = new Image();
			image.onload = () => {
				ctx.canvas.width = image.width;
				ctx.canvas.height = image.height;
				ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
				ctx.drawImage(image, 0, 0, image.width, image.height);

				// 画像の右下1pxを透過させる
				const pix = ctx.getImageData(image.width - 1, image.height - 1, 1, 1);
				pix.data[3] = 0;
				ctx.putImageData(pix, image.width - 1, image.height - 1);

				const imageData = ctx.canvas.toDataURL('image/png');
				fetch(imageData)
					.then((res) => res.blob())
					.then((blob) => {
						setBlob(blob);
					});
			};
			image.src = URL.createObjectURL(file);
		}
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