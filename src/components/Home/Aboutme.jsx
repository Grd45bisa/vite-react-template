import React from 'react';
import '../style/AboutMe.css';

const AboutMe = () => {
return (
    <div className="aboutme-section">
        <div className="aboutme-left">
            <img src="./Images/Fasion2.jpg" alt="Tentang Kami 1" />
            <img src="./Images/Fasion1.jpg" alt="Tentang Kami 2" />
        </div>
        <div className="aboutme-right">
            <h1>Tentang FashionHub</h1>
            <p>
                <strong>FashionHub</strong> adalah platform e-commerce fashion yang bertujuan memberikan pengalaman belanja yang nyaman, cepat, dan terpercaya bagi para pecinta fashion modern.
            </p>
            <p>
                Saat ini, FashionHub menggunakan <strong>data dari brand Erigo</strong> sebagai referensi sementara dalam pengembangan platform. Kami tidak memiliki afiliasi resmi dengan Erigo, dan seluruh hak cipta tetap menjadi milik pemilik aslinya.
            </p>
            <p>
                Kami berkomitmen untuk terus mengembangkan platform ini agar dapat mendukung brand lokal dalam menjangkau pasar fashion nasional maupun internasional.
            </p>
            <a href="/Product" className="btn-more">Lihat Produk Kami</a>
        </div>
    </div>
);
};

export default AboutMe;
