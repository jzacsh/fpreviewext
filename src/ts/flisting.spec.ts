import { MediaType, MediaListing } from './flisting';
import { Config } from './config';
import { expect } from 'chai';

import * as mck from './fixture.domharness';

function setupTestbed(id: string, testBedHTML: string) : Element {
  // TODO(zacsh)rule out that `spyOn` isn't more appropriate here
  document.body.insertAdjacentHTML('afterbegin', testBedHTML);
  let testBed = document.getElementById(id);
  expect(testBed).to.be.ok;
  return testBed!;
}

function tearDownTestbed(id: string) : void {
  let mockTableEl = document.getElementById(id)
  expect(mockTableEl, 'missing mock testbed ID=' + id).to.be.ok;
  document.body.removeChild(mockTableEl!);
}

describe('MediaListing sub directories', () => {
  const testBedId = 'MediaListing-subdirs';
  const mockTableHtml = mck.buildTableStr('p/stuff/', testBedId, [
    mck.buildRow("nils frahm.mp3", mck.hm(2851772, '2.8 M'), mck.hm(993, '993 secs')),
    mck.buildRow("henson.opus", mck.hm(17348923, '17 M'), mck.hm(3882, '3882 s. since epoch')),
  ]);

  let m : MediaListing;
  let trs : NodeListOf<Element>;
  beforeEach(function() {
    trs = setupTestbed(testBedId, mockTableHtml).querySelectorAll('tbody > tr');
    expect(trs.length).to.equal(3); // including parent directory
  });

  afterEach(tearDownTestbed.bind(null, testBedId));

  it('should ignore parent directory hardlink', function() {
    m = new MediaListing(trs);
    expect(trs.length).to.equal(3);
    expect(trs.length).to.be.above(m.length);
    expect(m.length).to.equal(2);
  });

  it('should ignore directories with tricky names', function() {
    let anch = trs[1].children[0]/*<td>*/.children[0];
    expect(anch.getAttribute('class')).to.equal('icon file');
    anch.setAttribute('class', 'icon dir');
    expect(anch.getAttribute('class')).to.equal('icon dir');
    m = new MediaListing(trs);
    expect(m.length).to.equal(1);
  });
});

describe('MediaListing of videos', () => {
  const testBedId = 'MediaListing-vidoes';
  const mockTableHtml = mck.buildTableStr('p/stuff/', testBedId, [
    mck.buildRow("foo.html", mck.hm(123, '123 B'), mck.hm(432, '432 secs')),
    mck.buildRow("bar.mp4", mck.hm(34809, '33 KB'), mck.hm(431, '400+ s. since epoch')),
    mck.buildRow("thing.webm", mck.hm(13913, '14 KB'), mck.hm(194, '200+ s. since epoch')),
  ]);

  let m : MediaListing;
  beforeEach(function() {
    let trs = setupTestbed(testBedId, mockTableHtml).querySelectorAll('tbody > tr');
    expect(trs.length).to.equal(4); // including parent directory
    m = new MediaListing(trs);
  });

  afterEach(tearDownTestbed.bind(null /*this*/, testBedId));

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
    expect(barMp4El.children[0].getAttribute('src')).to.equal('bar.mp4');
    expect(barMp4El.children[2].getAttribute('class')).to.equal('caption');
    expect(barMp4El.children[2].textContent).to.equal('bar.mp4');

    const thingWebmEl = m.get(1).buildEl();
    expect(thingWebmEl.nodeName).to.equal('A');
    expect(thingWebmEl.getAttribute('href')).to.equal('thing.webm');
    expect(thingWebmEl.children.length).to.equal(3); // TODO(zacsh) replace <br> with some CSS
    expect(thingWebmEl.children[0].nodeName).to.equal('VIDEO');
    expect(thingWebmEl.children[0].textContent).to.equal('Preview of thing.webm');
    expect(thingWebmEl.children[0].getAttribute('src')).to.equal('thing.webm');
    expect(thingWebmEl.children[2].getAttribute('class')).to.equal('caption');
    expect(thingWebmEl.children[2].textContent).to.equal('thing.webm');
  });
});

