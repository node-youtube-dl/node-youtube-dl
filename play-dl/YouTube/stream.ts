import { video_info } from '.';
import { LiveStreaming, Stream } from './classes/LiveStream';
import { ProxyOptions as Proxy } from './../Request';

export enum StreamType {
    Arbitrary = 'arbitrary',
    Raw = 'raw',
    OggOpus = 'ogg/opus',
    WebmOpus = 'webm/opus',
    Opus = 'opus'
}

export interface StreamOptions {
    quality?: number;
    proxy?: Proxy[];
    htmldata?: boolean;
}

export interface InfoData {
    LiveStreamData: {
        isLive: boolean;
        dashManifestUrl: string;
        hlsManifestUrl: string;
    };
    html5player: string;
    format: any[];
    video_details: any;
}
/**
 * Command to find audio formats from given format array
 * @param formats Formats to search from
 * @returns Audio Formats array
 */
export function parseAudioFormats(formats: any[]) {
    const result: any[] = [];
    formats.forEach((format) => {
        const type = format.mimeType as string;
        if (type.startsWith('audio')) {
            format.codec = type.split('codecs="')[1].split('"')[0];
            format.container = type.split('audio/')[1].split(';')[0];
            result.push(format);
        }
    });
    return result;
}
/**
 * Type for YouTube Stream
 */
export type YouTubeStream = Stream | LiveStreaming;
/**
 * Stream command for YouTube
 * @param url YouTube URL
 * @param options lets you add quality, cookie, proxy support for stream
 * @returns Stream class with type and stream for playing.
 */
export async function stream(url: string, options: StreamOptions = {}): Promise<YouTubeStream> {
    const info = await video_info(url, { proxy: options.proxy, htmldata: options.htmldata });
    const final: any[] = [];
    if (
        info.LiveStreamData.isLive === true &&
        info.LiveStreamData.hlsManifestUrl !== null &&
        info.video_details.durationInSec === 0
    ) {
        return new LiveStreaming(
            info.LiveStreamData.dashManifestUrl,
            info.format[info.format.length - 1].targetDurationSec,
            info.video_details.url
        );
    }

    const audioFormat = parseAudioFormats(info.format);
    if (typeof options.quality !== 'number') options.quality = audioFormat.length - 1;
    else if (options.quality <= 0) options.quality = 0;
    else if (options.quality >= audioFormat.length) options.quality = audioFormat.length - 1;
    if (audioFormat.length !== 0) final.push(audioFormat[options.quality]);
    else final.push(info.format[info.format.length - 1]);
    let type: StreamType =
        final[0].codec === 'opus' && final[0].container === 'webm' ? StreamType.WebmOpus : StreamType.Arbitrary;
    return new Stream(
        final[0].url,
        type,
        info.video_details.durationInSec,
        Number(final[0].contentLength),
        info.video_details.url,
        options
    );
}
/**
 * Stream command for YouTube using info from video_info or decipher_info function.
 * @param info video_info data
 * @param options lets you add quality, cookie, proxy support for stream
 * @returns Stream class with type and stream for playing.
 */
export async function stream_from_info(info: InfoData, options: StreamOptions = {}): Promise<YouTubeStream> {
    const final: any[] = [];
    if (
        info.LiveStreamData.isLive === true &&
        info.LiveStreamData.hlsManifestUrl !== null &&
        info.video_details.durationInSec === '0'
    ) {
        return new LiveStreaming(
            info.LiveStreamData.dashManifestUrl,
            info.format[info.format.length - 1].targetDurationSec,
            info.video_details.url
        );
    }

    const audioFormat = parseAudioFormats(info.format);
    if (typeof options.quality !== 'number') options.quality = audioFormat.length - 1;
    else if (options.quality <= 0) options.quality = 0;
    else if (options.quality >= audioFormat.length) options.quality = audioFormat.length - 1;
    if (audioFormat.length !== 0) final.push(audioFormat[options.quality]);
    else final.push(info.format[info.format.length - 1]);
    let type: StreamType =
        final[0].codec === 'opus' && final[0].container === 'webm' ? StreamType.WebmOpus : StreamType.Arbitrary;
    return new Stream(
        final[0].url,
        type,
        info.video_details.durationInSec,
        Number(final[0].contentLength),
        info.video_details.url,
        options
    );
}
