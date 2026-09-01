/**
 * Живой прогон CRUD/валидации/фото против localhost:4060.
 * Создаёт сущности с уникальным префиксом и удаляет их в конце.
 */
const BASE = process.env.API_URL ?? 'http://localhost:4060';
const PNG = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082',
  'hex',
);
const PREFIX = `FLOW-${Date.now()}`;

let passed = 0;
let failed = 0;
const failures = [];
let token = '';

function assert(cond, name, extra) {
  if (cond) {
    passed += 1;
    console.log(`  ok  ${name}`);
    return;
  }
  failed += 1;
  failures.push({ name, extra });
  console.log(`  FAIL ${name}`);
  if (extra !== undefined) console.log('       ', extra);
}

async function req(method, path, { json, form, auth = true, raw } = {}) {
  const headers = {};
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  let body;
  if (json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(json);
  } else if (form) {
    body = form;
  } else if (raw) {
    body = raw.body;
    Object.assign(headers, raw.headers);
  }
  const res = await fetch(`${BASE}${path}`, { method, headers, body });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { status: res.status, data, headers: res.headers, text };
}

function formFrom(fields, files = []) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null) fd.append(k, String(v));
  }
  for (const file of files) {
    fd.append('images', new Blob([file.bytes], { type: file.type }), file.name);
  }
  return fd;
}

