import { MediaListing } from './flisting';
import { Config } from './config';
import { Grid } from './grid';

/** @type {!MediaListing} */
let listing = new MediaListing(document.querySelectorAll('tbody tr'));

new Grid(listing).startRender();
