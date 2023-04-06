function validateMusicParameters(tet, scalePattern, subsetScalePattern) {
  if (tet <= 0) {
    throw new Error('TET must be a positive integer.');
  }

  if (!Array.isArray(scalePattern) || !Array.isArray(subsetScalePattern)) {
    throw new Error('Both scalePattern and subsetScalePattern must be arrays.');
  }

  if (scalePattern.length >= tet || subsetScalePattern.length >= scalePattern.length) {
    throw new Error('The length of scalePattern must be less than TET.');
  }

  if (subsetScalePattern.length >= scalePattern.length) {
    throw new Error('The length of subsetScalePattern must be less then the length of scalePattern.');
  }

  if (scalePattern.reduce((a, b) => a + b) !== tet) {
    throw new Error('The sum of the numbers in the scalePattern must equal TET.');
  }

  if (subsetScalePattern.reduce((a, b) => a + b) !== tet) {
    throw new Error('The sum of the numbers in the subsetScalePattern must equal TET.');
  }

  return true;
}

function toRoman(num) {
  const romanNumerals = {
    M: 1000,
    CM: 900,
    D: 500,
    CD: 400,
    C: 100,
    XC: 90,
    L: 50,
    XL: 40,
    X: 10,
    IX: 9,
    V: 5,
    IV: 4,
    I: 1,
  };

  let roman = '';

  for (let key in romanNumerals) {
    while (num >= romanNumerals[key]) {
      roman += key;
      num -= romanNumerals[key];
    }
  }

  return roman;
}

function indexToNote(noteIndex, baseNote) {
  const sharpNotes = [
    "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"
  ];
  const flatNotes = [
    "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"
  ];

  // Use flats for these keys
  const useFlats = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];

  // Choose the appropriate note array based on the base note
  const notes = useFlats.includes(baseNote) ? flatNotes : sharpNotes;

  // Find the index of the base note
  const baseIndex = notes.indexOf(baseNote);

  // Calculate the new note index
  const newIndex = (baseIndex + noteIndex) % 12;

  // Return the new note
  return notes[newIndex];
}

function generateFullScale(tet, scalePattern) {
  let scale = [0];
  let currentNote = 0;
  for (let i = 0; i < scalePattern.length - 1; i++) {
    currentNote += scalePattern[i];
    currentNote %= tet;
    scale.push(currentNote);
  }
  return scale;
}

function findUniqueSubsetScales(tet, scalePattern, subsetScalePattern, printToKey = '') {
  const fullScale = generateFullScale(tet, scalePattern);
  const allScales = [];

  for (let i = 0; i < fullScale.length; i++) {
    for (let j = 0; j < subsetScalePattern.length; j++) {
      const scale = [];
      const subScale = [];
      const subScalePattern1 = [];
      const subScalePattern2 = [];
      let note = fullScale[i];
      let subsetIndex = j;
      for (let k = 0; k < subsetScalePattern.length; k++) {
        scale.push(note);
        subScale.push(note);
        subScalePattern1.push(subsetScalePattern[k]);
        subScalePattern2.push(subsetScalePattern[subsetIndex]);
        note = (note + subsetScalePattern[subsetIndex]) % tet;
        subsetIndex = (subsetIndex + 1) % subsetScalePattern.length;
      }
      allScales.push({
        sortedScale: scale.sort((a, b) => a - b),
        subScale,
        subScalePattern1,
        subScalePattern2, 
        subScaleNotes: subScale.map((note) => (tet === 12 && printToKey ? indexToNote(note, printToKey) : note)),
        scaleIndex: i,
        subsetIndex: j,
        subsetName: [
                'Major Pentatonic',
                'Suspended Pentatonic',
                'Blues Minor Pentatonic',
                'Blues Major Pentatonic',
                'Minor Pentatonic',
              ][j]
      });
    }
  }
 
  const filteredScales = allScales
    .filter(scaleObj => {
      return scaleObj.subScale.every(note => fullScale.includes(note));
    })

  const uniqueScales = [];
  const uniqueScaleInfos = [];

  for (let i = 0; i < filteredScales.length; i++) {
    const scaleStr = filteredScales[i].sortedScale.toString();
    const scaleIndex = uniqueScales.findIndex((scale) => scale.toString() === scaleStr);

    if (scaleIndex === -1) {
      uniqueScales.push(filteredScales[i].sortedScale);
      uniqueScaleInfos.push([
        {
          subScale: filteredScales[i].subScale,
          romanNumeral: toRoman(filteredScales[i].scaleIndex + 1),
          subsetIndex: filteredScales[i].subsetIndex,
        },
      ]);
    } else {
      uniqueScaleInfos[scaleIndex].push({
        subScale: filteredScales[i].subScale,
        romanNumeral: toRoman(filteredScales[i].scaleIndex + 1),
        subsetIndex: filteredScales[i].subsetIndex,
      });
    }
  }

  const result = uniqueScales
    .map((scale, index) => ({
      uniqueScale: scale.map((note) => (tet === 12 && printToKey ? indexToNote(note, printToKey) : note)),
      scaleInfos: uniqueScaleInfos[index].map((info) => {
        const submodeName =
          tet === 12 && subsetScalePattern.toString() === [2, 2, 3, 2, 3].toString()
            ? [
                'Major Pentatonic',
                'Suspended Pentatonic',
                'Blues Minor Pentatonic',
                'Blues Major Pentatonic',
                'Minor Pentatonic',
              ][info.subsetIndex]
            : `${info.subsetIndex} submode`;

        return {
          subScale: info.subScale.map((note) =>
            tet === 12 && printToKey ? indexToNote(note, printToKey) : note
          ),
          romanNumeral: info.romanNumeral,
          subsetIndex: info.subsetIndex,
          submodeName: submodeName,
        };
      }),
    }))
    .filter((item) => item.scaleInfos.some((info) => info.subsetIndex === 0));

  return result;
}

// Example usage:
const tet = 12;
const scalePattern = [2, 2, 1, 2, 2, 2, 1]; // Major scale pattern (whole and half steps)
const subsetScalePattern = [2, 2, 3, 2, 3]; // Major pentatonic scale pattern (whole and whole-and-a-half steps)
const printToKey = 'Bb';

if (validateMusicParameters(tet, scalePattern, subsetScalePattern)) {
	console.log(findUniqueSubsetScales(tet, scalePattern, subsetScalePattern, printToKey));
}
