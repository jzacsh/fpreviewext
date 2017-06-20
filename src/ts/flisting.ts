import { Config } from './config';
import panicif from './assert';

interface HumanMachine {
  machine: number;
  human: string;
}

enum MediaType {
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
  private listing_: Element;
  private fname_: string;
  private mtime_: HumanMachine;
  private size_: HumanMachine;
  private bodyWidthPx_: number;
  private type_: MediaType;

  constructor(
    parentEl: Element,
    fileName: string,
    sizeEl: Element,
    modTimeEl: Element) {
    this.listing_ = parentEl;
    this.fname_ = fileName;
    this.type_ = Listing.guessAVType_(fileName);
    this.mtime_ = {
      machine: parseInt(modTimeEl.getAttribute('data-value') + "", 10),
      human: modTimeEl.textContent + "",
    }; // TODO(zacsh) actually error check rather than magic cast to string

    this.size_ = {
      machine: parseInt(sizeEl.getAttribute('data-value') + "", 10),
      human: sizeEl.textContent + "",
    }; // TODO(zacsh) actually error check rather than magic cast to string
    this.bodyWidthPx_ = Listing.scrapeBodyWidth_();
  }

  /** Some HTML with an <img> element, intended for display. */
  buildEl() : Element {
    let ancEl = document.createElement('a');
    ancEl.setAttribute('href', this.fname_);
    let mediaEl = Listing.buildMediaEl(this.avType, this.fname_ /*src*/);
    mediaEl.setAttribute('class', 'preview');
    mediaEl.setAttribute('title', this.fname_);
    mediaEl.setAttribute('width', this.widthStyle_);

    ancEl.appendChild(mediaEl);
    ancEl.appendChild(document.createElement('br'));
    let captionEl = document.createElement('div');
    captionEl.textContent = this.fname_;
    captionEl.setAttribute('class', 'caption');
    ancEl.appendChild(captionEl);
    return ancEl;
  }

  /** Audio/Visual (AV) media type. */
  get avType() : MediaType { return this.type_; }

  private get widthStyle_() : string {
    return this.bodyWidthPx_ * Config.GRID_LATTICE_RATIO + 'px';
  }

  get bytes() : number { return this.size_.machine; }

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

  private static scrapeBodyWidth_() : number {
    const pxRaw = window.getComputedStyle(document.body).width;

    panicif(!pxRaw, 'DOM failed to report computedStyle width');
    let px = pxRaw!.replace(/px/, '')!;

    panicif(!px, 'failed to parse pixel value');
    let width = parseInt(px!, 10);

    panicif(!width, 'failed to parse pixel integer');
    return width!;
  }

  static isAVMedia(basename: string) : boolean {
    return Listing.guessAVType_(basename) != MediaType.NotAV;
  };

  private static guessAVType_(filename: string) : MediaType {
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
  private dirLsLen_: number
  private filtered_: Array<Listing>
  constructor(trs: NodeListOf<Element>) {
    this.dirLsLen_ = trs.length;
    this.filtered_ = MediaListing.filterMedia_(this.dirLsLen_, trs);
  }

  get listingSize() : number {
    return this.dirLsLen_ - 1 /* ignore hardlink to parent dir */;
  }

  get length() : number { return this.filtered_.length; }

  get isMixed() : boolean { return this.listingSize != this.length; }

  get(index: number) : Listing {
    if (index < 0 || index > this.length - 1) {
      throw new Error(
          'invalid image index ' +
          index + ' requested, expected [0,' +
          this.length + ')');
    }
    return this.filtered_[index];
  }

  private static filterMedia_(len: number, trs: NodeListOf<Element>) : Array<Listing> {
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
