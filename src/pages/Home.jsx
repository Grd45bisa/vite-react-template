import React from 'react';
import Navbar from "../components/Navbar";
import Carousel from "../components/Home/Carousel";
import Kategori from "../components/Home/Kategori";
import Rekomendasi from "../components/Home/Rekomendasi";
import Keunggulan from "../components/Home/Keunggulan";
import RatingSummary from "../components/Home/RatingSummary";
import UlasanBintangLima from "../components/Home/UlasanBintangLima";
import AboutMe from "../components/Home/Aboutme";
import Footer from "../components/Footer";

const Home = () => {
  return (
    <>
      <Navbar />
      <Carousel />
      <Kategori />
      <Rekomendasi />
      <Keunggulan />
      <AboutMe />
      <RatingSummary />
      <UlasanBintangLima />
      <Footer />
    </>
  );
};

export default Home;
