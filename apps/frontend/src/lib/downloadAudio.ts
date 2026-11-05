export async function downloadMp3(url: string, title: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  saveBlob(blob, `${safeName(title)}.mp3`);
}

export async function downloadWav(url: string, title: string, start = 0, end?: number | null) {
  const response = await fetch(url);
  const raw = await response.arrayBuffer();
  const audio = new AudioContext();
  const decoded = await audio.decodeAudioData(raw.slice(0));
  const rate = decoded.sampleRate;
  const from = Math.max(0, Math.floor(start * rate));
  const to = Math.min(decoded.length, end ? Math.floor(end * rate) : decoded.length);
  const length = Math.max(1, to - from);
  const channels = decoded.numberOfChannels;
  const wav = encodeWav(decoded, from, length, channels, rate);
  saveBlob(new Blob([wav], { type: "audio/wav" }), `${safeName(title)}.wav`);
  await audio.close();
}

function safeName(title: string) {
  return title.replace(/[^\w\- ]+/g, "").trim() || "sonzai-song";
}

function saveBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(href);
}

function encodeWav(buffer: AudioBuffer, offset: number, length: number, channels: number, rate: number) {
  const bytesPerSample = 2;
  const block = channels * bytesPerSample;
  const dataSize = length * block;
  const out = new ArrayBuffer(44 + dataSize);
  const view = new DataView(out);
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * block, true);
  view.setUint16(32, block, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, dataSize, true);
  let pos = 44;
  for (let i = 0; i < length; i += 1) {
    for (let channel = 0; channel < channels; channel += 1) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[offset + i] || 0));
      view.setInt16(pos, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      pos += 2;
    }
  }
  return out;
}

function writeString(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i += 1) view.setUint8(offset + i, text.charCodeAt(i));
}
