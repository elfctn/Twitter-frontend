// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // Tailwind'in hangi dosyalardaki class'ları tarayacağını belirtir.
  // Bu sayede sadece kullandığınız CSS class'ları nihai çıktıya dahil edilir.
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // src klasörü altındaki tüm js,ts,jsx,tsx dosyalarını tara
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
