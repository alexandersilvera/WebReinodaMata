import { useState, useEffect } from 'react';

interface CountdownBannerProps {
  targetDate: string;
}

const images = [
  "https://firebasestorage.googleapis.com/v0/b/reino-da-mata-2fea3.firebasestorage.app/o/templo_110.jpg?alt=media&token=17e7f62b-6609-4436-964c-ca13e73cb357",
  "https://firebasestorage.googleapis.com/v0/b/reino-da-mata-2fea3.firebasestorage.app/o/templo_221.jpg?alt=media&token=6ddfe6e9-de2a-4168-93c2-a2a73e127068",
  "https://firebasestorage.googleapis.com/v0/b/reino-da-mata-2fea3.firebasestorage.app/o/templo_148.jpg?alt=media&token=139839d2-526d-4540-8572-773e552ff61b",
  "https://firebasestorage.googleapis.com/v0/b/reino-da-mata-2fea3.firebasestorage.app/o/templo_204.jpg?alt=media&token=7d4be670-5ad4-44ba-800f-e89a31bc771d"
];

const CountdownBanner = ({ targetDate }: CountdownBannerProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Slideshow logic
  useEffect(() => {
    const slideshowTimer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(slideshowTimer);
  }, []);

  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        días: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  // Countdown logic
  useEffect(() => {
    const countdownTimer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(countdownTimer);
  });

  const timerComponents: JSX.Element[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    const value = timeLeft[interval as keyof typeof timeLeft];
    if (value === undefined) {
      return;
    }

    timerComponents.push(
      <div key={interval} className="text-center">
        <span className="text-4xl md:text-5xl font-bold">{value}</span>
        <span className="block text-sm uppercase">{interval}</span>
      </div>
    );
  });

  return (
    <section className="bg-gray-800 text-white py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Image Gallery and Overlays */}
        <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden shadow-xl mb-12">
          {images.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Templo Reino da Mata ${index + 1}`}
              className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
            />
          ))}
          
          {/* Text Overlay */}
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-black bg-opacity-30">
            <p className="text-white text-2xl md:text-3xl font-semibold text-center max-w-3xl drop-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>
              Recordando a nuestra Mae Luz, Jefa y Madre de nuestra Casa Religiosa.
            </p>
          </div>

          {/* Countdown Timer Overlay */}
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 p-4 rounded-lg shadow-lg">
            {timerComponents.length ? (
              <div className="grid grid-cols-4 gap-4 text-white">
                {timerComponents}
              </div>
            ) : (
              <div className="text-center">
                <span className="text-2xl font-bold text-green-400">¡Las actividades han comenzado!</span>
              </div>
            )}
          </div>
        </div>

        {/* Text and Button Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-orange-400">
            Comienzo de Actividades - Octubre 2025
          </h2>
          <p className="text-lg text-gray-300 mb-6 max-w-3xl mx-auto">
            Te esperamos para compartir un nuevo ciclo de contacto con el mundo espiritual y nuestra ancestralidad. ¡¡¡Registrate para participar!!!
          </p>
          <a
            href="/contacto"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105"
          >
            Regístrate Ahora
          </a>
        </div>

      </div>
    </section>
  );
};

export default CountdownBanner;