;(() => {
  const bundleSelector = document.getElementById("bundleSelector")
  if (!bundleSelector) return

  const bundleOptions = bundleSelector.querySelectorAll(".bundle-option")
  const gifts = bundleSelector.querySelectorAll(".gift")
  const addToCartButton = bundleSelector.querySelector(".add-to-cart")

  let selectedBundle = 2

  function updateGifts() {
    gifts.forEach((gift) => {
      const minBottles = Number.parseInt(gift.dataset.minBottles, 10)
      const bottlesRequired = gift.querySelector(".bottles-required")
      const freeBadge = gift.querySelector(".free-badge")
      const lockIcon = gift.querySelector(".lock-icon")

      if (selectedBundle >= minBottles) {
        gift.classList.add("available")
        if (bottlesRequired) bottlesRequired.style.display = "none"
        if (freeBadge) freeBadge.style.display = "block"
        if (lockIcon) lockIcon.style.display = "none"
      } else {
        gift.classList.remove("available")
        if (bottlesRequired) bottlesRequired.style.display = "block"
        if (freeBadge) freeBadge.style.display = "none"
        if (lockIcon) lockIcon.style.display = "flex"
      }
    })
  }

  function updateBundleSelection() {
    bundleOptions.forEach((option) => {
      const bottles = Number.parseInt(option.dataset.bottles, 10)
      if (bottles === selectedBundle) {
        option.classList.add("selected")
      } else {
        option.classList.remove("selected")
      }
    })
    updateGifts()
  }

  bundleOptions.forEach((option) => {
    option.addEventListener("click", function (e) {
      if (e.target.tagName.toLowerCase() === "select") return

      const bottles = Number.parseInt(this.dataset.bottles, 10)
      if (!isNaN(bottles)) {
        selectedBundle = bottles
        updateBundleSelection()
      }
    })
  })

  function openCartDrawer() {
    const cartDrawer = document.getElementById("cart-drawer")
    if (cartDrawer) {
      cartDrawer.style.opacity = "1"
      cartDrawer.style.visibility = "visible"
      cartDrawer.removeAttribute("inert")
      cartDrawer.setAttribute("open", "")
    }
  }

  addToCartButton.addEventListener("click", () => {
    const selectedBundleOption = bundleSelector.querySelector(`.bundle-option[data-bottles="${selectedBundle}"]`)
    if (!selectedBundleOption) return

    let variants = []

    if (selectedBundle === 1) {
      const singleVariantSelector = selectedBundleOption.querySelector("select.variant-css")
      if (singleVariantSelector && singleVariantSelector.value) {
        variants.push({ id: singleVariantSelector.value, quantity: 1 })
      }
    } else {
      variants = Array.from(selectedBundleOption.querySelectorAll(".variant-selector"))
        .map((selector) => ({
          id: selector.value,
          quantity: 1,
        }))
        .filter((item) => item.id)
    }

    if (variants.length === 0) {
      alert("Veuillez sélectionner une variante")
      return
    }

    fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        items: variants,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        document.documentElement.dispatchEvent(
          new CustomEvent("cart:refresh", {
            bubbles: true,
          }),
        )

        openCartDrawer()
      })
      .catch((error) => {
        console.error("Erreur lors de l'ajout au panier:", error)
        alert("Une erreur est survenue lors de l'ajout au panier")
      })
  })

  updateBundleSelection()
})()