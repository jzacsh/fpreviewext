import { MediaType, MediaListing } from './flisting';
import { Config } from './config';
import { expect } from 'chai';

import * as mck from './fixture.domharness';

describe('MediaListing of videos', () => {
  const mockTableHtml = mck.buildTableStr('p/stuff/', 'MediaListing-vidoes', [
    mck.buildRow("foo.html", mck.hm(123, '123 B'), mck.hm(432, '432 secs')),
    mck.buildRow("bar.mp4", mck.hm(34809, '33 KB'), mck.hm(431, '400+ s. since epoch')),
    mck.buildRow("thing.webm", mck.hm(13913, '14 KB'), mck.hm(194, '200+ s. since epoch')),
  ]);

  let m : MediaListing;
  beforeEach(function() {
    // TODO(zacsh)rule out that `spyOn` isn't more appropriate here
    document.body.insertAdjacentHTML('afterbegin', mockTableHtml);
    let trs = document.querySelectorAll('table#MediaListing-vidoes tbody > tr');
    expect(trs.length).to.equal(4); // including parent directory
    m = new MediaListing(trs);
  })

  afterEach(function() {
    let mockTableEl = document.getElementById('MediaListing-vidoes')
    expect(mockTableEl, 'missing mock testbed').to.be.ok;
    document.body.removeChild(mockTableEl!);
  })

  it('#listingSize getter', function() {
    expect(m.listingSize).to.equal(3);
  });

  it('#length getter', function() {
    expect(m.length, 'should have files "bar.mp4" & "thing.webm"').to.equal(2);
  });

  it('#isMixed getter', function() {
    expect(m.isMixed).to.equal(true); // foo.html is not AV
  });

  it('get(...).avType', function() {
    expect(m.get(0).avType).to.equal(MediaType.Video);
    expect(m.get(1).avType).to.equal(MediaType.Video);
  });

  it('get(...).buildEl()', function() {
    const barMp4El = m.get(0).buildEl();
    expect(barMp4El.nodeName).to.equal('A');
    expect(barMp4El.getAttribute('href')).to.equal('bar.mp4');
    expect(barMp4El.children.length).to.equal(3); // TODO(zacsh) replace <br> with some CSS
    expect(barMp4El.children[0].nodeName).to.equal('VIDEO');
    expect(barMp4El.children[0].textContent).to.equal('Preview of bar.mp4');
    expect(barMp4El.children[2].getAttribute('class')).to.equal('caption');
    expect(barMp4El.children[2].textContent).to.equal('bar.mp4');

    const thingWebmEl = m.get(1).buildEl();
    expect(thingWebmEl.nodeName).to.equal('A');
    expect(thingWebmEl.getAttribute('href')).to.equal('thing.webm');
    expect(thingWebmEl.children.length).to.equal(3); // TODO(zacsh) replace <br> with some CSS
    expect(thingWebmEl.children[0].nodeName).to.equal('VIDEO');
    expect(thingWebmEl.children[0].textContent).to.equal('Preview of thing.webm');
    expect(thingWebmEl.children[2].getAttribute('class')).to.equal('caption');
    expect(thingWebmEl.children[2].textContent).to.equal('thing.webm');
  });
})

describe('MediaListing of audio', () => {
  const mockTableHtml = mck.buildTableStr('p/stuff/', 'MediaListing-vidoes', [
    mck.buildRow("nils frahm.mp3", mck.hm(2851772, '2.8 M'), mck.hm(993, '993 secs')),
    mck.buildRow("thing.bats", mck.hm(34809, '33 KB'), mck.hm(2223, '223+ s. since epoch')),
    mck.buildRow(
      "keaton henson.flac", mck.hm(19768925, '19 M'), mck.hm(3999, '3999 s. since epoch')),
  ]);

  let m : MediaListing;
  beforeEach(function() {
    document.body.insertAdjacentHTML('afterbegin', mockTableHtml);
    let trs = document.querySelectorAll('table#MediaListing-vidoes tbody > tr');
    expect(trs.length).to.equal(4); // including parent directory
    m = new MediaListing(trs);
  })

  afterEach(function() {
    let mockTableEl = document.getElementById('MediaListing-vidoes')
    expect(mockTableEl, 'missing mock testbed').to.be.ok;
    document.body.removeChild(mockTableEl!);
  })

  it('#listingSize getter', function() {
    expect(m.listingSize).to.equal(3);
  });

  it('#length getter', function() {
    expect(m.length,
      'should have files "nils frahm.mp3" & "keaton henson.flac"').to.equal(2);
  });

  it('#isMixed getter', function() {
    expect(m.isMixed).to.equal(true); // foo.html is not AV
  });

  it('get(...).avType', function() {
    expect(m.get(0).avType).to.equal(MediaType.Audio);
    expect(m.get(1).avType).to.equal(MediaType.Audio);
  });

  it('get(...).buildEl()', function() {
    const barMp4El = m.get(0).buildEl();
    expect(barMp4El.nodeName).to.equal('A');
    expect(barMp4El.getAttribute('href')).to.equal('nils frahm.mp3');
    expect(barMp4El.children.length).to.equal(3); // TODO(zacsh) replace <br> with some CSS
    expect(barMp4El.children[0].nodeName).to.equal('AUDIO');
    expect(barMp4El.children[0].textContent).to.equal('Preview of nils frahm.mp3');
    expect(barMp4El.children[2].getAttribute('class')).to.equal('caption');
    expect(barMp4El.children[2].textContent).to.equal('nils frahm.mp3');

    const thingWebmEl = m.get(1).buildEl();
    expect(thingWebmEl.nodeName).to.equal('A');
    expect(thingWebmEl.getAttribute('href')).to.equal('keaton henson.flac');
    expect(thingWebmEl.children.length).to.equal(3); // TODO(zacsh) replace <br> with some CSS
    expect(thingWebmEl.children[0].nodeName).to.equal('AUDIO');
    expect(thingWebmEl.children[0].textContent).to.equal('Preview of keaton henson.flac');
    expect(thingWebmEl.children[2].getAttribute('class')).to.equal('caption');
    expect(thingWebmEl.children[2].textContent).to.equal('keaton henson.flac');
  });
})

describe('MediaListing of images', function() {
  it('#listingSize getter', function() { this.skip(); });
  it('#length getter', function() { this.skip(); });
  it('#isMixed getter', function() { this.skip(); });
  it('get(...)', function() { this.skip(); });
})
