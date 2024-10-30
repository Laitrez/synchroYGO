

const start = ( ) => {
    console.log('Hello Karim')
}

/* Recup toute les images avec tempo */
// synchroImage()

start();


/**
 * main.js
 * start()
 * Aller chercher les infos - getInfos()
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