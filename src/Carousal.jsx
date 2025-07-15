import React, { useRef, useEffect, useState } from "react";

const models = [
  {
    name: "Momos",
    file: "momos",
    thumb: "momos.jpg",
    price: "₹299",
    description: "Steamed dumplings filled with seasoned vegetables and spices",
    category: "starters",
  },
  {
    name: "Pasta",
    file: "pasta",
    thumb: "pasta.jpg",
    price: "₹399",
    description: "Creamy Italian pasta with fresh herbs and parmesan cheese",
    category: "main",
  },
  {
    name: "Soup",
    file: "soup",
    thumb: "soup.jpg",
    price: "₹199",
    description:
      "Hot and hearty soup with fresh vegetables and aromatic spices",
    category: "starters",
  },
  {
    name: "Fish Dish",
    file: "fish_dish",
    thumb: "fish_dish.jpg",
    price: "₹599",
    description: "Grilled fish fillet with seasonal vegetables and lemon sauce",
    category: "main",
  },
  {
    name: "Chicken Fried Rice",
    file: "chicken_fried_rice",
    thumb: "chicken_fried_rice.jpg",
    price: "₹349",
    description:
      "Wok-fried rice with tender chicken pieces and mixed vegetables",
    category: "main",
  },
  {
    name: "Chicken Meatball",
    file: "chicken_meatball",
    thumb: "chicken_meatball.jpg",
    price: "₹429",
    description: "Juicy chicken meatballs in rich tomato sauce with herbs",
    category: "main",
  },
  {
    name: "Chicken Wings",
    file: "chicken_wings",
    thumb: "chicken_wings.jpg",
    price: "₹329",
    description: "Crispy chicken wings with spicy buffalo sauce and celery",
    category: "starters",
  },
  {
    name: "Fish Slice Dish",
    file: "fish_slice_dish",
    thumb: "fish_slice_dish.jpg",
    price: "₹499",
    description: "Fresh fish slices with ginger, scallions and soy sauce",
    category: "main",
  },
  {
    name: "Chicken Drumstick",
    file: "Chicken_Drumstick",
    thumb: "chicken_wings.jpg",
    price: "₹379",
    description: "Perfectly grilled chicken drumsticks with smoky BBQ flavor",
    category: "main",
  },
  {
    name: "Omlette Rice",
    file: "Omlette_rice",
    thumb: "chicken_fried_rice.jpg",
    price: "₹279",
    description: "Fluffy omelette served over seasoned fried rice",
    category: "main",
  },
];

const categories = [
  { id: "all", name: "All" },
  { id: "starters", name: "Starters" },
  { id: "main", name: "Main Course" },
];

