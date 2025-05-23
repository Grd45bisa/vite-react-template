import axios from 'axios';

// Create axios instance with default configuration for Vite proxy
const apiClient = axios.create({
  // Empty baseURL to use relative URLs that will be proxied by Vite
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
    // Tidak menyertakan Cache-Control karena menyebabkan masalah CORS
  },
  timeout: 10000, // 10 seconds timeout
});

// Response interceptor untuk menangani error dengan lebih baik
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    
    // Coba lagi jika error CORS dengan menghapus header cache-control
    if (error.message === 'Network Error' && error.config) {
      console.log('Mencoba kembali request tanpa cache-control header...');
      
      // Buat salinan config untuk request baru
      const newConfig = { ...error.config };
      
      // Hapus header cache-control jika ada
      if (newConfig.headers && (newConfig.headers['Cache-Control'] || newConfig.headers['cache-control'])) {
        delete newConfig.headers['Cache-Control'];
        delete newConfig.headers['cache-control'];
        return axios(newConfig);
      }
    }
    
    return Promise.reject(error);
  }
);

// Fungsi untuk fetch data ulasan dengan retry logic
export const fetchUlasan = async (maxRetries = 3) => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      console.log(`Mencoba ambil ulasan (attempt ${retries + 1}/${maxRetries})...`);
      // Updated to use Vite proxy - relative URL with /api prefix
      const response = await apiClient.get('/api/ulasan');
      return response.data;
    } catch (error) {
      retries++;
      console.error(`Gagal ambil ulasan (attempt ${retries}/${maxRetries}):`, error);
      
      // Gunakan mock data jika mencapai maksimum retry
      if (retries >= maxRetries) {
        console.log('Menggunakan data mock setelah semua retry gagal');
        return generateMockUlasan();
      }
      
      // Tunggu sebelum retry berikutnya (dengan exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }
};

// Fungsi untuk generate data mock ulasan
const generateMockUlasan = () => {
  return [
    { 
      produk_id: "TS001",
      pengguna: "Alex",
      produk: "Erigo T-Shirt Skye Black", 
      rating: 5, 
      komentar: "Bahannya nyaman dan desainnya keren banget! Worth it."
    },
    { 
      produk_id: "DP001",
      pengguna: "Budi",
      produk: "Erigo Denim Pants Edwin Medium Blue", 
      rating: 5, 
      komentar: "Jahitannya rapi, model dan warnanya bagus. Recommended!"
    },
    { 
      produk_id: "TS002",
      pengguna: "Citra",
      produk: "Erigo T-Shirt Selkie Olive", 
      rating: 5, 
      komentar: "Suka banget sama warnanya, di badan juga nyaman. Kualitas bagus."
    },
    { 
      produk_id: "JK001",
      pengguna: "Diana",
      produk: "Erigo Jacket Harrington Black", 
      rating: 4, 
      komentar: "Jaketnya bagus, tapi ukurannya agak kekecilan dari yang diharapkan."
    },
    { 
      produk_id: "TS003",
      pengguna: "Eko",
      produk: "Erigo T-Shirt Amani White", 
      rating: 4, 
      komentar: "Desainnya minimalis dan elegan. Bahan nyaman."
    },
    { 
      produk_id: "DP002",
      pengguna: "Fika",
      produk: "Erigo Chino Pants Beige", 
      rating: 3, 
      komentar: "Bahannya lumayan, tapi warnanya sedikit berbeda dari gambar."
    },
    { 
      produk_id: "SH001",
      pengguna: "Gita",
      produk: "Erigo Short Pants Navy", 
      rating: 2, 
      komentar: "Kurang sesuai dengan ekspektasi, bahannya kurang nyaman."
    },
    { 
      produk_id: "HC001",
      pengguna: "Hadi",
      produk: "Erigo Hoodie Cream", 
      rating: 1, 
      komentar: "Ukurannya tidak sesuai dan jahitannya kurang rapi."
    }
  ];
};

// Fungsi untuk fetch data produk rekomendasi
export const fetchProdukRekomendasi = async (limit = 100) => {
  try {
    // Updated to use Vite proxy - relative URL with /api prefix
    const response = await apiClient.get(`/api/produk/rekomendasi?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Gagal fetch produk rekomendasi:', error);
    // Gunakan data mock jika API gagal
    return generateMockProduk();
  }
};

// Fungsi untuk generate data mock produk
const generateMockProduk = () => {
  return [
    {
      product_id: 1,
      nama_produk: "Erigo T-Shirt Skye Black",
      kategori: "T-Shirt",
      terjual: "120",
      rating: "4.8",
      harga: 79000,
      ukuran: "M,L,XL",
      kondisi: "Baru",
      stok: "10",
      "link_Gambar 1": "/images/products/tshirt-black.jpg"
    },
    {
      product_id: 2,
      nama_produk: "Erigo Denim Pants Edwin Medium Blue",
      kategori: "Celana",
      terjual: "85",
      rating: "4.5",
      harga: 239000,
      ukuran: "30,32,34",
      kondisi: "Baru",
      stok: "5",
      "link_Gambar 1": "/images/products/denim-blue.jpg"
    },
    {
      product_id: 3,
      nama_produk: "Erigo T-Shirt Selkie Olive",
      kategori: "T-Shirt",
      terjual: "95",
      rating: "4.7",
      harga: 79000,
      ukuran: "M,L,XL",
      kondisi: "Baru",
      stok: "15",
      "link_Gambar 1": "/images/products/tshirt-olive.jpg"
    },
    {
      product_id: 4,
      nama_produk: "Erigo Jacket Harrington Black",
      kategori: "Jaket",
      terjual: "65",
      rating: "4.9",
      harga: 199000,
      ukuran: "M,L,XL",
      kondisi: "Baru",
      stok: "8",
      "link_Gambar 1": "/images/products/jacket-black.jpg"
    }
  ];
};

// Fungsi untuk fetch data statistik
export const fetchStatistik = async () => {
  try {
    // Updated to use Vite proxy - relative URL with /api prefix
    const response = await apiClient.get('/api/statistik');
    return response.data;
  } catch (error) {
    console.error('Gagal fetch statistik:', error);
    throw error;
  }
};

export default apiClient;