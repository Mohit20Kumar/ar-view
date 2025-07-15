import React, { useState, useRef, useEffect } from "react";
import { Plus, Minus, ShoppingCart, Eye, X } from "lucide-react";

const menuItems = [
  {
    id: 1,
    name: "Momos",
    file: "momos",
    thumb: "momos.jpg",
    price: 299,
    description: "Steamed dumplings filled with seasoned vegetables and spices",
    category: "starters",
  },
  {
    id: 2,
    name: "Pasta",
    file: "pasta",
    thumb: "pasta.jpg",
    price: 399,
    description: "Creamy Italian pasta with fresh herbs and parmesan cheese",
    category: "main",
  },
  {
    id: 3,
    name: "Soup",
    file: "soup",
    thumb: "soup.jpg",
    price: 199,
    description:
      "Hot and hearty soup with fresh vegetables and aromatic spices",
    category: "starters",
  },
  {
    id: 4,
    name: "Fish Dish",
    file: "fish_dish",
    thumb: "fish_dish.jpg",
    price: 599,
    description: "Grilled fish fillet with seasonal vegetables and lemon sauce",
    category: "main",
  },
  {
    id: 5,
    name: "Chicken Fried Rice",
    file: "chicken_fried_rice",
    thumb: "chicken_fried_rice.jpg",
    price: 349,
    description:
      "Wok-fried rice with tender chicken pieces and mixed vegetables",
    category: "main",
  },
  {
    id: 6,
    name: "Chicken Meatball",
    file: "chicken_meatball",
    thumb: "chicken_meatball.jpg",
    price: 429,
    description: "Juicy chicken meatballs in rich tomato sauce with herbs",
    category: "main",
  },
  {
    id: 7,
    name: "Chicken Wings",
    file: "chicken_wings",
    thumb: "chicken_wings.jpg",
    price: 329,
    description: "Crispy chicken wings with spicy buffalo sauce and celery",
    category: "starters",
  },
  {
    id: 8,
    name: "Fish Slice Dish",
    file: "fish_slice_dish",
    thumb: "fish_slice_dish.jpg",
    price: 499,
    description: "Fresh fish slices with ginger, scallions and soy sauce",
    category: "main",
  },
  {
    id: 9,
    name: "Chicken Drumstick",
    file: "Chicken_Drumstick",
    thumb: "chicken_wings.jpg",
    price: 379,
    description: "Perfectly grilled chicken drumsticks with smoky BBQ flavor",
    category: "main",
  },
  {
    id: 10,
    name: "Omelette Rice",
    file: "Omlette_rice",
    thumb: "chicken_fried_rice.jpg",
    price: 279,
    description: "Fluffy omelette served over seasoned fried rice",
    category: "main",
  },
];

const categories = [
  { id: "all", name: "All Items" },
  { id: "starters", name: "Starters" },
  { id: "main", name: "Main Course" },
];

