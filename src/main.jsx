// src/main.jsx
import React from "react"; // React kütüphanesini import et
import ReactDOM from "react-dom/client"; // ReactDOM (React'ı web'e bağlayan kütüphane) import et
import App from "./App.jsx"; // Ana uygulama bileşenimiz olan App.jsx'i import et
import "./index.css"; // Global CSS dosyasını import et (Tailwind CSS direktifleri burada)

// React uygulamasını 'root' ID'li DOM elementine bağla
ReactDOM.createRoot(document.getElementById("root")).render(
  // Geliştirme sırasında ek kontroller ve uyarılar sağlayan React.StrictMode'u kullan
  <React.StrictMode>
    <App /> {/* Ana App bileşenimizi render et */}
  </React.StrictMode>
);
