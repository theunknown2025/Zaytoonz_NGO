export type LanguageCode = 'en' | 'fr' | 'ar';

export interface Language {
  code: LanguageCode;
  name: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' }
];

export const translations = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      jobs: 'Jobs',
      training: 'Training',
      funding: 'Funding',
      resources: 'Resources',
      aboutUs: 'About us',
      signIn: 'Sign In',
      getStarted: 'Get Started',
      language: 'Language'
    },
    // Hero Section
    hero: {
      badge: '🌍 Connecting Global Changemakers Since 2020',
      title1: 'Fueling',
      title2: 'Social Impact',
      title3: 'with',
      title4: 'Professional Expertise',
      description: 'Zaytoonz is the leading platform connecting skilled professionals with mission-driven non-profit entities across the globe. We enable impactful careers that contribute to social change, strengthening the capacity of organizations while advancing sustainable development and community resilience.',
      discoverOpportunities: 'Discover Opportunities',
      postOpportunities: 'Post Opportunities'
    },
    // Stats
    stats: {
      activeTalents: 'Active Talents',
      fromCountries: 'From 85+ countries',
      partnerOrgs: 'Partner Organizations',
      acrossContinents: 'Across 6 continents',
      livesImpacted: 'Lives Impacted',
      throughPartnerships: 'Through our partnerships',
      successRate: 'Success Rate',
      successfulPlacements: 'Successful placements'
    },
    // Recent Opportunities
    opportunities: {
      latestTitle: 'Latest Opportunities',
      jobs: 'Jobs',
      funding: 'Funding',
      training: 'Training',
      viewOpportunity: 'View Opportunity',
      viewDetails: 'View Details',
      posted: 'Posted',
      external: 'External',
      partner: 'Partner',
      noAvailable: 'No {type}s available',
      checkBack: 'Check back soon for new {type} opportunities.',
      exploreAll: 'Explore All Opportunities'
    },
    // How It Works
    howItWorks: {
      title: 'How Zaytoonz Works',
      description: 'Zaytoonz offers a streamlined platform that connects skilled professionals with mission-driven non-profit entities, enabling impactful collaborations that drive meaningful social change.',
      // For Job Seekers
      forSeekers: 'For Job Seekers',
      seekersSubtitle: 'From profile to placement in 4 simple steps',
      seeker1Title: 'Build Your Professional Profile',
      seeker1Desc: 'Create a detailed profile highlighting your skills, experience, and career goals using our profile management tools.',
      seeker2Title: 'Navigate & Search Opportunities',
      seeker2Desc: 'Use our opportunity navigation system to browse jobs, set up alerts, and discover roles that match your passion.',
      seeker3Title: 'Apply with Professional CVs',
      seeker3Desc: 'Create tailored CVs using our CV maker and analyzer, then submit applications and track their progress.',
      seeker4Title: 'Manage & Track Progress',
      seeker4Desc: 'Monitor your applications, access career services, and utilize resources to advance your professional journey.',
      // For Organizations
      forOrgs: 'For Organizations',
      orgsSubtitle: 'From opportunity creation to talent acquisition',
      org1Title: 'Set Up Organization Profile',
      org1Desc: 'Create your organization profile, manage resources, and access tools to streamline your operations.',
      org2Title: 'Create & Manage Opportunities',
      org2Desc: 'Use our opportunity management system to create new postings and manage your existing job listings.',
      org3Title: 'Review & Track Applications',
      org3Desc: 'Access our comprehensive application management system to review candidates and track your recruitment process.',
      org4Title: 'Connect & Hire Talent',
      org4Desc: 'Utilize analytics to make informed decisions and connect with candidates who align with your mission and values.'
    },
    // Morchid AI Section
    morchid: {
      badge: '✨ AI-Powered Career Assistant',
      title: 'Meet Morchid',
      subtitle: 'Your Intelligent Career Companion',
      description: 'Morchid is your personal AI career assistant that understands your skills, analyzes opportunities, and provides personalized guidance to accelerate your professional journey.',
      feature1Title: 'Smart Job Matching',
      feature1Desc: 'Morchid analyzes your CV and profile to find opportunities that perfectly match your skills and career goals.',
      feature2Title: 'CV Optimization',
      feature2Desc: 'Get AI-powered feedback on your resume with specific suggestions to improve your chances of success.',
      feature3Title: 'Career Guidance',
      feature3Desc: 'Receive personalized career advice based on your experience, skills, and industry trends.',
      feature4Title: 'Interview Prep',
      feature4Desc: 'Practice with AI-generated interview questions tailored to your target roles and industries.',
      chatPreview1: 'Hi! I\'m looking for jobs in project management...',
      chatPreview2: 'I found 12 opportunities matching your profile! Based on your 5 years of experience and your skills in Agile and team leadership, here are the top matches...',
      tryMorchid: 'Try Morchid Now',
      learnMore: 'Learn More'
    },
    // About Section
    about: {
      title: 'About Zaytoonz',
      description: 'We are dedicated to creating a world where young talents can build meaningful careers while contributing to positive social change through strategic Organization partnerships. Our mission is to democratize access to impactful career opportunities globally.',
      missionVisionTitle: 'Our Mission & Vision',
      missionTitle: 'Mission',
      missionText: 'To inspire and empower skilled professionals to collaborate with mission-driven non-profits worldwide, forging meaningful careers that spark lasting social change and strengthen communities globally.',
      visionTitle: 'Vision',
      visionText: 'A world where every young professional has access to meaningful career opportunities that align with their values, and every Organization has the talented workforce needed to maximize their social impact.'
    },
    // Our Partners Section
    partners: {
      title: 'Our Partners',
      subtitle: 'Meet the organizations making a difference',
      viewProfile: 'View Profile',
      opportunities: 'Opportunities',
      noPartners: 'No partners available at the moment'
    },
    // Contact Section
    contact: {
      title: 'Get in Touch',
      description: 'Ready to start your journey? We\'re here to help you connect with the right opportunities.',
      formTitle: 'Send us a Message',
      sendTo: 'Send to',
      firstName: 'First Name',
      firstNamePlaceholder: 'Your first name',
      lastName: 'Last Name',
      lastNamePlaceholder: 'Your last name',
      email: 'Email',
      emailPlaceholder: 'your.email@example.com',
      iAmA: 'I am a...',
      selectRole: 'Select your role',
      youngTalent: 'Young Talent',
      orgRepresentative: 'Organization Representative',
      partnerOrg: 'Partner Organization',
      other: 'Other',
      message: 'Message',
      messagePlaceholder: 'Tell us how we can help you...',
      sendMessage: 'Send Message'
    },
    // Footer
    footer: {
      description: 'Zaytoonz offers a streamlined platform that connects skilled professionals with mission-driven non-profit entities, enabling impactful collaborations that drive meaningful social change.',
      platform: 'Platform',
      forSeekers: 'For Seekers',
      forOrganizations: 'For Organizations',
      services: 'Services',
      support: 'Support',
      contact: 'Contact',
      about: 'About',
      followUs: 'Follow Us',
      copyright: '© 2025 Zaytoonz Organization. All rights reserved.'
    }
  },
  fr: {
    // Navigation
    nav: {
      home: 'Accueil',
      jobs: 'Emplois',
      training: 'Formations',
      funding: 'Financements',
      resources: 'Ressources',
      aboutUs: 'À propos',
      signIn: 'Connexion',
      getStarted: 'Commencer',
      language: 'Langue'
    },
    // Hero Section
    hero: {
      badge: '🌍 Connecter les Acteurs du Changement depuis 2020',
      title1: 'Alimenter',
      title2: "l'Impact Social",
      title3: 'avec',
      title4: 'une Expertise Professionnelle',
      description: "Zaytoonz est la plateforme leader connectant des professionnels qualifiés avec des entités à but non lucratif à travers le monde. Nous permettons des carrières impactantes qui contribuent au changement social, renforçant la capacité des organisations tout en faisant progresser le développement durable et la résilience communautaire.",
      discoverOpportunities: 'Découvrir les Opportunités',
      postOpportunities: 'Publier des Opportunités'
    },
    // Stats
    stats: {
      activeTalents: 'Talents Actifs',
      fromCountries: 'De plus de 85 pays',
      partnerOrgs: 'Organisations Partenaires',
      acrossContinents: 'Sur 6 continents',
      livesImpacted: 'Vies Impactées',
      throughPartnerships: 'Grâce à nos partenariats',
      successRate: 'Taux de Réussite',
      successfulPlacements: 'Placements réussis'
    },
    // Recent Opportunities
    opportunities: {
      latestTitle: 'Dernières Opportunités',
      jobs: 'Emplois',
      funding: 'Financements',
      training: 'Formations',
      viewOpportunity: "Voir l'Opportunité",
      viewDetails: 'Voir les Détails',
      posted: 'Publié',
      external: 'Externe',
      partner: 'Partenaire',
      noAvailable: 'Aucun {type} disponible',
      checkBack: 'Revenez bientôt pour de nouvelles opportunités de {type}.',
      exploreAll: 'Explorer Toutes les Opportunités'
    },
    // How It Works
    howItWorks: {
      title: 'Comment Fonctionne Zaytoonz',
      description: "Zaytoonz offre une plateforme rationalisée qui connecte des professionnels qualifiés avec des entités à but non lucratif, permettant des collaborations impactantes qui génèrent un changement social significatif.",
      // For Job Seekers
      forSeekers: "Pour les Chercheurs d'Emploi",
      seekersSubtitle: 'Du profil au placement en 4 étapes simples',
      seeker1Title: 'Créez Votre Profil Professionnel',
      seeker1Desc: 'Créez un profil détaillé mettant en valeur vos compétences, votre expérience et vos objectifs de carrière en utilisant nos outils de gestion de profil.',
      seeker2Title: 'Naviguez et Recherchez des Opportunités',
      seeker2Desc: "Utilisez notre système de navigation d'opportunités pour parcourir les emplois, configurer des alertes et découvrir des postes qui correspondent à votre passion.",
      seeker3Title: 'Postulez avec des CV Professionnels',
      seeker3Desc: 'Créez des CV personnalisés en utilisant notre créateur et analyseur de CV, puis soumettez vos candidatures et suivez leur progression.',
      seeker4Title: 'Gérez et Suivez Votre Progression',
      seeker4Desc: 'Surveillez vos candidatures, accédez aux services de carrière et utilisez les ressources pour faire avancer votre parcours professionnel.',
      // For Organizations
      forOrgs: 'Pour les Organisations',
      orgsSubtitle: "De la création d'opportunités à l'acquisition de talents",
      org1Title: "Configurez le Profil de l'Organisation",
      org1Desc: "Créez le profil de votre organisation, gérez les ressources et accédez aux outils pour rationaliser vos opérations.",
      org2Title: 'Créez et Gérez les Opportunités',
      org2Desc: "Utilisez notre système de gestion d'opportunités pour créer de nouvelles offres et gérer vos offres d'emploi existantes.",
      org3Title: 'Examinez et Suivez les Candidatures',
      org3Desc: 'Accédez à notre système complet de gestion des candidatures pour examiner les candidats et suivre votre processus de recrutement.',
      org4Title: 'Connectez et Recrutez des Talents',
      org4Desc: "Utilisez les analyses pour prendre des décisions éclairées et connectez-vous avec des candidats qui s'alignent sur votre mission et vos valeurs."
    },
    // Morchid AI Section
    morchid: {
      badge: '✨ Assistant Carrière Propulsé par l\'IA',
      title: 'Découvrez Morchid',
      subtitle: 'Votre Compagnon de Carrière Intelligent',
      description: 'Morchid est votre assistant carrière IA personnel qui comprend vos compétences, analyse les opportunités et fournit des conseils personnalisés pour accélérer votre parcours professionnel.',
      feature1Title: 'Matching d\'Emploi Intelligent',
      feature1Desc: 'Morchid analyse votre CV et votre profil pour trouver des opportunités qui correspondent parfaitement à vos compétences et objectifs de carrière.',
      feature2Title: 'Optimisation du CV',
      feature2Desc: 'Obtenez des commentaires alimentés par l\'IA sur votre CV avec des suggestions spécifiques pour améliorer vos chances de succès.',
      feature3Title: 'Orientation Professionnelle',
      feature3Desc: 'Recevez des conseils de carrière personnalisés basés sur votre expérience, vos compétences et les tendances du secteur.',
      feature4Title: 'Préparation aux Entretiens',
      feature4Desc: 'Entraînez-vous avec des questions d\'entretien générées par l\'IA adaptées à vos rôles et industries cibles.',
      chatPreview1: 'Bonjour ! Je cherche des emplois en gestion de projet...',
      chatPreview2: 'J\'ai trouvé 12 opportunités correspondant à votre profil ! Basé sur vos 5 ans d\'expérience et vos compétences en Agile et leadership d\'équipe, voici les meilleures correspondances...',
      tryMorchid: 'Essayer Morchid',
      learnMore: 'En Savoir Plus'
    },
    // About Section
    about: {
      title: 'À Propos de Zaytoonz',
      description: "Nous nous engageons à créer un monde où les jeunes talents peuvent construire des carrières significatives tout en contribuant au changement social positif grâce à des partenariats stratégiques avec des organisations. Notre mission est de démocratiser l'accès aux opportunités de carrière impactantes à l'échelle mondiale.",
      missionVisionTitle: 'Notre Mission et Vision',
      missionTitle: 'Mission',
      missionText: "Inspirer et habiliter les professionnels qualifiés à collaborer avec des organisations à but non lucratif à travers le monde, forgeant des carrières significatives qui génèrent un changement social durable et renforcent les communautés à l'échelle mondiale.",
      visionTitle: 'Vision',
      visionText: "Un monde où chaque jeune professionnel a accès à des opportunités de carrière significatives qui s'alignent sur ses valeurs, et chaque organisation dispose de la main-d'œuvre talentueuse nécessaire pour maximiser son impact social."
    },
    // Our Partners Section
    partners: {
      title: 'Nos Partenaires',
      subtitle: 'Découvrez les organisations qui font la différence',
      viewProfile: 'Voir le Profil',
      opportunities: 'Opportunités',
      noPartners: 'Aucun partenaire disponible pour le moment'
    },
    // Contact Section
    contact: {
      title: 'Contactez-Nous',
      description: "Prêt à commencer votre parcours ? Nous sommes là pour vous aider à vous connecter aux bonnes opportunités.",
      formTitle: 'Envoyez-nous un Message',
      sendTo: 'Envoyer à',
      firstName: 'Prénom',
      firstNamePlaceholder: 'Votre prénom',
      lastName: 'Nom',
      lastNamePlaceholder: 'Votre nom',
      email: 'Email',
      emailPlaceholder: 'votre.email@exemple.com',
      iAmA: 'Je suis...',
      selectRole: 'Sélectionnez votre rôle',
      youngTalent: 'Jeune Talent',
      orgRepresentative: "Représentant d'Organisation",
      partnerOrg: 'Organisation Partenaire',
      other: 'Autre',
      message: 'Message',
      messagePlaceholder: 'Dites-nous comment nous pouvons vous aider...',
      sendMessage: 'Envoyer le Message'
    },
    // Footer
    footer: {
      description: "Zaytoonz offre une plateforme rationalisée qui connecte des professionnels qualifiés avec des entités à but non lucratif, permettant des collaborations impactantes qui génèrent un changement social significatif.",
      platform: 'Plateforme',
      forSeekers: 'Pour les Chercheurs',
      forOrganizations: 'Pour les Organisations',
      services: 'Services',
      support: 'Support',
      contact: 'Contact',
      about: 'À propos',
      followUs: 'Suivez-Nous',
      copyright: '© 2025 Organisation Zaytoonz. Tous droits réservés.'
    }
  },
  ar: {
    // Navigation
    nav: {
      home: 'الرئيسية',
      jobs: 'الوظائف',
      training: 'التدريب',
      funding: 'التمويل',
      resources: 'الموارد',
      aboutUs: 'من نحن',
      signIn: 'تسجيل الدخول',
      getStarted: 'ابدأ الآن',
      language: 'اللغة'
    },
    // Hero Section
    hero: {
      badge: '🌍 نربط صناع التغيير العالميين منذ 2020',
      title1: 'تعزيز',
      title2: 'التأثير الاجتماعي',
      title3: 'بـ',
      title4: 'الخبرة المهنية',
      description: 'زيتونز هي المنصة الرائدة التي تربط المهنيين المهرة بالمنظمات غير الربحية الملتزمة بالرسالة حول العالم. نمكّن المسارات المهنية المؤثرة التي تساهم في التغيير الاجتماعي، وتعزيز قدرات المنظمات مع تقدم التنمية المستدامة ومرونة المجتمعات.',
      discoverOpportunities: 'اكتشف الفرص',
      postOpportunities: 'أنشر الفرص'
    },
    // Stats
    stats: {
      activeTalents: 'المواهب النشطة',
      fromCountries: 'من أكثر من 85 دولة',
      partnerOrgs: 'المنظمات الشريكة',
      acrossContinents: 'عبر 6 قارات',
      livesImpacted: 'حياة تأثرت',
      throughPartnerships: 'من خلال شراكاتنا',
      successRate: 'نسبة النجاح',
      successfulPlacements: 'توظيفات ناجحة'
    },
    // Recent Opportunities
    opportunities: {
      latestTitle: 'أحدث الفرص',
      jobs: 'وظائف',
      funding: 'تمويل',
      training: 'تدريب',
      viewOpportunity: 'عرض الفرصة',
      viewDetails: 'عرض التفاصيل',
      posted: 'نُشر',
      external: 'خارجي',
      partner: 'شريك',
      noAvailable: 'لا يوجد {type} متاح',
      checkBack: 'عد قريباً للاطلاع على فرص {type} جديدة.',
      exploreAll: 'استكشف جميع الفرص'
    },
    // How It Works
    howItWorks: {
      title: 'كيف تعمل زيتونز',
      description: 'تقدم زيتونز منصة مبسطة تربط المهنيين المهرة بالمنظمات غير الربحية الملتزمة بالرسالة، مما يتيح تعاونات مؤثرة تدفع التغيير الاجتماعي الهادف.',
      // For Job Seekers
      forSeekers: 'للباحثين عن عمل',
      seekersSubtitle: 'من الملف الشخصي إلى التوظيف في 4 خطوات بسيطة',
      seeker1Title: 'أنشئ ملفك المهني',
      seeker1Desc: 'أنشئ ملفاً تفصيلياً يبرز مهاراتك وخبراتك وأهدافك المهنية باستخدام أدوات إدارة الملف الشخصي.',
      seeker2Title: 'تصفح وابحث عن الفرص',
      seeker2Desc: 'استخدم نظام تصفح الفرص لدينا لاستعراض الوظائف وإعداد التنبيهات واكتشاف الأدوار التي تتناسب مع شغفك.',
      seeker3Title: 'قدم بسيرة ذاتية احترافية',
      seeker3Desc: 'أنشئ سيراً ذاتية مخصصة باستخدام صانع ومحلل السيرة الذاتية، ثم قدم طلباتك وتابع تقدمها.',
      seeker4Title: 'إدارة وتتبع التقدم',
      seeker4Desc: 'راقب طلباتك، واحصل على خدمات الحياة المهنية، واستفد من الموارد لتطوير مسيرتك المهنية.',
      // For Organizations
      forOrgs: 'للمنظمات',
      orgsSubtitle: 'من إنشاء الفرص إلى اكتساب المواهب',
      org1Title: 'أنشئ ملف المنظمة',
      org1Desc: 'أنشئ ملف منظمتك، وأدر الموارد، واحصل على الأدوات لتبسيط عملياتك.',
      org2Title: 'أنشئ وأدر الفرص',
      org2Desc: 'استخدم نظام إدارة الفرص لإنشاء إعلانات جديدة وإدارة قوائم الوظائف الحالية.',
      org3Title: 'راجع وتتبع الطلبات',
      org3Desc: 'احصل على نظام إدارة الطلبات الشامل لمراجعة المرشحين وتتبع عملية التوظيف.',
      org4Title: 'تواصل ووظف المواهب',
      org4Desc: 'استخدم التحليلات لاتخاذ قرارات مستنيرة والتواصل مع المرشحين الذين يتوافقون مع رسالتك وقيمك.'
    },
    // Morchid AI Section
    morchid: {
      badge: '✨ مساعد مهني مدعوم بالذكاء الاصطناعي',
      title: 'تعرف على مرشد',
      subtitle: 'رفيقك المهني الذكي',
      description: 'مرشد هو مساعدك المهني الشخصي بالذكاء الاصطناعي الذي يفهم مهاراتك، ويحلل الفرص، ويقدم إرشادات مخصصة لتسريع رحلتك المهنية.',
      feature1Title: 'مطابقة الوظائف الذكية',
      feature1Desc: 'يحلل مرشد سيرتك الذاتية وملفك الشخصي للعثور على الفرص التي تتطابق تمامًا مع مهاراتك وأهدافك المهنية.',
      feature2Title: 'تحسين السيرة الذاتية',
      feature2Desc: 'احصل على ملاحظات مدعومة بالذكاء الاصطناعي على سيرتك الذاتية مع اقتراحات محددة لتحسين فرص نجاحك.',
      feature3Title: 'التوجيه المهني',
      feature3Desc: 'احصل على نصائح مهنية مخصصة بناءً على خبرتك ومهاراتك واتجاهات الصناعة.',
      feature4Title: 'التحضير للمقابلات',
      feature4Desc: 'تدرب على أسئلة المقابلات المولدة بالذكاء الاصطناعي المصممة خصيصًا لأدوارك وصناعاتك المستهدفة.',
      chatPreview1: 'مرحبا! أبحث عن وظائف في إدارة المشاريع...',
      chatPreview2: 'وجدت 12 فرصة تتطابق مع ملفك الشخصي! بناءً على خبرتك البالغة 5 سنوات ومهاراتك في Agile وقيادة الفريق، إليك أفضل المطابقات...',
      tryMorchid: 'جرب مرشد الآن',
      learnMore: 'اعرف المزيد'
    },
    // About Section
    about: {
      title: 'عن زيتونز',
      description: 'نحن ملتزمون بإنشاء عالم يمكن فيه للمواهب الشابة بناء مسارات مهنية ذات معنى مع المساهمة في التغيير الاجتماعي الإيجابي من خلال شراكات استراتيجية مع المنظمات. مهمتنا هي إتاحة الوصول إلى فرص العمل المؤثرة عالمياً.',
      missionVisionTitle: 'رسالتنا ورؤيتنا',
      missionTitle: 'الرسالة',
      missionText: 'إلهام وتمكين المهنيين المهرة للتعاون مع المنظمات غير الربحية الملتزمة بالرسالة حول العالم، وبناء مسارات مهنية ذات معنى تولد تغييراً اجتماعياً دائماً وتعزز المجتمعات عالمياً.',
      visionTitle: 'الرؤية',
      visionText: 'عالم يحصل فيه كل مهني شاب على فرص عمل ذات معنى تتوافق مع قيمه، وتمتلك فيه كل منظمة القوى العاملة الموهوبة اللازمة لتعظيم تأثيرها الاجتماعي.'
    },
    // Our Partners Section
    partners: {
      title: 'شركاؤنا',
      subtitle: 'تعرف على المنظمات التي تحدث فرقاً',
      viewProfile: 'عرض الملف الشخصي',
      opportunities: 'الفرص',
      noPartners: 'لا يوجد شركاء متاحون في الوقت الحالي'
    },
    // Contact Section
    contact: {
      title: 'تواصل معنا',
      description: 'مستعد لبدء رحلتك؟ نحن هنا لمساعدتك على التواصل مع الفرص المناسبة.',
      formTitle: 'أرسل لنا رسالة',
      sendTo: 'إرسال إلى',
      firstName: 'الاسم الأول',
      firstNamePlaceholder: 'اسمك الأول',
      lastName: 'اسم العائلة',
      lastNamePlaceholder: 'اسم عائلتك',
      email: 'البريد الإلكتروني',
      emailPlaceholder: 'بريدك@مثال.com',
      iAmA: 'أنا...',
      selectRole: 'اختر دورك',
      youngTalent: 'موهبة شابة',
      orgRepresentative: 'ممثل منظمة',
      partnerOrg: 'منظمة شريكة',
      other: 'آخر',
      message: 'الرسالة',
      messagePlaceholder: 'أخبرنا كيف يمكننا مساعدتك...',
      sendMessage: 'إرسال الرسالة'
    },
    // Footer
    footer: {
      description: 'تقدم زيتونز منصة مبسطة تربط المهنيين المهرة بالمنظمات غير الربحية الملتزمة بالرسالة، مما يتيح تعاونات مؤثرة تدفع التغيير الاجتماعي الهادف.',
      platform: 'المنصة',
      forSeekers: 'للباحثين',
      forOrganizations: 'للمنظمات',
      services: 'الخدمات',
      support: 'الدعم',
      contact: 'اتصل بنا',
      about: 'من نحن',
      followUs: 'تابعنا',
      copyright: '© 2025 منظمة زيتونز. جميع الحقوق محفوظة.'
    }
  }
};

export type Translations = typeof translations.en;

export const getTranslations = (lang: LanguageCode): Translations => {
  return translations[lang] || translations.en;
};

export const getLanguageByCode = (code: string): Language => {
  return languages.find(l => l.code === code) || languages[0];
};

