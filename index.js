const API_BASE_URL = "https://fakestoreapi.com/products";
const CART_STORAGE_KEY = "swift_cart_items";

const state = {
  activeCategory: "all",
  products: [],
  productCache: new Map(),
};

const dom = {
  categoryFilters: document.getElementById("category-filters"),
  productsGrid: document.getElementById("products-grid"),
  productsError: document.getElementById("products-error"),
  detailModal: document.getElementById("product-detail-modal"),
  detailLoading: document.getElementById("detail-loading"),
  detailContent: document.getElementById("detail-content"),
  detailImage: document.getElementById("detail-image"),
  detailCategory: document.getElementById("detail-category"),
  detailTitle: document.getElementById("detail-title"),
  detailPrice: document.getElementById("detail-price"),
  detailRating: document.getElementById("detail-rating"),
  detailDescription: document.getElementById("detail-description"),
  detailAddToCart: document.getElementById("detail-add-to-cart"),
  homeTrendingGrid: document.getElementById("home-trending-grid"),
};

initGlobalConnections();

if (dom.homeTrendingGrid) {
  initHomePage();
}

if (dom.productsGrid && dom.categoryFilters) {
  initProductsPage();
}

function initGlobalConnections() {
  updateCartBadges();

  document.addEventListener("click", (event) => {
    const cartTrigger = event.target.closest("[data-cart-trigger]");
    if (cartTrigger && cartTrigger.tagName === "BUTTON") {
      const totalItems = getCart().reduce(
        (sum, item) => sum + Number(item.qty || 0),
        0,
      );
      window.alert(
        totalItems ? `Cart items: ${totalItems}` : "Your cart is empty.",
      );
      return;
    }

    const addButton = event.target.closest("button[data-add-product-id]");
    if (!addButton) {
      return;
    }

    const productId = Number(addButton.dataset.addProductId);
    if (!productId) {
      return;
    }

    const product = findProductById(productId);
    if (!product) {
      return;
    }

    addToCart(product);
    addButton.textContent = "Added";
    addButton.disabled = true;

    window.setTimeout(() => {
      addButton.textContent = "Add";
      addButton.disabled = false;
    }, 600);
  });
}

async function initHomePage() {
  renderHomeLoadingCards();

  try {
    const products = await fetchProducts("all");
    state.products = products;
    const topRated = [...products]
      .sort((a, b) => Number(b.rating?.rate || 0) - Number(a.rating?.rate || 0))
      .slice(0, 3);
    renderHomeTrending(topRated);
  } catch (error) {
    dom.homeTrendingGrid.innerHTML = `<div class="col-span-full rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${escapeHtml(error.message || "Unable to load trending products.")}</div>`;
  }
}

async function initProductsPage() {
  renderLoadingCards();

  try {
    const categories = await fetchCategories();
    renderCategoryButtons(categories);

    const params = new URLSearchParams(window.location.search);
    const requestedCategory = params.get("category");
    const initialCategory = categories.includes(requestedCategory)
      ? requestedCategory
      : "all";

    await setCategory(initialCategory);

    const requestedProductId = Number(params.get("product"));
    if (requestedProductId) {
      await openProductDetail(requestedProductId);
    }
  } catch (error) {
    renderError(error);
  }

  dom.categoryFilters.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) {
      return;
    }

    const { category } = button.dataset;
    if (category === state.activeCategory) {
      return;
    }

    await setCategory(category);

    const url = new URL(window.location.href);
    if (category === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", category);
    }
    url.searchParams.delete("product");
    window.history.replaceState({}, "", url);
  });

  dom.productsGrid.addEventListener("click", async (event) => {
    const detailButton = event.target.closest("button[data-product-id]");
    if (!detailButton) {
      return;
    }

    const productId = Number(detailButton.dataset.productId);
    await openProductDetail(productId);

    const url = new URL(window.location.href);
    url.searchParams.set("product", String(productId));
    window.history.replaceState({}, "", url);
  });
}

