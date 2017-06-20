import { ImageListing } from './flisting';
import { Config } from './config';
import { Grid } from './grid';

/** @type {!ImageListing} */
let listing = new ImageListing(document.querySelectorAll('tbody tr'));

new Grid(listing).startRender();
