import { ImageListing } from './flisting';
import { Config } from './config';

export class Grid {
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
    return cumFileSize < Config.RENDER_FRAME_BYTES_LIMIT;
  }
}
