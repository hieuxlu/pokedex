import * as tf from '@tensorflow/tfjs';
const modelIndexDbUrl = 'indexeddb://pokenet-model';
const modelURL = process.env.PUBLIC_URL + '/assets/js_models/mobilenet_128x128/model.json';
const pokemonNames = [
  'Abra',
  'Aerodactyl',
  'Alakazam',
  'Alolan Sandslash',
  'Arbok',
  'Arcanine',
  'Articuno',
  'Beedrill',
  'Bellsprout',
  'Blastoise',
  'Bulbasaur',
  'Butterfree',
  'Caterpie',
  'Chansey',
  'Charizard',
  'Charmander',
  'Charmeleon',
  'Clefable',
  'Clefairy',
  'Cloyster',
  'Cubone',
  'Dewgong',
  'Diglett',
  'Ditto',
  'Dodrio',
  'Doduo',
  'Dragonair',
  'Dragonite',
  'Dratini',
  'Drowzee',
  'Dugtrio',
  'Eevee',
  'Ekans',
  'Electabuzz',
  'Electrode',
  'Exeggcute',
  'Exeggutor',
  'Farfetchd',
  'Fearow',
  'Flareon',
  'Gastly',
  'Gengar',
  'Geodude',
  'Gloom',
  'Golbat',
  'Goldeen',
  'Golduck',
  'Golem',
  'Graveler',
  'Grimer',
  'Growlithe',
  'Gyarados',
  'Haunter',
  'Hitmonchan',
  'Hitmonlee',
  'Horsea',
  'Hypno',
  'Ivysaur',
  'Jigglypuff',
  'Jolteon',
  'Jynx',
  'Kabuto',
  'Kabutops',
  'Kadabra',
  'Kakuna',
  'Kangaskhan',
  'Kingler',
  'Koffing',
  'Krabby',
  'Lapras',
  'Lickitung',
  'Machamp',
  'Machoke',
  'Machop',
  'Magikarp',
  'Magmar',
  'Magnemite',
  'Magneton',
  'Mankey',
  'Marowak',
  'Meowth',
  'Metapod',
  'Mew',
  'Mewtwo',
  'Moltres',
  'MrMime',
  'Muk',
  'Nidoking',
  'Nidoqueen',
  'Nidorina',
  'Nidorino',
  'Ninetales',
  'Oddish',
  'Omanyte',
  'Omastar',
  'Onix',
  'Paras',
  'Parasect',
  'Persian',
  'Pidgeot',
  'Pidgeotto',
  'Pidgey',
  'Pikachu',
  'Pinsir',
  'Poliwag',
  'Poliwhirl',
  'Poliwrath',
  'Ponyta',
  'Porygon',
  'Primeape',
  'Psyduck',
  'Raichu',
  'Rapidash',
  'Raticate',
  'Rattata',
  'Rhydon',
  'Rhyhorn',
  'Sandshrew',
  'Sandslash',
  'Scyther',
  'Seadra',
  'Seaking',
  'Seel',
  'Shellder',
  'Slowbro',
  'Slowpoke',
  'Snorlax',
  'Spearow',
  'Squirtle',
  'Starmie',
  'Staryu',
  'Tangela',
  'Tauros',
  'Tentacool',
  'Tentacruel',
  'Vaporeon',
  'Venomoth',
  'Venonat',
  'Venusaur',
  'Victreebel',
  'Vileplume',
  'Voltorb',
  'Vulpix',
  'Wartortle',
  'Weedle',
  'Weepinbell',
  'Weezing',
  'Wigglytuff',
  'Zapdos',
  'Zubat',
];

export async function fetchModel() {
  console.log('Loading pokenet..');
  try {
    // Try loading locally saved model
    const model = await tf.loadLayersModel(modelIndexDbUrl);
    console.log('Model loaded from IndexedDB');

    return model;
  } catch (error) {
    console.log(error);
    // If local load fails, get it from the server
    try {
      const model = await tf.loadLayersModel(modelURL, { strict: true });
      console.log('Model loaded from HTTP.');

      // Store the downloaded model locally for future use
      await model.save(modelIndexDbUrl);
      console.log('Model saved to IndexedDB.');

      return model;
    } catch (error) {
      console.error(error);
    }
  }
}

export async function predictPokemon(input, model) {
  const k = 20;
  const IMG_SIZE = 128;

  // Preprocess image
  let img = tf.browser.fromPixels(input).expandDims(0);
  img = tf.image.resizeBilinear(img as any, [IMG_SIZE, IMG_SIZE]).div(255);

  // Get predictions
  const result = model.predict(img).flatten();
  const preds = result.softmax();
  const pred = preds.argMax().dataSync();

  // Get top k predictions
  const { values, indices } = tf.topk(preds, k, true);
  const topkIdx = indices.dataSync();
  const confidence = values.dataSync();
  const topKPreds = [];

  for (let i = 0; i < k; i++) {
    if (confidence[i] < 0.0001) break;
    topKPreds.push({
      conf: confidence[i],
      pred: pokemonNames[topkIdx[i]],
    });
  }
  return {
    pred: pokemonNames[pred[0]],
    topk: topKPreds,
  };
}
