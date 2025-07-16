import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ModelViewerCarousel from "./Carousal";
import ChefStories from "./ChefStories";

function Home() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <div className='space-y-4'>
        <Link
          to='/ar-menu'
          className='block px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 text-center'>
          View AR Menu
        </Link>
        <Link
          to='/chef-stories'
          className='block px-6 py-3 bg-green-600 text-white rounded shadow hover:bg-green-700 text-center'>
          Watch Chef Stories
        </Link>
      </div>
    </div>
  );
}

function ARMenu() {
  return (
    <div className='min-h-screen'>
      <Link
        to='/'
        className='m-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 inline-block'>
        Back
      </Link>
      <ModelViewerCarousel />
    </div>
  );
}

function Stories() {
  return (
    <div className='min-h-screen'>
      <Link
        to='/'
        className='m-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 inline-block'>
        Back
      </Link>
      <ChefStories />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/ar-menu' element={<ARMenu />} />
        <Route path='/chef-stories' element={<Stories />} />
      </Routes>
    </BrowserRouter>
  );
}
