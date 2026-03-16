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
		const pngBuffer: ArrayBuffer = inputPng instanceof Uint8Array
			? inputPng.buffer.slice(inputPng.byteOffset, inputPng.byteOffset + inputPng.byteLength)
			: await inputPng.arrayBuffer();
		// const zipBuffer = await createZip(inputFiles);
		// ファイルが1つ、かつzipファイルの場合はそのまま使う
		const zipBuffer = inputFiles.length === 1 && inputFiles[0].name.endsWith('.zip')
			? new Uint8Array(await inputFiles[0].arrayBuffer())
			: await createZip(inputFiles);


		const pngData = new Uint8Array(pngBuffer);

		const PNG_SIG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
		if (!pngData.slice(0, 8).every((byte, i) => byte === PNG_SIG[i])) {
			throw new Error('Invalid PNG file.');
		}

		const IEND = new Uint8Array([0x49, 0x45, 0x4e, 0x44]);
		const IDAT = new TextEncoder().encode('IDAT');
		const chunks: Uint8Array[] = [];
		let offset = 8;

		while (offset < pngData.length) {
			if (offset + 8 > pngData.length) {
				throw new Error('Invalid PNG chunk header.');
			}

			const length = ((pngData[offset] << 24) | (pngData[offset + 1] << 16) | (pngData[offset + 2] << 8) | pngData[offset + 3]) >>> 0;
			const chunkEnd = offset + 12 + length;
			if (chunkEnd > pngData.length) {
				throw new Error('Invalid PNG chunk length.');
			}
			const type = pngData.slice(offset + 4, offset + 8);

			if (type.every((byte, i) => byte === IEND[i])) {
				const insertOffset = offset + 8;
				const zipChunkData = fixupZip(zipBuffer, insertOffset);
				const zipChunkLength = uint32ToBigEndianBytes(zipChunkData.length);
				const zipChunkCrc = uint32ToBigEndianBytes(crc32(IDAT, zipChunkData));

				chunks.push(zipChunkLength, IDAT, zipChunkData, zipChunkCrc);
				chunks.push(pngData.slice(offset, chunkEnd));
				break;
			}
			chunks.push(pngData.slice(offset, chunkEnd));

			offset = chunkEnd;
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

const crc32table = new Uint32Array(256).map((_, n) => {
	let c = n;
	for (let k = 0; k < 8; k++) {
		c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	}
	return c >>> 0;
});
const crc32 = (type: Uint8Array, data: Uint8Array): number => {
	const combinedData = new Uint8Array(type.length + data.length);
	combinedData.set(type);
	combinedData.set(data, type.length);
	let crc = ~0;
	combinedData.forEach(byte => {
		crc = (crc >>> 8) ^ crc32table[(crc ^ byte) & 0xff];
	});
	return ~crc >>> 0;
};

const uint32ToBigEndianBytes = (value: number): Uint8Array => {
	const out = new Uint8Array(4);
	out[0] = (value >>> 24) & 0xff;
	out[1] = (value >>> 16) & 0xff;
	out[2] = (value >>> 8) & 0xff;
	out[3] = value & 0xff;
	return out;
};

export default embedZipIntoPng;