describe('MediaListing of audio', () => {
  const testBedId = 'MediaListing-audio';
  const mockTableHtml = mck.buildTableStr('p/stuff/', testBedId, [
    mck.buildRow("nils frahm.mp3", mck.hm(2851772, '2.8 M'), mck.hm(993, '993 secs')),
    mck.buildRow("thing.bats", mck.hm(34809, '33 KB'), mck.hm(2223, '223+ s. since epoch')),
    mck.buildRow("keaton.flac", mck.hm(19768925, '19 M'), mck.hm(3999, '3999 s. since epoch')),
    mck.buildRow("henson.opus", mck.hm(17348923, '17 M'), mck.hm(3882, '3882 s. since epoch')),
  ]);

  let m : MediaListing;
  beforeEach(function() {
    let trs = setupTestbed(testBedId, mockTableHtml).querySelectorAll('tbody > tr');
    expect(trs.length).to.equal(5); // including parent directory
    m = new MediaListing(trs);
  });

  afterEach(tearDownTestbed.bind(null /*this*/, testBedId));

  it('#listingSize getter', function() {
    expect(m.listingSize).to.equal(4);
  });

  it('#length getter', function() {
    expect(m.length,
      'should have files "nils frahm.mp3", "keaton.flac", "henson.opus"').to.equal(3);
  });

  it('#isMixed getter', function() {
    expect(m.isMixed).to.equal(true); // foo.html is not AV
  });

  it('get(...).avType', function() {
    expect(m.get(0).avType).to.equal(MediaType.Audio);
    expect(m.get(1).avType).to.equal(MediaType.Audio);
  });

  it('get(...).buildEl()', function() {
    const nilsFrahmMp3El = m.get(0).buildEl();
    expect(nilsFrahmMp3El.nodeName).to.equal('A');
    expect(nilsFrahmMp3El.getAttribute('href')).to.equal('nils frahm.mp3');
    expect(nilsFrahmMp3El.children.length).to.equal(3); // TODO(zacsh) replace <br> with some CSS
    expect(nilsFrahmMp3El.children[0].nodeName).to.equal('AUDIO');
    expect(nilsFrahmMp3El.children[0].textContent).to.equal('Preview of nils frahm.mp3');
    expect(nilsFrahmMp3El.children[0].getAttribute('src')).to.equal('nils frahm.mp3');
    expect(nilsFrahmMp3El.children[2].getAttribute('class')).to.equal('caption');
    expect(nilsFrahmMp3El.children[2].textContent).to.equal('nils frahm.mp3');

    const keatonFlacEl = m.get(1).buildEl();
    expect(keatonFlacEl.nodeName).to.equal('A');
    expect(keatonFlacEl.getAttribute('href')).to.equal('keaton.flac');
    expect(keatonFlacEl.children.length).to.equal(3); // TODO(zacsh) replace <br> with some CSS
    expect(keatonFlacEl.children[0].nodeName).to.equal('AUDIO');
    expect(keatonFlacEl.children[0].textContent).to.equal('Preview of keaton.flac');
    expect(keatonFlacEl.children[0].getAttribute('src')).to.equal('keaton.flac');
    expect(keatonFlacEl.children[2].getAttribute('class')).to.equal('caption');
    expect(keatonFlacEl.children[2].textContent).to.equal('keaton.flac');

    const hensonOpusEl = m.get(2).buildEl();
    expect(hensonOpusEl.nodeName).to.equal('A');
    expect(hensonOpusEl.getAttribute('href')).to.equal('henson.opus');
    expect(hensonOpusEl.children.length).to.equal(3); // TODO(zacsh) replace <br> with some CSS
    expect(hensonOpusEl.children[0].nodeName).to.equal('AUDIO');
    expect(hensonOpusEl.children[0].textContent).to.equal('Preview of henson.opus');
    expect(hensonOpusEl.children[0].getAttribute('src')).to.equal('henson.opus');
    expect(hensonOpusEl.children[2].getAttribute('class')).to.equal('caption');
    expect(hensonOpusEl.children[2].textContent).to.equal('henson.opus');
  });
});

describe('MediaListing of images', function() {
  const testBedId = 'MediaListing-images';

  const mockTableHtml = mck.buildTableStr('p/stuff/', testBedId, [
    mck.buildRow("nils album cover.jpg", mck.hm(2851772, '2.8 M'), mck.hm(993, '993 secs')),
    mck.buildRow("thing.png", mck.hm(34809, '33 KB'), mck.hm(2223, '223+ s. since epoch')),
    mck.buildRow("stuff.txt", mck.hm(98403, '99 KB'), mck.hm(3828, '338+ s. since epoch')),
    mck.buildRow("keaton.gif", mck.hm(53718111, '53 M'), mck.hm(3999, '3999 s. since epoch')),
    mck.buildRow("henson.webp", mck.hm(17348923, '17 M'), mck.hm(3882, '3882 s. since epoch')),
  ]);

  let m : MediaListing;
  beforeEach(function() {
    let trs = setupTestbed(testBedId, mockTableHtml).querySelectorAll('tbody > tr');
    expect(trs.length).to.equal(6); // including parent directory
    m = new MediaListing(trs);
  });

  afterEach(tearDownTestbed.bind(null /*this*/, testBedId));

  it('#listingSize getter', function() {
    expect(m.listingSize).to.equal(5);
  });

  it('#length getter', function() {
    expect(m.length).to.equal(4);
  });

  it('#isMixed getter', function() {
    expect(m.isMixed).to.equal(true);
  });

  it('get(...)', function() {
    const nilsAlbumJpg = m.get(0).buildEl();
    expect(nilsAlbumJpg.nodeName).to.equal('A');
    expect(nilsAlbumJpg.getAttribute('href')).to.equal('nils album cover.jpg');
    expect(nilsAlbumJpg.children.length).to.equal(3); // TODO(zacsh) replace <br> with some CSS
    expect(nilsAlbumJpg.children[0].nodeName).to.equal('IMG');
    expect(nilsAlbumJpg.children[0].getAttribute('alt')).to.equal('Preview of nils album cover.jpg');
    expect(nilsAlbumJpg.children[0].getAttribute('src')).to.equal('nils album cover.jpg');
    expect(nilsAlbumJpg.children[2].getAttribute('class')).to.equal('caption');
    expect(nilsAlbumJpg.children[2].textContent).to.equal('nils album cover.jpg');

    const keatonGifEl = m.get(3).buildEl();
    expect(keatonGifEl.nodeName).to.equal('A');
    expect(keatonGifEl.getAttribute('href')).to.equal('keaton.gif');
    expect(keatonGifEl.children.length).to.equal(3); // TODO(zacsh) replace <br> with some CSS
    expect(keatonGifEl.children[0].nodeName).to.equal('IMG');
    expect(keatonGifEl.children[0].getAttribute('alt')).to.equal('Preview of keaton.gif');
    expect(nilsAlbumJpg.children[0].getAttribute('src')).to.equal('keaton.gif');
    expect(keatonGifEl.children[2].getAttribute('class')).to.equal('caption');
    expect(keatonGifEl.children[2].textContent).to.equal('keaton.gif');
  });
});
