import React from 'react';
import '../style/Keunggulan.css';
import { Truck, Star, BadgeCheck, ShieldCheck, Percent } from 'lucide-react';

const Keunggulan = () => {
const fitur = [
    {
        icon: <Truck className="icon" />,
        title: "Gratis Ongkir",
        desc: "Nikmati layanan gratis ongkir ke seluruh Indonesia tanpa syarat.",
    },
    {
        icon: <Star className="icon" />,
        title: "Produk Premium",
        desc: "Hanya produk terbaik dengan kualitas premium yang kami tawarkan.",
    },
    {
        icon: <Percent className="icon" />,
        title: "Diskon Menarik",
        desc: "Dapatkan penawaran spesial dan diskon eksklusif setiap hari.",
    },
    {
        icon: <ShieldCheck className="icon" />,
        title: "Transaksi Aman",
        desc: "Belanja dengan tenang, sistem keamanan kami melindungi setiap transaksi.",
    },
];

  return (
    <section className="keunggulan-section">
      <h2 className="judul">Kenapa Harus Belanja di FashionHub?</h2>
      <div className="fitur-grid">
        {fitur.map((item, index) => (
          <div className="fitur-card" key={index}>
            {item.icon}
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Keunggulan;
