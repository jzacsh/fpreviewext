import { Config } from './config';
import panicif from './assert';

interface HumanMachine {
  machine: number;
  human: string;
}

/** @const {!RegExp} */
const IMG_EXT_REGEXP = /\.(png|svg|jpe?g|webp|tiff|gif)$/;

class Img {
  private listing_: Element;
  private fname_: string;
  private mtime_: HumanMachine;
  private size_: HumanMachine;
  private bodyWidthPx_: number;

  constructor(
    parentEl: Element,
    fileName: string,
    sizeEl: Element,
    modTimeEl: Element) {
    this.listing_ = parentEl;
    this.fname_ = fileName;
    this.mtime_ = {
      machine: parseInt(modTimeEl.getAttribute('data-value') + "", 10),
      human: modTimeEl.textContent + "",
    }; // TODO(zacsh) actually error check rather than magic cast to string

    this.size_ = {
      machine: parseInt(sizeEl.getAttribute('data-value') + "", 10),
      human: sizeEl.textContent + "",
    }; // TODO(zacsh) actually error check rather than magic cast to string
    this.bodyWidthPx_ = Img.scrapeBodyWidth_();
  }

  /** Some HTML with an <img> element, intended for display. */
  buildEl() : Element {
    let ancEl = document.createElement('a');
    ancEl.setAttribute('href', this.fname_);
    let imgEl = document.createElement('img');
    imgEl.setAttribute('src', this.fname_);
    imgEl.setAttribute('class', 'preview');
    imgEl.setAttribute('alt', 'Preview of ' + this.fname_);
    imgEl.setAttribute('title', this.fname_);
    imgEl.setAttribute('width', this.widthStyle_);
    ancEl.appendChild(imgEl);
    ancEl.appendChild(document.createElement('br'));
    let captionEl = document.createElement('div');
    captionEl.textContent = this.fname_;
    captionEl.setAttribute('class', 'caption');
    ancEl.appendChild(captionEl);
    return ancEl;
  }

  private get widthStyle_() : string {
    return this.bodyWidthPx_ * Config.GRID_LATTICE_RATIO + 'px';
  }

  get bytes() : number { return this.size_.machine; }

  private static scrapeBodyWidth_() : number {
    const pxRaw = window.getComputedStyle(document.body).width;

    panicif(!pxRaw, 'DOM failed to report computedStyle width');
    let px = pxRaw!.replace(/px/, '')!;

    panicif(!px, 'failed to parse pixel value');
    let width = parseInt(px!, 10);

    panicif(!width, 'failed to parse pixel integer');
    return width!;
  }
}

export class ImageListing {
  private dirLsLen_: number
  private filtered_: Array<Img>
  constructor(trs: NodeListOf<Element>) {
    this.dirLsLen_ = trs.length;
    this.filtered_ = ImageListing.filterImages_(this.dirLsLen_, trs);
  }

  get listingSize() : number {
    return this.dirLsLen_ - 1 /* ignore hardlink to parent dir */;
  }

  get length() : number { return this.filtered_.length; }

  get isMixed() : boolean { return this.listingSize != this.length; }

  get(index: number) : Img {
    if (index < 0 || index > this.length - 1) {
      throw new Error(
          'invalid image index ' +
          index + ' requested, expected [0,' +
          this.length + ')');
    }
    return this.filtered_[index];
  }

  /** Thin wrapper for {@link Img#buildEl}. */
  // TODO(zacsh) convert calls to this to `get` and `buildEl` call chained together
  buildImage(index: number) : Element { return this.get(index).buildEl(); }


  private static filterImages_(len: number, trs: NodeListOf<Element>) : Array<Img> {
    let imgs = new Array(len);

    let count = 0;
    for (let i = 0; i < trs.length; ++i) {
      let tds = trs[i].querySelectorAll('td');
      let fname = tds[0].getAttribute('data-value');
      panicif(!fname, 'failed to read data-value from first <td>');
      if (!ImageListing.isLikelyImage_(fname!)) {
        continue;
      }

      imgs[count] = new Img(
          trs[i],  // parentEl
          fname!,  // fileName
          tds[1],  // sizeEl
          tds[2]  /*modTimeEl*/);
      count++;
    }
    return imgs.slice(0, count);
  }

  private static isLikelyImage_(basename: string) : boolean {
    return Boolean(basename.toLowerCase().match(IMG_EXT_REGEXP));
  };
}
