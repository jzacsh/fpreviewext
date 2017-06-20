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
  listing_: Element;
  fname_: string;
  mtime_: HumanMachine;
  size_: HumanMachine;
  bodyWidthPx_: number;

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

  /**
   * @return {!Element}
   *     An <img> element intended to display
   */ // TODO(zacsh) return a div, instead, with caption, linking, etc.
  buildEl() {
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

  /**
   * @return {string}
   * @private
   */
  get widthStyle_() { return this.bodyWidthPx_ * CONFIG.GRID_LATTICE_RATIO + 'px'; }

  /** @return {number} */
  get bytes() { return this.size_.machine; }

  /**
   * @return {number}
   * @private
   */
  static scrapeBodyWidth_() {
    const px = window.getComputedStyle(document.body).width;
    return parseInt(px.replace(/px/, ''), 10);
  }
}

/** @const {!RegExp} */
const IMG_EXT_REGEXP = /\.(png|svg|jpe?g|webp|tiff|gif)$/;

class ImageListing {
  dirLsLen_: number
  filtered_: Array<Img>
  constructor(trs: NodeListOf<Element>) {
    this.dirLsLen_ = trs.length;
    this.filtered_ = ImageListing.filterImages_(this.dirLsLen_, trs);
  }

  /** @return {number} */
  get listingSize() {
    return this.dirLsLen_ - 1 /* ignore hardlink to parent dir */;
  }

  /** @return {number} */
  get length() { return this.filtered_.length; }


  /** @return {boolean} */
  get isMixed() { return this.listingSize != this.length; }

  /** @return {!Img} */
  get(index: number) {
    if (index < 0 || index > this.length - 1) {
      throw new Error(
          'invalid image index ' +
          index + ' requested, expected [0,' +
          this.length + ')');
    }
    return this.filtered_[index];
  }

  /**
   * Thin wrapper for {@link Img#buildEl}.
   * @return {!Element}
   */
  // TODO(zacsh) convert calls to this to `get` and `buildEl` call chained together
  buildImage(index: number) { return this.get(index).buildEl(); }


  /**
   * @return {!Array.<Img>}
   * @private
   */
  static filterImages_(len: number, trs: NodeListOf<Element>) {
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

  /**
   * @return {boolean}
   * @private
   */
  static isLikelyImage_(basename: string) {
    return Boolean(basename.toLowerCase().match(IMG_EXT_REGEXP));
  };
}

class Grid {
  listing_: ImageListing;
  hasBuilt_: boolean;
  /**
   * Array index of {@link #listing_} indicating the next image still waiting to
   * be rendered.
   */
  renderIndex_: number;
  contanerEl_: Element;
  gridListEl_: Element;
  statusEl_: Element;

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

  startRender() {
    if (this.hasBuilt_) {
      throw new Error('startRender() called more than once');
    }
    this.hasBuilt_ = true;

    this.renderMore_();
  }

  /**
   * @return {boolean}
   * @private
   */
  haveUnrendereds_() { return this.renderIndex_ < this.listing_.length; }

  /**
   * Recursive rendering queue
   * @private
   */
  renderMore_ () {
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
  static isSmallRenderFrame_(cumFileSize: number) {
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
