import React, { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "./MedicineIdDetails.css";

// Updated dataset with **real images**
const medicineDetails = [
  {
    id: "68babe8a573167c31f01ce29",
    name: "Paracetamol 500mg Tablet",
    pharmacy: "MediCare Pharma (Pvt. Ltd.)",
    price: "45.50",
    imageSrc:
      "https://images.unsplash.com/photo-1584308661627-7894a0d1b523?auto=format&fit=crop&w=900&q=80",
    description:
      "A common painkiller used to treat aches, pain, and reduce a high temperature (fever). It is effective for headaches, toothaches, and cold symptoms.",
    ingredients: ["Paracetamol 500mg", "Starch", "Povidone", "Magnesium stearate"],
    usesBenefits: [
      "Relieves mild to moderate pain (headache, muscle ache)",
      "Reduces fever",
      "Effective against cold and flu symptoms",
    ],
    dosage:
      "Adults: 1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets in 24 hours. Always follow a doctor's prescription.",
    storageSafety:
      "Store below 25°C in a dry place. Keep out of reach of children. Do not consume alcohol while taking this medicine.",
  },
  {
    id: "68babe8a573167c31f01ce26",
    name: "Amoxicillin 250mg Capsule",
    pharmacy: "HealthPlus Wellness",
    price: "180.00",
    imageSrc:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=900&q=80",
    description:
      "An antibiotic from the penicillin group, used to treat a wide range of bacterial infections. It works by stopping the growth of bacteria.",
    ingredients: ["Amoxicillin Trihydrate 250mg", "Magnesium Stearate", "Gelatin"],
    usesBenefits: [
      "Treats chest infections (pneumonia, bronchitis)",
      "Treats ear, nose, and throat infections",
      "Treats urinary tract infections",
    ],
    dosage:
      "Adults: 250mg to 500mg three times a day. Complete the full course of treatment even if you feel better.",
    storageSafety:
      "Store in the original package at room temperature, away from moisture and heat. Do not skip doses.",
  },
  {
    id: "68babe8a573167c31f01ce20",
    name: "Vitamin C Chewable Tablet",
    pharmacy: "NutriBoost Supplements",
    price: "99.99",
    imageSrc:
      "https://images.unsplash.com/photo-1625772299846-2d7e2d7b9b2f?auto=format&fit=crop&w=900&q=80",
    description:
      "A vital nutrient that acts as an antioxidant. It helps protect cells from damage caused by free radicals.",
    ingredients: ["Ascorbic Acid (Vitamin C) 500mg", "Sucrose", "Natural Flavoring"],
    usesBenefits: [
      "Boosts the immune system",
      "Aids in collagen formation",
      "Helps the body absorb iron",
    ],
    dosage: "Adults: One chewable tablet daily, preferably with a meal.",
    storageSafety:
      "Keep the container tightly closed. Store away from heat and light. Supplements are not a substitute for a balanced diet.",
  },
  {
    id: "68babe8a573167c31f01ce30",
    name: "Ibuprofen 400mg Pain Reliever",
    pharmacy: "The Relief Store",
    price: "62.00",
    imageSrc:
      "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=900&q=80",
    description:
      "A non-steroidal anti-inflammatory drug (NSAID) used for pain and inflammation relief. Provides fast relief for common aches and pains.",
    ingredients: ["Ibuprofen 400mg", "Cellulose", "Croscarmellose Sodium"],
    usesBenefits: [
      "Reduces pain (migraines, dental pain, body aches)",
      "Reduces fever",
      "Reduces inflammation and swelling",
    ],
    dosage:
      "Adults: 1 tablet every 4-6 hours as needed for pain. Do not exceed 3 tablets in 24 hours.",
    storageSafety:
      "Take with food or milk if stomach upset occurs. Consult a doctor if pain persists for more than 10 days.",
  },
];

// Fallback image (real generic pharmacy photo)
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=900&q=80";

// Normalize IDs
const normalizeId = (v) => String(v ?? "").trim().replace(/,/g, "").toLowerCase();
const detailsMap = new Map(medicineDetails.map((m) => [normalizeId(m.id), m]));

function MedicineIdDetails({ addToCart }) {
  const { id, medicineId } = useParams();
  const paramId = decodeURIComponent(medicineId ?? id ?? "");
  const navigate = useNavigate();

  const medicine = useMemo(() => detailsMap.get(normalizeId(paramId)), [paramId]);

  if (!medicine) {
    return (
      <main className="medicine-details">
        <div className="medicine-details__header">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ← Back
          </button>
        </div>
        <section className="medicine-details__not-found">
          <h2>Medicine not found</h2>
          <p>We couldn’t find a medicine for ID: {paramId}</p>
          <Link to="/medicines" className="btn btn--primary">
            Browse medicines
          </Link>
        </section>
      </main>
    );
  }

  const priceNumber = Number.parseFloat(medicine.price);
  const formattedPrice = isNaN(priceNumber)
    ? `₹${medicine.price}`
    : `₹${priceNumber.toFixed(2)}`;

  const handleAddToCart = () => {
    if (typeof addToCart === "function") {
      addToCart({
        _id: medicine.id,
        id: medicine.id,
        name: medicine.name,
        price: priceNumber,
        image: medicine.imageSrc,
      });
    }
  };

  return (
    <main className="medicine-details" aria-labelledby="medicine-title">
      <div className="medicine-details__header">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ← Back
        </button>
      </div>

      <section className="medicine-details__card">
        <div className="medicine-details__image-col">
          <img
            src={medicine.imageSrc}
            alt={medicine.name}
            className="medicine-details__image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </div>

        <div className="medicine-details__info-col">
          <h1 id="medicine-title" className="medicine-details__title">
            {medicine.name}
          </h1>
          <p className="medicine-details__pharmacy">{medicine.pharmacy}</p>

          <div className="medicine-details__price-row">
            <span className="medicine-details__price">{formattedPrice}</span>
            {typeof addToCart === "function" && (
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleAddToCart}
                aria-label={`Add ${medicine.name} to cart`}
              >
                Add to Cart
              </button>
            )}
          </div>

          <p className="medicine-details__description">{medicine.description}</p>

          <div className="medicine-details__sections">
            <div className="medicine-details__section">
              <h2>Ingredients</h2>
              <ul>
                {medicine.ingredients.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="medicine-details__section">
              <h2>Uses & Benefits</h2>
              <ul>
                {medicine.usesBenefits.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="medicine-details__section">
              <h2>Dosage</h2>
              <p>{medicine.dosage}</p>
            </div>

            <div className="medicine-details__section">
              <h2>Storage & Safety</h2>
              <p>{medicine.storageSafety}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default MedicineIdDetails;