export default function ModelViewerCarousel() {
  const modelRef = useRef(null);
  const sliderRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState("momos");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [devicePixelRatio] = useState(window.devicePixelRatio || 1);

  const getCurrentModel = () =>
    models.find((model) => model.file === selectedModel) || models[0];

  const getFilteredModels = () =>
    selectedCategory === "all"
      ? models
      : models.filter((model) => model.category === selectedCategory);

  const switchModel = (file) => {
    if (file !== selectedModel) {
      setIsLoading(true);
      setSelectedModel(file);
      if (modelRef.current) {
        modelRef.current.src = `/${file}.glb`;
        modelRef.current.poster = `/${file}.jpg`;
      }
    }
  };

  const handleCategoryChange = (id) => {
    setSelectedCategory(id);
    const filtered = getFilteredModels();
    if (filtered.length > 0 && filtered[0].file !== selectedModel) {
      switchModel(filtered[0].file);
    }
  };

  const handleAddToCart = () => {
    alert(`Added ${getCurrentModel().name} to cart!`);
  };

  // 🔒 Prevent model movement when sliding
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.addEventListener("beforexrselect", (ev) => {
        ev.preventDefault(); // ✅ Stops interaction passing to AR model
      });
    }
  }, []);

  useEffect(() => {
    if (modelRef.current) {
      const handleLoad = () => {
        setIsLoading(false);
        if (devicePixelRatio > 1) {
          modelRef.current.setAttribute(
            "render-scale",
            devicePixelRatio.toString()
          );
        }
      };

      const handleError = (error) => {
        console.error("Model loading error:", error);
        setIsLoading(false);
      };

      modelRef.current.addEventListener("load", handleLoad);
      modelRef.current.addEventListener("error", handleError);

      return () => {
        if (modelRef.current) {
          modelRef.current.removeEventListener("load", handleLoad);
          modelRef.current.removeEventListener("error", handleError);
        }
      };
    }
  }, [selectedModel, devicePixelRatio]);

  return (
    <div style={{ position: "relative", background: "#f9f9f9" }}>
      <model-viewer
        ref={modelRef}
        src='/momos.glb'
        poster='/momos.jpg'
        shadow-intensity='1'
        camera-controls
        ar
        ar-placement='floor'
        ar-modes='webxr scene-viewer quick-look'
        ar-scale='auto'
        auto-rotate
        auto-rotate-delay='5000'
        environment-image='neutral'
        exposure='1'
        shadow-softness='0.4'
        tone-mapping='neutral'
        style={{
          width: "100%",
          height: "90vh",
          // backgroundColor: "#f2f2f2",
          // borderBottom: "1px solid #ccc",
        }}>
        <button slot='ar-button' id='ar-button'>
          View in AR
        </button>

        {isLoading && (
          <div className='loading-overlay'>
            <div className='loading-spinner' />
            <p className='loading-text'>Loading...</p>
          </div>
        )}

        <div className='info-card'>
          <h3>{getCurrentModel().name}</h3>
          <p className='price'>{getCurrentModel().price}</p>
          <p className='desc'>{getCurrentModel().description}</p>
          <button className='cart-btn' onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>

        <div className='category-menu'>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`cat-btn ${
                selectedCategory === cat.id ? "active" : ""
              }`}>
              {cat.name}
            </button>
          ))}
        </div>

        <div className='carousel' ref={sliderRef}>
          {getFilteredModels().map((model) => (
            <button
              key={model.file}
              onClick={() => switchModel(model.file)}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className={`thumb ${
                selectedModel === model.file ? "active" : ""
              }`}
              style={{ backgroundImage: `url(/${model.thumb})` }}
            />
          ))}
        </div>
      </model-viewer>

      <style>{`
        #ar-button {
          background: #fff;
          color: #4285f4;
          border: 1px solid #ccc;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          position: absolute;
          left: 50%;
          bottom: 132px;
          transform: translateX(-50%);
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .loading-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.95);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 999;
        }

        .loading-spinner {
          width: 36px;
          height: 36px;
          border: 4px solid #eee;
          border-top: 4px solid #4285f4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
          margin-top: 10px;
          font-size: 14px;
          color: #444;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        .info-card {
          position: absolute;
          top: 20px;
          left: 20px;
          background: #fff;
          padding: 18px 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          font-family: 'Roboto', sans-serif;
          max-width: 280px;
        }

        .info-card h3 {
          margin: 0;
          font-size: 18px;
          color: #222;
        }

        .price {
          font-weight: bold;
          color: #4285f4;
          margin: 4px 0;
        }

        .desc {
          font-size: 14px;
          color: #555;
          margin-bottom: 12px;
        }

        .cart-btn {
          padding: 10px 16px;
          background: #4285f4;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
        }

        .category-menu {
          position: absolute;
          top: 80px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .cat-btn {
          padding: 8px 12px;
          font-size: 12px;
          border-radius: 6px;
          background: #fff;
          border: 1px solid #ccc;
        }

        .cat-btn.active {
          background: #4285f4;
          color: white;
        }

        .carousel {
          display: flex;
          position: absolute;
          bottom: 20px;
          width: 100%;
          justify-content: center;
          gap: 12px;
          overflow-x: auto;
          padding: 0 10px;
        }

        .thumb {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background-size: cover;
          background-position: center;
          border: 3px solid #fff;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          flex-shrink: 0;
        }

        .thumb.active {
          border-color: #4285f4;
        }
      `}</style>
    </div>
  );
}
