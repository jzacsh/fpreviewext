'use strict';

/** @const {!Object.<string, boolean>} */
const FEATURES = {
  GRID_LAYOUT: true,
};

/** @const {!Object.<string, string|number>} */
const CONFIG = {
  GRID_LATTICE_RATIO: .25, // (0,1]
};


class Img {
  /**
   * @param {!Element} parentEl
   * @param {string} fileName
   * @param {!Element} sizeEl
   * @param {!Element} modTimeEl
   */
  constructor(parentEl, fileName, sizeEl, modTimeEl) {
    /** @private {!Element} */
    this.listing_ = parentEl;
    /** @private {string} */
    this.fname_ = fileName;

    /**
     * @type {
     *   stamp: number,
     *   human: string
     * }
     */
    this.mtime_ = {
      stamp: parseInt(modTimeEl.getAttribute('data-value'), 10),
      human: modTimeEl.textContent,
    };

    /**
     * @type {
     *   bytes: number,
     *   dush: string
     * }
     */
    this.size_ = {
      bytes: parseInt(sizeEl.getAttribute('data-value'), 10),
      dush: sizeEl.textContent,
    };

    /* @private {number} */
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
  /** @param {!Element} trs */
  constructor(trs) {
    /** @private {number} */
    this.dirLsLen_ = trs.length;

    /** @private {!Array.<Img>} */
    this.filtered_ = ImageListing.filterImages_(this.dirLsLen_, trs);
  }

  /** @return {number} */
  get listingSize() {
    return this.dirLsLen_ - 1 /* ignore hardlink to parent dir */;
  }

  /** @return {number} */
  get length() { return this.filtered_.length; }


  /** @return {boolean} */
  get isMixed() { return listingLen != this.length; }

  /**
   * Thin wrapper for {@link Img#buildEl}.
   * @param {number} index
   * @return {!Element}
   */
  buildImage(index) {
    if (index < 0 || index > this.length - 1) {
      throw new Error(
          'invalid image index ' +
          index + ' requested, expected [0,' +
          this.length + ')');
    }

    return this.filtered_[index].buildEl();
  }


  /**
   * @param {number} len
   * @param{!Element} trs
   * @return {!Array.<Img>}
   * @private
   */
  static filterImages_(len, trs) {
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
   * @param {string} basename
   * @return {boolean}
   * @private
   */
  static isLikelyImage_(basename) {
    return Boolean(basename.toLowerCase().match(IMG_EXT_REGEXP));
  };
}

class Grid {
  /** @param {!ImageListing} listing */
  constructor(listing) {
    /* @private {!ImageListing} */
    this.listing_ = listing;

    /** @private {boolean} */
    this.hasBuilt_ = false;

    /**
     * Array index of {@link #listing_}.
     * @private {number}
     */
    this.renderIndex_ = 0;

    /** @private {!Element} */
    this.contanerEl_ = document.createElement('div');
    this.contanerEl_.setAttribute('id', 'imagebrowse');
    document.body.appendChild(this.contanerEl_);

    /** @private {!Element} */
    this.gridListEl_ = document.createElement('ul');
    this.contanerEl_.appendChild(this.gridListEl_);

    /** @private {!Element} */
    this.statusEl_ = document.createElement('p');
    this.statusEl_.setAttribute('class', 'status');
    this.contanerEl_.appendChild(this.statusEl_);
  }

  build() {
    if (this.hasBuilt_) {
      throw new Error('build() called more than once');
    }
    this.hasBuilt_ = true;

    for (let i = 0; i < this.listing_.length; ++i) {
      let liEl = document.createElement('li');
      liEl.appendChild(this.listing_.buildImage(i));
      this.gridListEl_.appendChild(liEl);
    }
  }
}

/** @type {!ImageListing} */
let listing = new ImageListing(document.querySelectorAll('tbody tr'));

// console.log('found %d images of %d files....', listing.length, listing.listingSize);
if (listing.length) {
  if (FEATURES.GRID_LAYOUT) {
    // console.log('rendering grid layout');
    new Grid(listing).build();
  } else {
    // console.log('rendering inlined-images layout');
    throw new Error('\tJK! not yet implemented');
  }
}
