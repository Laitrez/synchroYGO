const fs = require("fs/promises");
const { json } = require("stream/consumers");
const { PrismaClient } = require("@prisma/client");
const { format } = require("path");

const prisma = new PrismaClient();
// import testJson from '../datas/test.json' assert { type: 'json' };


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
  {
    property: "card_sets",
    logProperty:'cardSets',
    relation: "cardSets",
    db_name: "card_set",
    mapping: {
      setName: "set_name",
      setCode: "set_code",
      setRarity: "set_rarity",
      setRarityCode: "set_rarity_code",
      setPrice: "set_price",
    },
  },
  {
    property: 'misc_info[0].formats',
    logProperty:'formats',
    relation: "formats",
    db_name: "formats",
    mapping: {
      name: "formats",
    },
  },
  {
    property: "card_prices",
    logProperty:'cardPrices',
    relation: "cardPrice",
    db_name: "card_prices",
    mapping: {
      cardmarketPrice: "cardmarket_price",
      tcgplayerPrice: "tcgplayer_price",
      ebayPrice: "ebay_price",
      amazonPrice: "amazon_price",
      coolstuffincPrice: "coolstuffinc_price",
    },
  },
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
    // console.log('card : ',card);
    const cardMapped={
    name:card.name,
    desc:card.desc,
    name_en:card.name_en,
    ygoprodecUrl:card.ygoprodeck_url,
    betaId: card.misc_info[0].beta_id || 0,
    konamiId: card.misc_info[0].konami_id,
    mdRarity: card.misc_info[0].md_rarity,
    
  }
 cardMapped.cardTypeId = relations.cardType.find(item => item.type === card.type)?.id || '';  
 cardMapped.cardArchetypeId = parseInt(relations.cardArchetype.find(item => item.name === card.archetype)?.id) || null;
 cardMapped.cardRaceId = relations.cardRace.find(item => item.name === card.race)?.id || '';


 cardMapped.cardSets = {
  connect:
  card.card_sets
        .map(set => relations.cardSets.find(item => item.setCode === set.set_code)?.id).map((id)=>({id}))};  
        
//  cardMapped.cardPrices = card.card_prices
//         .map(set => relations.cardPrice.find(item=>item.cardmarketPrice === set.cardmarket_price && item.tcgplayerPrice === set.tcgplayer_price )?.id);  
 cardMapped.formats={
  connect:card.misc_info[0].formats.map(forma=>relations.formats.find(item=>forma===item.name)?.id).map((id)=>({id}))};
        
 console.log(cardMapped);
 return cardMapped;
      },
};

const relation = {
  type: "card_type",
  archetype: "card_archetype",
  race: "card_race",
  card_sets: "card_set",
  formats:"formats"
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
  formats:[
    "formats",
  ]
};

/**
 * 
  cardType
    type => type
    humanReadable => humandReadableCardType
 * 
 */

/*creation des formats */
async function createFormat(datas,config){
  const formats= [...new Set(datas.flatMap((data) => data.misc_info[0].formats))];
  d=formats.map((form)=>buildQuery({name:form},config));
  const res = await Promise.all(d);
  return res;
}

/* Creation de 1 relation */
async function createRelation(datas, config) {
  
  const getNestedValues = (obj, chem) => {
    
    d= chem.replace(/\[(\d+)\]/g, '.$1').split('.').reduce((acc, key) => acc?.[key], obj);
    //  console.log(d); 
    return d;
  }
  
    const entities = [
    ...new Map(
      datas
        // .filter((data) => data[config.property] !== undefined)'---->legacy
        .filter((data) => getNestedValues(data,config.property) !== undefined)
        //  on va juste mettre un if ici
        .flatMap((data) => {
          // on recup la data
          // const value = data[config.property] ;`--->leacy
          const value = getNestedValues(data,config.property) ;
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
  const promisesCard = cards.map((entity) => {
    return buildQuery(entity, configCard);
  });
    try {
    // console.log(promises)
    const res = await Promise.all(promisesCard);
  } catch (e) {}
}

async function buildQuery(entity, config) {
  try {
    // console.log( ` ici : ${config.db_where}: ${entity[config.db_where]}`);
    // console.log('entity ! : ',entity);
    const searchOptions = {
      where: {
        ...entity,
      },
    };
    if (config.relation === "card" && entity.formats) {
      searchOptions.where.formats = {
        some: {
          id: { in: entity.formats.connect.map((format) => format.id) },
        },
      }
      // console.log(entity.cardSets);
      searchOptions.where.cardSets = {
        some: {
          id: { in: entity.cardSets.connect.map((cardset) => cardset.id) },
        },
      }
    };

    const d = await prisma[config.relation].findFirst({
      // where: { type: entity[config.db_where] },
      // where: entity
      where:searchOptions.where
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

    return d;
  } catch (e) {
    console.error("erreur dans buildQuery", e);
  }
}

/* Creation des relations */
async function createRelations(datas) {
  let createdCards = {};
  for (const config of configRelation) {
    // const card =config.relation==='formats'? await createFormat(datas,config):await createRelation(datas, config);-->legacy
    const card =await createRelation(datas, config);
    createdCards[config.relation]=card;
  }
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
    // console.log('key :',key);
    entity[key] = datas?.[value] || (value==='formats'?datas:'') ;
    return entity; 
  }, {});
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