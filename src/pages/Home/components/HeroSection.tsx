interface HeroSectionProps {
  userName?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ userName }) => (
  <section className="relative text-white py-28">
    <video
      autoPlay
      loop
      muted
      className="absolute inset-0 w-full h-full object-cover brightness-75"
      src="https://cdn.prod.website-files.com/62bac7754ea6d7967db80305/65d6f41364044a20584b6dea_CZ_Main_Compress-transcode.mp4"
    />
    <div className="relative z-10 container mx-auto text-center">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
        Welcome Back, {userName || "Creative User"}!
      </h1>
      <p className="text-lg mb-8 md:mb-12">
        Explore your projects and enhance your creative journey.
      </p>
      <button className="bg-gradient-to-r from-teal-500 to-green-400 text-white py-3 px-8 rounded-full font-medium shadow-md hover:shadow-lg hover:scale-105 transform transition duration-300">
        Get Started
      </button>
    </div>
  </section>
);