function ModelViewer({ item, onClose }) {
  const modelRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(
    menuItems.findIndex((m) => m.id === item.id)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isArActive, setIsArActive] = useState(false);
  const [devicePixelRatio] = useState(window.devicePixelRatio || 1);

  const currentItem = menuItems[currentIndex];

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    setIsLoading(true); // Start loading on item change

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

      const handleArStatus = (event) => {
        const status = event.detail.status;
        setIsArActive(status === "session-started");

        if (status === "session-started" && modelRef.current) {
          modelRef.current.setAttribute("ar-scale", "fixed");
          if (window.innerWidth > 768) {
            modelRef.current.setAttribute("render-scale", "2");
          }
        }
      };

      modelRef.current.addEventListener("load", handleLoad);
      modelRef.current.addEventListener("error", handleError);
      modelRef.current.addEventListener("ar-status", handleArStatus);

      return () => {
        if (modelRef.current) {
          modelRef.current.removeEventListener("load", handleLoad);
          modelRef.current.removeEventListener("error", handleError);
          modelRef.current.removeEventListener("ar-status", handleArStatus);
        }
      };
    }
  }, [currentItem, devicePixelRatio]);

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % menuItems.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + menuItems.length) % menuItems.length);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden relative'>
        {/* Header */}
        <div className='flex justify-between items-center p-4 border-b'>
          <div>
            <h2 className='text-xl font-bold'>{currentItem.name}</h2>
            <p className='text-gray-600'>{currentItem.description}</p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
            <X size={24} />
          </button>
        </div>

        {/* 3D Model Viewer */}
        <div className='relative h-96 bg-gray-100'>
          <model-viewer
            key={currentItem.id}
            ref={modelRef}
            src={`/${currentItem.file}.glb`}
            poster={`/${currentItem.file}.webp`}
            alt={`A 3D model of ${currentItem.name}`}
            ar
            ar-modes='webxr scene-viewer quick-look'
            ar-scale='fixed'
            ar-placement='floor'
            camera-controls
            touch-action='pan-y'
            auto-rotate
            auto-rotate-delay='3000'
            rotation-per-second='30deg'
            shadow-intensity='1'
            shadow-softness='0.25'
            environment-image='neutral'
            exposure='1.2'
            tone-mapping='aces'
            interaction-prompt='auto'
            loading='eager'
            reveal='auto'
            disable-zoom={isArActive}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#f5f5f5",
            }}>
            <button slot='ar-button' className='ar-button'>
              <span>View in your space</span>
            </button>

            <div slot='ar-failure' className='ar-failure'>
              AR is not tracking!
            </div>

            {isLoading && (
              <div className='loading-overlay'>
                <div className='loading-spinner'></div>
                <p className='loading-text'>Loading 3D model...</p>
              </div>
            )}
            <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 flex gap-6'>
              <button onClick={goPrev} className='carousel-button'>
                ←
              </button>
              <button onClick={goNext} className='carousel-button'>
                →
              </button>
            </div>
          </model-viewer>
          {/* Carousel Buttons */}
        </div>

        {/* Footer */}
        <div className='p-4 border-t bg-gray-50'>
          <div className='flex justify-between items-center'>
            <span className='text-2xl font-bold text-blue-600'>
              ₹{currentItem.price}
            </span>
            <div className='text-sm text-gray-600'>
              <p>• Rotate to view from all angles</p>
              <p>• Tap "View in your space" for AR experience</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        model-viewer {
          --poster-color: #f5f5f5;
          --progress-bar-color: #4285f4;
          --progress-bar-height: 4px;
        }

        .ar-button {
          background: linear-gradient(135deg, #4285f4, #3367d6);
          color: white;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: 20px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 24px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(66, 133, 244, 0.3);
          z-index: 10;
        }

        .ar-button:hover {
          transform: translateX(-50%) translateY(-2px);
          box-shadow: 0 6px 20px rgba(66, 133, 244, 0.4);
        }

        .ar-failure {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: 20px;
          display: none;
          background: rgba(255, 0, 0, 0.8);
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          z-index: 10;
        }

        model-viewer[ar-tracking="not-tracking"] .ar-failure {
          display: block;
        }

        .loading-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 255, 0.95);
          padding: 24px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          backdrop-filter: blur(10px);
          z-index: 20;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4285f4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        .loading-text {
          font-size: 16px;
          color: #333;
          font-weight: 500;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .carousel-button {
          background: white;
          border-radius: 9999px;
          padding: 12px 18px;
          font-size: 20px;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .carousel-button:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [cart, setCart] = useState({});
  const [showCart, setShowCart] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const getFilteredItems = () => {
    if (selectedCategory === "all") return menuItems;
    return menuItems.filter((item) => item.category === selectedCategory);
  };

  const addToCart = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));

    // Add haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = menuItems.find((item) => item.id === parseInt(itemId));
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const formatPrice = (price) => `₹${price}`;

  const openModelViewer = (item) => {
    setSelectedItem(item);
  };

  const closeModelViewer = () => {
    setSelectedItem(null);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-6xl mx-auto px-4 py-4'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Delicious Bites
              </h1>
              <p className='text-gray-600'>Authentic flavors in 3D & AR</p>
            </div>
            <button
              onClick={() => setShowCart(!showCart)}
              className='relative bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-colors shadow-lg'>
              <ShoppingCart size={24} />
              {getCartItemCount() > 0 && (
                <span className='absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold'>
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className='max-w-6xl mx-auto px-4 py-8'>
        <div className='flex gap-8'>
          {/* Main Menu */}
          <div className='flex-1'>
            {/* Category Filter */}
            <div className='flex flex-wrap gap-2 mb-8'>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-2 rounded-full font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                  }`}>
                  {category.name}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {getFilteredItems().map((item) => (
                <div
                  key={item.id}
                  className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'>
                  {/* Item Image */}
                  <div className='h-48 bg-gray-200 relative overflow-hidden'>
                    <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent'></div>
                    <div className='absolute top-4 right-4 bg-white px-2 py-1 rounded-full'>
                      <span className='text-sm font-bold text-gray-700'>
                        {item.category}
                      </span>
                    </div>

                    {/* 3D View Button */}
                    <button
                      onClick={() => openModelViewer(item)}
                      className='absolute top-4 left-4 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg'
                      title='View in 3D & AR'>
                      <Eye size={20} />
                    </button>

                    {/* Placeholder for image */}
                    <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100'>
                      <span className='text-4xl'>🍽️</span>
                    </div>
                  </div>

                  {/* Item Info */}
                  <div className='p-6'>
                    <div className='flex justify-between items-start mb-2'>
                      <h3 className='text-xl font-bold text-gray-900'>
                        {item.name}
                      </h3>
                      <span className='text-xl font-bold text-blue-600'>
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                      {item.description}
                    </p>

                    {/* Action Buttons */}
                    <div className='flex items-center justify-between'>
                      <button
                        onClick={() => openModelViewer(item)}
                        className='flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-200 transition-colors text-sm font-medium'>
                        <Eye size={16} />
                        View 3D
                      </button>

                      {cart[item.id] ? (
                        <div className='flex items-center gap-3'>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className='bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors'>
                            <Minus size={16} />
                          </button>
                          <span className='font-bold text-lg min-w-[24px] text-center'>
                            {cart[item.id]}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className='bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200 transition-colors'>
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className='bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors font-medium'>
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          {showCart && (
            <div className='w-80 bg-white rounded-lg shadow-lg p-6 h-fit sticky top-4'>
              <h3 className='text-xl font-bold mb-4'>Your Order</h3>

              {Object.keys(cart).length === 0 ? (
                <p className='text-gray-500 text-center py-8'>
                  Your cart is empty
                </p>
              ) : (
                <>
                  <div className='space-y-4 mb-6'>
                    {Object.entries(cart).map(([itemId, quantity]) => {
                      const item = menuItems.find(
                        (item) => item.id === parseInt(itemId)
                      );
                      if (!item) return null;

                      return (
                        <div
                          key={itemId}
                          className='flex items-center justify-between py-2 border-b'>
                          <div className='flex-1'>
                            <h4 className='font-medium'>{item.name}</h4>
                            <p className='text-sm text-gray-600'>
                              {formatPrice(item.price)} each
                            </p>
                          </div>
                          <div className='flex items-center gap-2'>
                            <button
                              onClick={() => removeFromCart(parseInt(itemId))}
                              className='text-red-600 p-1 hover:bg-red-50 rounded'>
                              <Minus size={14} />
                            </button>
                            <span className='font-medium min-w-[24px] text-center'>
                              {quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className='text-green-600 p-1 hover:bg-green-50 rounded'>
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className='border-t pt-4'>
                    <div className='flex justify-between items-center mb-4'>
                      <span className='text-lg font-bold'>Total:</span>
                      <span className='text-xl font-bold text-blue-600'>
                        {formatPrice(getCartTotal())}
                      </span>
                    </div>
                    <button className='w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors'>
                      Place Order
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3D Model Viewer Modal */}
      {selectedItem && (
        <ModelViewer item={selectedItem} onClose={closeModelViewer} />
      )}
    </div>
  );
}
