// src/App.jsx
import React, { useState, useEffect } from "react";
// import './App.css'; // Bu satırı kaldırın veya yoruma alın, artık Tailwind kullanıyoruz

function App() {
  // --- State Yönetimi ---
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Kullanıcının giriş yapıp yapmadığı
  const [currentUser, setCurrentUser] = useState(null); // Giriş yapan kullanıcının bilgileri (id, username, email)
  const [jwtToken, setJwtToken] = useState(""); // JWT tokenı
  const [loginUsernameOrEmail, setLoginUsernameOrEmail] = useState(""); // Giriş formu için kullanıcı adı/e-posta
  const [loginPassword, setLoginPassword] = useState(""); // Giriş formu için şifre
  const [newTweetContent, setNewTweetContent] = useState(""); // Yeni tweet içeriği formu
  const [tweets, setTweets] = useState([]); // Tweetleri saklamak için
  const [loading, setLoading] = useState(false); // Yükleme durumu
  const [error, setError] = useState(null); // Hata mesajları

  // NOT: Bu userId, Postman'dan aldığınız ve backend'de kaydettiğiniz bir kullanıcıya ait olmalı.
  // Bu userId'ye ait tweetleri çekeceğiz.
  const fetchTweetsForUserId = "YOUR_REGISTERED_USER_UUID_FROM_BACKEND"; // <-- Lütfen burayı kendi UUID'nizle değiştirin!

  // --- JWT Token ve Kullanıcı Bilgilerini Yükleme (Uygulama Başlangıcında) ---
  useEffect(() => {
    // Tarayıcı yenilendiğinde token ve kullanıcı bilgilerini Local Storage'dan yükle
    const storedToken = localStorage.getItem("jwtToken");
    const storedUser = localStorage.getItem("currentUser");

    if (storedToken && storedUser) {
      setJwtToken(storedToken);
      setCurrentUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
      // Token geçerliliğini kontrol etmek için ek bir API çağrısı yapılabilir (ileride)
    }
  }, []);

  // --- Yardımcı Fonksiyon: JWT Header Oluşturma ---
  const getAuthHeader = () => {
    if (jwtToken) {
      return { Authorization: `Bearer ${jwtToken}` };
    }
    return {}; // Token yoksa boş obje dön
  };

  // --- API Çağrıları ---

  // Kullanıcı Giriş (Login) İşlemi
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernameOrEmail: loginUsernameOrEmail,
          password: loginPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Giriş hatası! Durum: ${response.status}`
        );
      }

      const data = await response.json();
      setJwtToken(data.token);
      setCurrentUser({
        id: data.id,
        username: data.username,
        email: data.email,
      });
      setIsLoggedIn(true);

      // Token ve kullanıcı bilgilerini Local Storage'a kaydet (Oturum kalıcılığı için)
      localStorage.setItem("jwtToken", data.token);
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: data.id,
          username: data.username,
          email: data.email,
        })
      );

      alert("Başarıyla giriş yapıldı!");
      setLoginUsernameOrEmail("");
      setLoginPassword("");
      // Giriş sonrası tweetleri çek
      fetchUserTweets(fetchTweetsForUserId); // Giriş yapan kullanıcının ID'si ile değil, test ettiğimiz ID ile çekiyoruz
    } catch (e) {
      console.error("Giriş yaparken hata:", e);
      setError(e.message || "Giriş işlemi başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı Çıkış (Logout) İşlemi
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setJwtToken("");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("currentUser");
    alert("Çıkış yapıldı.");
    setTweets([]); // Tweetleri temizle
  };

  // Kullanıcının Tweetlerini Getirme (GET /tweets/user/{userId})
  const fetchUserTweets = async (userIdToFetch) => {
    if (!jwtToken) {
      // Token yoksa API çağrısı yapma
      setError("JWT Token mevcut değil. Lütfen giriş yapın.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:3000/tweets/user/${userIdToFetch}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeader(), // Authorization başlığını ekle
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Tweetleri getirirken hata! Durum: ${response.status}`
        );
      }

      const data = await response.json();
      setTweets(data);
    } catch (e) {
      console.error("Tweetleri getirirken hata:", e);
      setError(e.message || "Tweetleri getirirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Yeni Tweet Oluşturma (POST /tweets)
  const handleCreateTweet = async (e) => {
    e.preventDefault();
    if (!jwtToken) {
      setError("Tweet oluşturmak için giriş yapmalısınız.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/tweets", {
        // localhost:3000 yazılmalı
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: JSON.stringify({ content: newTweetContent, isRetweet: false }), // Basit tweet oluşturma
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message ||
            `Tweet oluşturma hatası! Durum: ${response.status}`
        );
      }

      const newTweet = await response.json();
      setTweets((prevTweets) => [newTweet, ...prevTweets]); // Yeni tweeti listenin başına ekle
      setNewTweetContent(""); // Formu temizle
      alert("Tweet başarıyla oluşturuldu!");
    } catch (e) {
      console.error("Tweet oluştururken hata:", e);
      setError(e.message || "Tweet oluşturulamadı.");
    } finally {
      setLoading(false);
    }
  };

  // --- Sayfa Yüklendiğinde Tweetleri Çek ---
  useEffect(() => {
    // Yalnızca kullanıcı giriş yapmışsa tweetleri çek
    // Ayrıca, fetchTweetsForUserId güncellendiğinde de çekmeliyiz.
    // İlk render'da jwtToken boş olabilir, bu yüzden isLogged ile kontrol önemli.
    if (isLoggedIn && fetchTweetsForUserId && jwtToken) {
      fetchUserTweets(fetchTweetsForUserId);
    }
  }, [isLoggedIn, fetchTweetsForUserId, jwtToken]);

  // --- Render Edilecek UI ---
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {" "}
      {/* Tailwind class'ları */}
      <header className="text-center my-8">
        <h1 className="text-4xl font-extrabold text-blue-700 mb-2">
          Twitter Klonu
        </h1>
        <p className="text-lg text-gray-700">
          Spring Boot Backend & React Frontend
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Backend Port: 3000 | Frontend Port: 3200
        </p>
        <p className="text-sm text-gray-500">
          Test Edilen Kullanıcı ID: {fetchTweetsForUserId}
        </p>
      </header>
      <nav className="max-w-xl mx-auto mb-6 p-6 bg-white rounded-xl shadow-md">
        {isLoggedIn ? (
          <div className="flex justify-between items-center">
            <p className="text-lg text-gray-800">
              Hoş geldin,{" "}
              <span className="font-bold text-blue-600">
                {currentUser?.username}
              </span>
              !
            </p>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
            >
              Çıkış Yap
            </button>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 text-center">
              Giriş Yap
            </h2>
            <input
              type="text"
              placeholder="Kullanıcı Adı veya E-posta"
              value={loginUsernameOrEmail}
              onChange={(e) => setLoginUsernameOrEmail(e.target.value)}
              className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <input
              type="password"
              placeholder="Şifre"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full py-3 px-6 rounded-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
              disabled={loading}
            >
              {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        )}
      </nav>
      {isLoggedIn && (
        <main className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg mt-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            Yeni Tweet Oluştur
          </h2>
          <form onSubmit={handleCreateTweet} className="space-y-4 mb-8">
            <textarea
              placeholder="Ne düşünüyorsun?"
              value={newTweetContent}
              onChange={(e) => setNewTweetContent(e.target.value)}
              className="block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              rows="4"
              maxLength="280"
              required
            ></textarea>
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold w-full py-3 px-6 rounded-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
              disabled={loading || newTweetContent.length === 0}
            >
              Tweetle
            </button>
          </form>

          <h2 className="text-2xl font-bold text-gray-800 mb-5">
            @{currentUser?.username}'in Tweetleri
          </h2>
          {loading && (
            <p className="text-center text-blue-500 text-lg">
              Tweetler yükleniyor...
            </p>
          )}
          {error && (
            <p className="text-center text-red-600 text-lg">Hata: {error}</p>
          )}

          {!loading &&
            !error &&
            (tweets.length === 0 ? (
              <p className="text-center text-gray-500 text-lg">
                Bu kullanıcının henüz tweeti yok veya ID yanlış girilmiş.
              </p>
            ) : (
              <div className="space-y-6">
                {tweets.map((tweet) => (
                  <div
                    key={tweet.id}
                    className="border border-gray-200 rounded-xl p-6 bg-gray-50 shadow-sm flex flex-col gap-2"
                  >
                    <p className="text-gray-900 text-lg font-medium">
                      {tweet.content}
                    </p>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span className="font-semibold">
                        @{tweet.user.username}
                      </span>
                      <span className="text-xs">
                        {new Date(tweet.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {tweet.isRetweet && (
                      <p className="text-xs text-blue-500 font-medium">
                        Retweet
                      </p>
                    )}
                    {tweet.replyToTweetId && (
                      <p className="text-xs text-purple-500">
                        Yanıtlanan Tweet ID: {tweet.replyToTweetId}
                      </p>
                    )}
                    {tweet.originalTweetId && tweet.isRetweet && (
                      <p className="text-xs text-orange-500">
                        Orijinal Tweet ID: {tweet.originalTweetId}
                      </p>
                    )}
                    {/* Diğer aksiyon butonları buraya eklenecek: Güncelle, Sil, Yorum Yap, Beğen, Retweet */}
                    {/* Örneğin:
                    <div className="flex gap-2 mt-3 text-sm">
                      <button className="text-blue-500 hover:underline">Yorum Yap</button>
                      <button className="text-green-500 hover:underline">Beğen</button>
                      <button className="text-purple-500 hover:underline">Retweet</button>
                      {currentUser?.id === tweet.user.id && ( // Sadece kendi tweetini güncelleyebilir/silebilir
                          <>
                            <button className="text-yellow-500 hover:underline">Düzenle</button>
                            <button className="text-red-500 hover:underline">Sil</button>
                          </>
                      )}
                    </div>
                    */}
                  </div>
                ))}
              </div>
            ))}
        </main>
      )}
    </div>
  );
}

export default App;