async function main() {
  console.log(`\n== flow test ${PREFIX} @ ${BASE} ==\n`);

  // --- health ---
  console.log('health');
  {
    const r = await req('GET', '/api', { auth: false });
    assert(r.status === 200, 'GET /api жив', r);
  }

  // --- auth ---
  console.log('\nauth');
  {
    const bad = await req('POST', '/api/auth/login', {
      json: { login: 'admin', password: 'wrong-password' },
      auth: false,
    });
    assert(bad.status === 401, 'неверный пароль → 401', bad.data);
    assert(
      bad.data?.message === 'Неверный логин или пароль',
      'сообщение неверного пароля',
      bad.data,
    );

    const empty = await req('POST', '/api/auth/login', {
      json: { login: '', password: '' },
      auth: false,
    });
    assert(empty.status === 400, 'пустой логин → 400', empty.data);
    assert(
      empty.data?.message === 'Не все поля заполнены',
      'message пустых полей логина',
      empty.data,
    );

    const ok = await req('POST', '/api/auth/login', {
      json: { login: 'admin', password: 'admin' },
      auth: false,
    });
    assert(ok.status === 200, 'логин admin/admin → 200', ok.data);
    assert(typeof ok.data?.accessToken === 'string', 'accessToken строка');
    token = ok.data?.accessToken ?? '';

    const me = await req('GET', '/api/auth/me');
    assert(me.status === 200 && me.data?.login === 'admin', 'GET /me', me.data);

    const noAuth = await req('POST', '/api/marks', {
      json: { name: `${PREFIX}-noauth` },
      auth: false,
    });
    assert(noAuth.status === 401, 'POST без JWT → 401', noAuth.data);
    assert(
      noAuth.data?.message === 'Нужна авторизация администратора',
      'сообщение 401 без токена',
      noAuth.data,
    );

    const saved = token;
    token = 'not.a.jwt';
    const badTok = await req('POST', '/api/marks', {
      json: { name: `${PREFIX}-badtok` },
    });
    token = saved;
    assert(badTok.status === 401, 'битый JWT → 401', badTok.data);
    assert(
      badTok.data?.message === 'Сессия недействительна',
      'сообщение битого JWT',
      badTok.data,
    );
  }

  // --- public GET ---
  console.log('\npublic lists');
  let seedMarks;
  let seedModels;
  let seedCats;
  let seedParts;
  {
    const marks = await req('GET', '/api/marks', { auth: false });
    const models = await req('GET', '/api/models', { auth: false });
    const cats = await req('GET', '/api/categories', { auth: false });
    const parts = await req('GET', '/api/spare-parts', { auth: false });
    assert(marks.status === 200 && Array.isArray(marks.data), 'GET marks');
    assert(models.status === 200 && Array.isArray(models.data), 'GET models');
    assert(cats.status === 200 && Array.isArray(cats.data), 'GET categories');
    assert(parts.status === 200 && Array.isArray(parts.data), 'GET spare-parts');
    seedMarks = marks.data;
    seedModels = models.data;
    seedCats = cats.data;
    seedParts = parts.data;
    assert(seedMarks.length >= 1, 'есть марки в сидах');
    assert(seedModels.length >= 1, 'есть модели в сидах');
    assert(seedCats.length >= 1, 'есть категории в сидах');
    assert(seedParts.length >= 1, 'есть запчасти в сидах');

    const badId = await req('GET', '/api/marks/abc', { auth: false });
    assert(badId.status === 400, 'id не число → 400', badId.data);
    assert(badId.data?.message === 'Некорректный id', 'message некорректного id', badId.data);

    const missing = await req('GET', '/api/marks/999999', { auth: false });
    assert(missing.status === 404, 'нет марки → 404', missing.data);
    assert(missing.data?.message === 'Марка не найдена', 'message 404 марки', missing.data);

    const extra = await req('POST', '/api/marks', {
      json: { name: `${PREFIX}-x`, foo: 1 },
    });
    assert(extra.status === 400, 'лишнее поле → 400', extra.data);
    assert(extra.data?.message === 'Ошибка валидации', 'message лишнего поля', extra.data);
  }

  // --- marks CRUD + photos ---
  console.log('\nmarks');
  let markA;
  let markB;
  {
    const empty = await req('POST', '/api/marks', { json: {} });
    assert(empty.status === 400, 'марка без name → 400', empty.data);
    assert(empty.data?.message === 'Не все поля заполнены', 'message пустой марки', empty.data);
    assert(
      Array.isArray(empty.data?.details) && empty.data.details.includes('Название обязательно'),
      'details названия',
      empty.data,
    );

    const created = await req('POST', '/api/marks', {
      json: { name: `${PREFIX}-MarkA`, description: '  desc  ' },
    });
    assert(created.status === 201 || created.status === 200 || created.status === 201, 'создать марку JSON', created);
    // Nest default create returns 201 only if @HttpCode; otherwise 201 from nest? Default POST is 201.
    assert([200, 201].includes(created.status), `статус создания марки ${created.status}`, created.data);
    markA = created.data;
    assert(markA?.name === `${PREFIX}-MarkA`, 'имя марки сохранилось');
    assert(markA?.description === 'desc', 'description обрезан', markA);

    const blankDesc = await req('PATCH', `/api/marks/${markA.id}`, {
      json: { description: '   ' },
    });
    assert(
      blankDesc.status === 200 && blankDesc.data?.description === null,
      'пустое описание → null',
      blankDesc.data,
    );
    assert(Array.isArray(markA?.images) && markA.images.length === 0, 'images []');

    const dup = await req('POST', '/api/marks', {
      json: { name: `${PREFIX}-MarkA` },
    });
    assert(dup.status === 409, 'дубль марки → 409', dup.data);
    assert(
      dup.data?.message === 'Марка с таким названием уже есть',
      'message дубля марки',
      dup.data,
    );

    const caseDup = await req('POST', '/api/marks', {
      json: { name: `${PREFIX}-marka` },
    });
    assert(caseDup.status === 409, 'дубль марки без учёта регистра → 409', caseDup.data);

    const withPhoto = await req('POST', '/api/marks', {
      form: formFrom(
        { name: `${PREFIX}-MarkB`, description: 'with photo' },
        [{ bytes: PNG, type: 'image/png', name: 'a.png' }],
      ),
    });
    assert([200, 201].includes(withPhoto.status), 'создать марку с фото', withPhoto.data);
    markB = withPhoto.data;
    assert(markB?.images?.length === 1, '1 фото у марки B', markB);
    assert(
      typeof markB?.images?.[0] === 'string' && markB.images[0].startsWith('/uploads/marks/'),
      'путь фото марки',
      markB?.images,
    );

    const img = await fetch(`${BASE}${markB.images[0]}`);
    assert(img.status === 200, 'отдача фото марки', img.status);
    assert(img.headers.get('content-type')?.includes('image'), 'content-type фото', img.headers.get('content-type'));

    const patched = await req('PATCH', `/api/marks/${markA.id}`, {
      json: { description: 'обновлено' },
    });
    assert(patched.status === 200, 'PATCH описания марки', patched.data);
    assert(patched.data?.description === 'обновлено', 'описание обновилось', patched.data);

    const renamed = await req('PATCH', `/api/marks/${markA.id}`, {
      json: { name: `${PREFIX}-MarkA-renamed` },
    });
    assert(renamed.status === 200, 'переименовать марку', renamed.data);
    markA = renamed.data;

    const clash = await req('PATCH', `/api/marks/${markA.id}`, {
      json: { name: markB.name },
    });
    assert(clash.status === 409, 'переименовать в занятое → 409', clash.data);

    const emptyPatch = await req('PATCH', `/api/marks/${markA.id}`, { json: {} });
    assert(emptyPatch.status === 200, 'пустой PATCH марки', emptyPatch.data);

    const addPhotos = await req('PATCH', `/api/marks/${markB.id}`, {
      form: formFrom(
        {},
        [
          { bytes: PNG, type: 'image/png', name: 'b.png' },
          { bytes: PNG, type: 'image/png', name: 'c.png' },
        ],
      ),
    });
    assert(addPhotos.status === 200, 'добавить 2 фото к марке (итого 3)', addPhotos.data);
    assert(addPhotos.data?.images?.length === 3, '3 фото', addPhotos.data?.images);
    markB = addPhotos.data;

    const tooMany = await req('PATCH', `/api/marks/${markB.id}`, {
      form: formFrom({}, [{ bytes: PNG, type: 'image/png', name: 'd.png' }]),
    });
    assert(tooMany.status === 400, '4-е фото → 400', tooMany.data);
    assert(
      tooMany.data?.message === 'Можно загрузить не больше 3 фотографий',
      'message лимита фото',
      tooMany.data,
    );

    const txt = await req('POST', '/api/marks', {
      form: formFrom(
        { name: `${PREFIX}-badfile` },
        [{ bytes: Buffer.from('not-an-image'), type: 'text/plain', name: 'x.txt' }],
      ),
    });
    assert(txt.status === 400, 'не картинка → 400', txt.data);
    assert(
      txt.data?.message === 'Можно загружать только jpeg, png, webp или gif',
      'message типа файла',
      txt.data,
    );

    const fakeJpeg = await req('POST', '/api/marks', {
      form: formFrom(
        { name: `${PREFIX}-fakeimg` },
        [{ bytes: PNG, type: 'image/jpeg', name: 'x.jpg' }],
      ),
    });
    assert(fakeJpeg.status === 400, 'png под видом jpeg → 400', fakeJpeg.data);

    const filename = markB.images[0].split('/').pop();
    const delImg = await req('DELETE', `/api/marks/${markB.id}/images/${filename}`);
    assert(delImg.status === 200, 'удалить одно фото марки', delImg.data);
    assert(delImg.data?.images?.length === 2, 'осталось 2 фото', delImg.data?.images);
    markB = delImg.data;

    const gone = await fetch(`${BASE}/uploads/marks/${filename}`);
    assert(gone.status === 404, 'файл с диска исчез', gone.status);

    const fakeFile = await req('DELETE', `/api/marks/${markB.id}/images/not-a-uuid.jpg`);
    assert(fakeFile.status === 400, 'кривое имя файла → 400', fakeFile.data);

    const stolen = await req(
      'DELETE',
      `/api/marks/${markA.id}/images/${markB.images[0].split('/').pop()}`,
    );
    assert(stolen.status === 400, 'чужое фото → 400', stolen.data);
  }

  // --- models ---
  console.log('\nmodels');
  let modelA;
  let modelB;
  {
    const noMark = await req('POST', '/api/models', {
      json: { name: `${PREFIX}-M1` },
    });
    assert(noMark.status === 400, 'модель без markId → 400', noMark.data);

    const missingMark = await req('POST', '/api/models', {
      json: { name: `${PREFIX}-M1`, markId: 999999 },
    });
    assert(missingMark.status === 404, 'модель к несуществующей марке → 404', missingMark.data);

    const created = await req('POST', '/api/models', {
      json: {
        name: `${PREFIX}-ModelA`,
        markId: markA.id,
        description: 'модель A',
      },
    });
    assert([200, 201].includes(created.status), 'создать модель', created.data);
    modelA = created.data;
    assert(modelA?.markId === markA.id, 'markId модели');

    const dup = await req('POST', '/api/models', {
      json: { name: `${PREFIX}-ModelA`, markId: markA.id },
    });
    assert(dup.status === 409, 'дубль модели у марки → 409', dup.data);

    const sameNameOtherMark = await req('POST', '/api/models', {
      json: { name: `${PREFIX}-ModelA`, markId: markB.id },
    });
    assert(
      [200, 201].includes(sameNameOtherMark.status),
      'то же имя модели у другой марки ок',
      sameNameOtherMark.data,
    );
    modelB = sameNameOtherMark.data;

    const byMark = await req('GET', `/api/models?markId=${markA.id}`, { auth: false });
    assert(byMark.status === 200, 'фильтр моделей по markId', byMark.data);
    assert(
      byMark.data.every((m) => m.markId === markA.id),
      'все модели от markA',
      byMark.data.map((m) => m.markId),
    );
    assert(
      byMark.data.some((m) => m.id === modelA.id),
      'modelA в фильтре',
    );

    const patched = await req('PATCH', `/api/models/${modelA.id}`, {
      json: { description: 'новое описание модели' },
    });
    assert(patched.status === 200, 'PATCH модели', patched.data);
    assert(patched.data?.description === 'новое описание модели', 'описание модели');

    const withPhoto = await req('PATCH', `/api/models/${modelA.id}`, {
      form: formFrom({}, [{ bytes: PNG, type: 'image/png', name: 'm.png' }]),
    });
    assert(withPhoto.status === 200 && withPhoto.data?.images?.length === 1, 'фото модели', withPhoto.data);
    modelA = withPhoto.data;
  }

  // --- categories ---
  console.log('\ncategories');
  let catA;
  let catB;
  {
    const created = await req('POST', '/api/categories', {
      json: { name: `${PREFIX}-CatA`, description: 'категория A' },
    });
    assert([200, 201].includes(created.status), 'создать категорию', created.data);
    catA = created.data;

    const dup = await req('POST', '/api/categories', {
      json: { name: `${PREFIX}-CatA` },
    });
    assert(dup.status === 409, 'дубль категории → 409', dup.data);

    catB = (
      await req('POST', '/api/categories', {
        json: { name: `${PREFIX}-CatB` },
      })
    ).data;

    const patched = await req('PATCH', `/api/categories/${catA.id}`, {
      json: { description: 'обновлено' },
    });
    assert(patched.status === 200 && patched.data?.description === 'обновлено', 'PATCH категории', patched.data);
  }

  // --- spare parts ---
  console.log('\nspare-parts');
  let partA;
  let partB;
  {
    const missing = await req('POST', '/api/spare-parts', { json: { name: 'x' } });
    assert(missing.status === 400, 'запчасть без обязательных → 400', missing.data);

    const mismatch = await req('POST', '/api/spare-parts', {
      json: {
        name: `${PREFIX}-Part`,
        price: 100,
        markId: markA.id,
        modelId: modelB.id, // belongs to markB
        categoryId: catA.id,
      },
    });
    assert(mismatch.status === 400, 'модель не от марки → 400', mismatch.data);
    assert(
      mismatch.data?.message === 'Модель не принадлежит выбранной марке',
      'message mismatch',
      mismatch.data,
    );

    const zero = await req('POST', '/api/spare-parts', {
      json: {
        name: `${PREFIX}-Part`,
        price: 0,
        markId: markA.id,
        modelId: modelA.id,
        categoryId: catA.id,
      },
    });
    assert(zero.status === 400, 'цена 0 → 400', zero.data);

    const huge = await req('POST', '/api/spare-parts', {
      json: {
        name: `${PREFIX}-Part`,
        price: 100_000_000,
        markId: markA.id,
        modelId: modelA.id,
        categoryId: catA.id,
      },
    });
    assert(huge.status === 400, 'цена слишком большая → 400', huge.data);

    const created = await req('POST', '/api/spare-parts', {
      form: formFrom(
        {
          name: `${PREFIX}-PartA`,
          price: 1500,
          markId: markA.id,
          modelId: modelA.id,
          categoryId: catA.id,
          article: '  ART-FLOW-1  ',
          description: 'запчасть A',
        },
        [{ bytes: PNG, type: 'image/png', name: 'p.png' }],
      ),
    });
    assert([200, 201].includes(created.status), 'создать запчасть с фото', created.data);
    partA = created.data;
    assert(partA?.article === 'ART-FLOW-1', 'артикул обрезан', partA);
    assert(partA?.price === 1500, 'цена 1500', partA);
    assert(partA?.images?.length === 1, '1 фото запчасти', partA);

    const noArticle = await req('POST', '/api/spare-parts', {
      json: {
        name: `${PREFIX}-PartB`,
        price: 990,
        markId: markA.id,
        modelId: modelA.id,
        categoryId: catA.id,
        article: '',
      },
    });
    assert([200, 201].includes(noArticle.status), 'запчасть без артикула', noArticle.data);
    partB = noArticle.data;
    assert(partB?.article === null, 'пустой артикул → null', partB);

    const dupArt = await req('POST', '/api/spare-parts', {
      json: {
        name: `${PREFIX}-PartC`,
        price: 100,
        markId: markA.id,
        modelId: modelA.id,
        categoryId: catA.id,
        article: 'ART-FLOW-1',
      },
    });
    assert(dupArt.status === 409, 'дубль артикула → 409', dupArt.data);

    const caseArt = await req('POST', '/api/spare-parts', {
      json: {
        name: `${PREFIX}-PartC`,
        price: 100,
        markId: markA.id,
        modelId: modelA.id,
        categoryId: catA.id,
        article: 'art-flow-1',
      },
    });
    assert(caseArt.status === 409, 'дубль артикула без учёта регистра → 409', caseArt.data);

    const patched = await req('PATCH', `/api/spare-parts/${partA.id}`, {
      json: { price: 1990, name: `${PREFIX}-PartA-upd` },
    });
    assert(patched.status === 200, 'PATCH запчасти', patched.data);
    assert(patched.data?.price === 1990, 'цена обновилась', patched.data);
    assert(patched.data?.name === `${PREFIX}-PartA-upd`, 'имя обновилось');
    partA = patched.data;

    const moveCat = await req('PATCH', `/api/spare-parts/${partA.id}`, {
      json: { categoryId: catB.id },
    });
    assert(moveCat.status === 200 && moveCat.data?.categoryId === catB.id, 'сменить категорию', moveCat.data);
    partA = moveCat.data;

    const clearArt = await req('PATCH', `/api/spare-parts/${partA.id}`, {
      json: { article: '' },
    });
    assert(clearArt.status === 200 && clearArt.data?.article === null, 'очистить артикул', clearArt.data);
    partA = clearArt.data;

    const setArt = await req('PATCH', `/api/spare-parts/${partA.id}`, {
      json: { article: 'ART-FLOW-1' },
    });
    assert(setArt.status === 200, 'вернуть артикул', setArt.data);
    partA = setArt.data;

    const modelOnly = await req('POST', '/api/spare-parts', {
      json: {
        name: `${PREFIX}-PartModelOnly`,
        price: 100,
        modelId: modelA.id,
        categoryId: catA.id,
      },
    });
    assert(modelOnly.status === 400, 'модель без марки → 400', modelOnly.data);
    assert(
      modelOnly.data?.message === 'Марка обязательна, если выбрана модель',
      'message модель без марки',
      modelOnly.data,
    );

    const universal = await req('POST', '/api/spare-parts', {
      json: {
        name: `${PREFIX}-PartUni`,
        price: 200,
        categoryId: catA.id,
      },
    });
    assert([200, 201].includes(universal.status), 'универсальная запчасть', universal.data);
    assert(universal.data?.markId === null, 'универсальная: markId null', universal.data);
    assert(universal.data?.modelId === null, 'универсальная: modelId null', universal.data);

    const markWide = await req('POST', '/api/spare-parts', {
      json: {
        name: `${PREFIX}-PartMark`,
        price: 300,
        markId: markA.id,
        categoryId: catA.id,
      },
    });
    assert([200, 201].includes(markWide.status), 'запчасть на всю марку', markWide.data);
    assert(markWide.data?.markId === markA.id, 'марка задана', markWide.data);
    assert(markWide.data?.modelId === null, 'модель пустая у марки', markWide.data);

    const toUni = await req('PATCH', `/api/spare-parts/${partB.id}`, {
      json: { markId: null, modelId: null },
    });
    assert(toUni.status === 200, 'PATCH в универсальную', toUni.data);
    assert(toUni.data?.markId === null && toUni.data?.modelId === null, 'PATCH null ids', toUni.data);
    partB = toUni.data;

    const toMark = await req('PATCH', `/api/spare-parts/${partB.id}`, {
      json: { markId: markA.id, modelId: null },
    });
    assert(toMark.status === 200 && toMark.data?.modelId === null, 'PATCH на марку', toMark.data);
    partB = toMark.data;

    const toAuto = await req('PATCH', `/api/spare-parts/${partB.id}`, {
      json: { markId: markA.id, modelId: modelA.id },
    });
    assert(toAuto.status === 200 && toAuto.data?.modelId === modelA.id, 'PATCH обратно на модель', toAuto.data);
    partB = toAuto.data;

    const delUni = await req('DELETE', `/api/spare-parts/${universal.data.id}`);
    assert(delUni.status === 200, 'удалить универсальную', delUni.data);
    const delMarkWide = await req('DELETE', `/api/spare-parts/${markWide.data.id}`);
    assert(delMarkWide.status === 200, 'удалить запчасть марки', delMarkWide.data);

    const q = await req(
      'GET',
      `/api/spare-parts?markId=${markA.id}&modelId=${modelA.id}&categoryId=${catB.id}`,
      { auth: false },
    );
    assert(q.status === 200 && q.data.some((p) => p.id === partA.id), 'query фильтр запчастей', q.data);

    const pFile = partA.images[0].split('/').pop();
    const delImg = await req('DELETE', `/api/spare-parts/${partA.id}/images/${pFile}`);
    assert(delImg.status === 200 && delImg.data?.images?.length === 0, 'удалить фото запчасти', delImg.data);
    partA = delImg.data;
  }

  // --- move model to another mark (spare parts markId should follow) ---
  console.log('\nmodel mark move');
  {
    const moved = await req('PATCH', `/api/models/${modelA.id}`, {
      json: { markId: markB.id, name: `${PREFIX}-ModelA-moved` },
    });
    assert(moved.status === 200, 'перенести модель на другую марку', moved.data);
    assert(moved.data?.markId === markB.id, 'markId модели сменился', moved.data);
    modelA = moved.data;

    const part = await req('GET', `/api/spare-parts/${partA.id}`, { auth: false });
    assert(part.status === 200, 'запчасть после переноса модели', part.data);
    assert(part.data?.markId === markB.id, 'markId запчасти подтянут за моделью', part.data);
    assert(part.data?.modelId === modelA.id, 'modelId запчасти тот же');
    partA = part.data;
  }

  // --- category delete blocked ---
  console.log('\ndeletes');
  {
    const blocked = await req('DELETE', `/api/categories/${catB.id}`);
    assert(blocked.status === 409, 'категория с запчастями → 409', blocked.data);
    assert(
      blocked.data?.message === 'Нельзя удалить категорию, пока к ней привязаны запчасти',
      'message 409 категории',
      blocked.data,
    );

    const delPartB = await req('DELETE', `/api/spare-parts/${partB.id}`);
    assert(delPartB.status === 200, 'удалить запчасть B', delPartB.data);

    const emptyCat = await req('DELETE', `/api/categories/${catA.id}`);
    assert(emptyCat.status === 200, 'удалить пустую категорию', emptyCat.data);

    const gone = await req('GET', `/api/categories/${catA.id}`, { auth: false });
    assert(gone.status === 404, 'пустая категория исчезла', gone.data);

    const delModelB = await req('DELETE', `/api/models/${modelB.id}`);
    assert(delModelB.status === 200, 'удалить модель B', delModelB.data);

    // cascade: delete markB should drop modelA + partA + photos
    const modelPhoto = modelA.images?.[0];
    const delMarkB = await req('DELETE', `/api/marks/${markB.id}`);
    assert(delMarkB.status === 200, 'каскад удаление марки B', delMarkB.data);

    const modelGone = await req('GET', `/api/models/${modelA.id}`, { auth: false });
    assert(modelGone.status === 404, 'модель каскадно удалена', modelGone.data);
    const partGone = await req('GET', `/api/spare-parts/${partA.id}`, { auth: false });
    assert(partGone.status === 404, 'запчасть каскадно удалена', partGone.data);

    if (modelPhoto) {
      const f = await fetch(`${BASE}${modelPhoto}`);
      assert(f.status === 404, 'фото модели стёрто с диска', f.status);
    }

    const leftoverCat = await req('DELETE', `/api/categories/${catB.id}`);
    assert(leftoverCat.status === 200, 'категория B после каскада удаляется', leftoverCat.data);

    const delMarkA = await req('DELETE', `/api/marks/${markA.id}`);
    assert(delMarkA.status === 200, 'удалить марку A', delMarkA.data);
  }

  // --- seed data still intact ---
  console.log('\nseed intact');
  {
    const marks = await req('GET', '/api/marks', { auth: false });
    const models = await req('GET', '/api/models', { auth: false });
    const cats = await req('GET', '/api/categories', { auth: false });
    const parts = await req('GET', '/api/spare-parts', { auth: false });
    const seedMarkIds = new Set(seedMarks.map((m) => m.id));
    const afterMarkIds = new Set(marks.data.map((m) => m.id));
    assert(
      [...seedMarkIds].every((id) => afterMarkIds.has(id)),
      'сидовые марки на месте',
    );
    assert(
      seedModels.every((m) => models.data.some((x) => x.id === m.id)),
      'сидовые модели на месте',
    );
    assert(
      seedCats.every((c) => cats.data.some((x) => x.id === c.id)),
      'сидовые категории на месте',
    );
    assert(
      seedParts.every((p) => parts.data.some((x) => x.id === p.id)),
      'сидовые запчасти на месте',
    );
    assert(
      !marks.data.some((m) => String(m.name).startsWith(PREFIX)),
      'тестовые марки не остались',
    );
  }

  console.log(`\n== ${passed} passed, ${failed} failed ==\n`);
  if (failures.length) {
    for (const f of failures) {
      console.log('FAIL', f.name, f.extra ?? '');
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