async function setCategory(category) {
  state.activeCategory = category;
  highlightActiveCategory();
  dom.productsError.classList.add("hidden");
  renderLoadingCards();

  try {
    state.products = await fetchProducts(category);
    renderProducts(state.products);
  } catch (error) {
    renderError(error);
  }
}

async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error("Unable to load product categories.");
  }

  const categories = await response.json();
  return Array.isArray(categories) ? categories : [];
}

async function fetchProducts(category) {
  const endpoint =
    category === "all"
      ? API_BASE_URL
      : `${API_BASE_URL}/category/${encodeURIComponent(category)}`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("Unable to load products.");
  }

  const products = await response.json();
  return Array.isArray(products) ? products : [];
}

async function fetchSingleProduct(productId) {
  if (state.productCache.has(productId)) {
    return state.productCache.get(productId);
  }

  const response = await fetch(`${API_BASE_URL}/${productId}`);
  if (!response.ok) {
    throw new Error("Unable to load this product detail.");
  }

  const product = await response.json();
  state.productCache.set(productId, product);
  return product;
}

function renderCategoryButtons(categories) {
  const allCategories = ["all", ...categories];

  dom.categoryFilters.innerHTML = allCategories
    .map((category) => {
      return `<button
        class="btn btn-sm rounded-full border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:text-indigo-600"
        data-category="${escapeHtml(category)}"
      >${escapeHtml(toCategoryLabel(category))}</button>`;
    })
    .join("");
}

function highlightActiveCategory() {
  const buttons = dom.categoryFilters.querySelectorAll("button[data-category]");

  buttons.forEach((button) => {
    const isActive = button.dataset.category === state.activeCategory;
    if (isActive) {
      button.classList.remove("bg-white", "text-slate-700");
      button.classList.add("bg-indigo-600", "text-white", "border-indigo-600");
    } else {
      button.classList.remove("bg-indigo-600", "text-white", "border-indigo-600");
      button.classList.add("bg-white", "text-slate-700");
    }
  });
}

function renderLoadingCards() {
  dom.productsGrid.innerHTML = Array.from({ length: 8 }, () => {
    return `<article class="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
      <div class="h-52 rounded-lg bg-slate-200"></div>
      <div class="mt-4 h-4 w-20 rounded bg-slate-200"></div>
      <div class="mt-3 h-4 w-full rounded bg-slate-200"></div>
      <div class="mt-2 h-4 w-2/3 rounded bg-slate-200"></div>
      <div class="mt-4 h-7 w-24 rounded bg-slate-200"></div>
    </article>`;
  }).join("");
}

function renderHomeLoadingCards() {
  dom.homeTrendingGrid.innerHTML = Array.from({ length: 3 }, () => {
    return `<article class="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div class="h-64 rounded-lg bg-slate-200"></div>
      <div class="mt-3 h-4 w-24 rounded bg-slate-200"></div>
      <div class="mt-2 h-4 w-full rounded bg-slate-200"></div>
      <div class="mt-2 h-8 w-28 rounded bg-slate-200"></div>
    </article>`;
  }).join("");
}

function renderHomeTrending(products) {
  if (!products.length) {
    dom.homeTrendingGrid.innerHTML = `<div class="col-span-full rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">No products available right now.</div>`;
    return;
  }

  dom.homeTrendingGrid.innerHTML = products
    .map((product) => {
      return `<article class="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div class="flex h-64 items-center justify-center rounded-lg bg-[#efeff2] p-4">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" class="max-h-full w-auto max-w-full object-contain" loading="lazy" />
        </div>
        <div class="mt-3 flex items-center justify-between text-xs">
          <span class="rounded bg-indigo-50 px-2 py-1 text-indigo-600">${escapeHtml(toCategoryLabel(product.category))}</span>
          <span class="text-amber-500">${formatRating(product.rating)}</span>
        </div>
        <h3 class="mt-2 truncate text-sm font-semibold" title="${escapeHtml(product.title)}">${escapeHtml(product.title)}</h3>
        <p class="mt-2 text-2xl font-extrabold">${formatPrice(product.price)}</p>
        <div class="mt-3 grid grid-cols-2 gap-2">
          <a href="products.html?product=${product.id}" class="btn btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-100">Details</a>
          <button class="btn btn-sm bg-indigo-600 text-white hover:bg-indigo-700" data-add-product-id="${product.id}">Add</button>
        </div>
      </article>`;
    })
    .join("");
}

