'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('en');
  const [suggestions, setSuggestions] = useState([]);

  // Mock autocomplete suggestions
  useEffect(() => {
    const mockSuggestions = ['Maize', 'Tomatoes', 'Groundnuts', 'Fish', 'Beans'];
    if (query.length > 1) {
      setSuggestions(
        mockSuggestions.filter((item) =>
          item.toLowerCase().includes(query.toLowerCase())
        )
      );
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ch' : 'en');
  };

  const translations = {
    en: {
      title: 'ZammundaMarket',
      heroTitle: 'Empowering Malawi’s Agri-Food Future',
      heroSubtitle: 'Connect farmers and buyers with seamless logistics, transparency, and fair pricing.',
      searchPlaceholder: 'Search produce, sellers...',
      featuresTitle: 'Why Choose ZammundaMarket?',
      ctaTitle: 'Transform Your Agri-Business Today',
      ctaSubtitle: 'Join our Fulfillment by Zammunda (FBZ) program and start in minutes.',
      testimonialsTitle: 'What Our Users Say',
      marketTrendsTitle: 'Live Market Trends',
      footerAbout: 'ZammundaMarket is Malawi’s leading agri-tech platform, connecting farmers to buyers with efficient logistics and fair trade.',
    },
    ch: {
      title: 'ZammundaMarket',
      heroTitle: 'Kupititsa Patsogolo Tsogolo la Chakudya cha Ulimi ku Malawi',
      heroSubtitle: 'Lumikizani alimi ndi ogula ndi zoyendera zosavuta, zowonekera, komanso mitengo yabwino.',
      searchPlaceholder: 'Fufuzani zokolola, ogulitsa...',
      featuresTitle: 'Chifukwa Chiyani Musankhe ZammundaMarket?',
      ctaTitle: 'Sintha Bizinesi Yanu ya Ulimi Lero',
      ctaSubtitle: 'Lowani nawo pulogalamu yathu ya Fulfillment by Zammunda (FBZ) ndikuyamba mu mphindi.',
      testimonialsTitle: 'Zomwe Ogwiritsa Ntchito Athu Amanena',
      marketTrendsTitle: 'Zochitika Zamsika Panthawi Ino',
      footerAbout: 'ZammundaMarket ndiye nsanja yotsogola ya ulimi ku Malawi, yolumikiza alimi ndi ogula ndi zoyendera zabwino komanso malonda achilungamo.',
    },
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-700">{translations[language].title}</h1>
          <div className="flex items-center space-x-4 sm:space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-green-700 text-sm sm:text-base">
              {language === 'en' ? 'Features' : 'Zinthu Zake'}
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-green-700 text-sm sm:text-base">
              {language === 'en' ? 'How It Works' : 'Momwe Zimagwirira Ntchito'}
            </Link>
            <Link href="#faq" className="text-gray-600 hover:text-green-700 text-sm sm:text-base">
              {language === 'en' ? 'FAQ' : 'Mafunso Ofunsidwa Kawirikawiri'}
            </Link>
            <button
              onClick={toggleLanguage}
              className="text-gray-600 hover:text-green-700 text-sm sm:text-base"
            >
              {language === 'en' ? 'Chichewa' : 'English'}
            </button>
            <Link href="/login" className="bg-green-700 text-white px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base">
              {language === 'en' ? 'Login' : 'Lowani'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative mt-16 h-[60vh] sm:h-[80vh] overflow-hidden">
        <Image
          src="/images/market-illustration.jpg"
          alt="Malawi Agri Market"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col items-start justify-center container mx-auto px-4 sm:px-6">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 max-w-2xl"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {translations[language].heroTitle}
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg lg:text-xl text-white mb-6 max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            {translations[language].heroSubtitle}
          </motion.p>
          {/*<div className="relative w-full max-w-md">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={translations[language].searchPlaceholder}
              className="w-full px-4 py-3 rounded-l-xl outline-none text-gray-800"
            />
            <button className="absolute right-0 top-0 bg-yellow-400 text-slate-800 font-semibold px-4 sm:px-6 py-3 rounded-r-xl hover:bg-yellow-500 transition">
              {language === 'en' ? 'Search' : 'Fufuza'}
            </button>
            {suggestions.length > 0 && (
              <div className="absolute w-full bg-white shadow-lg rounded-b-xl mt-1 max-h-40 overflow-y-auto">
                {suggestions.map((suggestion, i) => (
                  <div
                    key={i}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setQuery(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>*/}
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-green-700 mb-12">
            {translations[language].featuresTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: '📦',
                title: language === 'en' ? 'Fulfillment by Zammunda (FBZ)' : 'Kutsata kwa Zammunda (FBZ)',
                desc: language === 'en'
                  ? 'Store your produce in our aggregation hubs with end-to-end delivery and quality assurance.'
                  : 'Sungani zokolola zanu m’malo athu osonkhanitsira ndi kutumiza kwathunthu komanso chitsimikizo cha khalidwe.',
              },
              // {
              //   icon: '📱',
              //   title: language === 'en' ? 'Accessible Platforms' : 'Mapulatifomu Ofikika',
              //   desc: language === 'en'
              //     ? 'Use our app, web, or USSD for feature phones, designed for low-bandwidth areas.'
              //     : 'Gwiritsani ntchito pulogalamu yathu, intaneti, kapena USSD pamafoni osavuta, opangidwira madera a low-bandwidth.',
              // },
              {
                icon: '💰',
                title: language === 'en' ? 'Secure Payments' : 'Malipiro Otetezeka',
                desc: language === 'en'
                  ? 'Pay or get paid instantly via mobile money with Airtel Money or TNM Mpamba.'
                  : 'Lipirani kapena mulandire malipiro nthawi yomweyo kudzera pa mobile money ndi Airtel Money kapena TNM Mpamba.',
              },
              {
                icon: '🛡️',
                title: language === 'en' ? 'Transparency & Trust' : 'Kuwonekera & Chikhulupiriro',
                desc: language === 'en'
                  ? 'QR-coded tracking and verified users ensure a reliable supply chain.'
                  : 'Kutsata ndi QR-code komanso ogwiritsa ntchito otsimikizika amatsimikizira njira yodalirika.',
              },
              {
                icon: '🤝',
                title: language === 'en' ? 'Community Partnerships' : 'Mgwirizano wa Anthu Amderalo',
                desc: language === 'en'
                  ? 'Work with local cooperatives for trust and wider market reach.'
                  : 'Gwirani ntchito ndi ma cooperatives amderalo kuti mukhale ndi chikhulupiriro komanso msika waukulu.',
              },
              {
                icon: '📊',
                title: language === 'en' ? 'Market Insights' : 'Zidziwitso za Msika',
                desc: language === 'en'
                  ? 'Access pricing trends and analytics to make informed decisions.'
                  : 'Pezani zidziwitso za mitengo ndi ma analytics kuti mupange zisankho zodziwika.',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                className="bg-gray-50 rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <div className="text-4xl sm:text-5xl mb-4">{f.icon}</div>
                <h4 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-800">{f.title}</h4>
                <p className="text-gray-600 text-sm sm:text-base">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-green-700 mb-12">
            {translations[language].testimonialsTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: 'Mary Phiri',
                role: language === 'en' ? 'Farmer, Lilongwe' : 'Mlimi, Lilongwe',
                quote: language === 'en'
                  ? 'ZammundaMarket helped me sell my maize directly to buyers at better prices!'
                  : 'ZammundaMarket yandithandiza kugulitsa chimanga changa mwachindunji kwa ogula pamitengo yabwino!',
                img: '/images/farmer1.jpg',
              },
              {
                name: 'John Banda',
                role: language === 'en' ? 'Buyer, Blantyre' : 'Ogula, Blantyre',
                quote: language === 'en'
                  ? 'The platform’s tracking and quality checks make sourcing produce so easy.'
                  : 'Kutsata kwa nsanja ndi kuwunika khalidwe kumapangitsa kupeza zokolola kukhala kosavuta.',
                img: '/images/buyer1.jpg',
              },
              {
                name: 'Grace Mwewa',
                role: language === 'en' ? 'Cooperative Leader, Mzuzu' : 'Mtsogoleri wa Cooperative, Mzuzu',
                quote: language === 'en'
                  ? 'Our cooperative now reaches more buyers with Zammunda’s logistics.'
                  : 'Cooperative yathu tsopano ikufikira ogula ambiri ndi zoyendera za Zammunda.',
                img: '/images/coop1.jpg',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <Image
                  src={t.img}
                  alt={t.name}
                  width={80}
                  height={80}
                  className="rounded-full mb-4 mx-auto"
                />
                <p className="text-gray-600 italic mb-4 text-sm sm:text-base">"{t.quote}"</p>
                <h4 className="text-lg font-semibold text-gray-800">{t.name}</h4>
                <p className="text-gray-500 text-sm">{t.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Market Trends Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-green-700 mb-12">
            {translations[language].marketTrendsTitle}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                produce: 'Maize',
                price: 'MWK 450/kg',
                trend: '↑ 5%',
                desc: language === 'en' ? 'Rising demand in urban markets' : 'Kufunika kwachuluka m’misika ya m’tauni',
              },
              {
                produce: 'Tomatoes',
                price: 'MWK 800/kg',
                trend: '↓ 2%',
                desc: language === 'en' ? 'Seasonal oversupply' : 'Kuchuluka kwa nyengo',
              },
              {
                produce: 'Groundnuts',
                price: 'MWK 1200/kg',
                trend: '→ Stable',
                desc: language === 'en' ? 'Consistent demand' : 'Kufunika kosasintha',
              },
              {
                produce: 'Fish',
                price: 'MWK 2000/kg',
                trend: '↑ 8%',
                desc: language === 'en' ? 'High demand for dried fish' : 'Kufunika kwakukulu kwa nsomba zouma',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                className="bg-gray-50 rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <h4 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{t.produce}</h4>
                <p className="text-green-700 font-bold mb-2">{t.price}</p>
                <p className={t.trend.includes('↑') ? 'text-green-500' : t.trend.includes('↓') ? 'text-red-500' : 'text-gray-500'}>
                  {t.trend}
                </p>
                <p className="text-gray-600 text-sm">{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-green-700 text-white text-center">
        <h3 className="text-2xl sm:text-3xl font-bold mb-4">{translations[language].ctaTitle}</h3>
        <p className="mb-8 text-sm sm:text-base">{translations[language].ctaSubtitle}</p>
        <Link
          href="/signup"
          className="bg-yellow-400 text-slate-800 font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-lg hover:bg-yellow-500 transition"
        >
          {language === 'en' ? 'Get Started' : 'Yambani Tsopano'}
        </Link>
      </section>

      {/* Footer Section */}
      <footer id="faq" className="bg-gray-800 text-gray-400 py-12">
        <div className="container mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h5 className="font-bold text-white mb-4">{translations[language].title}</h5>
            <p className="text-sm">{translations[language].footerAbout}</p>
          </div>
          <div>
            <h5 className="font-bold text-white mb-4">{language === 'en' ? 'Quick Links' : 'Maulalo Achangu'}</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="#features" className="hover:text-white">{language === 'en' ? 'Features' : 'Zinthu Zake'}</Link></li>
              <li><Link href="#how-it-works" className="hover:text-white">{language === 'en' ? 'How It Works' : 'Momwe Zimagwirira Ntchito'}</Link></li>
              <li><Link href="#faq" className="hover:text-white">{language === 'en' ? 'FAQ' : 'Mafunso'}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white mb-4">{language === 'en' ? 'Contact Us' : 'Lumikizanani Nafe'}</h5>
            <p className="text-sm">Email: support@zammundamarket.com</p>
            <p className="text-sm">Phone: +265 123 456</p>
            <p className="text-sm">{language === 'en' ? 'Address: Lilongwe, Malawi' : 'Adilesi: Lilongwe, Malawi'}</p>
          </div>
          <div>
            <h5 className="font-bold text-white mb-4">{language === 'en' ? 'Follow Us' : 'Titsatireni'}</h5>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-twitter"></i></a>
              <a href="#" className="text-gray-400 hover:text-white"><i className="fab fa-whatsapp"></i></a>
            </div>
          </div>
        </div>
        <div className="text-center mt-8 text-sm">
          <p>© 2025 ZammundaMarket. {language === 'en' ? 'All rights reserved.' : 'Ufulu wonse uli ndi ife.'}</p>
        </div>
      </footer>
    </div>
  );
}