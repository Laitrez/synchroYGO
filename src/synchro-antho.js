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
      property: "type",
      relation: "cardType",
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
    "cardSets",
    {
      property: "card_sets",
      relation: "cardSets",
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
  relation: "card",
  mapping: (
    {
      name,
      desc,
      name_en,
      id,
      type,
      humanReadableCardType,
      frameType,
      race,
      archetype,
      ygoprodeck_url,
      misc_info,
      card_sets,
    },
    relationStore,
    config // cardConfiguration
  ) => {
    const obj = {
      name,
      desc,
      name_en,
      ygoprodeck_url,
      beta_id: misc_info[0].beta_id,
      konami_id: misc_info[0].konami_id,
      md_rarity: misc_info[0].md_rarity,
      cardTypeId: (() => {
        const config = relationsConfiguration.get("type");
        return cardConfiguration.relations.getIdby(
          config.relation,
          config.storeKeyProperty,
          type,
          relationStore
        );
      })(),
      cardSets: (() => {
        const config = relationsConfiguration.get("cardSets");
        return cardConfiguration.relations.getMappedIds(
          config.relation,
          config.storeKeyProperty,
          card_sets,
          "set_code",
          relationStore
        );
      })(),
    };
    console.log(`obj`, obj.cardSets);

    return obj;
  },
  relations: {
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
            array.map((c) => c[arrayProperty]).includes(set[storekeyProperty])
          )
          .map((c) => ({
            id: c.id,
          })),
      };
    },
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

function buildRelations(datas, config) {
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

function buildCards(datas, relations, config) {
  return datas.map((card) => config.mapping(card, relations, config));
}

async function buildQuery(entity, config, ifExist = false) {
  let e = ifExist;
  if (ifExist) e = await getEntity(entity, config.relation);
  if (e) {
    console.warn(
      `FOUND la donnée ${config.relation} avec la valeur ${
        entity[config.logProperty]
      } exist deja`
    );
    return e;
  } else
    try {
      console.log(
        `Sauvegarde ${config.relation} avec la valeur ${
          entity[config.logProperty]
        }`
      );
      return await prisma[config.relation]
        .create({
          data: entity,
        })
        .catch((e) => console.log(`e`, e));
    } catch (e) {
      console.error(
        `Error Sauvegarde ${config.relation} avec la valeur ${
          entity[config.logProperty]
        }`,
        e
      );
    }
}

async function saveRelations(entities, config) {
  return await chunks(entities, (entity) => buildQuery(entity, config), 100);
}

async function processRelations(datas) {
  for (const relation of relationsConfiguration.values()) {
    console.log(`Sauvegarde `, relation.relation);

    const entities = buildRelations(datas, relation);
    const data = await saveRelations(entities, relation);
    // on pousse dans la map les relation pour
    // retrouver leur ID sur la construction des cartes par la suite
    relationStore.set(relation.relation, data);
  }
}

async function processCards(datas) {
  console.log("Process card");
  const cards = buildCards(datas, relationStore, cardConfiguration);
  console.log(`cards`, cards);
  const data = await saveRelations(cards, cardConfiguration);

  console.log("cards", data);
  // là on va faire pareil que pour les relations, sauf que le builder est différents !!!
  // Il faut crée la cart builder() ->
  //    Le buildRelations() ne peut pas marcher ou ne sert à rien dans le cas des cartes
  //    buildRelations() -> build les datas ET enleve les doublons
  //    Pour les carte on veut juste build les datas
}

async function start() {
  const fullDatas = getDatasFile("datas/test.json");
  await processRelations(fullDatas);
  console.log("relationStore", relationStore);

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
