// Fredy's House - ingrédients dynamiques (version PRO avec arrondis intelligents)
(function () {
  function roundToStep(value, step) {
    return Math.round(value / step) * step;
  }

  function formatQty(n) {
    const rounded = Math.round(n * 100) / 100; // 2 décimales max
    return Number.isInteger(rounded) ? String(rounded) : String(rounded);
  }

  function needsInteger(name, unit) {
    const n = (name || "").toLowerCase();
    const u = (unit || "").toLowerCase();

    // ingrédients qui doivent être entiers
    const integerKeywords = [
      "œuf", "oeuf", "oignon", "carotte", "tomate", "pain", "tranche",
      "bouquet", "feuille", "gousse"
    ];

    return integerKeywords.some(k => n.includes(k)) || u === "" && integerKeywords.some(k => n.includes(k));
  }

  function smartRound(qty, unit, name) {
    const u = (unit || "").toLowerCase();

    // 1) Arrondi "entier" pour certains ingrédients
    if (needsInteger(name, unit)) {
      return Math.max(1, Math.round(qty));
    }

    // 2) Vin (cl) : arrondi au 5 cl
    if (u === "cl") {
      return Math.max(5, roundToStep(qty, 5));
    }

    // 3) Grammes : arrondi au 5 g
    if (u === "g") {
      return Math.max(5, roundToStep(qty, 5));
    }

    // 4) Kg : arrondi au 0.05 kg (50 g)
    if (u === "kg") {
      const r = roundToStep(qty, 0.05);
      return r <= 0 ? 0.05 : r;
    }

    // 5) Cuillères : arrondi au 0.5
    if (u.includes("c. à soupe") || u.includes("c. a soupe") || u.includes("c. à café") || u.includes("c. a cafe")) {
      return Math.max(0.5, roundToStep(qty, 0.5));
    }

    // 6) Par défaut : 2 décimales max
    return Math.round(qty * 100) / 100;
  }

  function renderIngredientsForList(listEl, servings) {
    const baseServings = Number(listEl.dataset.baseServings || 2);
    const ratio = servings / baseServings;

    const items = listEl.querySelectorAll("li[data-qty][data-name]");
    items.forEach((li) => {
      const baseQty = Number(li.dataset.qty);
      const unit = (li.dataset.unit || "").trim();
      const name = (li.dataset.name || "").trim();

      const rawQty = baseQty * ratio;
      const finalQty = smartRound(rawQty, unit, name);
      const qtyText = formatQty(finalQty);

      // Affichage : si unité vide => "2 oignons", sinon "150 g de lardons"
      if (!unit) {
        li.textContent = `${qtyText} ${name}`.trim();
      } else {
        // éviter "de œufs" : on écrit simplement "2 œufs" si name commence par "œufs"
        if (name.toLowerCase().startsWith("œuf") || name.toLowerCase().startsWith("oeuf")) {
          li.textContent = `${qtyText} ${name}`.trim();
        } else {
          li.textContent = `${qtyText} ${unit} de ${name}`.trim();
        }
      }
    });
  }

  function renderAllIngredients(servings) {
    document.querySelectorAll(".ingredients[data-base-servings]").forEach((listEl) => {
      renderIngredientsForList(listEl, servings);
    });

    const peopleLabel = document.querySelector("[data-servings-label]");
    if (peopleLabel) {
  const unit = (peopleLabel.dataset.unit || "personnes");
  const singular = unit === "parts" ? "part" : "personne";
  const plural = unit === "parts" ? "parts" : "personnes";
  peopleLabel.textContent = `${servings} ${servings > 1 ? plural : singular}`;
}

  }

  function initServings() {
    const input = document.getElementById("servings");
    const minus = document.getElementById("servingsMinus");
    const plus = document.getElementById("servingsPlus");
    if (!input) return;

    function clamp() {
      const v = Math.max(1, parseInt(input.value || "1", 10));
      input.value = String(v);
      return v;
    }

    renderAllIngredients(clamp());

    input.addEventListener("input", () => renderAllIngredients(clamp()));

    if (minus) {
      minus.addEventListener("click", () => {
        input.value = String(clamp() - 1);
        renderAllIngredients(clamp());
      });
    }

    if (plus) {
      plus.addEventListener("click", () => {
        input.value = String(clamp() + 1);
        renderAllIngredients(clamp());
      });
    }
  }

  document.addEventListener("DOMContentLoaded", initServings);
})();