function renderProducts(products) {
  if (!products.length) {
    dom.productsGrid.innerHTML = `<div class="col-span-full rounded-xl border border-slate-200 bg-white p-10 text-center text-slate-600">No products found in this category.</div>`;
    return;
  }

  dom.productsGrid.innerHTML = products
    .map((product) => {
      return `<article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex h-60 items-center justify-center rounded-lg bg-[#efeff2] p-4">
          <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}" class="max-h-full w-auto max-w-full object-contain" loading="lazy" />
        </div>

        <div class="mt-4 flex items-center justify-between gap-2 text-xs">
          <span class="rounded-full bg-indigo-50 px-2 py-1 text-indigo-600">${escapeHtml(toCategoryLabel(product.category))}</span>
          <span class="text-amber-500">${formatRating(product.rating)}</span>
        </div>

        <h3 class="mt-3 truncate text-lg font-semibold" title="${escapeHtml(product.title)}">${escapeHtml(product.title)}</h3>
        <p class="mt-2 text-3xl font-extrabold">${formatPrice(product.price)}</p>

        <div class="mt-4 grid grid-cols-2 gap-2">
          <button class="btn btn-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-100" data-product-id="${product.id}">Details</button>
          <button class="btn btn-sm bg-indigo-600 text-white hover:bg-indigo-700" data-add-product-id="${product.id}">Add</button>
        </div>
      </article>`;
    })
    .join("");
}

function renderError(error) {
  dom.productsGrid.innerHTML = "";
  dom.productsError.textContent = error.message || "Something went wrong.";
  dom.productsError.classList.remove("hidden");
}

async function openProductDetail(productId) {
  if (!dom.detailModal) {
    return;
  }

  dom.detailLoading.textContent = "Loading product details...";
  dom.detailLoading.classList.remove("hidden");
  dom.detailContent.classList.add("hidden");
  dom.detailModal.showModal();

  try {
    const product = await fetchSingleProduct(productId);
    fillProductDetail(product);
    dom.detailLoading.classList.add("hidden");
    dom.detailContent.classList.remove("hidden");
  } catch (error) {
    dom.detailLoading.textContent = error.message || "Unable to load details.";
  }
}

function fillProductDetail(product) {
  dom.detailImage.src = product.image;
  dom.detailImage.alt = product.title;
  dom.detailCategory.textContent = toCategoryLabel(product.category);
  dom.detailTitle.textContent = product.title;
  dom.detailPrice.textContent = formatPrice(product.price);

  if (product.rating) {
    dom.detailRating.textContent = `Rating: ${Number(product.rating.rate).toFixed(1)} (${product.rating.count} reviews)`;
  } else {
    dom.detailRating.textContent = "Rating: Not available";
  }

  dom.detailDescription.textContent = product.description;

  if (dom.detailAddToCart) {
    dom.detailAddToCart.dataset.addProductId = String(product.id);
  }
}

function formatRating(rating) {
  if (!rating) {
    return "No ratings";
  }

  return `* ${Number(rating.rate).toFixed(1)} (${rating.count})`;
}

function findProductById(productId) {
  if (state.products && state.products.length) {
    const inList = state.products.find(
      (product) => Number(product.id) === productId,
    );
    if (inList) {
      return inList;
    }
  }

  if (state.productCache.has(productId)) {
    return state.productCache.get(productId);
  }

  return null;
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => Number(item.id) === Number(product.id));

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      image: product.image,
      qty: 1,
    });
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadges();
}

function getCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function updateCartBadges() {
  const count = getCart().reduce((sum, item) => sum + Number(item.qty || 0), 0);
  const badges = document.querySelectorAll("[data-cart-count]");

  badges.forEach((badge) => {
    badge.textContent = String(count);
    badge.classList.toggle("hidden", count === 0);
  });
}

function toCategoryLabel(category) {
  if (category === "all") {
    return "All";
  }

  return category
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(price));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
