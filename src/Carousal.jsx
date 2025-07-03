// src/components/ModelViewerCarousel.jsx
import React, { useRef, useEffect, useState } from "react";
// import "@google/model-viewer";

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
  const [selectedModel, setSelectedModel] = useState("momos");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const sliderRef = useRef(null);

  const getCurrentModel = () => {
    return models.find((model) => model.file === selectedModel) || models[0];
  };

  const getFilteredModels = () => {
    if (selectedCategory === "all") return models;
    return models.filter((model) => model.category === selectedCategory);
  };

  const switchModel = (name) => {
    // Only switch if it's a different model
    if (name !== selectedModel) {
      setIsLoading(true);
      const base = `/${name}`;
      if (modelRef.current) {
        modelRef.current.src = `${base}.glb`;
        modelRef.current.poster = `${base}.jpg`;
        setSelectedModel(name);
      }
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    const filteredModels =
      categoryId === "all"
        ? models
        : models.filter((model) => model.category === categoryId);
    if (filteredModels.length > 0) {
      // Only switch model if it's different from the currently selected one
      const firstModel = filteredModels[0].file;
      if (firstModel !== selectedModel) {
        switchModel(firstModel);
      }
    }
  };

  const handleAddToCart = () => {
    // Do nothing for now
  };

  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.addEventListener("beforexrselect", (ev) => {
        // Keep slider interactions from affecting the XR scene.
        ev.preventDefault();
      });
    }

    // Add model load event listener
    if (modelRef.current) {
      const handleLoad = () => setIsLoading(false);
      modelRef.current.addEventListener("load", handleLoad);

      return () => {
        if (modelRef.current) {
          modelRef.current.removeEventListener("load", handleLoad);
        }
      };
    }
  }, []);

  const handleSliderInteraction = (e) => {
    e.stopPropagation();
    // Temporarily disable camera controls during slider interaction
    if (modelRef.current) {
      modelRef.current.cameraControls = false;
      setTimeout(() => {
        if (modelRef.current) {
          modelRef.current.cameraControls = true;
        }
      }, 300);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <model-viewer
        ref={modelRef}
        src='/momos.glb'
        poster='/momos.webp'
        shadow-intensity='1'
        camera-controls
        touch-action='pan-y'
        ar
        ar-placement='floor'
        ar-modes='webxr scene-viewer quick-look'
        ar-scale='auto'
        scale='1 1 1'
        interaction-prompt='none'
        environment-image='neutral'
        exposure='1'
        shadow-softness='0.25'
        tone-mapping='neutral'
        alt='A 3D model carousel'
        style={{
          width: "100%",
          height: "500px",
          backgroundColor: "#eee",
        }}>
        <button slot='ar-button' id='ar-button'>
          View in your space
        </button>

        <button id='ar-failure'>AR is not tracking!</button>

        {isLoading && (
          <div className='loading-overlay'>
            <div className='loading-spinner'></div>
            <p className='loading-text'>Loading model...</p>
          </div>
        )}

        <div className='dish-info'>
          <h3 className='dish-name'>{getCurrentModel().name}</h3>
          <p className='dish-price'>{getCurrentModel().price}</p>
          <p className='dish-description'>{getCurrentModel().description}</p>
          <button className='add-to-cart-btn' onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>

        <div className='category-filter'>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`category-btn ${
                selectedCategory === category.id ? "active" : ""
              }`}
              onClick={() => handleCategoryChange(category.id)}>
              {category.name}
            </button>
          ))}
        </div>

        <div className='slider' ref={sliderRef}>
          <div className='slides'>
            {getFilteredModels().map((model) => (
              <button
                key={model.file}
                className={`slide ${
                  selectedModel === model.file ? "selected" : ""
                }`}
                onClick={() => switchModel(model.file)}
                style={{
                  backgroundImage: `url(/${model.thumb})`,
                }}></button>
            ))}
          </div>
        </div>
      </model-viewer>

      <style>{`
        model-viewer > #ar-prompt {
          position: absolute;
          left: 50%;
          bottom: 175px;
          animation: elongate 2s infinite ease-in-out alternate;
          display: none;
        }
        model-viewer[ar-status="session-started"] > #ar-prompt {
          display: block;
        }
        model-viewer > #ar-prompt > img {
          animation: circle 4s linear infinite;
        }
        model-viewer > #ar-failure {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: 175px;
          display: none;
        }
        model-viewer[ar-tracking="not-tracking"] > #ar-failure {
          display: block;
        }

        .slider {
          width: 100%;
          text-align: center;
          overflow: hidden;
          position: absolute;
          bottom: 16px;
          z-index: 999;
          pointer-events: auto;
        }

        .slides {
          display: flex;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        .slide {
          scroll-snap-align: start;
          flex-shrink: 0;
          width: 80px;
          height: 80px;
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          background-color: #fff;
          margin-right: 15px;
          border-radius: 50%;
          border: 3px solid #fff;
          display: flex;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .slide.selected {
          border: 3px solid #4285f4;
          transition: all 0.2s ease;
        }

        .loading-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.9);
          padding: 20px;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          backdrop-filter: blur(10px);
          z-index: 1000;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4285f4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }

        .loading-text {
          margin: 0;
          font-family: Roboto, sans-serif;
          font-size: 14px;
          color: #333;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .dish-info {
          position: absolute;
          top: 20px;
          left: 20px;
          background: rgba(255, 255, 255, 0.9);
          padding: 15px;
          border-radius: 10px;
          max-width: 250px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .dish-name {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: bold;
          color: #333;
          font-family: Roboto, sans-serif;
        }

        .dish-price {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: bold;
          color: #4285f4;
          font-family: Roboto, sans-serif;
        }

        .dish-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #666;
          line-height: 1.4;
          font-family: Roboto, sans-serif;
        }

        .add-to-cart-btn {
          background: #4285f4;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-family: Roboto, sans-serif;
          font-size: 14px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .add-to-cart-btn:hover {
          background: #3367d6;
        }

        .category-filter {
          position: absolute;
          top: 80px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-btn {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid #ddd;
          padding: 8px 12px;
          border-radius: 6px;
          font-family: Roboto, sans-serif;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .category-btn.active {
          background: #4285f4;
          color: white;
          border-color: #4285f4;
        }

        .category-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        @keyframes circle {
          from { transform: translateX(-50%) rotate(0deg) translateX(50px) rotate(0deg); }
          to   { transform: translateX(-50%) rotate(360deg) translateX(50px) rotate(-360deg); }
        }

        @keyframes elongate {
          from { transform: translateX(100px); }
          to   { transform: translateX(-100px); }
        }

        #ar-button {
          background-image: url(../../assets/ic_view_in_ar_new_googblue_48dp.png);
          background-repeat: no-repeat;
          background-size: 20px 20px;
          background-position: 12px 50%;
          background-color: #fff;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          bottom: 132px;
          padding: 0px 16px 0px 40px;
          font-family: Roboto, sans-serif;
          font-size: 14px;
          color: #4285f4;
          height: 36px;
          line-height: 36px;
          border-radius: 18px;
          border: 1px solid #DADCE0;
        }
        #ar-button:active { background-color: #E8EAED; }
        #ar-button:focus-visible { outline: 1px solid #4285f4; }
      `}</style>
    </div>
  );
}
