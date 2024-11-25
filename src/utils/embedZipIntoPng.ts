import fixupZip from './fixupZip';
import JSZip from 'jszip';

const createZip = async (files: File[]): Promise<Uint8Array> => {
	const zip = new JSZip();
	files.forEach(file => zip.file(file.name, file));
	return zip.generateAsync({ type: 'uint8array' });
};

const embedZipIntoPng = async (
	inputPng: Blob | null | Uint8Array,
	inputFiles: File[],
	outputFile: string
): Promise<void> => {
	if (!inputPng || inputFiles.length === 0) {
		alert('Please select a PNG file and at least one file to embed.');
		return;
	}

	try {
		const pngBuffer: ArrayBuffer = inputPng instanceof Uint8Array ? inputPng.buffer : await inputPng.arrayBuffer();
		// const zipBuffer = await createZip(inputFiles);
		// もし複数ファイル、かつzipが1つでもある場合はエラー
		if (inputFiles.length > 1 && inputFiles.some(file => file.name.endsWith('.zip'))) {
			throw new Error('Multiple files are selected, but one of them is a ZIP file.');
		}
		// ファイルが1つ、かつzipファイルの場合はそのまま使う
		const zipBuffer = inputFiles.length === 1 && inputFiles[0].name.endsWith('.zip')
			? new Uint8Array(await inputFiles[0].arrayBuffer())
			: await createZip(inputFiles);


		const pngData = new Uint8Array(pngBuffer);
		const zipData = new Uint8Array(zipBuffer);

		const PNG_SIG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
		if (!pngData.slice(0, 8).every((byte, i) => byte === PNG_SIG[i])) {
			throw new Error('Invalid PNG file.');
		}

		const IEND = new Uint8Array([0x49, 0x45, 0x4e, 0x44]);
		const chunks: Uint8Array[] = [];
		let offset = 8;

		while (offset < pngData.length) {
			const length = (pngData[offset] << 24) | (pngData[offset + 1] << 16) | (pngData[offset + 2] << 8) | pngData[offset + 3];
			const type = pngData.slice(offset + 4, offset + 8);

			if (type.every((byte, i) => byte === IEND[i])) {
				const insertOffset = offset + 8;
				const zipChunkType = new TextEncoder().encode('IDAT');
				const zipChunkData = fixupZip(zipBuffer, insertOffset);
				const zipChunkLength = new Uint8Array(new Uint32Array([zipChunkData.length]).buffer);
				const zipChunkCrc = new Uint8Array(new Uint32Array([crc32(zipChunkType, zipData)]).buffer);

				chunks.push(zipChunkLength, zipChunkType, zipChunkData, zipChunkCrc);
			}
			chunks.push(pngData.slice(offset, offset + 12 + length));

			offset += 12 + length;
		}

		const newPngData = new Blob([PNG_SIG, ...chunks], { type: 'image/png' });

		const a = document.createElement('a');
		a.href = URL.createObjectURL(newPngData);
		a.download = outputFile;
		a.click();
	} catch (error) {
		console.error('Error embedding ZIP into PNG:', error);
		alert('An error occurred while processing the files.');
	}
};

const crc32 = (type: Uint8Array, data: Uint8Array): number => {
	const table = new Uint32Array(256).map((_, n) => {
		let c = n;
		for (let k = 0; k < 8; k++) {
			c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		return c >>> 0;
	});
	let crc = ~0;
	[...type, ...data].forEach(byte => {
		crc = (crc >>> 8) ^ table[(crc ^ byte) & 0xff];
	});
	return ~crc >>> 0;
};

export default embedZipIntoPng;