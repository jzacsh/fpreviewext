export default function panicif(failure: boolean, error: string) : void {
  if (!failure) {
    return;
  }
  throw new Error('panic: ' + error);
};
