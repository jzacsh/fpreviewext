/** @const {!Object.<string, boolean>} */
const FEATURES = {
  GRID_LAYOUT: true,
};

/** @const {!Object.<string, string|number>} */
const CONFIG = {
  GRID_LATTICE_RATIO: .25, // (0,1]
  RENDER_FRAME_BYTES_LIMIT: 1500000, // 4M
};

interface HumanMachine {
  machine: number;
  human: string;
}


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
      machine: parseInt(modTimeEl.getAttribute('data-value'), 10),
      human: modTimeEl.textContent,
    };

    this.size_ = {
      machine: parseInt(sizeEl.getAttribute('data-value'), 10),
      human: sizeEl.textContent,
    };
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
    return this.bodyWidthPx_ * CONFIG.GRID_LATTICE_RATIO + 'px';
  }

  get bytes() : number { return this.size_.machine; }

  private static scrapeBodyWidth_() : number {
    const px = window.getComputedStyle(document.body).width;
    return parseInt(px.replace(/px/, ''), 10);
  }
}

/** @const {!RegExp} */
const IMG_EXT_REGEXP = /\.(png|svg|jpe?g|webp|tiff|gif)$/;

class ImageListing {
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
      if (!ImageListing.isLikelyImage_(fname)) {
        continue;
      }

      imgs[count] = new Img(
          trs[i],  // parentEl
          fname,  // fileName
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

class Grid {
  private listing_: ImageListing;
  private hasBuilt_: boolean;
  /**
   * Array index of {@link #listing_} indicating the next image still waiting to
   * be rendered.
   */
  private renderIndex_: number;
  private contanerEl_: Element;
  private gridListEl_: Element;
  private statusEl_: Element;

  constructor(listing: ImageListing) {
    this.listing_ = listing;
    this.hasBuilt_ = false;
    this.renderIndex_ = 0;

    this.contanerEl_ = document.createElement('div');
    this.contanerEl_.setAttribute('id', 'imagebrowse');
    document.body.appendChild(this.contanerEl_);

    this.gridListEl_ = document.createElement('ul');
    this.contanerEl_.appendChild(this.gridListEl_);

    this.statusEl_ = document.createElement('p');
    this.statusEl_.setAttribute('class', 'status');
    this.contanerEl_.appendChild(this.statusEl_);
  }

  startRender() : void {
    if (this.hasBuilt_) {
      throw new Error('startRender() called more than once');
    }
    this.hasBuilt_ = true;

    this.renderMore_();
  }

  private haveUnrendereds_() : boolean { return this.renderIndex_ < this.listing_.length; }

  /** Recursive rendering queue */
  private renderMore_ () : void {
    let renderedSize = 0; // size of images we've clobbered the DOM with
    while (this.haveUnrendereds_() && Grid.isSmallRenderFrame_(renderedSize)) {
      let img = this.listing_.get(this.renderIndex_);

      let liEl = document.createElement('li');
      liEl.appendChild(img.buildEl());
      this.gridListEl_.appendChild(liEl);

      renderedSize += img.bytes;
      this.renderIndex_++;
    }

    if (!this.haveUnrendereds_()) {
      return; // We're done
    }

    window.requestAnimationFrame(this.renderMore_.bind(this));
  }

  /**
   * @param {number} cumFileSize
   *    Total cumulative byte count of image files added to DOM for rendering,
   *    within a single render frame.
   * @return {boolean}
   */
  private static isSmallRenderFrame_(cumFileSize: number) : boolean {
    return cumFileSize < CONFIG.RENDER_FRAME_BYTES_LIMIT;
  }
}

/** @type {!ImageListing} */
let listing = new ImageListing(document.querySelectorAll('tbody tr'));

// console.log('found %d images of %d files....', listing.length, listing.listingSize);
if (listing.length) {
  if (FEATURES.GRID_LAYOUT) {
    // console.log('rendering grid layout');
    new Grid(listing).startRender();
  } else {
    // console.log('rendering inlined-images layout');
    throw new Error('\tJK! not yet implemented');
  }
}
