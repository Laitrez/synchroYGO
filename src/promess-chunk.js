async function buildQuery(ms, result) {
  return new Promise((resolve) =>
    setTimeout(() => {
      console.log(`Promise avec résultat "${result}" résolue après ${ms}ms`);
      resolve(result);
    }, ms)
  );
}

async function chunk(datas, callback, n = 5) {
  for (let i = 0; i < datas.length; i += n) {
    // Attention maintenant ici c'est un tableau
    const chunkDatas = datas.slice(i, i + n);
    await Promise.allSettled(chunkDatas.map((data) => callback(data)));
  }
}

async function chunkBuildQuery(datas, n = 5) {
  /* 3. Envoyer Toute les datas  n par n */
  console.log(`Envoyer Toute les datas  ${n} par ${n}`);
  for (let i = 0; i < datas.length; i += n) {
    // Attention maintenant ici c'est un tableau
    const chunkDatas = datas.slice(i, i + n);
    await Promise.allSettled(
      chunkDatas.map((data) => buildQuery(data.ms, data.msg))
    );
  }
}

/* v1 */
async function start() {
  const datas = [
    { ms: 1000, msg: "A" },
    { ms: 1000, msg: "B" },
    { ms: 1000, msg: "C" },
    { ms: 1000, msg: "D" },
    { ms: 1000, msg: "E" },
    { ms: 1000, msg: "F" },
    { ms: 1000, msg: "G" },
  ];

  /* On veut envoyer les datas par paquet */
  /* 1. Envoyer une datas */
  console.log(`Envoie 1 seul donnée`);
  await buildQuery(datas[0].ms, datas[0].msg);

  /* 2. Envoyer Toute les datas  1 par 1*/
  console.log(`Envoyer Toute les datas  1 par 1`);
  const res1 = [];
  for (let i = 0; i < datas.length; i++) {
    // On recupere 1 data
    const data = datas[i];
    const r = await buildQuery(data.ms, data.msg);
    res1.push(r);
  }
  console.log(`res1`, res1);

  /* 3. Envoyer Toute les datas  n par n */
  const res2 = [];
  const n = 5;
  for (let i = 0; i < datas.length; i += n) {
    // Attention maintenant ici c'est un tableau
    const chunkDatas = datas.slice(i, i + n);
    const r = await Promise.allSettled(
      chunkDatas.map((data) => buildQuery(data.ms, data.msg))
    );
    res2.push(...r.map((r) => r.value));
    console.log(`res2 -- intermediate`, res2);
  }
  console.log(`res2 -- finale`, res2);

  //   await chunkBuildQuery(datas);
  //   await chunk(datas, (data) => buildQuery(data.ms, data.msg));
}

start().then(() => {
  console.log(`Fin de programme`);
});
