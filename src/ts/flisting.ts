import { Config } from './config';
import panicif from './assert';

export interface HumanMachine {
  machine: number;
  human: string;
}

export enum MediaType {
  Picture,
  Video,
  Audio,
  NotAV,
}

/** @const {!RegExp} */
const VIDEO_EXT_REGEXP = /\.(mp4|ogv|ogg|webm|mpe?g|3gp)$/;

/** @const {!RegExp} */
const AUDIO_EXT_REGEXP = /\.(m4a|mp3)$/;

/** @const {!RegExp} */
const IMG_EXT_REGEXP = /\.(png|svg|jpe?g|webp|tiff|gif)$/;

/**
 * Data scraped for a single file.
 */
class Listing {
  private listing: Element;
  private fname: string;
  private mtime: HumanMachine;
  private size: HumanMachine;
  private bodyWidthPx: number;
  private mediaType: MediaType;

  constructor(
    parentEl: Element,
    fileName: string,
    sizeEl: Element,
    modTimeEl: Element) {
    this.listing = parentEl;
    this.fname = fileName;
    this.mediaType = Listing.guessAVType(fileName);
    this.mtime = {
      machine: parseInt(modTimeEl.getAttribute('data-value') + "", 10),
      human: modTimeEl.textContent + "",
    }; // TODO(zacsh) actually error check rather than magic cast to string

    this.size = {
      machine: parseInt(sizeEl.getAttribute('data-value') + "", 10),
      human: sizeEl.textContent + "",
    }; // TODO(zacsh) actually error check rather than magic cast to string
    this.bodyWidthPx = Listing.scrapeBodyWidth();
  }

  /** Some HTML with an <img> element, intended for display. */
  buildEl() : Element {
    let ancEl = document.createElement('a');
    ancEl.setAttribute('href', this.fname);
    let mediaEl = Listing.buildMediaEl(this.avType, this.fname /*src*/);
    mediaEl.setAttribute('class', 'preview');
    mediaEl.setAttribute('title', this.fname);
    mediaEl.setAttribute('width', this.widthStyle);

    ancEl.appendChild(mediaEl);
    ancEl.appendChild(document.createElement('br'));
    let captionEl = document.createElement('div');
    captionEl.textContent = this.fname;
    captionEl.setAttribute('class', 'caption');
    ancEl.appendChild(captionEl);
    return ancEl;
  }

  /** Audio/Visual (AV) media type. */
  get avType() : MediaType { return this.mediaType; }

  private get widthStyle() : string {
    return this.bodyWidthPx * Config.GRID_LATTICE_RATIO + 'px';
  }

  get bytes() : number { return this.size.machine; }

  private static buildMediaEl(avType: MediaType, url: string) : Element {
    let el;

    const altMsg = 'Preview of ' + url;
    switch (avType) {
      case MediaType.Picture:
        el = document.createElement('img');
        el.setAttribute('src', url);
        el.setAttribute('alt', altMsg);
        return el;
      case MediaType.Video:
      case MediaType.Audio:
        el = document.createElement('audio');
        if (avType == MediaType.Video) {
          el = document.createElement('video');
        }

        el.setAttribute('src', url);
        el.setAttribute('controls', 'controls');
        el.setAttribute('preload', 'auto');
        el.textContent = altMsg;
      return el;
      case MediaType.NotAV:
        throw new Error('called buildMediaEl() for non-media file: ' + url);
    }
  }

  private static scrapeBodyWidth() : number {
    const pxRaw = window.getComputedStyle(document.body).width;

    panicif(!pxRaw, 'DOM failed to report computedStyle width');
    let px = pxRaw!.replace(/px/, '')!;

    panicif(!px, 'failed to parse pixel value');
    let width = parseInt(px!, 10);

    panicif(!width, 'failed to parse pixel integer');
    return width!;
  }

  static isAVMedia(basename: string) : boolean {
    return Listing.guessAVType(basename) != MediaType.NotAV;
  };

  private static guessAVType(filename: string) : MediaType {
    let file = filename.toLowerCase();

    if (file.match(IMG_EXT_REGEXP)) {
      return MediaType.Picture;
    }

    if (file.match(VIDEO_EXT_REGEXP)) {
      return MediaType.Video;
    }

    if (file.match(AUDIO_EXT_REGEXP)) {
      return MediaType.Audio;
    }

    return MediaType.NotAV;
  }
}

export class MediaListing {
  private dirLsLen: number
  private filtered: Array<Listing>
  constructor(trs: NodeListOf<Element>) {
    this.dirLsLen = trs.length;
    this.filtered = MediaListing.filterMedia(this.dirLsLen, trs);
  }

  get listingSize() : number {
    return this.dirLsLen - 1 /* ignore hardlink to parent dir */;
  }

  get length() : number { return this.filtered.length; }

  get isMixed() : boolean { return this.listingSize != this.length; }

  get(index: number) : Listing {
    if (index < 0 || index > this.length - 1) {
      throw new Error(
          'invalid image index ' +
          index + ' requested, expected [0,' +
          this.length + ')');
    }
    return this.filtered[index];
  }

  private static filterMedia(len: number, trs: NodeListOf<Element>) : Array<Listing> {
    let media = new Array(len);

    let count = 0;
    for (let i = 0; i < trs.length; ++i) {
      let tds = trs[i].querySelectorAll('td');
      let fname = tds[0].getAttribute('data-value');
      panicif(!fname, 'failed to read data-value from first <td>');
      if (!Listing.isAVMedia(fname!)) {
        continue;
      }

      media[count] = new Listing(
          trs[i],  // parentEl
          fname!,  // fileName
          tds[1],  // sizeEl
          tds[2]  /*modTimeEl*/);
      count++;
    }
    return media.slice(0, count);
  }
}
