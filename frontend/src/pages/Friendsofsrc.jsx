import React, { useState, useEffect, useRef } from 'react';

// Reusable component to handle the scroll-up animation
const FadeInSection = ({ children, className = "" }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    
    const current = domRef.current;
    if (current) observer.observe(current);
    
    return () => { if (current) observer.unobserve(current); };
  }, []);

  return (
    <div
      ref={domRef}
      className={`scroll-reveal ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

const styles = {
  pageContainer: {
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    color: '#0135cf', 
    margin: 0,
    padding: 0,
    backgroundColor: '#fff',
    overflowX: 'hidden',
  },
  creamSection: {
    backgroundColor: '#F8F8F5',
  },
  textBlock: {
    maxWidth: '550px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '20px',
    lineHeight: 1.2,
    color: '#0135cf',
  },
  titleWithSubtitle: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '40px',
    color: '#0135cf',
  },
  paragraph: {
    fontSize: '16px',
    lineHeight: 1.6,
    marginBottom: '30px',
    color: '#333', 
  },
  button: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#0135cf', 
    color: 'white',
    textDecoration: 'none',
    fontWeight: 'bold',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    border: 'none',
    textAlign: 'center',
  },
  smallButton: {
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: '500',
  },
  laurelLogoContainer: {
    display: 'flex',
    justifyContent: 'center', 
  },
  circularPortrait: {
    maxWidth: '300px',
    width: '100%',
  },
  whyIconCard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  whyIcon: {
    height: '120px', 
    marginBottom: '20px',
  },
  whyIconText: {
    fontSize: '13px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    maxWidth: '120px',
    lineHeight: 1.3,
    color: '#0135cf'
  },
  mapImage: {
    maxWidth: '600px',
    width: '100%',
    height: 'auto',
  },
  donateCard: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  donateCardTitle: {
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: '15px',
    letterSpacing: '0.5px',
    color: '#333'
  },
  donateAmountContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '5px',
    marginBottom: '10px',
    color: '#0135cf', 
  },
  donateValue: {
    fontSize: '64px',
    fontWeight: '700',
  },
  donateCurrency: {
    fontSize: '36px',
    fontWeight: '600',
  },
  donateCardType: {
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#666'
  },
  donateFooterText: {
    color: '#666',
    fontSize: '14px',
    maxWidth: '700px',
    margin: '30px auto 0 auto',
    lineHeight: 1.5,
  },
  headerLaurelLogo: {
    width: '100%',
    maxWidth: '500px', 
  },
  volunteerImage: {
    width: '100%',
    maxWidth: '450px',
    borderRadius: '8px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
    display: 'block',
    margin: '0 auto'
  }
};

const FriendsOfSRCPage = () => {
  // --- STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- REFS ---
  const subscriptionModalRef = useRef(null); 

  // --- EFFECT: LOAD MONTHLY SUBSCRIPTION WIDGET ---
  useEffect(() => {
    const container = subscriptionModalRef.current;
    
    // Check if container exists and doesn't already have the form
    if (container && !container.querySelector('form')) {
      const form = document.createElement('form');
      const script = document.createElement('script');
      script.src = "https://cdn.razorpay.com/static/widget/subscription-button.js";
      // Used your provided subscription ID and theme
      script.setAttribute('data-subscription_button_id', 'pl_SVq8WcT4cNFI3m');
      script.setAttribute('data-button_theme', 'rzp-light-standard');
      script.async = true;

      form.appendChild(script);
      container.appendChild(form);
    }
  }, []);

  return (
    <div style={styles.pageContainer}>
      
      <style>{`
        .responsive-section {
          padding: 80px 20px;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 60px;
        }
        .responsive-column {
          flex: 1;
        }
        .why-icons-container {
          display: flex;
          justify-content: space-between;
          gap: 40px;
          margin: 40px 100px 0 100px;
        }
        .donate-grid-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
          margin-top: 60px;
          margin-bottom: 60px;
        }
        .center-align-text {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .scroll-reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
          will-change: opacity, transform;
        }
        .scroll-reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .donate-card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
        }
        .donate-card-hover:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          z-index: 9999;
          display: flex; items-align: center; justify-content: center;
          background-color: rgba(1, 53, 207, 0.7);
          backdrop-filter: blur(4px);
          opacity: 0; pointer-events: none;
          transition: opacity 0.3s ease;
        }
        .modal-overlay.is-open {
          opacity: 1; pointer-events: auto;
        }
        .modal-content {
          background: #fff;
          border-radius: 2rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          width: 100%; max-width: 400px;
          position: relative;
          display: flex; flex-direction: column;
          max-height: 85vh;
          transform: scale(0.95);
          transition: transform 0.3s ease;
          margin: auto; /* Fallback for flex centering */
        }
        .modal-overlay.is-open .modal-content {
          transform: scale(1);
        }
        .modal-close-btn {
          position: absolute; top: 1rem; right: 1rem;
          z-index: 50;
          background: #f3f4f6; color: #6b7280;
          border: none; border-radius: 50%;
          width: 2.5rem; height: 2.5rem;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .modal-close-btn:hover {
          background: #e5e7eb; color: #ef4444;
        }
        .modal-body {
          overflow-y: auto; padding: 2rem;
          display: flex; flex-direction: column; align-items: center;
        }

        /* Mobile View Overrides: Stack elements and force everything to center */
        @media (max-width: 768px) {
          .responsive-section {
            flex-direction: column !important;
            align-items: center !important;
            padding: 50px 20px;
            gap: 40px;
          }
          .responsive-column {
            width: 100%;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .responsive-column h1, 
          .responsive-column h2, 
          .responsive-column h3, 
          .responsive-column p,
          .responsive-column div {
            text-align: center !important;
            align-items: center !important;
          }
          .why-icons-container {
            flex-direction: column;
            margin: 40px 0 0 0;
            gap: 50px;
          }
          .donate-grid-container {
            grid-template-columns: 1fr;
          }
          .center-align-text {
            align-items: stretch; 
          }
        }
      `}</style>

      {/* 1. Hero / Header Section */}
      <section>
        <FadeInSection className="responsive-section">
          <div className="responsive-column" style={styles.laurelLogoContainer}>
            <img 
              src="/friends-of-src-laurel.png" 
              alt="Friends of SRC Logo" 
              style={styles.headerLaurelLogo}
            />
          </div>
          <div className="responsive-column" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={styles.titleWithSubtitle}>
              <h1 style={{...styles.title, marginBottom: '5px'}}>Education is a Right,</h1>
              <h1 style={{...styles.title, marginBottom: '20px'}}>Not a Privilege.</h1>
            </div>
            <p style={{...styles.subtitle, color: '#333', fontSize: '18px', marginBottom: '30px'}}>
              Join us with a monthly<br />
              Support
            </p>
            {/* Swapped standard anchor for button, triggers modal */}
            <button onClick={() => setIsModalOpen(true)} style={styles.button}>DONATE NOW</button>
          </div>
        </FadeInSection>
      </section>

      {/* 2. Savitribai Section */}
      <section style={styles.creamSection}>
        <FadeInSection className="responsive-section">
          <div className="responsive-column" style={styles.textBlock}>
            <h2 style={styles.title}>Savitribai Phule<br />Resource Center</h2>
            <p style={styles.paragraph}>
              The Savitribai Phule Resource Centre (SRC) was born from a burning need for equity. Named in honor of the trailblazing 19th-century advocate for women's rights and education, we are driven by Savitribai Phule’s enduring courage and compassion. We don't just provide resources; we create safe, inclusive spaces where individuals from marginalized backgrounds are empowered to unlock their full, untapped potential.
            </p>
            {/* Triggers modal */}
            <button onClick={() => setIsModalOpen(true)} style={{...styles.button, ...styles.smallButton}}>Become a Monthly Supporter</button>
          </div>
          <div className="responsive-column" style={{ display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/savitribai-circular.png" 
              alt="Savitribai Phule Portrait Logo" 
              style={styles.circularPortrait}
            />
          </div>
        </FadeInSection>
      </section>

      {/* 3. Why Section */}
      <section style={{ display: 'block' }}>
        <FadeInSection>
          <div className="responsive-section" style={{ paddingBottom: '20px' }}>
            <div className="responsive-column" style={styles.textBlock}>
              <h2 style={styles.title}>Friends of SRC</h2>
            </div>
            <div className="responsive-column">
              <p style={{...styles.paragraph, fontWeight: '500'}}>
                To create lasting, systemic change, we cannot do this alone. We need allies. We need champions. We need Friends of SRC.
              </p>
              <p style={styles.paragraph}>
                When you choose to financially support SRC, you are actively dismantling the hurdles of caste, creed, and religious identity. You are funding targeted educational initiatives, driving community engagement, and fighting for social justice.
              </p>
            </div>
          </div>
          
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
            <hr style={{ border: 'none', borderBottom: '2px solid #000', margin: '20px 0' }} />
            <p style={{ textAlign: 'center', fontSize: '18px', fontWeight: '600', color: '#0135cf', margin: '20px 0' }}>
              As a Friend of SRC, your contribution directly provides:
            </p>
            <hr style={{ border: 'none', borderBottom: '2px solid #000', margin: '20px 0' }} />
          </div>
          
          <div className="why-icons-container" style={{ maxWidth: '1200px', margin: '40px auto 0 auto', padding: '0 20px' }}>
            <div style={styles.whyIconCard}>
              <img src="/safe-learning-icon.png" alt="Lightbulb Icon" style={styles.whyIcon} />
              <div style={styles.whyIconText}>SAFE LEARNING SPACES</div>
            </div>
            <div style={styles.whyIconCard}>
              <img src="/mentorship-icon.png" alt="Target and Arrows Icon" style={styles.whyIcon} />
              <div style={styles.whyIconText}>TARGETED MENTORSHIP</div>
            </div>
            <div style={styles.whyIconCard}>
              <img src="/learning-tools-icon.png" alt="Pencil Icon" style={styles.whyIcon} />
              <div style={styles.whyIconText}>PREPARING LEARNING TOOLS</div>
            </div>
          </div>
        </FadeInSection>
      </section>

      {/* 4. Map Section */}
      <section style={styles.creamSection}>
        <FadeInSection className="responsive-section">
          <div className="responsive-column" style={{...styles.textBlock, maxWidth: '450px'}}>
            <h2 style={styles.title}>We Are On the Ground,<br />Where It Matters Most.</h2>
            <p style={styles.paragraph}>
              From bustling cities to rural heartlands, the SRC network is expanding. Thanks to early supporters, our centers are already acting as hubs of empowerment across multiple regions.
            </p>
          </div>
          <div className="responsive-column" style={{ display: 'flex', justifyContent: 'center' }}>
            <img 
              src="/regional-map.png" 
              alt="Regional Map of India" 
              style={styles.mapImage}
            />
          </div>
        </FadeInSection>
      </section>

      {/* 5. Donate Tiers Section */}
      <section style={{ display: 'block', padding: '100px 20px' }}>
        <FadeInSection>
          <div className="center-align-text">
            <h2 style={{...styles.title, textAlign: 'center'}}>Choose Your Impact as a<br />Friend of SRC</h2>
          </div>

          <div className="donate-grid-container" style={{ maxWidth: '1000px', margin: '60px auto' }}>
            {/* Card 250 - Triggers modal */}
            <div className="donate-card-hover" style={styles.donateCard} onClick={() => setIsModalOpen(true)}>
              <div style={styles.donateCardTitle}>DONATE</div>
              <div style={styles.donateAmountContainer}>
                <span style={styles.donateValue}>250</span>
                <span style={styles.donateCurrency}>₹</span>
              </div>
              <div style={styles.donateCardType}>MONTHLY</div>
            </div>
            {/* Card 500 - Triggers modal */}
            <div className="donate-card-hover" style={styles.donateCard} onClick={() => setIsModalOpen(true)}>
              <div style={styles.donateCardTitle}>DONATE</div>
              <div style={styles.donateAmountContainer}>
                <span style={styles.donateValue}>500</span>
                <span style={styles.donateCurrency}>₹</span>
              </div>
              <div style={styles.donateCardType}>MONTHLY</div>
            </div>
            {/* Card 1000 - Triggers modal */}
            <div className="donate-card-hover" style={styles.donateCard} onClick={() => setIsModalOpen(true)}>
              <div style={styles.donateCardTitle}>DONATE</div>
              <div style={styles.donateAmountContainer}>
                <span style={styles.donateValue}>1000</span>
                <span style={styles.donateCurrency}>₹</span>
              </div>
              <div style={styles.donateCardType}>MONTHLY</div>
            </div>
          </div>

          <div className="center-align-text" style={{ maxWidth: '700px', margin: '0 auto' }}>
            {/* Custom Amount Button configured with Razorpay Link */}
            <a 
              href="https://pages.razorpay.com/pl_SWAjiV1mIfS7gg/view" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.button}
            >
              CUSTOM AMOUNT
            </a>
            <p style={styles.donateFooterText}>
              Every single contribution, no matter the size, helps creates a better future. As a monthly supporter, your consistent contribution allows us to plan more effectively and generate a much larger impact.
            </p>
          </div>
        </FadeInSection>
      </section>

      {/* 6. Volunteer Section */}
      <section style={styles.creamSection}>
        <FadeInSection className="responsive-section">
          <div className="responsive-column" style={styles.textBlock}>
            <h2 style={{...styles.title, fontSize: '42px'}}>Not Ready to Donate?</h2>
            <h3 style={styles.subtitle}>Give Your Time.</h3>
            
            <p style={{...styles.paragraph, marginBottom: '20px', color: '#666'}}>
              The Friends of SRC network isn't just about financial support; it's about building a community of passionate individuals.
            </p>
            <p style={{...styles.paragraph, marginBottom: '20px', color: '#666'}}>
              If you believe in our vision of inclusivity, equity, and opportunity for all, we need your voice and your energy. Become a volunteer at one of our centers, help us organize events, or mentor our students.
            </p>
            <p style={{...styles.paragraph, marginBottom: '40px', color: '#666', fontWeight: '500'}}>
              Ready to stand with us? Fill out the form below to become an official SRC Volunteer.
            </p>
            
            {/* UPDATED: Google Form link added here */}
            <a 
              href="https://forms.gle/udnMdo3QNpLq1Nyz8" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.button}
            >
              FILL OUT THE VOLUNTEER GOOGLE FORM
            </a>
          </div>
          
          <div className="responsive-column">
            <img 
              src="/kids-graduation.jpg" 
              alt="Smiling children wearing graduation caps" 
              style={styles.volunteerImage}
            />
          </div>
        </FadeInSection>
      </section>

      {/* --- SUBSCRIPTION MODAL --- */}
      <div className={`modal-overlay ${isModalOpen ? 'is-open' : ''}`}>
        <div className="modal-content">
          <button 
            onClick={() => setIsModalOpen(false)} 
            className="modal-close-btn"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="modal-body">
            <h3 style={{...styles.title, fontSize: '24px', textTransform: 'uppercase', marginBottom: '10px'}}>Support Us</h3>
            
            {/* Razorpay Subscription Widget Container */}
            <div ref={subscriptionModalRef} style={{ width: '100%', display: 'flex', justifyContent: 'center', minHeight: '300px' }}></div>
            
            <button 
              onClick={() => setIsModalOpen(false)} 
              style={{ background: 'none', border: 'none', color: '#9ca3af', textDecoration: 'underline', fontSize: '12px', marginTop: '20px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default FriendsOfSRCPage;