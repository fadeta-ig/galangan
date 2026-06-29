export type Dictionary = {
  meta: {
    siteTitle: string;
    siteDescription: string;
    ogSiteName: string;
  };
  nav: {
    home: string;
    about: string;
    services: string;
    experience: string;
    news: string;
    gallery: string;
    contact: string;
  };
  common: {
    readMore: string;
    learnMore: string;
    viewAll: string;
    contactUs: string;
    sendMessage: string;
    subscribe: string;
    loadMore: string;
    search: string;
    filter: string;
    all: string;
    back: string;
    next: string;
    previous: string;
    share: string;
    download: string;
    close: string;
    chatWhatsApp: string;
  };
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
  sections: {
    servicesTitle: string;
    servicesSubtitle: string;
    seeAllServices: string;
    newsTitle: string;
    newsSubtitle: string;
    seeAllNews: string;
    experienceTitle: string;
    experienceSubtitle: string;
    viewAllExperience: string;
    projectBannerTitle: string;
    projectBannerSubtitle: string;
    statisticsTitle: string;
  };
  about: {
    pageTitle: string;
    pageSubtitle: string;
    whoWeAre: string;
    visionTitle: string;
    missionTitle: string;
    valuesTitle: string;
    facilitiesTitle: string;
    historyTitle: string;
  };
  contact: {
    pageTitle: string;
    pageSubtitle: string;
    getInTouch: string;
    formTitle: string;
    fullName: string;
    email: string;
    phone: string;
    companyName: string;
    serviceInterest: string;
    subject: string;
    message: string;
    address: string;
    businessHours: string;
    successMessage: string;
    errorMessage: string;
    validationError: string;
    rateLimitError: string;
  };
  footer: {
    quickLinks: string;
    ourServices: string;
    getInTouch: string;
    newsletter: string;
    newsletterPlaceholder: string;
    copyright: string;
  };
  gallery: {
    pageTitle: string;
    pageSubtitle: string;
  };
  experience: {
    pageTitle: string;
    pageSubtitle: string;
    client: string;
    vesselType: string;
    year: string;
    location: string;
    relatedServices: string;
    relatedProjects: string;
  };
  news: {
    pageTitle: string;
    pageSubtitle: string;
    publishedAt: string;
    author: string;
    relatedArticles: string;
    tags: string;
  };
  services: {
    pageTitle: string;
    pageSubtitle: string;
    benefits: string;
    process: string;
    faq: string;
    needService: string;
    relatedServices: string;
  };
  [key: string]: unknown;
};
