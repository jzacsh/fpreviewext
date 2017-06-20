import { MediaListing } from './flisting';
import { Config } from './config';

export class Grid {
  private listing: MediaListing;
  private hasBuilt: boolean;
  /**
   * Array index of {@link #listing} indicating the next image still waiting to
   * be rendered.
   */
  private renderIndex: number;
  private contanerEl: Element;
  private gridListEl: Element;
  private statusEl: Element;

  constructor(listing: MediaListing) {
    this.listing = listing;
    this.hasBuilt = false;
    this.renderIndex = 0;

    this.contanerEl = document.createElement('div');
    this.contanerEl.setAttribute('id', 'imagebrowse');
    document.body.appendChild(this.contanerEl);

    this.gridListEl = document.createElement('ul');
    this.contanerEl.appendChild(this.gridListEl);

    this.statusEl = document.createElement('p');
    this.statusEl.setAttribute('class', 'status');
    this.contanerEl.appendChild(this.statusEl);
  }

  startRender() : void {
    if (this.hasBuilt) {
      throw new Error('startRender() called more than once');
    }
    this.hasBuilt = true;

    this.renderMore();
  }

  private haveUnrendereds() : boolean { return this.renderIndex < this.listing.length; }

  /** Recursive rendering queue */
  private renderMore () : void {
    let renderedSize = 0; // size of images we've clobbered the DOM with
    while (this.haveUnrendereds() && Grid.isSmallRenderFrame(renderedSize)) {
      let img = this.listing.get(this.renderIndex);

      let liEl = document.createElement('li');
      liEl.appendChild(img.buildEl());
      this.gridListEl.appendChild(liEl);

      renderedSize += img.bytes;
      this.renderIndex++;
    }

    if (!this.haveUnrendereds()) {
      return; // We're done
    }

    window.requestAnimationFrame(this.renderMore.bind(this));
  }

  /**
   * @param {number} cumFileSize
   *    Total cumulative byte count of image files added to DOM for rendering,
   *    within a single render frame.
   * @return {boolean}
   */
  private static isSmallRenderFrame(cumFileSize: number) : boolean {
    return cumFileSize < Config.RENDER_FRAME_BYTES_LIMIT;
  }
}
