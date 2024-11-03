const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

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

function buildQueries(entities, config) {
  return entities.map(async (entity) => await buildQuery(entity, config));
}

async function buildQuery(entity, config) {
  const e = await getEntity(entity, config.relation);
  if (e) {
    console.warn(
      `FOUND la donnée ${config.relation} avec la valeur ${
        entity[config.where]
      } exist deja`
    );
    return e;
  } else
    try {
      console.log(
        `Sauvegarde ${relation} avec la valeur ${entity[config.where]}`
      );
      return await prisma[relation].create({
        data: entity,
      });
    } catch (e) {
      console.error(
        `Error Sauvegarde ${relation} avec la valeur ${entity[config.where]}`,
        e
      );
    }
}

async function getEntity(entity, relation) {
  return await prisma[relation].findFirst({
    where: entity,
  });
}

async function processRelations(datas) {
  for (const relation of relationsConfiguration) {
    const entities = buildEntities(datas, relation);
    const queries = buildQueries(entities, relation);
    const data = await Promise.all(queries);
    // on pousse dans la map les relation pour
    // retrouver leur ID sur la construction des cartes par la suite
    relationStore.set(relation.relation, data);
  }
}

async function processCards(datas) {
  console.log("Process card");
}

async function start() {
  const fullDatas = getDatasFile("datas/test.json");
  await processRelations(fullDatas);
  await processCards(fullDatas);
}

start()
  .then(async () => {
    // Tout ce qu'il faut faire à la fin du programme
    // await prisma.$disconnect();
    console.log("fin du programme");
  })
  // Si on a une erreur sur le programme
  // On pourrai utiliser un gestionnaire histoire de pas perdre le fil, mais bon
  .catch(async (e) => console.error(e));
