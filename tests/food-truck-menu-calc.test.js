/**
 * Asserts the free food-truck calculator defaults reproduce the page's
 * made-up taco and brewery-night examples. Not linked from the site.
 * Run: node tests/food-truck-menu-calc.test.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'food-truck-menu-cost-calculator/index.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');

function inputValue(id) {
  const re = new RegExp('id="' + id + '"[^>]*\\bvalue="([^"]*)"');
  const m = html.match(re);
  assert.ok(m, 'missing value for #' + id);
  return Number(m[1]);
}

const calcSrc = html.match(/<script id="food-calc">([\s\S]*?)<\/script>/);
assert.ok(calcSrc, 'food-calc script missing');
const ctx = {};
vm.runInNewContext(calcSrc[1], ctx);

const plateIn = {
  food: inputValue('pc-food'),
  target: inputValue('pc-target'),
  pack: inputValue('pc-pack'),
  step: inputValue('pc-step'),
  price: null
};
const plate = ctx.foodPlateCalc(plateIn);
const plateAt8 = ctx.foodPlateCalc(Object.assign({}, plateIn, { price: 8 }));

const eventIn = {
  orders: inputValue('ec-orders'),
  ticket: inputValue('ec-ticket'),
  foodPct: inputValue('ec-foodPct'),
  pack: inputValue('ec-pack'),
  staff: inputValue('ec-staff'),
  cardPct: inputValue('ec-cardPct'),
  commPct: inputValue('ec-commPct'),
  fee: inputValue('ec-fee'),
  other: inputValue('ec-other')
};
const event = ctx.foodEventCalc(eventIn);

const results = {
  plateDefaults: {
    food: plateIn.food,
    targetPct: plateIn.target,
    packaging: plateIn.pack,
    step: plateIn.step,
    priceBeforeRounding: ctx.r2(plate.raw),
    suggested: plate.sugg,
    foodCostPct: ctx.r1(plate.fc),
    grossProfit: plate.gp
  },
  plateOverride8: {
    suggested: plateAt8.sugg,
    foodCostPct: ctx.r1(plateAt8.fc),
    grossProfit: plateAt8.gp
  },
  eventDefaults: {
    orders: event.orders,
    revenue: event.revenue,
    food: event.food,
    packaging: event.packaging,
    staff: event.staff,
    card: event.card,
    commission: event.comm,
    eventFee: event.fee,
    other: event.other,
    profit: event.profit,
    profitPct: ctx.r1(event.profitPct),
    breakEven: event.be,
    fixed: event.fixed,
    contrib: event.contrib
  }
};
console.log(JSON.stringify(results, null, 2));

assert.strictEqual(plate.err, '');
assert.strictEqual(ctx.r2(plate.raw), 7.7, '2.31 / 0.30 should be 7.70 before rounding');
assert.strictEqual(plate.sugg, 8, '7.70 rounds up to 8.00 at a 0.50 step');
assert.strictEqual(ctx.r1(plate.fc), 28.9);
assert.strictEqual(plate.gp, 5.34);
assert.strictEqual(plate.usedYours, false);
assert.strictEqual(plate.over, false);

assert.strictEqual(plateAt8.err, '');
assert.strictEqual(plateAt8.sugg, 8);
assert.strictEqual(ctx.r1(plateAt8.fc), 28.9);
assert.strictEqual(plateAt8.gp, 5.34);
assert.strictEqual(plateAt8.usedYours, true);
assert.strictEqual(plateAt8.over, false);

assert.strictEqual(event.err, '');
assert.strictEqual(event.orders, 100);
assert.strictEqual(event.revenue, 959);
assert.strictEqual(event.food, 278.61);
assert.strictEqual(event.packaging, 46.2);
assert.strictEqual(event.staff, 324);
assert.strictEqual(event.card, 49.14);
assert.strictEqual(event.comm, 95.9);
assert.strictEqual(event.fee, 75);
assert.strictEqual(event.other, 45);
assert.strictEqual(event.profit, 45.15);
assert.strictEqual(ctx.r1(event.profitPct), 4.7);
assert.strictEqual(event.fixed, 444);
assert.ok(Math.abs(event.contrib - 4.8915) < 1e-9, 'contribution ' + event.contrib);
assert.strictEqual(event.be, 91);
assert.strictEqual(Math.ceil(event.fixed / event.contrib - 1e-9), 91);

const low = ctx.foodPlateCalc(Object.assign({}, plateIn, { price: 7.5 }));
assert.strictEqual(low.over, true);
assert.ok(ctx.r1(low.fc) > 30);

const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
const product = blocks.find(b => Array.isArray(b) ? b.some(x => x['@type'] === 'Product') : b['@type'] === 'Product');
const productNode = Array.isArray(product) ? product.find(x => x['@type'] === 'Product') : product;
assert.ok(productNode, 'Product JSON-LD missing');
assert.strictEqual(productNode.offers.price, '19.00');
assert.strictEqual(productNode.aggregateRating, undefined);
assert.strictEqual(JSON.stringify(product).includes('aggregateRating'), false);
assert.strictEqual(JSON.stringify(product).includes('review'), false);

const faqLd = blocks.find(b => b['@type'] === 'FAQPage');
assert.ok(faqLd, 'FAQPage JSON-LD missing');
const visible = [...html.split('id="faq-list"')[1].split('</section>')[0].matchAll(/<summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p>/g)]
  .map(m => ({ q: m[1].trim(), a: m[2].trim() }));
assert.ok(visible.length >= 6 && visible.length <= 9, 'FAQ count ' + visible.length);
assert.strictEqual(faqLd.mainEntity.length, visible.length);
faqLd.mainEntity.forEach((q, i) => {
  assert.strictEqual(q.name, visible[i].q, 'question ' + i);
  assert.strictEqual(q.acceptedAnswer.text, visible[i].a, 'answer ' + i);
});

assert.ok(html.includes('<title>Food Truck Menu Pricing Calculator (Free) + Event Break-Even</title>'));
assert.ok(html.includes('<h1>Food Truck Menu Pricing Calculator (Free) + Event Break-Even</h1>'));
assert.ok(html.includes('<link rel="canonical" href="https://orvianmarketplace.com/food-truck-menu-cost-calculator/">'));
assert.ok(html.includes("gtag('event','tool_use',{tool_name:'food_plate_calc'})"));
assert.ok(html.includes("gtag('event','tool_use',{tool_name:'food_event_calc'})"));
assert.ok(html.includes('utm_content=nav'));
assert.ok(html.includes('utm_content=hero'));
assert.ok(html.includes('utm_content=final'));
assert.ok(html.includes('utm_content=calc'));
assert.ok(sitemap.includes('<loc>https://orvianmarketplace.com/food-truck-menu-cost-calculator/</loc><lastmod>2026-11-25</lastmod>'));

console.log('ok', visible.length, 'FAQ questions match JSON-LD;', 'plate and event defaults match the page examples');
