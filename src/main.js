const fs = require("fs/promises");
const { json } = require("stream/consumers");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
// import testJson from '../datas/test.json' assert { type: 'json' };

/**
 

  Je te met un tit message ici, Essai de voir toutes les fonctionnalité que tu aura derriere les fonction generales
  comme getInfos, qui peut etre mis en plein de petite function ou constante, histoire que ce soit plus digeste et facile a coder
  Pour rappel en JS tu peux crée des function ou constant dans les function

  function Foo() {

    const bar = (m) => console.log(m)

    bar();
    
    👌👌👌👌👌
  }


  // FLAT MAP
  const data = [
    {
      type: ['fdfd', 'dsds']
    },
    {
      type: ['fdfd2', 'dsds2']
    }
  ]
  function Bar(datas) {
    datas.flatMap(data => data.propery)
  }

  @Return -> ['fdfd', 'dsds', 'fdfd2', 'dsds2'] tout les type de toute les cartes




  Aller bon chance ^^ 😎

  
 */
// lecture du fichier Json
// async function readCard(url) {
//   try {
//     // const data = await fs.readFile(url, "utf8");
//     data=fetch(url).then(res=>JSON.parse(res))
//     return console.log(data);
//   } catch (err) {
//     throw err;
//   }
// }

// ASYNC -> Promise
/**
 * @Input String url
 * @Return Promise<unknown>
 */
async function getData(url) {
  try {
    // const data = awit fs.readFile(url, "utf8");
    // return  fs
    //   .readFile(url)
    //   .then((res) => JSON.parse(res))
    //   .then(() => console.log("C"));

    const data = await fs.readFile(url);
    // JSON.parse(data).then(card=>sendCards(card))
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
  {
    property: "archetype",
    logProperty:'card_archetype',
    relation: "cardArchetype",
    db_name: "card_archetype",
    mapping: {
      name: "archetype"
    },
  },
  {
    property: "race",
    logProperty:'card_race',
    relation: "cardRace",
    db_name: "card_race",
    mapping: {
      name: "race"
    },
  },
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
  // console.log("relations.cardType:", relations);
  // console.log("card.type:", card.type);
  // relations[0].map((item,i)=>(console.log(`item ${i} : ${JSON.stringify(item)}`)));
  // if (card.type) {
    // cardMapped.cardTypeId = relations.map((relation)=>(relation.find(item => item.type === card.type)?.id || ''));
    cardMapped.cardTypeId = relations.cardType.find(item => item.type === card.type)?.id || '';  
  // }
  // if (card.archetype) {
    cardMapped.archetypeId = relations.cardArchetype.find(item => item.name === card.archetype)?.id || '';
  // }
  // if (card.race) {
    cardMapped.raceId = relations.cardRace.find(item => item.name === card.race)?.id || '';
  // }
  console.log(cardMapped);
    return cardMapped;
  },
};
/*
tab = {
type:[
  {},{},{}
],
archetype:[
  {},{},{}
]
}


*/
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

/**
 * 
  cardType
    type => type
    humanReadable => humandReadableCardType
 * 
 */

