import { MediaListing } from './flisting';
import { Config } from './config';
import { expect } from 'chai';

import * as mck from './fixture.domharness';

describe('MediaListing of videos', () => {
  let m;
  beforeEach(function() {
    // TODO(zacsh)rule out that `spyOn` isn't more appropriate here
    document.body.insertAdjacentHTML('afterbegin', mck.buildTableStr(
      'p/stuff/', 'MediaListing-vidoes', [
        mck.buildRow("foo.html",
          mck.hm(123, '123 B'),
          mck.hm(432, '432 secs')),
        mck.buildRow("bar.mp4",
          mck.hm(34809, '33 KB'),
          mck.hm(431, '400+ s. since epoch')),
        mck.buildRow("thing.webm",
          mck.hm(13913, '14 KB'),
          mck.hm(194, '200+ s. since epoch')),
    ]));

    m = new MediaListing(document.querySelectorAll(
      'table#MediaListing-vidoes tbody > tr'));
  });
  let d = this;
  it('#listingSize getter', function() { this.skip(); });
  it('#length getter', function() { this.skip(); });
  it('#isMixed getter', function() { this.skip(); });
  it('get(...)', function() { this.skip(); });
})

describe('MediaListing of audio', () => {
  it('#listingSize getter', function() { this.skip(); });
  it('#length getter', function() { this.skip(); });
  it('#isMixed getter', function() { this.skip(); });
  it('get(...)', function() { this.skip(); });
})

describe('MediaListing of images', function() {
  it('#listingSize getter', function() { this.skip(); });
  it('#length getter', function() { this.skip(); });
  it('#isMixed getter', function() { this.skip(); });
  it('get(...)', function() { this.skip(); });
})
