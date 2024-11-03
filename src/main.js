const fs = require("fs/promises");
const { json } = require("stream/consumers");
// const { PrismaClient } = require("@prisma/client");

// const prisma = new PrismaClient();
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
  // {
  //   property: "type",
  //   relation: "cardType",
  //   db_name: "card_type",
  //   db_where: "type",
  //   mapping: {
  //     type: "type",
  //     humanReadableType: "humanReadableCardType",
  //     frameType: "frameType",
  //   },
  // },
  {
    property: "card_sets",
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
];

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
          const values = Array.isArray(value) ? value : [value];
          return values.map((val) => [
            JSON.stringify(val),
            setEntity(val, config.mapping),
          ]);
        })
    ).values(),
  ];

  const promises = entities.map((entity) => {
    return buildQuery(entity, config);
  });
  try {
    console.log(promises)
    // const res = await Promise.all(promises);
  } catch (e) {}

}

async function buildQuery(entity, config) {
  try {
    const d = await prisma[config.relation].findFirst({
      where: { type: entity[config.db_where] },
    });

    if (!d) {
      console.log(
        `creation de ${config.relation} avec la valeur ${
          entity[config.property]
        }`
      );
      return await prisma[config.relation].create({
        data: entity,
      });
    } else
      console.warn(
        `il y a deja un ${config.relation} avec la valeur ${
          entity[config.property]
        }`
      );

    return null;
  } catch (e) {
    console.error("erreur dans buildQuery", e);
  }
}

/* Creation des relations */
async function createRelations(datas) {
  // Object.entries(relation).map(
  //   async ([prop, model]) => await createRelation(datas, prop)
  // );
  return configRelation.forEach(
    async (config) => await createRelation(datas, config)
  );
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
  return Object.entries(mapping).reduce((entity, [key, value]) => {
    entity[key] = datas?.[value] || null;
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

  const cards = await getData("datas/test.json").then(async (datas) => {
    await createRelations(datas);
    // NOTE: TEST
    // await createRelation(datas, configRelation[0]);
    // sendCards(data)
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
 Faut faire quoi ?
         {
      "id": 37478723,
      "name": "\"Armes Nobles Inferno - Durendal\"",
      "type": "Spell Card",
      "humanReadableCardType": "Equip Spell",
      "frameType": "spell",
      "desc": "Tant que cette carte est \u00e9quip\u00e9e \u00e0 un monstre : vous pouvez ajouter 1 monstre FEU Guerrier de max. Niveau 5 depuis votre Deck \u00e0 votre main, puis d\u00e9truisez cette carte. Si cette carte est envoy\u00e9e au Cimeti\u00e8re parce que le monstre \u00e9quip\u00e9 est envoy\u00e9 au Cimeti\u00e8re : vous pouvez cibler 1 monstre FEU Guerrier de max. Niveau 5 dans votre Cimeti\u00e8re ; Invoquez-le Sp\u00e9cialement, et aussi, vous ne pouvez pas Invoquer Sp\u00e9cialement de monstres (monstres Guerrier exclus) le reste du tour. Vous ne pouvez utiliser qu'1 effet de \"\"Armes Nobles Inferno - Durendal\"\" par tour, et uniquement une fois le tour.",
      "race": "Equip",
      "name_en": "\"Infernoble Arms - Durendal\"",
      "archetype": "Noble Knight",
      "ygoprodeck_url": "https://ygoprodeck.com/card/infernoble-arms-durendal-10991",
      "card_sets": [
        {
          "set_name": "2021 Tin of Ancient Battles",
          "set_code": "MP21-EN136",
          "set_rarity": "Super Rare",
          "set_rarity_code": "(SR)",
          "set_price": "0"
        },
        {
          "set_name": "Amazing Defenders",
          "set_code": "AMDE-EN042",
          "set_rarity": "Rare",
          "set_rarity_code": "(R)",
          "set_price": "0"
        },
        {
          "set_name": "Rise of the Duelist",
          "set_code": "ROTD-EN053",
          "set_rarity": "Ultra Rare",
          "set_rarity_code": "(UR)",
          "set_price": "0"
        }
      ],
      "card_images": [
        {
          "id": 37478723,
          "image_url": "https://images.ygoprodeck.com/images/cards/37478723.jpg", "image_url_small": "https://images.ygoprodeck.com/images/cards_small/37478723.jpg",
          "image_url_cropped": "https://images.ygoprodeck.com/images/cards_cropped/37478723.jpg"
        }
      ],
      "card_prices": [
        {
          "cardmarket_price": "0.14",
          "tcgplayer_price": "0.15",
          "ebay_price": "0.99",
          "amazon_price": "2.96",
          "coolstuffinc_price": "0.00"
        }
      ],
      "misc_info": [
        {
          "beta_name": "\"Flame Noble Arms - Durendal\"",
          "views": 492031,
          "viewsweek": 2958,
          "upvotes": 10,
          "downvotes": 12,
          "formats": ["TCG", "OCG", "Master Duel"],
          "beta_id": 101101053,
          "tcg_date": "2020-08-06",
          "ocg_date": "2020-04-18",
          "konami_id": 15287,
          "has_effect": 1,
          "md_rarity": "Rare"
        }
      ]
    },
 * 
 */