/* Creation de 1 relation */
async function createRelation(datas, config) {
  // new Set() va renvoyer un objet de class Set , ici on veut avoir un tableau avec no type
  // Pour ca il faut suivre l'instruction ci dessous
  // suppression des doublons

  // const relations = [...new Set(datas.flatMap((data) => data[property]))]
  //   .reduce((acc, val) => {
  //     const strVal = JSON.stringify(val);
  //     if (acc.findIndex((d) => d === strVal) === -1 && val !== undefined)
  //       acc.push(strVal);
  //     return acc;
  //   }, [])
  //   .map((d) => JSON.parse(d));

  /*
    [TYPE]
    {
      type : type,
      humanReadable : humandReadableCardType
    }
      */

  // console.log( datas
  // .filter((data) => data[config.property] ).flatMap((data) => {return [data[config.property]].map((val) => [
  //   JSON.stringify(val),
  //   setEntity(val, config.mapping),
  // ])}));
  // console.log( datas
  //   .filter((data) => data[config.property] !== undefined ));

  const entities = [
    ...new Map(
      datas
        .filter((data) => data[config.property] !== undefined)
        //  on va juste mettre un if ici
        .flatMap((data) => {
          // on recup la data
          const value = data[config.property];
          // C'est un flatMap, donc il va mettre a plat les valeur retourner
          // Donc si c'est un tableau on retourne le tableau
          // Sinon on transforme la valeur en tableau pour le flatMap
          const values = Array.isArray(value) ? value : [data];
          // let values;
          // let key;
          // if(Array.isArray(value)){
          //   values= value;
          //   key =value;
          // } else{
          //   values=[data];
          //   key=data[config.property];
          // }
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
  // const cards = [
  //   ...new Map(
  // datas
  // console.log(datas);
  const cards = datas.map((card) => configCard.mapping(card,relations));
  // datas.map((item=>(console.log(item))));
  // console.log(cards);
  // const promisesCard=cards.map((card)=>(buildQuery(card,configCard)));

  //  on va juste mettre un if ici
  // .flatMap((data) => {
  // on recup la data
  // const value = data[config.property];
  // C'est un flatMap, donc il va mettre a plat les valeur retourner
  // Donc si c'est un tableau on retourne le tableau
  // Sinon on transforme la valeur en tableau pour le flatMap
  // const values = Array.isArray(value) ? value : [data];
  // let values;
  // let key;
  // if(Array.isArray(value)){
  //   values= value;
  //   key =value;
  // } else{
  //   values=[data];
  //   key=data[config.property];
  // }
  // const isArray=Array.isArray(value);
  // return values.map((val) => [
  //  JSON.stringify(isArray ?val:value),
  // setEntity(val, config.mapping),
  // ]);
  // })
  // ).values(),
  // ];
  // console.log(cards);
  // const promises = entities.map((entity) => {
  //   return buildQuery(entity, config);
  // });
  try {
    // console.log(promises)
    // const res = await Promise.all(promises);
  } catch (e) {}
}

async function buildQuery(entity, config) {
  try {
    // console.log( ` ici : ${config.db_where}: ${entity[config.db_where]}`);
    const d = await prisma[config.relation].findFirst({
      // where: { type: entity[config.db_where] },
      where:entity
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
    } else{
      console.warn(
        `il y a deja un ${config.relation} avec la valeur ${
          entity[config.logProperty]
        } : ${JSON.stringify(d)}`
      );
    }
    // console.log('entity: ',entity);

    return d;
  } catch (e) {
    console.error("erreur dans buildQuery", e);
  }
}

/* Creation des relations */
async function createRelations(datas) {
  let createdCards = {};
  // Object.entries(relation).map(
  //   async ([prop, model]) => await createRelation(datas, prop)
  // );
  for (const config of configRelation) {
    const card =await createRelation(datas, config);
    createdCards[config.relation]=card;
    // relationCard[config.relation].push(card);
  }
  // mise en place d'un for of car foreach n'aime pas l'async
  // return configRelation.forEach(
  //   async (config) => await createRelation(datas, config)
  // );
return createdCards;
}

/*
    @Return {
      type : "Spell Card",
      humanReadable : "Equip Spell"
    }

  mapping: {
      type: 'type',
      humanReadableType: 'humanReadableCardType'
    },
*/
function setEntity(datas, mapping) {
  // construire une entité
  // console.log('datas : ',datas);
  return Object.entries(mapping).reduce((entity, [key, value]) => {
    entity[key] = datas?.[value] || "";
    return entity;
  }, {});
  // console.log(datas);
  // return datas;
}

async function setRelation(model, uniqueValues, fields) {
  // const uniqueValues = [...new Set(data.map((item) => item[uniqueField]))];
  // for (const value of uniqueValues) {
  // uniqueValues.forEach(value => {
  // });
  // ------------------
  // for (const filed of fields) {
  //   uniqueValues.map(
  //     async (value) =>
  //       await prisma[model].upsert({
  //         where: { filed: value },
  //         create: { filed: value },
  //         update: {},
  //       })
  //     );
  //   }
  // ------------------
  // }
  // console.log('model: '+ model);
  // console.log('uniqueValue: '+ uniqueValues);
  // console.log('fields: '+ fields);
}

/* Recup toute les images avec tempo */
// synchroImage()
async function start() {
  console.log("A");
  console.time("e");

  const relations = await getData("datas/test.json").then(async (datas) => {
    return await createRelations(datas);
    // NOTE: TEST
    // await createRelation(datas, configRelation[0]);
    // sendCards(data)
  });
  // console.log('card',relations);
  const datas = await getData("datas/test.json").then(async (datas) => {
    await buildCards(datas,relations);
  });
  // je creer mes relation et les pousses sur la bdd

  // boucle sur mes datas (
  // je creer ma query
  // je pousse sur ma bdd )
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

/**
 * main.js
 * start()
 * Aller chercher les infos - getInfos()
 * 
 * 
 *  On recup TOUT
 * Boucler sur les infos - buildRequestParams(infos: Toute les infos)
 *  const b = (p = 0, limit = 10000) =>
    *  p < limit + p boucleMAP(this->buildQuery)
    *  saveQuery(p).then(b(p + limit, limit))
 * Crée les requete de création de la ligne - buildQuery()
 * Crée les lignes (promise) CHUNK - Prisma - saveQuery()
 *  log('j'ai save ${p} ligne')
 *  Promise.resolve('ok')
 * log - winston (on sait jaja)
 * 
 * 
 * RG: pouvoir regler le temps de traitement (200 * 60 * 1000 line/min)
 * 
 * 
**/