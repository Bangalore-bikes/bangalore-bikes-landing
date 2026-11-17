import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { createContentStore, ContentStoreError } from '../src/lib/content-store.ts';

// A real SQLite adapter. batch must provide the same atomicity as libSQL write batches.
function fixture(t) {
  const db = new DatabaseSync(':memory:');
  t.after(() => db.close());
  const execute = async ({ sql, args = [] }) => {
    const statement = db.prepare(sql);
    if (statement.columns().length) return { rows: statement.all(...args) };
    const result = statement.run(...args);
    return { rows: [], rowsAffected: Number(result.changes) };
  };
  const client = {
    execute,
    async batch(statements, mode) {
      assert.equal(mode, 'write');
      db.exec('BEGIN IMMEDIATE');
      try {
        const results = [];
        for (const statement of statements) results.push(await execute(statement));
        db.exec('COMMIT');
        return results;
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
    },
  };
  return { db, store: createContentStore(client), client };
}
const article = (title = 'First') => ({ slug: 'first', title, status: 'published' });
const resource = (post, suffix = '') => ({ id: post, status: 'published', url: `https://www.reddit.com/r/BangaloreBikes/comments/${post}/${suffix}` });
const errorCode = (code) => (error) => error instanceof ContentStoreError && error.code === code;

test('migration is repeatable; collections and publication filtering remain isolated', async (t) => {
  const { store } = fixture(t);
  await store.migrate();
  await store.migrate();
  await store.create('articles', 'same', article(), 'mod');
  await store.create('articles', 'draft', { status: 'draft' }, 'mod');
  await store.create('rides', 'same', { status: 'scheduled', confirmed: true }, 'mod', { published: true });
  await store.create('rides', 'cancelled', { status: 'cancelled', confirmed: true }, 'mod', { published: true });
  await store.create('rides', 'draft', { status: 'draft' }, 'mod');
  assert.deepEqual((await store.list('articles')).map(r => r.id), ['same']);
  assert.equal((await store.list('articles', 'all')).length, 2);
  assert.deepEqual((await store.list('rides')).map(r => r.id), ['cancelled', 'same']);
  assert.equal(await store.get('articles', 'missing'), null);
});

test('CRUD enforces versions, preserves tombstones and audits only successful changes', async (t) => {
  const { store } = fixture(t);
  await store.migrate();
  const created = await store.create('articles', 'first', article(), 'alice');
  assert.deepEqual(created, { collection: 'articles', id: 'first', data: article(), version: 1, deleted: false, published: true });
  await assert.rejects(store.create('articles', 'first', article(), 'bob'), errorCode('CONFLICT'));
  const edited = await store.update('articles', 'first', article('Edited'), 1, 'bob');
  assert.equal(edited.version, 2);
  await assert.rejects(store.update('articles', 'first', article('Lost'), 1, 'alice'), errorCode('CONFLICT'));
  await assert.rejects(store.delete('articles', 'first', 1, 'alice'), errorCode('CONFLICT'));
  assert.equal((await store.get('articles', 'first')).data.title, 'Edited');
  await store.delete('articles', 'first', 2, 'bob');
  assert.equal(await store.get('articles', 'first'), null);
  assert.deepEqual(await store.list('articles', 'all'), []);
  await assert.rejects(store.create('articles', 'first', article(), 'bob'), errorCode('CONFLICT'));
  await assert.rejects(store.update('articles', 'first', article(), 3, 'bob'), errorCode('CONFLICT'));
  await assert.rejects(store.delete('articles', 'first', 3, 'bob'), errorCode('CONFLICT'));
  await assert.rejects(store.update('articles', 'missing', article(), 1, 'bob'), errorCode('CONFLICT'));
  const audit = await store.audit('articles', 'first');
  assert.deepEqual(audit.map(({ actor, action, version }) => ({ actor, action, version })), [
    { actor: 'alice', action: 'create', version: 1 },
    { actor: 'bob', action: 'update', version: 2 },
    { actor: 'bob', action: 'delete', version: 3 },
  ]);
  assert.ok(audit.every(entry => entry.createdAt && entry.id > 0));
});

test('only one competing writer can update a version', async (t) => {
  const { store, client } = fixture(t);
  await store.migrate();
  await store.create('articles', 'first', article(), 'mod');
  // Independent repository instance, same underlying database.
  const other = createContentStore(client);
  await other.update('articles', 'first', article('winner'), 1, 'other');
  await assert.rejects(store.update('articles', 'first', article('loser'), 1, 'mod'), errorCode('CONFLICT'));
  assert.equal((await store.get('articles', 'first')).data.title, 'winner');
});

test('publication metadata overrides content status for writes and seeds', async (t) => {
  const { store } = fixture(t);
  await store.migrate();
  const hidden = await store.create('articles', 'hidden', article(), 'mod', { published: false });
  assert.equal(hidden.published, false);
  await store.create('rides', 'private', { status: 'scheduled', confirmed: true }, 'mod');
  await store.seedOnce({ rides: [{ id: 'public', data: { status: 'cancelled', confirmed: true }, published: true }] }, 'seed');
  assert.deepEqual((await store.list('rides')).map(r => r.id), ['public']);
  const updated = await store.update('rides', 'private', { status: 'scheduled', confirmed: true }, 1, 'mod', { published: true });
  assert.equal(updated.published, true);
  await store.update('rides', 'private', { status: 'scheduled', confirmed: true }, 2, 'mod', { published: false });
  assert.deepEqual((await store.list('rides')).map(r => r.id), ['public']);
  await store.update('articles', 'hidden', { status: 'draft' }, 1, 'mod', { published: true });
  assert.equal((await store.list('articles')).length, 1);
});

test('a tombstone made before initial seed is not resurrected', async (t) => {
  const { store, db } = fixture(t);
  await store.migrate();
  await store.create('articles', 'first', article(), 'mod');
  await store.delete('articles', 'first', 1, 'mod');
  await store.seedOnce({ articles: [{ id: 'first', data: article() }] }, 'seed');
  assert.equal(await store.get('articles', 'first'), null);
  const row = db.prepare('SELECT version, deleted FROM content_records').get();
  assert.equal(row.version, 2);
  assert.equal(row.deleted, 1);
  assert.equal((await store.audit()).length, 2);
});

test('seed runs once per collection, preserves edits and never resurrects tombstones', async (t) => {
  const { store, client } = fixture(t);
  await store.migrate();
  await store.create('articles', 'existing', article('edited'), 'mod');
  const seeds = { articles: [{ id: 'existing', data: article() }, { id: 'seed', data: article() }] };
  await store.seedOnce(seeds, 'bootstrap');
  await store.delete('articles', 'seed', 1, 'mod');
  const restarted = createContentStore(client);
  await restarted.migrate();
  await restarted.seedOnce({ articles: [...seeds.articles, { id: 'later', data: article() }], rides: [{ id: 'ride', data: { status: 'scheduled' } }] }, 'bootstrap');
  assert.equal((await store.get('articles', 'existing')).data.title, 'edited');
  assert.equal(await store.get('articles', 'seed'), null);
  assert.equal(await store.get('articles', 'later'), null);
  assert.equal((await store.get('rides', 'ride')).version, 1);
  assert.deepEqual((await store.audit()).map(e => e.action), ['create', 'seed', 'delete', 'seed']);
});

test('resource source identity ignores title, URL hostname case, query and fragment', async (t) => {
  const { store } = fixture(t);
  await store.migrate();
  await store.create('resources', 'one', resource('abc123', 'title/?x=1#anchor'), 'mod');
  const duplicate = { ...resource('ABC123'), url: 'https://reddit.com/r/bangalorebikes/comments/ABC123/different/' };
  await assert.rejects(store.create('resources', 'two', duplicate, 'mod'), errorCode('SOURCE_CONFLICT'));
  await store.create('resources', 'two', resource('def456'), 'mod');
  await assert.rejects(store.update('resources', 'two', duplicate, 1, 'mod'), errorCode('SOURCE_CONFLICT'));
  assert.equal((await store.get('resources', 'two')).version, 1);
  await store.delete('resources', 'one', 1, 'mod');
  await store.update('resources', 'two', duplicate, 1, 'mod');
  assert.equal((await store.audit('resources')).length, 4);
});

test('audit failure rolls back mutation and seed failure rolls back marker and rows', async (t) => {
  const { store, db } = fixture(t);
  await store.migrate();
  db.exec("CREATE TRIGGER reject_audit BEFORE INSERT ON content_audit BEGIN SELECT RAISE(ABORT, 'audit unavailable'); END");
  await assert.rejects(store.create('articles', 'first', article(), 'mod'), /audit unavailable/);
  assert.equal(await store.get('articles', 'first'), null);
  db.exec('DROP TRIGGER reject_audit');
  await store.create('articles', 'first', article(), 'mod');
  db.exec("CREATE TRIGGER reject_audit BEFORE INSERT ON content_audit BEGIN SELECT RAISE(ABORT, 'audit unavailable'); END");
  await assert.rejects(store.update('articles', 'first', article('lost'), 1, 'mod'), /audit unavailable/);
  await assert.rejects(store.delete('articles', 'first', 1, 'mod'), /audit unavailable/);
  assert.equal((await store.get('articles', 'first')).version, 1);
  assert.equal((await store.get('articles', 'first')).data.title, 'First');
  db.exec('DROP TRIGGER reject_audit');
  await assert.rejects(store.seedOnce({ resources: [{ id: 'one', data: resource('abc123') }, { id: 'two', data: resource('abc123') }] }, 'seed'), errorCode('SOURCE_CONFLICT'));
  assert.deepEqual(await store.list('resources', 'all'), []);
  await store.seedOnce({ resources: [{ id: 'one', data: resource('abc123') }] }, 'seed');
  assert.equal((await store.list('resources')).length, 1);
});

test('untrusted values stay bound; invalid collections, versions and actor are rejected', async (t) => {
  const { store } = fixture(t);
  await store.migrate();
  const id = "quote'); DROP TABLE content_records; --";
  await store.create('articles', id, article(id), "mod';--");
  assert.equal((await store.get('articles', id)).data.title, id);
  await assert.rejects(store.list('articles; DROP TABLE content_records'), errorCode('INVALID_INPUT'));
  await assert.rejects(store.list('articles', 'oops'), errorCode('INVALID_INPUT'));
  for (const version of [0, -1, 1.5, NaN, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(store.delete('articles', id, version, 'mod'), errorCode('INVALID_INPUT'));
  }
  await assert.rejects(store.create('articles', 'blank', article(), ' '), errorCode('INVALID_INPUT'));
  await assert.rejects(store.create('articles', '', article(), 'mod'), errorCode('INVALID_INPUT'));
  await assert.rejects(store.create('resources', 'bad', { url: 'https://example.com' }, 'mod'), errorCode('INVALID_INPUT'));
  assert.equal((await store.list('articles')).length, 1);
});
