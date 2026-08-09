const AboutPage = () => {
  const team = [
    {
      name: 'Amod Khurasiya',
  role: 'Main Lead — Backend & Frontend',
  image: '/Creator/amod%20image%20.jpg',
      bio: 'Amod leads Trybee’s vision and partnerships, building a platform that empowers artisans and celebrates tradition.',
      linkedin: 'https://www.linkedin.com/in/amod-khurasiya-526940290/',
    },
    {
      name: 'Anuj Kori',
  role: 'Design & Frontend',
  image: '/Creator/anuj.jpg',
      bio: 'Anuj architects and builds the Trybee platform with a focus on reliability, performance, and delightful UX.',
      linkedin: 'https://www.linkedin.com/in/anujkori09/',
    },
    {
      name: 'Anshika Gupta',
  role: 'Frontend',
  image: '/Creator/anshika.jpg',
      bio: 'Anshika shapes the brand and community programs, highlighting artisan stories and ethical practices.',
      linkedin: 'https://www.linkedin.com/in/anshika-gupta2701/',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">About Trybee</h1>
        <p className="text-gray-600 mb-8">We connect artisans with customers through authentic, handcrafted tribal products. Our mission is to preserve traditional craftsmanship while providing fair, sustainable income to creators.</p>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Authenticity</h3>
            <p className="text-gray-600 text-sm">Every product is verified for origin and materials, with direct ties to artisan communities.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Fair Trade</h3>
            <p className="text-gray-600 text-sm">We prioritize ethical sourcing and fair compensation for artisans and small producers.</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Quality</h3>
            <p className="text-gray-600 text-sm">Products are curated for durability and design, blending tradition with modern use.</p>
          </div>
        </div>

        {/* Team */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Founders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member) => (
            <div key={member.name} className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/Trybee-Logo.svg';
                  }}
                />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{member.role}</p>
              <p className="text-sm text-gray-600 mb-4">{member.bio}</p>
              <a
                href={member.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white"
                style={{ backgroundColor: '#0A66C2' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M20.447 20.452H17.24v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.135 1.446-2.135 2.941v5.665H9.046V9h3.073v1.561h.044c.428-.81 1.473-1.665 3.03-1.665 3.242 0 3.842 2.136 3.842 4.915v6.641zM5.337 7.433a1.777 1.777 0 110-3.554 1.777 1.777 0 010 3.554zM6.96 20.452H3.713V9H6.96v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
