

//////////////////////////////////////////////////////////////////////////////////////////////////////
const fs = require("fs/promises");
const { json } = require("stream/consumers");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
// import testJson from '../datas/test.json' assert { type: 'json' };


// ASYNC -> Promise
/**
 * @Input String url
 * @Return Promise<unknown>
 */
async function getData(url) {
  try {
      const data = await fs.readFile(url);
    let dataParse = JSON.parse(data);
    return dataParse.data;
  } catch (err) {
    throw err;
  }
}
/**
 * @Description Il doit gerer la sauvegarde en base des cards
 * @Input [] cards
 * @Return Promise<boolean>
 */
async function sendCards(cards) {
  // prisma
}

// const relation = ["type",  "archetype", "race","card_sets"];

const configRelation = [
  {
    property: "type",
    logProperty :'type',
    relation: "cardType",
    db_name: "card_type",
    db_where: "type",
    mapping: {
      type: "type",
      humanReadableType: "humanReadableCardType",
      frameType: "frameType",
    },
  },
  // {
  //   property: "card_sets",
  //   logProperty:'setName',
  //   relation: "cardSets",
  //   db_name: "card_set",
  //   mapping: {
  //     setName: "set_name",
  //     setCode: "set_code",
  //     setRarity: "set_rarity",
  //     setRarityCode: "set_rarity_code",
  //     setPrice: "set_price",
  //   },
  // },
  // {
  //   property: "card_prices",
  //   logProperty:'cardPrices',
  //   relation: "cardPrice",
  //   db_name: "card_prices",
  //   mapping: {
  //     cardmarketPrice: "cardmarket_price",
  //     tcgplayerPrice: "tcgplayer_price",
  //     ebayPrice: "ebay_price",
  //     amazonPrice: "amazon_price",
  //     coolstuffincPrice: "coolstuffinc_price",
  //   },
  // },
  // {
  //   property: "archetype",
  //   logProperty:'card_archetype',
  //   relation: "cardArchetype",
  //   db_name: "card_archetype",
  //   mapping: {
  //     name: "archetype"
  //   },
  // },
  // {
  //   property: "race",
  //   logProperty:'card_race',
  //   relation: "cardRace",
  //   db_name: "card_race",
  //   mapping: {
  //     name: "race"
  //   },
  // },
];



const relationCard=[];
const configCard = {
  property: "card",
  logProperty: "card",
  relation: "card",
  db_name: "card",
  mapping:(card,relations)=> {
    // console.log(card);
    const cardMapped={
    name:card.name,
    desc:card.desc,
    name_en:card.name_en,
    ygoprodecUrl:card.ygoprodeck_url,
    betaId: card.misc_info[0].beta_id || '0',
    konamiId: card.misc_info[0].konami_id,
    mdRarity: card.misc_info[0].md_rarity,

  }
  console.log("relations.cardType:", relations);
  console.log("card.type:", card.type);
  relations[0].map((item,i)=>(console.log(`item ${i} : ${JSON.stringify(item)}`)));
  // if (card.type) {
    cardMapped.cardTypeId = relations.find(item => item.type === card.type)?.id || '';
  // }
  // if (card.archetype) {
  //   cardMapped.archetypeId = relations.cardArchetype.find(archetype => archetype.name === card.archetype)?.id || '';
  // }
  // if (card.race) {
  //   cardMapped.raceId = relations.cardRace.find(race => race.name === card.race)?.id || '';
  // }
    return cardMapped;
  },
};

const relation = {
  type: "card_type",
  archetype: "card_archetype",
  race: "card_race",
  card_sets: "card_set",
};

// je fais ici un tableau pour toujours pouvoir bouclé dans le cadre de plusieurs champs a inserer dans la methode setRelation
const relationMappings = {
  type: ["type", "human_readable-type", "frame_type"],
  archetype: ["name"],
  race: ["name"],
  card_price: [
    "cardmarket_price",
    "tcgplayer_price",
    "ebay_price",
    "amazon_price",
    "coolstuffinc_price",
  ],
  card_sets: [
    "set_name",
    "set_code",
    "set_rarity",
    "set_rarity_code",
    "set_price",
  ],
};

/* Creation de 1 relation */
async function createRelation(datas, config) {
  const entities = [
    ...new Map(
      datas
        .filter((data) => data[config.property] !== undefined)
        //  on va juste mettre un if ici
        .flatMap((data) => {
          const value = data[config.property];
          const values = Array.isArray(value) ? value : [data];
          const isArray = Array.isArray(value);
          return values.map((val) => [
            JSON.stringify(isArray ? val : value),
            setEntity(val, config.mapping),
          ]);
        })
    ).values(),
  ];
  // console.log(entities);
  const promises = entities.map((entity) => {
    return buildQuery(entity, config);
  });
  try {
    const res = await Promise.all(promises);
    // console.log('res',res)
    return res;
  } catch (e) {}
}

async function buildCards(datas,relations) {
  const cards = datas.map((card) => configCard.mapping(card,relations));
  try {
    // console.log(promises)
    // const res = await Promise.all(promises);
  } catch (e) {}
}

async function buildQuery(entity, config) {
  try {
    // console.log(entity);
    const d = await prisma[config.relation].findFirst({
      where: { type: entity[config.db_where] },
    });

    if (!d) {
      console.log(
        `creation de ${config.relation} avec la valeur ${
          entity[config.logProperty]
        }`
      );
      return await prisma[config.relation].create({
        data: entity,
      });
    } else
      console.warn(
        `il y a deja un ${config.relation} avec la valeur ${
          entity[config.logProperty]
        } : ${JSON.stringify(d)}`
      );

    return d;
  } catch (e) {
    console.error("erreur dans buildQuery", e);
  }
}

/* Creation des relations */
async function createRelations(datas) {
  const createdCards = [];
  for (const config of configRelation) {
    const card =await createRelation(datas, config);
    createdCards.push(card);
  }
return createdCards;
}


function setEntity(datas, mapping) {
  return Object.entries(mapping).reduce((entity, [key, value]) => {
    entity[key] = datas?.[value] || "";
    return entity;
  }, {});
}

async function setRelation(model, uniqueValues, fields) {
  
}

/* Recup toute les images avec tempo */
// synchroImage()
async function start() {
  console.log("A");
  console.time("e");

  const relations = await getData("datas/test.json").then(async (datas) => {
    return await createRelations(datas);
  });
  // console.log('card',relations);
  const datas = await getData("datas/test.json").then(async (datas) => {
    await buildCards(datas,relations);
  });
}

start()
  .then(async () => {
    // Tout ce qu'il faut faire à la fin du programme
    console.timeEnd("e");
    console.log("fin du programme");
  })
  // Si on a une erreur sur le programme
  // On pourrai utiliser un gestionnaire histoire de pas perdre le fil, mais bon
  .catch(async (e) => console.error(e));