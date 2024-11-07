const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const defaultBatchSize = 100;

const relationStore = new Map();

relationStore.set("cardType", [
  {
    id: 176,
    type: "Spell Card",
    humanReadableType: "Equip Spell",
    frameType: "spell",
  },
]);

const relationsConfiguration = new Map([
  [
    "type",
    {
      incomingProperty: "type",
      entity: "cardType",
      logProperty: "type",
      storeKeyProperty: "type",
      mapping: (datas) => ({
        type: datas.type,
        humanReadableType: datas.humanReadableCardType,
        frameType: datas.frameType,
      }),
    },
  ],
  [
    "race",
    {
      incomingProperty: "race",
      entity: "cardRace",
      logProperty: "name",
      storeKeyProperty: "name",
      mapping: (datas) => ({
        name: datas.race,
      }),
    },
  ],
  [
    "archetype",
    {
      incomingProperty: "archetype",
      entity: "cardArchetype",
      logProperty: "name",
      storeKeyProperty: "name",
      mapping: (datas) => ({
        name: datas.archetype,
      }),
    },
  ],
  [
    "formats",
    {
      incomingProperty: "misc_info.formats",
      entity: "formats",
      logProperty: "name",
      storeKeyProperty: "name",
      mapping: (datas) => ({
        name: datas,
      }),
    },
  ],
  [
    "cardSets",
    {
      incomingProperty: "card_sets",
      entity: "cardSets",
      logProperty: "setName",
      storeKeyProperty: "setCode",
      // Faut retourner un cardSet
      mapping: (datas) => ({
        setName: datas.set_name,
        setCode: datas.set_code,
        setRarity: datas.set_rarity,
        setRarityCode: datas.set_rarity_code,
        setPrice: datas.set_price,
      }),
    },
  ],
]);

const cardConfiguration = {
  entity: "card",
  logProperty: "name",
  mapping: (
    {
      name,
      desc,
      name_en,
      type,
      race,
      archetype,
      ygoprodeck_url,
      misc_info,
      card_sets,
    },
    relationStore
  ) => {
    const obj = {
      name: String(name).replaceAll('"', ""),
      desc,
      name_en,
      ygoprodeck_url,
      beta_id: misc_info.beta_id,
      konami_id: misc_info.konami_id,
      md_rarity: misc_info.md_rarity,
      cardTypeId: (() => {
        const config = relationsConfiguration.get("type");
        return cardConfiguration.getIdby(
          config.entity,
          config.storeKeyProperty,
          type,
          relationStore
        );
      })(),
      cardRaceId: (() => {
        const config = relationsConfiguration.get("race");
        return cardConfiguration.getIdby(
          config.entity,
          config.storeKeyProperty,
          race,
          relationStore
        );
      })(),
      cardArchetypeId: (() => {
        const config = relationsConfiguration.get("archetype");
        return cardConfiguration.getIdby(
          config.entity,
          config.storeKeyProperty,
          archetype,
          relationStore
        );
      })(),
      cardSets: (() => {
        const config = relationsConfiguration.get("cardSets");
        return cardConfiguration.getMappedIds(
          config.entity,
          config.storeKeyProperty,
          card_sets,
          "set_code",
          relationStore
        );
      })(),
      formats: (() => {
        const config = relationsConfiguration.get("formats");
        return cardConfiguration.getMappedIds(
          config.entity,
          config.storeKeyProperty,
          misc_info.formats,
          null,
          relationStore
        );
      })(),
    };
    return obj;
  },
  getIdby: (storekey, storekeyProperty, value, relationStore) => {
    return relationStore
      .get(storekey)
      .find((c) => c[storekeyProperty] === value).id;
  },
  getMappedIds: (
    storekey,
    storekeyProperty,
    array,
    arrayProperty,
    relationStore
  ) => {
    return {
      connect: relationStore
        .get(storekey)
        .filter((set) =>
          array
            .map((c) => (arrayProperty ? c[arrayProperty] : c))
            .includes(set[storekeyProperty])
        )
        .map((c) => ({
          id: c.id,
        })),
    };
  },
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

function cleanData(data) {
  return data.map((d) => ({ ...d, misc_info: d.misc_info[0] }));
}

async function chunks(items, processFunction, batchSize = defaultBatchSize) {
  let res = [];
  const l = items.length;
  for (let i = 0; i < items.length; i += batchSize) {
    console.log(`Sauvegarder chunk: ${i + 1}-${i + 1 + batchSize}/${l}`);
    const chunk = items.slice(i, i + batchSize);
    const d = await Promise.allSettled(chunk.map(processFunction));
    res = [...res, ...d.map((d) => d.value)];
  }
  return res;
}

async function getEntity(entity, relation) {
  return await prisma[relation].findFirst({
    where: entity,
  });
}

/*
new Map(
  [
    [clé, val]
  ]
)
*/
// Construit les relations DTO et supprime les doublons
function buildRelationDTOs(datas, config) {
  const getValues = (datas, property) =>
    property.split(".").reduce((acc, key) => acc?.[key], datas);

  return [
    ...new Map(
      datas
        .filter((datas) => getValues(datas, config.incomingProperty))
        .flatMap((datas) => {
          let values = getValues(datas, config.incomingProperty);

          if (!Array.isArray(values)) {
            values = [datas];
          }

          return values.map((data) => {
            const b = config.mapping(data);

            return [JSON.stringify(b), b];
          });
        })
    ).values(),
  ];
}

function buildCardDTOs(datas, relations, config) {
  return datas.map((card) => config.mapping(card, relations));
}

async function buildQuery(entity, config, ifExist = false) {
  let e = ifExist;
  if (ifExist) e = await getEntity(entity, config.entity);
  if (e) {
    console.warn(
      `FOUND la donnée ${config.entity} avec la valeur ${
        entity[config.logProperty]
      } exist deja`
    );
    return e;
  } else
    try {
      console.log(
        `Sauvegarde ${config.entity} avec la valeur ${
          entity[config.logProperty]
        }`
      );
      return await prisma[config.entity]
        .create({
          data: entity,
        })
        .catch((e) => console.log(`e`, e));
    } catch (e) {
      console.error(
        `Error Sauvegarde ${config.entity} avec la valeur ${
          entity[config.logProperty]
        }`,
        e
      );
    }
}

async function saveEntities(entities, config, isExist) {
  return await chunks(
    entities,
    (entity) => buildQuery(entity, config, isExist),
    100
  );
}

async function processRelations(datas) {
  for (const relation of relationsConfiguration.values()) {
    const dtos = buildRelationDTOs(datas, relation);
    const relations = await saveEntities(dtos, relation, true);

    // on pousse dans la map les relation pour
    // retrouver leur ID sur la construction des cartes par la suite
    relationStore.set(relation.entity, relations);
  }
}

async function processCards(datas) {
  console.log("Process card");
  const cards = buildCardDTOs(datas, relationStore, cardConfiguration);

  const data = await saveEntities(cards, cardConfiguration);
  return data;
}

async function start() {
  let fullDatas = getDatasFile("datas/test.json");
  fullDatas = cleanData(fullDatas);
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
