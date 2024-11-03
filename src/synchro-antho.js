const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const defaultBatchSize = 100;

const relationStore = new Map();
const relationsConfiguration = [
  {
    property: "type",
    relation: "cardType",
    where: "type",
    mapping: (datas) => ({
      type: datas.type,
      humanReadableType: datas.humanReadableCardType,
      frameType: datas.frameType,
    }),
  },
  {
    property: "card_sets",
    relation: "cardSets",
    where: "setName",
    // Faut retourner un cardSet
    mapping: (datas) => ({
      setName: datas.set_name,
      setCode: datas.set_code,
      setRarity: datas.set_rarity,
      setRarityCode: datas.set_rarity_code,
      setPrice: datas.set_price,
    }),
  },
];

const cardConfiguration = {
  mapping: (datas) => ({
    type: datas.type,
    humanReadableType: datas.humanReadableCardType,
    frameType: datas.frameType,
  }),
};

// On va recup les datas depuis un fichier
function getDatasFile(url) {
  try {
    const data = fs.readFileSync(url);
    let dataParse = JSON.parse(data);
    return dataParse.data;
  } catch (err) {
    throw err;
  }
}
// On va recup les datas depuis une URL
function getDatasApi(url) {
  try {
  } catch (err) {
    throw err;
  }
}

async function getEntity(entity, relation) {
  return await prisma[relation].findFirst({
    where: entity,
  });
}

function buildEntities(datas, config) {
  return [
    ...new Map(
      datas
        .filter((data) => data[config.property])
        .flatMap((datas) => {
          let d = datas[config.property];

          if (!Array.isArray(d)) {
            d = [datas];
          }
          return d.map((data) => {
            const b = config.mapping(data);

            return [JSON.stringify(b), b];
          });
        })
    ).values(),
  ];
}

async function processInChunks(items, processFunction, batchSize = defaultBatchSize) {
  let res = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    const d = await Promise.allSettled(chunk.map(processFunction));
    res = [...res, ...d.map(d => d.value)];
  }
  return res;
}

async function buildQuery(entity, config, pos = 1, total = 1) {
  const e = await getEntity(entity, config.relation);
  if (e) {
    console.warn(
      `FOUND la donnée ${config.relation} avec la valeur ${
        entity[config.where]
      } exist deja ${pos}/${total}`
    );
    return e;
  } else
    try {
      console.log(
        `Sauvegarde ${config.relation} avec la valeur ${entity[config.where]}`
      );
      return await prisma[config.relation].create({
        data: entity,
      });
    } catch (e) {
      console.error(
        `Error Sauvegarde ${config.relation} avec la valeur ${
          entity[config.where]
        }`,
        e
      );
    }
}

async function saveRelations(entities, config) {
  return await processInChunks(entities, (entity) =>
    buildQuery(entity, config)
  );
}

async function processRelations(datas) {
  for (const relation of relationsConfiguration) {
    const entities = buildEntities(datas, relation);
    const data = await saveRelations(entities, relation);
    // on pousse dans la map les relation pour
    console.log(data);

    // retrouver leur ID sur la construction des cartes par la suite
    // relationStore.set(relation.relation, data);
  }
}

async function processCards(datas) {
  console.log("Process card");
}

async function start() {
  const fullDatas = getDatasFile("datas/fr.json");
  await processRelations(fullDatas);
  await processCards(fullDatas);
}

start()
  .then(async () => {
    // Tout ce qu'il faut faire à la fin du programme
    await prisma.$disconnect();
    console.log("fin du programme");
  })
  // Si on a une erreur sur le programme
  // On pourrai utiliser un gestionnaire histoire de pas perdre le fil, mais bon
  .catch(async (e) => console.error(e));
