  function own(o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); }
  function addMissing(target, src) {
    if (!target || !src) return;
    Object.keys(src).forEach(function (k) { if (!own(target, k)) target[k] = src[k]; });
  }
  var F = window.EDO_FOODS;
  if (F) {
    F.glossary = F.glossary || {};
    Object.keys(D.glossary).forEach(function (l) {
      if (!own(F.glossary, l)) F.glossary[l] = {};
      addMissing(F.glossary[l], D.glossary[l]);
    });
    F.groups = F.groups || {}; addMissing(F.groups, D.groups);
    F.recipeAmounts = F.recipeAmounts || {}; addMissing(F.recipeAmounts, D.amounts);
    F.recipeSteps = F.recipeSteps || {}; addMissing(F.recipeSteps, D.steps);
  }
  var L = window.EDO_LOCALES;
  if (L && L.res) {
    Object.keys(D.titles).forEach(function (l) {
      var r = own(L.res, l) ? L.res[l] : null;
      if (!r || !r.recipes) return;
      r.recipes.recipes = r.recipes.recipes || {};
      r.recipes.cuisines = r.recipes.cuisines || {};
      addMissing(r.recipes.recipes, D.titles[l]);
      addMissing(r.recipes.cuisines, D.cuisines[l] || {});
    });
  }
  window.EDO_RECIPES_EXT = { v: D.v, recipes: D.recipes };
