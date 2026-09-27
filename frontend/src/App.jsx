import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import AddProduct from "./pages/AddProduct/AddProduct";
import Dashboard from "./pages/Dashboard/Dashboard";
import TrackingCart from "./pages/TrackingCart/TrackingCart";
import Home from "./pages/Home/Home";

function App() {
  return (
    <BrowserRouter>
      <div className="app">

        <Header />

        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/tracking-cart" element={<TrackingCart />} />
        </Routes>
        
        <Footer />

      </div>
    </BrowserRouter>
  );
}

export default App;