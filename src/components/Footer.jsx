import React from 'react'

function Footer() {
  return (
    <div>
      <footer className="footer">
  <div className="footer-container">
    <div className="footer-section">
      <h4>Lokasi Kami</h4>
      <div className="mapouter">
        <div className="gmap_canvas">
          <iframe
            className="gmap_iframe"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            src="https://maps.google.com/maps?width=300&amp;height=200&amp;hl=en&amp;q=Universitas Cendekia Abditama&amp;t=&amp;z=18&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
            title="Lokasi"
          ></iframe>
        </div>
      </div>
    </div>

    <div className="footer-section">
      <h4>Hubungi Kami</h4>
      <p>
        WhatsApp:{" "}
        <a href="https://wa.me/6289647851864" target="_blank" rel="noopener noreferrer">
          Klik disini
        </a>
      </p>
      <p>
        Email:{" "}
        <a
          href="https://mail.google.com/mail/u/0/?view=cm&tf=1&fs=1&to=fahmisidiq24@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          FashionHub@gmail.com
        </a>
      </p>
    </div>

    <div className="footer-section">
      <h4>Ikuti Kami</h4>
      <div className="social-media">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
          Instagram
        </a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
          Facebook
        </a>
        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">
          TikTok
        </a>
      </div>
    </div>
  </div>

  <div className="footer-bottom">
    <p>&copy; 2025 FashionHub. Hak cipta dilindungi</p>
  </div>
</footer>

    </div>
  )
}

export default Footer
