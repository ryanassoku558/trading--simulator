import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initialAccount,trade} from '../trading.js';

test('trading keeps original $10,000 initial balance',()=>{
  const account=initialAccount();
  assert.equal(account.cash,10000);
  assert.deepEqual(account.positions,{});
});
test('trades preserve the input account and update a copy',()=>{
  const original=initialAccount();
  const next=trade(original,'AAPL','buy',2,100);
  assert.equal(original.cash,10000);
  assert.equal(next.cash,9800);
  assert.equal(next.positions.AAPL.quantity,2);
  assert.equal(next.trades.length,1);
});
test('reject overselling and unaffordable orders',()=>{
  assert.throws(()=>trade(initialAccount(),'AAPL','sell',1,100));
  assert.throws(()=>trade(initialAccount(),'AAPL','buy',200,100));
});
test('learning module is included in the site and build',async()=>{
  const [html,build,learning]=await Promise.all(['index.html','scripts/build.js','learning.js'].map(f=>readFile(new URL('../'+f,import.meta.url),'utf8')));
  assert.match(html,/mountLearning/);
  assert.match(build,/learning\.js/);
  assert.match(learning,/setLearningUser/);
});
