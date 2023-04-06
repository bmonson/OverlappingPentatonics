# OverlappingPentatonics
Javascript function that produces a list of pentatonic scales that overlap and coincide with a seven-note scale, but can generalize to any subscales within a scale.

```
// Example usage:
const tet = 12;
const scalePattern = [2, 2, 1, 2, 2, 2, 1]; // Major scale pattern (whole and half steps)
const subsetScalePattern = [2, 2, 3, 2, 3]; // Major pentatonic scale pattern (whole and whole-and-a-half steps)
const printToKey = 'C';

if (validateMusicParameters(tet, scalePattern, subsetScalePattern)) {
	console.log(findUniqueSubsetScales(tet, scalePattern, subsetScalePattern, printToKey));
}
```
